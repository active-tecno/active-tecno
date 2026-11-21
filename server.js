// server.js — Active Tecno: zero-dependency Node HTTP server (API + pages + static)
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { db } = require('./db');
const { seed, hashPassword } = require('./seed');
const views = require('./views');
const integ = require('./integrations');

seed();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.json': 'application/json; charset=utf-8' };

// ---------- helpers ----------
function hashPasswordVerify(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}
const newToken = () => crypto.randomBytes(32).toString('hex');

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(c => {
    const i = c.indexOf('='); if (i > -1) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}
function getUser(req) {
  const token = parseCookies(req).at_session;
  if (!token) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!s || s.expires_at < new Date().toISOString()) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(s.user_id);
}
function createSession(res, userId) {
  const token = newToken();
  const exp = new Date(Date.now() + 30 * 86400000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, exp);
  res.setHeader('Set-Cookie', `at_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}`);
}
function clearSession(res, req) {
  const token = parseCookies(req).at_session;
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.setHeader('Set-Cookie', 'at_session=; Path=/; HttpOnly; Max-Age=0');
}
function getStoreForUser(user) {
  return user ? db.prepare('SELECT * FROM stores WHERE user_id = ? ORDER BY id LIMIT 1').get(user.id) : null;
}
function requireStore(res, user) {
  const store = getStoreForUser(user);
  if (!store) { json(res, 400, { error: 'لا يوجد متجر لهذا الحساب' }); return null; }
  return store;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 15e6) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
async function readJSON(req) {
  const raw = await readBody(req);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return null; }
}
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}
function html(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}
const EG_PHONE = /^01[0125][0-9]{8}$/;
const normalizePhone = p => String(p || '').replace(/[\s\-\+\(\)]/g, '').replace(/^20/, '').replace(/^2/, '');

// ---------- static ----------
function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'public, max-age=300' });
    res.end(data);
  });
}

