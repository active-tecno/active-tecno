// integrations.js — production integration clients.
// Resolution order for every credential: environment variable → settings table (admin UI).
// When a provider has no credentials, calls run in simulation mode: the event is
// recorded in integration_events with simulated=1 and the caller gets a graceful
// result. Simulation status is visible in the admin panel only — never shown to customers.
const { db } = require('./db');

const PROVIDERS = {
  paymob: {
    label: 'Paymob — بوابة الدفع',
    keys: ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID'],
    base: 'https://accept.paymob.com/api',
  },
  whatsapp: {
    label: 'WhatsApp Cloud API — أكتف كونفيرم',
    keys: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
    base: 'https://graph.facebook.com/v20.0',
  },
  email: {
    label: 'البريد الإلكتروني — رسائل التحقق',
    keys: ['RESEND_API_KEY', 'EMAIL_FROM'],
    base: 'https://api.resend.com',
  },
};

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row && row.value !== '' ? row.value : null;
}
function setSetting(key, value) {
  if (value === null || value === undefined || value === '') db.prepare('DELETE FROM settings WHERE key = ?').run(key);
  else db.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').run(key, String(value));
}
function cred(key, storeCfg) { return (storeCfg && storeCfg[key]) || process.env[key] || getSetting(key); }
function configured(provider, storeCfg) { return PROVIDERS[provider].keys.every(k => !!cred(key0(k), storeCfg)); }
function key0(k) { return k; }

function logEvent(provider, kind, payload, status, simulated, detail = '') {
  try {
    db.prepare('INSERT INTO integration_events (provider, kind, payload, status, simulated, detail) VALUES (?, ?, ?, ?, ?, ?)')
      .run(provider, kind, JSON.stringify(payload).slice(0, 4000), status, simulated ? 1 : 0, String(detail).slice(0, 1000));
  } catch (_) { /* logging must never break a flow */ }
}

async function postJSON(url, body, headers = {}, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  } finally { clearTimeout(t); }
}

// ---------- Paymob ----------
// Real flow: auth token → create order → payment key → iframe URL.
async function paymobCreatePayment({ amountEGP, orderNumber, customer, storeCfg }) {
  const P = PROVIDERS.paymob;
  if (!configured('paymob', storeCfg)) {
    logEvent('paymob', 'payment_intention', { orderNumber, amountEGP }, 'simulated', true, 'no credentials — simulated gateway response');
    return { simulated: true, payment_url: null };
  }
  try {
    const auth = await postJSON(`${P.base}/auth/tokens`, { api_key: cred('PAYMOB_API_KEY', storeCfg) });
    if (!auth.ok || !auth.data.token) throw new Error(`auth failed (${auth.status})`);
    const token = auth.data.token;

    const order = await postJSON(`${P.base}/ecommerce/orders`, {
      auth_token: token, delivery_needed: false,
      amount_cents: Math.round(amountEGP * 100), currency: 'EGP',
      merchant_order_id: String(orderNumber), items: [],
    });
    if (!order.ok || !order.data.id) throw new Error(`order failed (${order.status})`);

    const keyRes = await postJSON(`${P.base}/acceptance/payment_keys`, {
      auth_token: token, amount_cents: Math.round(amountEGP * 100), currency: 'EGP',
      order_id: order.data.id, integration_id: Number(cred('PAYMOB_INTEGRATION_ID', storeCfg)),
      expiration: 3600, lock_order_when_paid: false,
      billing_data: {
        first_name: (customer.name || 'عميل').split(' ')[0], last_name: (customer.name || 'متجر').split(' ').slice(1).join(' ') || '—',
        phone_number: customer.phone || '01000000000', email: customer.email || 'customer@store.local',
        apartment: 'NA', floor: 'NA', street: customer.address || 'NA', building: 'NA',
        city: customer.governorate || 'Cairo', country: 'EG', state: customer.governorate || 'Cairo',
        shipping_method: 'NA', postal_code: 'NA',
      },
    });
    if (!keyRes.ok || !keyRes.data.token) throw new Error(`payment key failed (${keyRes.status})`);
    const url = `${P.base}/acceptance/iframes/${cred('PAYMOB_IFRAME_ID', storeCfg)}?payment_token=${keyRes.data.token}`;
    logEvent('paymob', 'payment_intention', { orderNumber, amountEGP, paymobOrderId: order.data.id }, 'ok', false);
    return { simulated: false, payment_url: url, paymob_order_id: order.data.id };
  } catch (e) {
    logEvent('paymob', 'payment_intention', { orderNumber, amountEGP }, 'error', false, e.message);
    return { simulated: false, error: e.message, payment_url: null };
  }
}