// ---------- API ----------
const verifyCodes = new Map(); // email -> { code, userId, expires } — code is emailed when the email provider is configured; otherwise returned for the on-screen verifier
const api = {
  // auth
  'POST /api/auth/register': async (req, res) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const { email, password, name, storeName, slug } = b;
    if (!email || !password || !name || !storeName) return json(res, 400, { error: 'كل الحقول مطلوبة' });
    if (password.length < 8) return json(res, 400, { error: 'كلمة المرور 8 أحرف على الأقل' });
    const s = String(slug || storeName).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-+|-+$/g, '') || 'store';
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())) return json(res, 409, { error: 'البريد مسجل بالفعل' });
    let finalSlug = s, n = 1;
    while (db.prepare('SELECT id FROM stores WHERE slug = ?').get(finalSlug)) finalSlug = `${s}-${++n}`;
    const u = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email.toLowerCase(), hashPassword(password), name);
    db.prepare('INSERT INTO stores (user_id, name, slug) VALUES (?, ?, ?)').run(u.lastInsertRowid, storeName, finalSlug);
    db.prepare('INSERT INTO team_members (store_id, email, name, role) VALUES (?, ?, ?, ?)')
      .run(db.prepare('SELECT id FROM stores WHERE slug = ?').get(finalSlug).id, email.toLowerCase(), name, 'owner');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    verifyCodes.set(email.toLowerCase(), { code, userId: u.lastInsertRowid, expires: Date.now() + 10 * 60000 });
    const mail = await integ.sendVerificationEmail({ to: email.toLowerCase(), code });
    json(res, 201, { ok: true, slug: finalSlug, needs_verification: true, email_sent: !mail.simulated, dev_code: mail.simulated ? code : undefined });
  },
  'POST /api/auth/verify': async (req, res) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const rec = verifyCodes.get(String(b.email || '').toLowerCase());
    if (!rec || rec.expires < Date.now()) return json(res, 400, { error: 'انتهت صلاحية الكود — أعد التسجيل' });
    if (String(b.code || '').trim() !== rec.code) return json(res, 400, { error: 'كود التحقق غير صحيح' });
    verifyCodes.delete(String(b.email).toLowerCase());
    createSession(res, rec.userId);
    json(res, 200, { ok: true });
  },
  'POST /api/auth/login': async (req, res) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const u = db.prepare('SELECT * FROM users WHERE email = ?').get(String(b.email || '').toLowerCase());
    if (!u || !hashPasswordVerify(String(b.password || ''), u.password_hash)) return json(res, 401, { error: 'بيانات الدخول غير صحيحة' });
    createSession(res, u.id);
    json(res, 200, { ok: true, is_admin: !!u.is_admin });
  },
  'POST /api/auth/logout': (req, res) => { clearSession(res, req); json(res, 200, { ok: true }); },
  'GET /api/me': (req, res, user) => {
    if (!user) return json(res, 401, { error: 'unauthenticated' });
    const store = getStoreForUser(user);
    json(res, 200, { user: { id: user.id, email: user.email, name: user.name, is_admin: !!user.is_admin }, store });
  },

  // store settings
  'GET /api/store': (req, res, user) => json(res, 200, { store: getStoreForUser(user) }),
  'PUT /api/store': async (req, res, user) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const fields = ['name', 'description', 'phone', 'whatsapp', 'announcement', 'free_shipping_over', 'theme_id', 'governorate'];
    const sets = [], vals = [];
    for (const f of fields) if (f in b) { sets.push(`${f} = ?`); vals.push(b[f]); }
    if (b.theme_settings) { sets.push('theme_settings = ?'); vals.push(JSON.stringify(b.theme_settings)); }
    if (b.slug && b.slug !== store.slug) {
      const s = String(b.slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
      if (!s) return json(res, 400, { error: 'الرابط غير صالح' });
      if (db.prepare('SELECT id FROM stores WHERE slug = ? AND id != ?').get(s, store.id)) return json(res, 409, { error: 'هذا الرابط مستخدم بالفعل' });
      sets.push('slug = ?'); vals.push(s);
    }
    if (sets.length) db.prepare(`UPDATE stores SET ${sets.join(', ')} WHERE id = ?`).run(...vals, store.id);
    json(res, 200, { store: getStoreForUser(user) });
  },
  // merchant integration status + payment keys
  'GET /api/store/integrations': (req, res, user) => {
    const store = getStoreForUser(user);
    const ts = JSON.parse(store.theme_settings || '{}');
    const pc = ts.payments_config || {};
    const storePaymob = ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID'].every(k => pc[k]);
    json(res, 200, {
      paymob: { configured: storePaymob || integ.configured('paymob'), own_keys: storePaymob, live: storePaymob || integ.configured('paymob') },
      whatsapp: { configured: integ.configured('whatsapp') },
      email: { configured: integ.configured('email') },
    });
  },
  'PUT /api/store/payments-config': async (req, res, user) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const ts = JSON.parse(store.theme_settings || '{}');
    const allowed = ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID'];
    ts.payments_config = ts.payments_config || {};
    for (const k of allowed) if (k in b) { const v = String(b[k] || '').trim(); if (v) ts.payments_config[k] = v; else delete ts.payments_config[k]; }
    db.prepare('UPDATE stores SET theme_settings = ? WHERE id = ?').run(JSON.stringify(ts), store.id);
    json(res, 200, { ok: true, configured: ['PAYMOB_API_KEY', 'PAYMOB_INTEGRATION_ID', 'PAYMOB_IFRAME_ID'].every(k => ts.payments_config[k]) });
  },
  'GET /api/themes': (req, res, user) => {
    json(res, 200, { themes: db.prepare('SELECT * FROM themes').all().map(t => ({ ...t, config: JSON.parse(t.config) })) });
  },

  // products
  'GET /api/products': (req, res, user) => {
    const store = getStoreForUser(user);
    json(res, 200, { products: db.prepare('SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC').all(store.id) });
  },
  'POST /api/products': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !b.name || !(b.price > 0)) return json(res, 400, { error: 'الاسم والسعر مطلوبان' });
    const store = getStoreForUser(user);
    const r = db.prepare(`INSERT INTO products (store_id, name, description, price, compare_at_price, cost, sku, stock, low_stock_threshold, category, status, images, upsell_product_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(store.id, b.name, b.description || '', b.price, b.compare_at_price || null, b.cost || 0, b.sku || '', b.stock ?? 0, b.low_stock_threshold ?? 3, b.category || '', b.status || 'active', JSON.stringify(b.images || []), b.upsell_product_id || null);
    json(res, 201, { product: db.prepare('SELECT * FROM products WHERE id = ?').get(r.lastInsertRowid) });
  },
  'PUT /api/products/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const prod = db.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?').get(p.id, store.id);
    if (!prod) return json(res, 404, { error: 'المنتج غير موجود' });
    const fields = ['name', 'description', 'price', 'compare_at_price', 'cost', 'sku', 'stock', 'low_stock_threshold', 'category', 'status', 'upsell_product_id'];
    const sets = [], vals = [];
    for (const f of fields) if (f in b) { sets.push(`${f} = ?`); vals.push(b[f]); }
    if (b.images) { sets.push('images = ?'); vals.push(JSON.stringify(b.images)); }
    if (sets.length) db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...vals, prod.id);
    json(res, 200, { product: db.prepare('SELECT * FROM products WHERE id = ?').get(prod.id) });
  },
  'DELETE /api/products/:id': (req, res, user, p) => {
    const store = getStoreForUser(user);
    db.prepare('DELETE FROM products WHERE id = ? AND store_id = ?').run(p.id, store.id);
    json(res, 200, { ok: true });
  },

  // uploads (base64 data URLs)
  'POST /api/upload': async (req, res, user) => {
    const b = await readJSON(req);
    const m = b && b.dataUrl && b.dataUrl.match(/^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,(.+)$/);
    if (!m) return json(res, 400, { error: 'صورة غير صالحة' });
    const ext = { png: 'png', jpeg: 'jpg', jpg: 'jpg', webp: 'webp', 'svg+xml': 'svg' }[m[1]];
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 5e6) return json(res, 400, { error: 'الصورة أكبر من 5 ميجا' });
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    json(res, 201, { url: '/uploads/' + name });
  },

  // orders
  'GET /api/orders': (req, res, user, p, url) => {
    const store = getStoreForUser(user);
    const status = url.searchParams.get('status');
    const q = url.searchParams.get('q');
    let sql = 'SELECT * FROM orders WHERE store_id = ?';
    const vals = [store.id];
    if (status) { sql += ' AND status = ?'; vals.push(status); }
    if (q) { sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR number LIKE ?)'; vals.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    sql += ' ORDER BY created_at DESC LIMIT 500';
    const orders = db.prepare(sql).all(...vals);
    const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    json(res, 200, { orders: orders.map(o => ({ ...o, items: itemsStmt.all(o.id) })) });
  },
  'PUT /api/orders/:id/status': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const ok = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!ok.includes(b.status)) return json(res, 400, { error: 'حالة غير صالحة' });
    const store = getStoreForUser(user);
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND store_id = ?').get(p.id, store.id);
    if (!order) return json(res, 404, { error: 'الطلب غير موجود' });
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(b.status, order.id);
    db.prepare('INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)').run(order.id, b.status, b.note || '');
    json(res, 200, { ok: true });
  },
  'GET /api/orders/:id/history': (req, res, user, p) => {
    json(res, 200, { history: db.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at').all(p.id) });
  },
  'POST /api/orders/:id/block-phone': (req, res, user, p) => {
    const store = getStoreForUser(user);
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND store_id = ?').get(p.id, store.id);
    if (!order) return json(res, 404, { error: 'الطلب غير موجود' });
    db.prepare('INSERT OR IGNORE INTO blocked_numbers (store_id, phone, reason) VALUES (?, ?, ?)').run(store.id, order.customer_phone, `محظور من الطلب ${order.number}`);
    json(res, 200, { ok: true });
  },
  'PUT /api/orders/:id/whatsapp': async (req, res, user, p) => {
    const store = getStoreForUser(user);
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND store_id = ?').get(p.id, store.id);
    if (!order) return json(res, 404, { error: 'الطلب غير موجود' });
    const sent = await integ.waSendTemplate({ to: order.customer_phone, storeName: store.name, orderNumber: order.number, totalText: `${order.total} ج.م` });
    db.prepare('UPDATE orders SET whatsapp_confirmed = 1 WHERE id = ?').run(order.id);
    json(res, 200, { ok: true, delivered: !sent.simulated && !sent.error, simulated: !!sent.simulated, error: sent.error || null });
  },
  'GET /api/orders-export.csv': (req, res, user, p, url) => {
    const store = getStoreForUser(user);
    const status = url.searchParams.get('status') || 'confirmed';
    const orders = db.prepare(`SELECT * FROM orders WHERE store_id = ? AND status = ? ORDER BY created_at`).all(store.id, status);
    const itemsStmt = db.prepare('SELECT name, qty FROM order_items WHERE order_id = ?');
    const rows = [['رقم الطلب', 'اسم العميل', 'رقم الهاتف', 'العنوان', 'المحافظة', 'المنتجات', 'المبلغ المطلوب تحصيله (COD)', 'ملاحظات']];
    for (const o of orders) {
      const items = itemsStmt.all(o.id).map(i => `${i.name} x${i.qty}`).join(' + ');
      rows.push([o.number, o.customer_name, o.customer_phone, o.customer_address, o.governorate, items, o.total, o.notes || '']);
    }
    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="orders-${status}.csv"` });
    res.end(csv);
  },

  // coupons
  'GET /api/coupons': (req, res, user) => json(res, 200, { coupons: db.prepare('SELECT * FROM coupons WHERE store_id = ? ORDER BY id DESC').all(getStoreForUser(user).id) }),
  'POST /api/coupons': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !b.code || !(b.value > 0)) return json(res, 400, { error: 'الكود والقيمة مطلوبان' });
    const store = getStoreForUser(user);
    try {
      const r = db.prepare('INSERT INTO coupons (store_id, code, type, value, min_order, usage_limit, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(store.id, b.code.toUpperCase().trim(), b.type === 'fixed' ? 'fixed' : 'percent', b.value, b.min_order || 0, b.usage_limit || 0, b.expires_at || null);
      json(res, 201, { coupon: db.prepare('SELECT * FROM coupons WHERE id = ?').get(r.lastInsertRowid) });
    } catch { json(res, 409, { error: 'الكود موجود بالفعل' }); }
  },
  'PUT /api/coupons/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    db.prepare('UPDATE coupons SET active = ? WHERE id = ? AND store_id = ?').run(b.active ? 1 : 0, p.id, store.id);
    json(res, 200, { ok: true });
  },
  'DELETE /api/coupons/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM coupons WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  // blocked numbers
  'GET /api/blocked': (req, res, user) => json(res, 200, { blocked: db.prepare('SELECT * FROM blocked_numbers WHERE store_id = ? ORDER BY id DESC').all(getStoreForUser(user).id) }),
  'POST /api/blocked': async (req, res, user) => {
    const b = await readJSON(req); const phone = normalizePhone(b && b.phone);
    if (!EG_PHONE.test(phone)) return json(res, 400, { error: 'رقم غير صالح' });
    db.prepare('INSERT OR IGNORE INTO blocked_numbers (store_id, phone, reason) VALUES (?, ?, ?)').run(getStoreForUser(user).id, phone, b.reason || '');
    json(res, 201, { ok: true });
  },
  'DELETE /api/blocked/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM blocked_numbers WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  // shipping
  'GET /api/shipping': (req, res, user) => json(res, 200, { zones: db.prepare('SELECT * FROM shipping_zones WHERE store_id = ?').all(getStoreForUser(user).id) }),
  'POST /api/shipping': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !b.name) return json(res, 400, { error: 'اسم المنطقة مطلوب' });
    const r = db.prepare('INSERT INTO shipping_zones (store_id, name, governorates, price, per_item, free_over) VALUES (?, ?, ?, ?, ?, ?)')
      .run(getStoreForUser(user).id, b.name, b.governorates || '', b.price || 0, b.per_item ? 1 : 0, b.free_over || 0);
    json(res, 201, { zone: db.prepare('SELECT * FROM shipping_zones WHERE id = ?').get(r.lastInsertRowid) });
  },
  'DELETE /api/shipping/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM shipping_zones WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  // team
  'GET /api/team': (req, res, user) => json(res, 200, { members: db.prepare('SELECT * FROM team_members WHERE store_id = ?').all(getStoreForUser(user).id) }),
  'POST /api/team': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !b.email || !b.name) return json(res, 400, { error: 'البيانات ناقصة' });
    db.prepare('INSERT INTO team_members (store_id, email, name, role) VALUES (?, ?, ?, ?)').run(getStoreForUser(user).id, b.email, b.name, b.role === 'owner' ? 'owner' : 'staff');
    json(res, 201, { ok: true });
  },
  'DELETE /api/team/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM team_members WHERE id = ? AND store_id = ? AND role != ?').run(p.id, getStoreForUser(user).id, 'owner');
    json(res, 200, { ok: true });
  },

  // analytics
  'GET /api/analytics': (req, res, user, p, url) => {
    const store = getStoreForUser(user);
    const days = Math.min(parseInt(url.searchParams.get('days')) || 30, 90);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const revenue = db.prepare(`SELECT COALESCE(SUM(total),0) s, COUNT(*) c FROM orders WHERE store_id = ? AND status NOT IN ('cancelled','returned') AND created_at >= ?`).get(store.id, since);
    const views = db.prepare(`SELECT COUNT(*) c FROM events WHERE store_id = ? AND type = 'page_view' AND created_at >= ?`).get(store.id, since).c;
    const funnel = {};
    for (const t of ['page_view', 'product_view', 'add_to_cart', 'begin_checkout', 'purchase'])
      funnel[t] = db.prepare('SELECT COUNT(*) c FROM events WHERE store_id = ? AND type = ? AND created_at >= ?').get(store.id, t, since).c;
    const daily = db.prepare(`
      SELECT substr(created_at, 1, 10) day, COUNT(*) orders, COALESCE(SUM(total),0) revenue
      FROM orders WHERE store_id = ? AND status NOT IN ('cancelled','returned') AND created_at >= ?
      GROUP BY day ORDER BY day`).all(store.id, since);
    const top = db.prepare(`
      SELECT oi.name, SUM(oi.qty) qty, SUM(oi.price * oi.qty) revenue FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.store_id = ? AND o.status NOT IN ('cancelled','returned') AND o.created_at >= ?
      GROUP BY oi.name ORDER BY revenue DESC LIMIT 5`).all(store.id, since);
    const statusCounts = {};
    for (const s of ['new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'])
      statusCounts[s] = db.prepare('SELECT COUNT(*) c FROM orders WHERE store_id = ? AND status = ? AND created_at >= ?').get(store.id, s, since).c;
    json(res, 200, {
      days, revenue: revenue.s, orders: revenue.c, views,
      conversion: views ? +(100 * revenue.c / views).toFixed(2) : 0,
      aov: revenue.c ? Math.round(revenue.s / revenue.c) : 0,
      funnel, daily, top, statusCounts
    });
  },

  // abandoned carts
  'GET /api/carts': (req, res, user) => {
    const carts = db.prepare(`SELECT * FROM carts WHERE store_id = ? AND items != '[]' ORDER BY updated_at DESC LIMIT 100`).all(getStoreForUser(user).id);
    json(res, 200, { carts: carts.map(c => ({ ...c, items: JSON.parse(c.items) })) });
  },
  'PUT /api/carts/:id/recovered': (req, res, user, p) => {
    db.prepare('UPDATE carts SET recovered = 1 WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  // activation
  'GET /api/activation': (req, res, user) => {
    const store = getStoreForUser(user);
    if (!store) return json(res, 200, { requests: [] });
    json(res, 200, { requests: db.prepare('SELECT * FROM activation_requests WHERE store_id = ? ORDER BY id DESC').all(store.id) });
  },
  'POST /api/activation': async (req, res, user) => {
    const b = await readJSON(req);
    if (!b || !['instapay', 'vodafone_cash'].includes(b.method) || !b.reference) return json(res, 400, { error: 'اختر طريقة الدفع وأدخل رقم المرجع' });
    const store = getStoreForUser(user);
    const pending = db.prepare(`SELECT id FROM activation_requests WHERE store_id = ? AND status = 'pending'`).get(store.id);
    if (pending) return json(res, 409, { error: 'لديك طلب تفعيل قيد المراجعة بالفعل' });
    db.prepare('INSERT INTO activation_requests (store_id, user_id, amount, method, reference) VALUES (?, ?, 50, ?, ?)').run(store.id, user.id, b.method, b.reference);
    json(res, 201, { ok: true });
  },

  // customers (CRM-lite, aggregated from orders)
  'GET /api/customers': (req, res, user) => {
    const store = getStoreForUser(user);
    const rows = db.prepare(`
      SELECT customer_phone phone, MAX(customer_name) name, COUNT(*) orders_count, SUM(total) total_spent,
             MAX(created_at) last_order, SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) cancelled
      FROM orders WHERE store_id = ? GROUP BY customer_phone ORDER BY total_spent DESC`).all(store.id);
    const blocked = new Set(db.prepare('SELECT phone FROM blocked_numbers WHERE store_id = ?').all(store.id).map(r => r.phone));
    json(res, 200, { customers: rows.map(r => ({ ...r, blocked: blocked.has(r.phone) })) });
  },

  // ---------- public webhooks ----------
  'GET /api/webhooks/whatsapp': (req, res, user, p, url) => {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const expected = process.env.WHATSAPP_VERIFY_TOKEN || integ.getSetting('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && expected && token === expected) {
      res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end(challenge);
    }
    return json(res, 403, { error: 'verification failed' });
  },
  'POST /api/webhooks/whatsapp': async (req, res) => {
    const b = await readJSON(req);
    try {
      for (const entry of (b && b.entry) || []) {
        for (const change of entry.changes || []) {
          const msgs = change.value && change.value.messages;
          for (const msg of msgs || []) {
            const payload = (msg.button && msg.button.payload) || (msg.interactive && msg.interactive.button_reply && msg.interactive.button_reply.id) || '';
            const m = String(payload).match(/^(CONFIRM|CANCEL)_(.+)$/);
            if (!m) continue;
            const order = db.prepare('SELECT * FROM orders WHERE number = ?').get(m[2]);
            if (!order) continue;
            const newStatus = m[1] === 'CONFIRM' ? 'confirmed' : 'cancelled';
            if (order.status === 'new') {
              db.prepare('UPDATE orders SET status = ?, whatsapp_confirmed = 1 WHERE id = ?').run(newStatus, order.id);
              db.prepare('INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)').run(order.id, newStatus, 'عبر رد العميل على واتساب (أكتف كونفيرم)');
            }
          }
        }
      }
    } catch (_) { /* never fail the webhook ack */ }
    json(res, 200, { ok: true });
  },

  // ---------- admin ----------
  'GET /api/admin/stats': (req, res, user) => {
    json(res, 200, {
      merchants: db.prepare('SELECT COUNT(*) c FROM users WHERE is_admin = 0').get().c,
      stores: db.prepare('SELECT COUNT(*) c FROM stores').get().c,
      published: db.prepare('SELECT COUNT(*) c FROM stores WHERE is_published = 1').get().c,
      orders: db.prepare('SELECT COUNT(*) c FROM orders').get().c,
      gmv: db.prepare(`SELECT COALESCE(SUM(total),0) s FROM orders WHERE status NOT IN ('cancelled','returned')`).get().s,
      pendingActivations: db.prepare(`SELECT COUNT(*) c FROM activation_requests WHERE status = 'pending'`).get().c,
      activationRevenue: db.prepare(`SELECT COALESCE(SUM(amount),0) s FROM activation_requests WHERE status = 'approved'`).get().s
    });
  },
  'GET /api/admin/merchants': (req, res, user, p, url) => {
    const q = url.searchParams.get('q');
    let sql = `SELECT u.id, u.email, u.name, u.phone, u.created_at, s.id store_id, s.name store_name, s.slug, s.is_published, s.published_until,
      (SELECT COUNT(*) FROM orders o WHERE o.store_id = s.id) orders_count,
      (SELECT COALESCE(SUM(o.total),0) FROM orders o WHERE o.store_id = s.id AND o.status NOT IN ('cancelled','returned')) gmv
      FROM users u LEFT JOIN stores s ON s.user_id = u.id WHERE u.is_admin = 0`;
    const vals = [];
    if (q) { sql += ' AND (u.email LIKE ? OR u.name LIKE ? OR s.name LIKE ?)'; vals.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    sql += ' ORDER BY u.created_at DESC LIMIT 200';
    json(res, 200, { merchants: db.prepare(sql).all(...vals) });
  },
  'GET /api/admin/activations': (req, res, user, p, url) => {
    const status = url.searchParams.get('status');
    let sql = `SELECT a.*, u.email, u.name user_name, s.name store_name, s.slug FROM activation_requests a
      JOIN users u ON u.id = a.user_id JOIN stores s ON s.id = a.store_id`;
    const vals = [];
    if (status) { sql += ' WHERE a.status = ?'; vals.push(status); }
    sql += ' ORDER BY a.id DESC LIMIT 200';
    json(res, 200, { requests: db.prepare(sql).all(...vals) });
  },
  'POST /api/admin/activations/:id/approve': (req, res, user, p) => {
    const r = db.prepare('SELECT * FROM activation_requests WHERE id = ?').get(p.id);
    if (!r || r.status !== 'pending') return json(res, 400, { error: 'الطلب غير متاح' });
    const until = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    db.prepare(`UPDATE activation_requests SET status = 'approved', reviewed_at = datetime('now') WHERE id = ?`).run(p.id);
    db.prepare('UPDATE stores SET is_published = 1, published_until = ? WHERE id = ?').run(until, r.store_id);
    json(res, 200, { ok: true, published_until: until });
  },
  'POST /api/admin/activations/:id/reject': async (req, res, user, p) => {
    const b = await readJSON(req);
    db.prepare(`UPDATE activation_requests SET status = 'rejected', admin_note = ?, reviewed_at = datetime('now') WHERE id = ? AND status = 'pending'`).run((b && b.note) || '', p.id);
    json(res, 200, { ok: true });
  },
  'GET /api/admin/stores': (req, res, user) => {
    json(res, 200, {
      stores: db.prepare(`SELECT s.*, u.email owner_email,
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id) products_count,
        (SELECT COUNT(*) FROM orders o WHERE o.store_id = s.id) orders_count
        FROM stores s JOIN users u ON u.id = s.user_id ORDER BY s.id DESC LIMIT 200`).all()
    });
  },
  'PUT /api/admin/stores/:id/publish': async (req, res, user, p) => {
    const b = await readJSON(req);
    db.prepare('UPDATE stores SET is_published = ?, published_until = ? WHERE id = ?')
      .run(b.published ? 1 : 0, b.published ? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) : null, p.id);
    json(res, 200, { ok: true });
  },
  'GET /api/admin/integrations': (req, res, user) => {
    json(res, 200, { providers: integ.status() });
  },
  'PUT /api/admin/integrations': async (req, res, user) => {
    const b = await readJSON(req); if (!b || typeof b !== 'object') return json(res, 400, { error: 'بيانات غير صالحة' });
    const allowed = new Set(Object.values(integ.PROVIDERS).flatMap(p => p.keys));
    for (const [k, v] of Object.entries(b)) {
      if (!allowed.has(k)) continue;
      integ.setSetting(k, String(v).trim());
    }
    json(res, 200, { providers: integ.status() });
  },
  'GET /api/admin/integration-events': (req, res, user, p, url) => {
    const provider = url.searchParams.get('provider');
    const rows = provider
      ? db.prepare('SELECT * FROM integration_events WHERE provider = ? ORDER BY id DESC LIMIT 50').all(provider)
      : db.prepare('SELECT * FROM integration_events ORDER BY id DESC LIMIT 50').all();
    json(res, 200, { events: rows });
  },
  'GET /api/admin/orders': (req, res, user) => {
    json(res, 200, {
      orders: db.prepare(`SELECT o.id, o.number, o.customer_name, o.total, o.status, o.created_at, s.name store_name
        FROM orders o JOIN stores s ON s.id = o.store_id ORDER BY o.created_at DESC LIMIT 50`).all()
    });
  },

  // ---------- public storefront API ----------
  'GET /api/public/:slug/store': (req, res, user, p) => {
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(store.theme_id);
    const zones = db.prepare('SELECT name, governorates, price, per_item, free_over FROM shipping_zones WHERE store_id = ?').all(store.id);
    json(res, 200, {
      store: { name: store.name, slug: store.slug, description: store.description, announcement: store.announcement, whatsapp: store.whatsapp, free_shipping_over: store.free_shipping_over, is_published: !!store.is_published, published_until: store.published_until },
      theme: theme ? { id: theme.id, name_ar: theme.name_ar, config: JSON.parse(theme.config) } : null,
      theme_settings: JSON.parse(store.theme_settings || '{}'),
      payments: (JSON.parse(store.theme_settings || '{}').payments) || { cod: true, online: false },
      zones
    });
  },
  'GET /api/public/:slug/products': (req, res, user, p) => {
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const products = db.prepare(`SELECT id, name, description, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' ORDER BY created_at DESC`).all(store.id);
    json(res, 200, { products: products.map(x => ({ ...x, images: JSON.parse(x.images) })) });
  },
  'POST /api/public/:slug/track': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, {});
    const store = db.prepare('SELECT id FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, {});
    const ok = ['page_view', 'product_view', 'add_to_cart', 'begin_checkout', 'purchase'];
    if (ok.includes(b.type)) db.prepare('INSERT INTO events (store_id, type, session_id, product_id) VALUES (?, ?, ?, ?)').run(store.id, b.type, String(b.session_id || ''), b.product_id || null);
    json(res, 200, { ok: true });
  },
  'POST /api/public/:slug/cart': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b || !b.session_id) return json(res, 400, {});
    const store = db.prepare('SELECT id FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, {});
    db.prepare(`INSERT INTO carts (store_id, session_id, customer_phone, items, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(store_id, session_id) DO UPDATE SET items = excluded.items, customer_phone = COALESCE(excluded.customer_phone, carts.customer_phone), updated_at = datetime('now')`)
      .run(store.id, b.session_id, normalizePhone(b.customer_phone || '') || '', JSON.stringify(b.items || []));
    json(res, 200, { ok: true });
  },
  'POST /api/public/:slug/validate-coupon': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = db.prepare('SELECT id FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const c = db.prepare(`SELECT * FROM coupons WHERE store_id = ? AND code = ? AND active = 1`).get(store.id, String(b.code || '').toUpperCase().trim());
    if (!c) return json(res, 404, { error: 'كود غير صالح' });
    if (c.expires_at && c.expires_at < new Date().toISOString()) return json(res, 400, { error: 'الكود منتهي' });
    if (c.usage_limit && c.used_count >= c.usage_limit) return json(res, 400, { error: 'انتهت مرات استخدام الكود' });
    if (c.min_order && b.subtotal < c.min_order) return json(res, 400, { error: `الكود يتطلب حد أدنى ${c.min_order} ج.م` });
    const discount = c.type === 'percent' ? Math.round(b.subtotal * c.value / 100) : Math.min(c.value, b.subtotal);
    json(res, 200, { ok: true, code: c.code, discount });
  },
  'POST /api/public/:slug/orders': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const phone = normalizePhone(b.phone);
    if (!b.name || !EG_PHONE.test(phone) || !b.address) return json(res, 400, { error: 'تأكد من الاسم ورقم الهاتف المصري والعنوان' });
    if (db.prepare('SELECT id FROM blocked_numbers WHERE store_id = ? AND phone = ?').get(store.id, phone))
      return json(res, 403, { error: 'عذراً، لا يمكن إتمام الطلب بهذا الرقم. تواصل مع المتجر للمساعدة.' });
    if (!Array.isArray(b.items) || !b.items.length) return json(res, 400, { error: 'السلة فارغة' });

    // validate items against live products
    const lineItems = [];
    for (const it of b.items) {
      const prod = db.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ? AND status = 'active'`).get(it.product_id, store.id);
      if (!prod) return json(res, 400, { error: `منتج غير متاح: ${it.name || it.product_id}` });
      const qty = Math.max(1, Math.min(parseInt(it.qty) || 1, 20));
      if (prod.stock < qty) return json(res, 400, { error: `الكمية غير متوفرة من "${prod.name}"` });
      lineItems.push({ prod, qty });
    }
    const subtotal = lineItems.reduce((s, li) => s + li.prod.price * li.qty, 0);

    // shipping by governorate
    let shipping = 0;
    const zones = db.prepare('SELECT * FROM shipping_zones WHERE store_id = ?').all(store.id);
    const zone = zones.find(z => (z.governorates || '').split(',').map(x => x.trim()).includes(b.governorate)) || zones[0];
    if (zone) shipping = (zone.free_over && subtotal >= zone.free_over) ? 0 : zone.price * (zone.per_item ? lineItems.reduce((s, li) => s + li.qty, 0) : 1);
    if (store.free_shipping_over && subtotal >= store.free_shipping_over) shipping = 0;

    // coupon
    let discount = 0, couponCode = null;
    if (b.coupon) {
      const c = db.prepare(`SELECT * FROM coupons WHERE store_id = ? AND code = ? AND active = 1`).get(store.id, String(b.coupon).toUpperCase().trim());
      if (c && (!c.expires_at || c.expires_at >= new Date().toISOString()) && (!c.usage_limit || c.used_count < c.usage_limit) && (!c.min_order || subtotal >= c.min_order)) {
        discount = c.type === 'percent' ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
        couponCode = c.code;
        db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(c.id);
      }
    }
    const total = Math.max(0, subtotal + shipping - discount);
    const count = db.prepare('SELECT COUNT(*) c FROM orders WHERE store_id = ?').get(store.id).c;
    const number = `${store.slug.slice(0, 2).toUpperCase()}-${1021 + count}`;
    const paymentsCfg = (JSON.parse(store.theme_settings || '{}').payments) || { cod: true, online: false };
    let payMethod = 'cod';
    if (b.payment_method === 'online') {
      if (!paymentsCfg.online) return json(res, 400, { error: 'الدفع الأونلاين غير مفعّل لهذا المتجر — اختر الدفع عند الاستلام' });
      payMethod = 'online';
    }

    const r = db.prepare(`INSERT INTO orders (store_id, number, customer_name, customer_phone, customer_address, governorate, notes, subtotal, shipping, discount, total, coupon_code, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(store.id, number, b.name.trim(), phone, b.address.trim(), b.governorate || '', (b.notes || '').trim(), subtotal, shipping, discount, total, couponCode, payMethod);
    const oid = r.lastInsertRowid;
    const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)');
    for (const li of lineItems) {
      itemStmt.run(oid, li.prod.id, li.prod.name, li.prod.price, li.qty, JSON.parse(li.prod.images)[0] || '');
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(li.qty, li.prod.id);
    }
    db.prepare('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)').run(oid, 'new');
    db.prepare(`INSERT INTO events (store_id, type, session_id) VALUES (?, 'purchase', ?)`).run(store.id, String(b.session_id || ''));
    db.prepare(`UPDATE carts SET items = '[]', customer_phone = ?, updated_at = datetime('now') WHERE store_id = ? AND session_id = ?`).run(phone, store.id, String(b.session_id || ''));
    let payment = null;
    if (payMethod === 'online') {
      payment = await integ.paymobCreatePayment({ amountEGP: total, orderNumber: number, customer: { name: b.name.trim(), phone, address: b.address.trim(), governorate: b.governorate || '' }, storeCfg: (JSON.parse(store.theme_settings || '{}').payments_config) || null });
      if (payment.payment_url) {
        db.prepare(`UPDATE orders SET payment_status = 'awaiting_payment', payment_ref = ? WHERE id = ?`).run(String(payment.paymob_order_id || ''), oid);
      } else if (payment.simulated) {
        // gateway not configured: keep the order payable on delivery and record the intent internally
        db.prepare(`UPDATE orders SET payment_status = 'pending_gateway' WHERE id = ?`).run(oid);
      } else if (payment.error) {
        db.prepare(`UPDATE orders SET payment_status = 'gateway_error' WHERE id = ?`).run(oid);
      }
    } else {
      db.prepare(`UPDATE orders SET payment_status = 'cod' WHERE id = ?`).run(oid);
    }
    json(res, 201, { ok: true, number, total, shipping, discount, payment_url: payment && payment.payment_url ? payment.payment_url : null });
  }
};