// ---------- WhatsApp Cloud API (Active Confirm) ----------
async function waSendTemplate({ to, storeName, orderNumber, totalText }) {
  const W = PROVIDERS.whatsapp;
  const phone = String(to || '').replace(/\D/g, '').replace(/^0/, '20');
  if (!configured('whatsapp')) {
    logEvent('whatsapp', 'order_confirmation', { to: phone, orderNumber }, 'simulated', true, 'no credentials — message not sent');
    return { simulated: true };
  }
  try {
    const body = {
      messaging_product: 'whatsapp', to: phone, type: 'template',
      template: { name: 'order_confirmation', language: { code: 'ar' }, components: [
        { type: 'body', parameters: [
          { type: 'text', text: storeName }, { type: 'text', text: String(orderNumber) }, { type: 'text', text: totalText },
        ] },
        { type: 'button', sub_type: 'quick_reply', index: '0', parameters: [{ type: 'payload', payload: `CONFIRM_${orderNumber}` }] },
        { type: 'button', sub_type: 'quick_reply', index: '1', parameters: [{ type: 'payload', payload: `CANCEL_${orderNumber}` }] },
      ] },
    };
    const r = await postJSON(`${W.base}/${cred('WHATSAPP_PHONE_NUMBER_ID')}/messages`, body, { Authorization: `Bearer ${cred('WHATSAPP_TOKEN')}` });
    if (!r.ok) throw new Error(`send failed (${r.status}): ${JSON.stringify(r.data).slice(0, 300)}`);
    logEvent('whatsapp', 'order_confirmation', { to: phone, orderNumber, messageId: r.data.messages?.[0]?.id }, 'ok', false);
    return { simulated: false, message_id: r.data.messages?.[0]?.id };
  } catch (e) {
    logEvent('whatsapp', 'order_confirmation', { to: phone, orderNumber }, 'error', false, e.message);
    return { simulated: false, error: e.message };
  }
}

// ---------- Transactional email (Resend-compatible HTTPS API) ----------
async function sendVerificationEmail({ to, code }) {
  const E = PROVIDERS.email;
  if (!configured('email')) {
    logEvent('email', 'verification_code', { to }, 'simulated', true, 'no credentials — code shown on screen');
    return { simulated: true };
  }
  try {
    const r = await postJSON(`${E.base}/emails`, {
      from: cred('EMAIL_FROM'), to: [to],
      subject: 'رمز التحقق — اكتف اوردر',
      html: `<div dir="rtl" style="font-family:sans-serif;padding:24px"><h2>رمز التحقق الخاص بك</h2><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#00BFAF;direction:ltr">${code}</p><p>صالح لمدة 10 دقائق.</p></div>`,
    }, { Authorization: `Bearer ${cred('RESEND_API_KEY')}` });
    if (!r.ok) throw new Error(`send failed (${r.status})`);
    logEvent('email', 'verification_code', { to }, 'ok', false);
    return { simulated: false };
  } catch (e) {
    logEvent('email', 'verification_code', { to }, 'error', false, e.message);
    return { simulated: false, error: e.message };
  }
}

function status() {
  return Object.entries(PROVIDERS).map(([id, p]) => ({
    id, label: p.label,
    configured: configured(id),
    source: p.keys.every(k => !!process.env[k]) ? 'env' : (configured(id) ? 'settings' : null),
    keys: p.keys.map(k => ({ key: k, set: !!cred(k), from: process.env[k] ? 'env' : (getSetting(k) ? 'settings' : null) })),
    last_event: db.prepare('SELECT kind, status, simulated, created_at FROM integration_events WHERE provider = ? ORDER BY id DESC LIMIT 1').get(id) || null,
  }));
}

module.exports = { PROVIDERS, getSetting, setSetting, configured, paymobCreatePayment, waSendTemplate, sendVerificationEmail, status };