// ---------- router ----------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);
    const user = getUser(req);

    // static
    if (pathname.startsWith('/public/')) return serveStatic(res, path.join(PUBLIC_DIR, pathname.slice(8)));
    if (pathname.startsWith('/uploads/')) return serveStatic(res, path.join(UPLOAD_DIR, pathname.slice(9)));

    // API
    const m = pathname.match(/^\/api\/(.+)$/);
    if (m) {
      const parts = m[1].split('/');
      let key = null, params = {};
      // try longest match with :param segments
      outer:
      for (const routeKey of Object.keys(api)) {
        const [method, routePath] = routeKey.split(' ');
        if (method !== req.method) continue;
        const rParts = routePath.replace(/^\/api\//, '').split('/');
        if (rParts.length !== parts.length) continue;
        const p = {};
        for (let i = 0; i < rParts.length; i++) {
          if (rParts[i].startsWith(':')) p[rParts[i].slice(1)] = parts[i];
          else if (rParts[i] !== parts[i]) continue outer;
        }
        key = routeKey; params = p; break;
      }
      if (!key) return json(res, 404, { error: 'Not found' });
      const isAdminRoute = key.includes('/api/admin/');
      const isPublic = key.includes('/api/public/') || key.includes('/api/auth/') || key.includes('/api/webhooks/');
      if (!isPublic && !user) return json(res, 401, { error: 'unauthenticated' });
      if (isAdminRoute && (!user || !user.is_admin)) return json(res, 403, { error: 'admin only' });
      if (!isPublic && !isAdminRoute && !getStoreForUser(user)) return json(res, 400, { error: 'لا يوجد متجر لهذا الحساب' });
      return await api[key](req, res, user, params, url);
    }

    // pages
    if (req.method !== 'GET') { res.writeHead(405); return res.end('Method not allowed'); }
    if (pathname === '/') return html(res, 200, views.landing());
    if (pathname === '/pricing' || pathname === '/pricing/') { res.writeHead(302, { Location: '/#pricing' }); return res.end(); }
    if (pathname === '/themes' || pathname === '/themes/') { res.writeHead(302, { Location: '/#themes' }); return res.end(); }
    if (pathname === '/blog' || pathname.startsWith('/blog/')) { res.writeHead(302, { Location: '/#faq' }); return res.end(); }
    if (pathname === '/login') return html(res, 200, views.login());
    if (pathname === '/register') return html(res, 200, views.register());
    if (pathname === '/app' || pathname.startsWith('/app/')) return html(res, 200, views.appShell());
    if (pathname === '/onboarding') {
      if (!user) { res.writeHead(302, { Location: '/login' }); return res.end(); }
      return html(res, 200, views.onboarding(getStoreForUser(user)));
    }
    if (pathname === '/admin') return html(res, 200, views.adminShell());

    const storeMatch = pathname.match(/^\/s\/([a-z0-9\u0600-\u06FF-]+)(\/p\/(\d+)|\/checkout|\/order\/([A-Z0-9-]+))?\/?$/i);
    if (storeMatch) {
      const [, slug, sub, productId, orderNumber] = storeMatch;
      const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(slug);
      if (!store) return html(res, 404, views.notFound('المتجر غير موجود', 'تأكد من الرابط أو تواصل مع صاحب المتجر.'));
      const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(store.theme_id);
      const tsFull = JSON.parse(store.theme_settings || '{}');
      const { pixels, payments, couriers, ...themeOverrides } = tsFull;
      const themeConfig = { ...(theme ? JSON.parse(theme.config) : {}), ...themeOverrides };
      const owner = user && user.id === store.user_id;
      if (!store.is_published && !owner && !sub) return html(res, 200, views.comingSoon(store));
      if (sub && sub.startsWith('/p/')) {
        const product = db.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ? AND status = 'active'`).get(productId, store.id);
        if (!product) return html(res, 404, views.notFound('المنتج غير موجود', 'ربما تم حذفه أو إيقافه.'));
        return html(res, 200, views.productPage(store, product, themeConfig, owner));
      }
      if (sub === '/checkout') return html(res, 200, views.checkoutPage(store, themeConfig, owner));
      if (sub && sub.startsWith('/order/')) {
        const order = db.prepare('SELECT * FROM orders WHERE store_id = ? AND number = ?').get(store.id, orderNumber);
        if (!order) return html(res, 404, views.notFound('الطلب غير موجود', 'تأكد من رقم الطلب.'));
        return html(res, 200, views.orderPage(store, order, themeConfig));
      }
      return html(res, 200, views.storefront(store, themeConfig, owner));
    }

    html(res, 404, views.notFound('الصفحة غير موجودة', 'الرابط الذي تحاول فتحه غير متاح.'));
  } catch (e) {
    console.error(e);
    try { json(res, 500, { error: 'خطأ داخلي في الخادم' }); } catch { res.end(); }
  }
});

server.listen(PORT, () => console.log(`Active Tecno running → http://localhost:${PORT}`));
