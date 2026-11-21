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
// Our own starter catalog (Easy Catalog) — generic products merchants can import. Original Arabic copy, no images.
const EASY_CATALOG = [
  { id: 'ec1', name: 'ساعة يد كلاسيك بسوار جلد', description: 'ساعة يد أنيقة بتصميم كلاسيكي، سوار جلد طبيعي مريح، مقاومة لرذاذ الماء، مناسبة للاستخدام اليومي والمناسبات.', price: 450, compare_at_price: 600, cost: 220, sku: 'EC-WATCH-01', stock: 40, category: 'إكسسوارات' },
  { id: 'ec2', name: 'نظارة شمس بعدسات مستقطبة', description: 'نظارة شمسية بإطار خفيف وعدسات مستقطبة بحماية UV400، تأتي مع جراب صلب ومنديل تنظيف.', price: 320, compare_at_price: 450, cost: 140, sku: 'EC-SUN-01', stock: 60, category: 'إكسسوارات' },
  { id: 'ec3', name: 'شنطة ظهر عملية بجيب لابتوب', description: 'شنطة ظهر بخامة مقاومة للماء، جيب مبطن للابتوب حتى 15.6 بوصة، جيوب منظمة متعددة وظهر مريح للاستخدام اليومي.', price: 550, compare_at_price: 750, cost: 280, sku: 'EC-BAG-01', stock: 35, category: 'شنط' },
  { id: 'ec4', name: 'محفظة جلد طبيعي بحماية RFID', description: 'محفظة رجالية من الجلد الطبيعي بتصميم نحيف، تحتوي على طبقة حماية RFID لتأمين البطاقات، وتتسع لـ 8 بطاقات ونقود ورقية.', price: 280, compare_at_price: 380, cost: 120, sku: 'EC-WALLET-01', stock: 80, category: 'إكسسوارات' },
  { id: 'ec5', name: 'سماعات بلوتوث لاسلكية بعزل ضوضاء', description: 'سماعات أذن لاسلكية ببلوتوث 5.3، عزل ضوضاء نشط، بطارية تدوم حتى 24 ساعة مع علبة الشحن، ومقاومة للعرق.', price: 750, compare_at_price: 999, cost: 380, sku: 'EC-AUDIO-01', stock: 50, category: 'إلكترونيات' },
  { id: 'ec6', name: 'حامل موبايل مغناطيسي للسيارة', description: 'حامل موبايل مغناطيسي قوي يثبت على فتحة التكييف، دوران 360 درجة، متوافق مع جميع الموبايلات.', price: 150, compare_at_price: 220, cost: 55, sku: 'EC-CAR-01', stock: 120, category: 'إلكترونيات' },
  { id: 'ec7', name: 'طقم أكواب سيراميك (6 قطع)', description: 'طقم 6 أكواب سيراميك بتصميم عصري، آمنة للميكروويف وغسالة الأطباق، سعة 250 مل للكوب.', price: 380, compare_at_price: 500, cost: 170, sku: 'EC-HOME-01', stock: 45, category: 'المنزل' },
  { id: 'ec8', name: 'منظم مكتب خشبي متعدد الأدراج', description: 'منظم مكتب من الخشب الطبيعي بأدراج وأقسام متعددة لترتيب الأدوات المكتبية والموبايل والأوراق.', price: 260, compare_at_price: 350, cost: 110, sku: 'EC-HOME-02', stock: 30, category: 'المنزل' },
  { id: 'ec9', name: 'تيشيرت قطن بيزك بقصّة مريحة', description: 'تيشيرت قطن 100% بخامة ثقيلة ناعمة، قصّة مريحة مناسبة للجنسين، متاح بمقاسات من S إلى XXL.', price: 220, compare_at_price: 300, cost: 90, sku: 'EC-FASH-01', stock: 100, category: 'ملابس' },
  { id: 'ec10', name: 'كوب حراري ستانلس يحافظ على الحرارة', description: 'كوب حراري ستانلس ستيل بجدار مزدوج، يحافظ على المشروبات ساخنة 6 ساعات وباردة 12 ساعة، بغطاء محكم ضد التسريب.', price: 340, compare_at_price: 450, cost: 150, sku: 'EC-HOME-03', stock: 70, category: 'المنزل' }
];
const verifyCodes = new Map(); // email -> { code, userId, expires } — code is emailed when the email provider is configured; otherwise returned for the on-screen verifier
const api = {
  // auth
  'POST /api/auth/register': async (req, res) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const { email, password, name, storeName, slug, phone, currency } = b;
    if (!email || !password || !name || !storeName) return json(res, 400, { error: 'كل الحقول مطلوبة' });
    if (password.length < 8) return json(res, 400, { error: 'كلمة المرور 8 أحرف على الأقل' });
    const s = String(slug || storeName).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-+|-+$/g, '') || 'store';
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())) return json(res, 409, { error: 'البريد مسجل بالفعل' });
    let finalSlug = s, n = 1;
    while (db.prepare('SELECT id FROM stores WHERE slug = ?').get(finalSlug)) finalSlug = `${s}-${++n}`;
    const cur = ['EGP', 'SAR', 'AED', 'USD'].includes(currency) ? currency : 'EGP';
    const u = db.prepare('INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)').run(email.toLowerCase(), hashPassword(password), name, String(phone || ''));
    // platform referral attribution (اكتف affiliate): ?ref=<referral_code> captured by the register page
    if (b.ref) {
      const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(String(b.ref).trim().toLowerCase());
      if (referrer && referrer.id !== u.lastInsertRowid) {
        try { db.prepare(`INSERT INTO referrals (referrer_user_id, referred_user_id, commission, status) VALUES (?, ?, 0, 'pending')`).run(referrer.id, u.lastInsertRowid); } catch (e) {}
      }
    }
    db.prepare('INSERT INTO stores (user_id, name, slug, currency) VALUES (?, ?, ?, ?)').run(u.lastInsertRowid, storeName, finalSlug, cur);
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
    json(res, 200, { themes: db.prepare("SELECT * FROM themes ORDER BY (id LIKE 'eo-%') DESC, rowid").all().map(t => ({ ...t, config: JSON.parse(t.config) })) });
  },

  // products
  'GET /api/products': (req, res, user) => {
    const store = getStoreForUser(user);
    json(res, 200, { products: db.prepare('SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC').all(store.id) });
  },
  'POST /api/products': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !b.name || !(b.price > 0)) return json(res, 400, { error: 'الاسم والسعر مطلوبان' });
    const store = getStoreForUser(user);
    const r = db.prepare(`INSERT INTO products (store_id, name, description, price, compare_at_price, cost, sku, stock, low_stock_threshold, category, status, images, upsell_product_id, meta_description, slug, priority, variants, stock_tracking, disable_on_zero, currency, custom_pixel, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(store.id, b.name, b.description || '', b.price, b.compare_at_price || null, b.cost || 0, b.sku || '', b.stock ?? 0, b.low_stock_threshold ?? 3, b.category || '', b.status || 'active', JSON.stringify(b.images || []), b.upsell_product_id || null, b.meta_description || '', b.slug || '', b.priority || 0, JSON.stringify(b.variants || []), b.stock_tracking ? 1 : 0, b.disable_on_zero ? 1 : 0, b.currency || '', b.custom_pixel || '', JSON.stringify(b.settings || {}));
    json(res, 201, { product: db.prepare('SELECT * FROM products WHERE id = ?').get(r.lastInsertRowid) });
  },
  'PUT /api/products/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const prod = db.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?').get(p.id, store.id);
    if (!prod) return json(res, 404, { error: 'المنتج غير موجود' });
    const fields = ['name', 'description', 'price', 'compare_at_price', 'cost', 'sku', 'stock', 'low_stock_threshold', 'category', 'status', 'upsell_product_id', 'meta_description', 'slug', 'priority', 'stock_tracking', 'disable_on_zero', 'currency', 'custom_pixel'];
    const sets = [], vals = [];
    for (const f of fields) if (f in b) { sets.push(`${f} = ?`); vals.push(b[f]); }
    if (b.images) { sets.push('images = ?'); vals.push(JSON.stringify(b.images)); }
    if (b.variants) { sets.push('variants = ?'); vals.push(JSON.stringify(b.variants)); }
    if (b.settings) { sets.push('settings = ?'); vals.push(JSON.stringify(b.settings)); }
    if (sets.length) db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...vals, prod.id);
    json(res, 200, { product: db.prepare('SELECT * FROM products WHERE id = ?').get(prod.id) });
  },
  'DELETE /api/products/:id': (req, res, user, p) => {
    const store = getStoreForUser(user);
    db.prepare('DELETE FROM products WHERE id = ? AND store_id = ?').run(p.id, store.id);
    json(res, 200, { ok: true });
  },
  'POST /api/products/:id/duplicate': (req, res, user, p) => {
    const store = getStoreForUser(user);
    const prod = db.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?').get(p.id, store.id);
    if (!prod) return json(res, 404, { error: 'المنتج غير موجود' });
    const r = db.prepare(`INSERT INTO products (store_id, name, description, price, compare_at_price, cost, sku, stock, low_stock_threshold, category, status, images, upsell_product_id, meta_description, slug, priority, variants, stock_tracking, disable_on_zero, currency, custom_pixel, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(store.id, prod.name + ' (نسخة)', prod.description, prod.price, prod.compare_at_price, prod.cost, prod.sku ? prod.sku + '-copy' : '', prod.stock, prod.low_stock_threshold, prod.category, 'draft', prod.images, prod.upsell_product_id, prod.meta_description, prod.slug ? prod.slug + '-copy' : '', prod.priority, prod.variants, prod.stock_tracking, prod.disable_on_zero, prod.currency, prod.custom_pixel, prod.settings);
    json(res, 201, { product: db.prepare('SELECT * FROM products WHERE id = ?').get(r.lastInsertRowid) });
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
    if (isDemoStore(store.id)) return json(res, 400, { error: 'إرسال واتساب معطّل في المتجر التجريبي — لا رسائل حقيقية من المتاجر التجريبية' });
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
  'GET /api/blocked': (req, res, user, p, url) => {
    const kind = url.searchParams.get('kind');
    const rows = kind
      ? db.prepare('SELECT * FROM blocked_numbers WHERE store_id = ? AND kind = ? ORDER BY id DESC').all(getStoreForUser(user).id, kind)
      : db.prepare('SELECT * FROM blocked_numbers WHERE store_id = ? ORDER BY id DESC').all(getStoreForUser(user).id);
    json(res, 200, { blocked: rows });
  },
  'POST /api/blocked': async (req, res, user) => {
    const b = await readJSON(req); const phone = normalizePhone(b && b.phone);
    if (!EG_PHONE.test(phone)) return json(res, 400, { error: 'رقم غير صالح' });
    const kind = b.kind === 'otp' ? 'otp' : 'order';
    db.prepare('INSERT OR IGNORE INTO blocked_numbers (store_id, phone, reason, kind) VALUES (?, ?, ?, ?)').run(getStoreForUser(user).id, phone, b.reason || '', kind);
    json(res, 201, { ok: true });
  },

  // newsletter
  'GET /api/newsletter': (req, res, user) => json(res, 200, { subscribers: db.prepare('SELECT * FROM newsletter_subscribers WHERE store_id = ? ORDER BY id DESC').all(getStoreForUser(user).id) }),
  'DELETE /api/newsletter/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM newsletter_subscribers WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },
  'POST /api/public/:slug/newsletter': async (req, res, user, p) => {
    const b = await readJSON(req); const email = String((b && b.email) || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, 400, { error: 'بريد إلكتروني غير صالح' });
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (store_id, email) VALUES (?, ?)').run(store.id, email);
    json(res, 201, { ok: true });
  },

  // ---------- H2: builder sections ----------
  'GET /api/sections': (req, res, user) => {
    const url = new URL(req.url, 'http://x'); const page = url.searchParams.get('page') || 'home';
    const sections = db.prepare('SELECT * FROM store_sections WHERE store_id = ? AND page = ? ORDER BY position, id').all(getStoreForUser(user).id, page);
    json(res, 200, { sections });
  },
  'POST /api/sections': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !b.type) return json(res, 400, { error: 'نوع القسم مطلوب' });
    const store = getStoreForUser(user);
    const page = String(b.page || 'home'); const zone = String(b.zone || 'content');
    const max = db.prepare('SELECT COALESCE(MAX(position),0) m FROM store_sections WHERE store_id = ? AND page = ? AND zone = ?').get(store.id, page, zone).m;
    const r = db.prepare('INSERT INTO store_sections (store_id, page, zone, position, type, settings) VALUES (?, ?, ?, ?, ?, ?)').run(store.id, page, zone, max + 1, String(b.type), JSON.stringify(b.settings || {}));
    json(res, 201, { section: db.prepare('SELECT * FROM store_sections WHERE id = ?').get(r.lastInsertRowid) });
  },
  'PUT /api/sections/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const sets = [], vals = [];
    if (b.settings !== undefined) { sets.push('settings = ?'); vals.push(JSON.stringify(b.settings)); }
    if (b.enabled !== undefined) { sets.push('enabled = ?'); vals.push(b.enabled ? 1 : 0); }
    if (b.zone !== undefined) { sets.push('zone = ?'); vals.push(String(b.zone)); }
    if (sets.length) db.prepare(`UPDATE store_sections SET ${sets.join(', ')} WHERE id = ? AND store_id = ?`).run(...vals, p.id, store.id);
    json(res, 200, { ok: true });
  },
  'POST /api/sections/:id/move': async (req, res, user, p) => {
    const b = await readJSON(req); const dir = b && b.dir === 'down' ? 1 : -1;
    const store = getStoreForUser(user);
    const sec = db.prepare('SELECT * FROM store_sections WHERE id = ? AND store_id = ?').get(p.id, store.id);
    if (!sec) return json(res, 404, { error: 'غير موجود' });
    const sib = db.prepare(`SELECT * FROM store_sections WHERE store_id = ? AND page = ? AND zone = ? AND position ${dir === 1 ? '>' : '<'} ? ORDER BY position ${dir === 1 ? 'ASC' : 'DESC'} LIMIT 1`).get(store.id, sec.page, sec.zone, sec.position);
    if (sib) {
      db.prepare('UPDATE store_sections SET position = ? WHERE id = ?').run(sib.position, sec.id);
      db.prepare('UPDATE store_sections SET position = ? WHERE id = ?').run(sec.position, sib.id);
    }
    json(res, 200, { ok: true });
  },
  'DELETE /api/sections/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM store_sections WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },
  'POST /api/sections/reorder': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !Array.isArray(b.ids)) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const page = String(b.page || 'home'); const zone = String(b.zone || 'content');
    const upd = db.prepare('UPDATE store_sections SET zone = ?, position = ? WHERE id = ? AND store_id = ? AND page = ?');
    b.ids.forEach((id, i) => upd.run(zone, i + 1, id, store.id, page));
    json(res, 200, { ok: true });
  },
  'GET /api/builder/render': (req, res, user) => {
    const url = new URL(req.url, 'http://x'); const page = url.searchParams.get('page') || 'home';
    const store = getStoreForUser(user);
    const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(store.theme_id);
    const tsFull = JSON.parse(store.theme_settings || '{}');
    const { pixels, payments, couriers, ...themeOverrides } = tsFull;
    const themeConfig = { ...(theme ? JSON.parse(theme.config) : {}), ...themeOverrides };
    json(res, 200, views.builderRender(store, themeConfig, page));
  },

  // ---------- F2: products cluster ----------
  'GET /api/categories': (req, res, user) => json(res, 200, { categories: db.prepare('SELECT * FROM categories WHERE store_id = ? ORDER BY priority ASC, name').all(getStoreForUser(user).id) }),
  'POST /api/categories': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !String(b.name || '').trim()) return json(res, 400, { error: 'اسم القسم مطلوب' });
    const store = getStoreForUser(user);
    try {
      const r = db.prepare('INSERT INTO categories (store_id, name, priority) VALUES (?, ?, ?)').run(store.id, String(b.name).trim(), b.priority || 0);
      json(res, 201, { category: db.prepare('SELECT * FROM categories WHERE id = ?').get(r.lastInsertRowid) });
    } catch (e) { json(res, 409, { error: 'هذا القسم موجود بالفعل' }); }
  },
  'PUT /api/categories/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const sets = [], vals = [];
    if (b.name !== undefined) { sets.push('name = ?'); vals.push(String(b.name).trim()); }
    if (b.priority !== undefined) { sets.push('priority = ?'); vals.push(b.priority | 0); }
    if (sets.length) db.prepare(`UPDATE categories SET ${sets.join(', ')} WHERE id = ? AND store_id = ?`).run(...vals, p.id, store.id);
    json(res, 200, { ok: true });
  },
  'DELETE /api/categories/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM categories WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  'GET /api/reviews': (req, res, user) => json(res, 200, {
    reviews: db.prepare(`SELECT r.*, p.name AS product_name FROM reviews r JOIN products p ON p.id = r.product_id WHERE r.store_id = ? ORDER BY r.id DESC`).all(getStoreForUser(user).id)
  }),
  'PUT /api/reviews/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    if (b.status && ['pending', 'published', 'hidden'].includes(b.status)) db.prepare('UPDATE reviews SET status = ? WHERE id = ? AND store_id = ?').run(b.status, p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },
  'DELETE /api/reviews/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM reviews WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },
  'POST /api/public/:slug/reviews': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b || !b.product_id || !String(b.customer_name || '').trim()) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const rating = Math.min(5, Math.max(1, b.rating | 0 || 5));
    db.prepare('INSERT INTO reviews (store_id, product_id, customer_name, rating, text) VALUES (?, ?, ?, ?, ?)').run(store.id, b.product_id, String(b.customer_name).trim(), rating, String(b.text || '').slice(0, 1000));
    json(res, 201, { ok: true });
  },

  'GET /api/ab-tests': (req, res, user) => json(res, 200, {
    tests: db.prepare(`SELECT t.*, p.name AS product_name FROM ab_tests t LEFT JOIN products p ON p.id = t.product_id WHERE t.store_id = ? ORDER BY t.id DESC`).all(getStoreForUser(user).id)
  }),
  'POST /api/ab-tests': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !String(b.name || '').trim()) return json(res, 400, { error: 'اسم الاختبار مطلوب' });
    const store = getStoreForUser(user);
    const r = db.prepare('INSERT INTO ab_tests (store_id, name, product_id, variant_a, variant_b) VALUES (?, ?, ?, ?, ?)')
      .run(store.id, String(b.name).trim(), b.product_id || null, JSON.stringify(b.variant_a || {}), JSON.stringify(b.variant_b || {}));
    json(res, 201, { test: db.prepare('SELECT * FROM ab_tests WHERE id = ?').get(r.lastInsertRowid) });
  },
  'PUT /api/ab-tests/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    if (b.name !== undefined) db.prepare('UPDATE ab_tests SET name = ? WHERE id = ? AND store_id = ?').run(String(b.name).trim(), p.id, store.id);
    if (b.variant_a !== undefined) db.prepare('UPDATE ab_tests SET variant_a = ? WHERE id = ? AND store_id = ?').run(JSON.stringify(b.variant_a), p.id, store.id);
    if (b.variant_b !== undefined) db.prepare('UPDATE ab_tests SET variant_b = ? WHERE id = ? AND store_id = ?').run(JSON.stringify(b.variant_b), p.id, store.id);
    if (b.status && ['running', 'stopped'].includes(b.status)) db.prepare('UPDATE ab_tests SET status = ? WHERE id = ? AND store_id = ?').run(b.status, p.id, store.id);
    json(res, 200, { ok: true });
  },
  'DELETE /api/ab-tests/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM ab_tests WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },
  'POST /api/public/:slug/ab-event': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b || !b.test_id) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const col = (b.variant === 'b' ? (b.kind === 'order' ? 'orders_b' : 'views_b') : (b.kind === 'order' ? 'orders_a' : 'views_a'));
    db.prepare(`UPDATE ab_tests SET ${col} = ${col} + 1 WHERE id = ? AND store_id = ?`).run(b.test_id, store.id);
    json(res, 200, { ok: true });
  },

  // product feed (Meta/Google catalog CSV) — public, per store
  'GET /api/public/:slug/feed.csv': (req, res, user, p) => {
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const prods = db.prepare(`SELECT * FROM products WHERE store_id = ? AND status = 'active' ORDER BY id`).all(store.id);
    const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const base = `https://${req.headers.host || 'active-order.onrender.com'}`;
    const rows = ['id,title,description,availability,condition,price,link,image_link'];
    for (const pr of prods) {
      let img = ''; try { const imgs = JSON.parse(pr.images || '[]'); img = imgs[0] || ''; } catch (e) {}
      if (img && img.startsWith('/')) img = base + img;
      rows.push([pr.id, esc(pr.name), esc((pr.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()), (pr.stock > 0 ? 'in stock' : 'out of stock'), 'new', `${Number(pr.price).toFixed(2)} EGP`, `${base}/s/${store.slug}#p-${pr.id}`, esc(img)].join(','));
    }
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8' });
    res.end(rows.join('\n'));
  },

  // easy catalog: our own starter product library merchants can import
  'GET /api/easy-catalog': (req, res, user) => json(res, 200, { items: EASY_CATALOG }),
  'POST /api/easy-catalog/import': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !Array.isArray(b.ids)) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    let added = 0;
    const ins = db.prepare(`INSERT INTO products (store_id, name, description, price, compare_at_price, cost, sku, stock, low_stock_threshold, category, status, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', '[]')`);
    for (const id of b.ids) {
      const item = EASY_CATALOG.find(x => x.id === id);
      if (!item) continue;
      ins.run(store.id, item.name, item.description, item.price, item.compare_at_price || null, item.cost || 0, item.sku || '', item.stock ?? 20, 3, item.category || '');
      added++;
    }
    json(res, 201, { added });
  },

  // ---------- F3: funnels ----------
  'GET /api/funnels': (req, res, user) => json(res, 200, {
    funnels: db.prepare(`SELECT f.*, p.name AS product_name FROM funnels f LEFT JOIN products p ON p.id = f.product_id WHERE f.store_id = ? ORDER BY f.id DESC`).all(getStoreForUser(user).id)
  }),
  'POST /api/funnels': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !String(b.name || '').trim()) return json(res, 400, { error: 'اسم الـ Funnel مطلوب' });
    const store = getStoreForUser(user);
    if (b.product_id && !db.prepare('SELECT id FROM products WHERE id = ? AND store_id = ?').get(b.product_id, store.id)) return json(res, 400, { error: 'المنتج غير موجود' });
    const r = db.prepare('INSERT INTO funnels (store_id, name, product_id) VALUES (?, ?, ?)').run(store.id, String(b.name).trim(), b.product_id || null);
    json(res, 201, { funnel: db.prepare('SELECT * FROM funnels WHERE id = ?').get(r.lastInsertRowid) });
  },
  'PUT /api/funnels/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    if (b.name !== undefined) db.prepare('UPDATE funnels SET name = ? WHERE id = ? AND store_id = ?').run(String(b.name).trim(), p.id, store.id);
    if (b.product_id !== undefined) db.prepare('UPDATE funnels SET product_id = ? WHERE id = ? AND store_id = ?').run(b.product_id || null, p.id, store.id);
    if (b.status && ['active', 'paused'].includes(b.status)) db.prepare('UPDATE funnels SET status = ? WHERE id = ? AND store_id = ?').run(b.status, p.id, store.id);
    json(res, 200, { ok: true });
  },
  'DELETE /api/funnels/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM funnels WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  // ---------- F6: settings tree ----------
  'PUT /api/store/settings': async (req, res, user) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const allowed = ['policies', 'head_code', 'seo', 'social', 'custom_domain', 'max_items', 'notify_email', 'notifications'];
    const up = db.prepare('INSERT INTO store_settings (store_id, key, value, updated_at) VALUES (?, ?, ?, datetime(\'now\')) ON CONFLICT(store_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at');
    for (const k of allowed) if (k in b) up.run(store.id, k, typeof b[k] === 'string' ? b[k] : JSON.stringify(b[k]));
    if ('phone' in b) db.prepare('UPDATE stores SET phone = ? WHERE id = ?').run(String(b.phone).trim(), store.id);
    json(res, 200, { ok: true });
  },
  'GET /api/store/settings': (req, res, user) => {
    const store = getStoreForUser(user);
    const s = Object.fromEntries(db.prepare('SELECT key, value FROM store_settings WHERE store_id = ?').all(store.id).map(r => [r.key, r.value]));
    json(res, 200, { settings: s, api_key: store.api_key || null });
  },
  'POST /api/store/api-key': (req, res, user) => {
    const store = getStoreForUser(user);
    const key = 'ak_' + crypto.randomBytes(20).toString('hex');
    db.prepare('UPDATE stores SET api_key = ? WHERE id = ?').run(key, store.id);
    json(res, 200, { api_key: key });
  },
  'GET /api/v1/:slug/orders': (req, res, user, p, url) => {
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store || !store.api_key || url.searchParams.get('key') !== store.api_key) return json(res, 401, { error: 'invalid api key' });
    const orders = db.prepare('SELECT number, customer_name, customer_phone, governorate, total, status, payment_status, created_at FROM orders WHERE store_id = ? ORDER BY id DESC LIMIT 100').all(store.id);
    json(res, 200, { orders });
  },
  'GET /api/settings/sessions': (req, res, user) => {
    const token = parseCookies(req).at_session || '';
    const rows = db.prepare('SELECT token, created_at, expires_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(user.id)
      .map(r => ({ created_at: r.created_at, expires_at: r.expires_at, current: r.token === token, hint: r.token.slice(0, 6) }));
    json(res, 200, { sessions: rows });
  },
  'POST /api/settings/sessions/revoke-others': (req, res, user) => {
    const token = parseCookies(req).at_session || '';
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(user.id, token);
    json(res, 200, { ok: true });
  },

  // ---------- F5: blogs ----------
  'GET /api/blog-categories': (req, res, user) => json(res, 200, {
    cats: db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM blog_posts p WHERE p.category_id = c.id) AS posts FROM blog_categories c WHERE c.store_id = ? ORDER BY c.id DESC`).all(getStoreForUser(user).id)
  }),
  'POST /api/blog-categories': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !String(b.name || '').trim()) return json(res, 400, { error: 'اسم القسم مطلوب' });
    try {
      const r = db.prepare('INSERT INTO blog_categories (store_id, name) VALUES (?, ?)').run(getStoreForUser(user).id, String(b.name).trim());
      json(res, 201, { id: r.lastInsertRowid });
    } catch (e) { json(res, 409, { error: 'هذا القسم موجود بالفعل' }); }
  },
  'DELETE /api/blog-categories/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM blog_categories WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },
  'GET /api/blog-posts': (req, res, user) => json(res, 200, {
    posts: db.prepare(`SELECT p.*, c.name AS category_name FROM blog_posts p LEFT JOIN blog_categories c ON c.id = p.category_id WHERE p.store_id = ? ORDER BY p.id DESC`).all(getStoreForUser(user).id)
  }),
  'POST /api/blog-posts': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !String(b.title || '').trim()) return json(res, 400, { error: 'عنوان المقال مطلوب' });
    const store = getStoreForUser(user);
    let slug = String(b.slug || b.title).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-+|-+$/g, '') || 'post', fs = slug, n = 1;
    while (db.prepare('SELECT id FROM blog_posts WHERE store_id = ? AND slug = ?').get(store.id, fs)) fs = `${slug}-${++n}`;
    const r = db.prepare('INSERT INTO blog_posts (store_id, category_id, title, slug, body, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(store.id, b.category_id || null, String(b.title).trim(), fs, String(b.body || ''), b.status === 'published' ? 'published' : 'draft');
    json(res, 201, { id: r.lastInsertRowid, slug: fs });
  },
  'PUT /api/blog-posts/:id': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ? AND store_id = ?').get(p.id, getStoreForUser(user).id);
    if (!post) return json(res, 404, { error: 'المقال غير موجود' });
    db.prepare('UPDATE blog_posts SET category_id = ?, title = ?, body = ?, status = ? WHERE id = ?')
      .run(b.category_id !== undefined ? (b.category_id || null) : post.category_id, String(b.title ?? post.title).trim(), String(b.body ?? post.body), ['draft', 'published'].includes(b.status) ? b.status : post.status, post.id);
    json(res, 200, { ok: true });
  },
  'DELETE /api/blog-posts/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM blog_posts WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  // ---------- F5: platform referral (نظام التسويق بالعمولة) ----------
  'GET /api/referrals': (req, res, user) => {
    if (!user.referral_code) {
      const code = 'at' + user.id.toString(36) + Math.random().toString(36).slice(2, 6);
      db.prepare('UPDATE users SET referral_code = ? WHERE id = ?').run(code, user.id);
      user.referral_code = code;
    }
    const rows = db.prepare(`SELECT r.*, u.name AS referred_name, u.email AS referred_email FROM referrals r JOIN users u ON u.id = r.referred_user_id WHERE r.referrer_user_id = ? ORDER BY r.id DESC`).all(user.id);
    const credited = rows.filter(r => r.status !== 'paid').reduce((t, r) => t + r.commission, 0);
    const paid = rows.filter(r => r.status === 'paid').reduce((t, r) => t + r.commission, 0);
    const withdrawals = db.prepare('SELECT * FROM withdrawal_requests WHERE user_id = ? ORDER BY id DESC').all(user.id);
    json(res, 200, { code: user.referral_code, referrals: rows, balance: credited, paid, withdrawals });
  },
  'POST /api/withdrawals': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !(+b.amount > 0) || !String(b.account || '').trim()) return json(res, 400, { error: 'المبلغ والحساب مطلوبان' });
    const bal = db.prepare(`SELECT COALESCE(SUM(commission),0) s FROM referrals WHERE referrer_user_id = ? AND status = 'credited'`).get(user.id).s;
    if (+b.amount > bal) return json(res, 400, { error: `رصيدك المتاح للسحب ${bal} ج.م فقط` });
    const r = db.prepare('INSERT INTO withdrawal_requests (user_id, amount, method, account) VALUES (?, ?, ?, ?)').run(user.id, +b.amount, String(b.method || 'instapay'), String(b.account).trim());
    json(res, 201, { id: r.lastInsertRowid });
  },

  // ---------- F5: dev requests (طلب تطويرات) ----------
  'GET /api/dev-requests': (req, res, user) => json(res, 200, {
    requests: db.prepare('SELECT * FROM dev_requests WHERE user_id = ? ORDER BY id DESC').all(user.id)
  }),
  'POST /api/dev-requests': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !String(b.title || '').trim()) return json(res, 400, { error: 'عنوان الطلب مطلوب' });
    const r = db.prepare('INSERT INTO dev_requests (user_id, title, details) VALUES (?, ?, ?)').run(user.id, String(b.title).trim(), String(b.details || ''));
    json(res, 201, { id: r.lastInsertRowid });
  },

  // ---------- F4: marketing tools ----------
  'GET /api/marketing': (req, res, user) => {
    const store = getStoreForUser(user);
    const rows = db.prepare('SELECT key, value FROM store_settings WHERE store_id = ?').all(store.id);
    const s = Object.fromEntries(rows.map(r => [r.key, r.value]));
    json(res, 200, { settings: s });
  },
  'PUT /api/marketing': async (req, res, user) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const allowed = ['min_order', 'sales_popup', 'downsell', 'wa_order_confirm', 'wa_cart_recovery', 'gmc_email', 'gmc_phone'];
    const up = db.prepare('INSERT INTO store_settings (store_id, key, value, updated_at) VALUES (?, ?, ?, datetime(\'now\')) ON CONFLICT(store_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at');
    for (const k of allowed) if (k in b) up.run(store.id, k, typeof b[k] === 'string' ? b[k] : JSON.stringify(b[k]));
    json(res, 200, { ok: true });
  },

  'GET /api/cross-sells': (req, res, user) => json(res, 200, {
    items: db.prepare(`SELECT c.id, c.product_id, c.related_product_id, p.name AS product_name, r.name AS related_name, r.price AS related_price FROM cross_sells c JOIN products p ON p.id = c.product_id JOIN products r ON r.id = c.related_product_id WHERE c.store_id = ? ORDER BY c.id DESC`).all(getStoreForUser(user).id)
  }),
  'POST /api/cross-sells': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !b.product_id || !b.related_product_id) return json(res, 400, { error: 'اختر المنتج والمنتج المرتبط' });
    if (b.product_id === b.related_product_id) return json(res, 400, { error: 'لا يمكن ربط المنتج بنفسه' });
    const store = getStoreForUser(user);
    try {
      const r = db.prepare('INSERT INTO cross_sells (store_id, product_id, related_product_id) VALUES (?, ?, ?)').run(store.id, b.product_id, b.related_product_id);
      json(res, 201, { id: r.lastInsertRowid });
    } catch (e) { json(res, 409, { error: 'هذا الربط موجود بالفعل' }); }
  },
  'DELETE /api/cross-sells/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM cross_sells WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  'GET /api/marketing/utm-stats': (req, res, user) => {
    const store = getStoreForUser(user);
    const rows = db.prepare(`SELECT utm_source, utm_medium, utm_campaign, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue FROM orders WHERE store_id = ? AND utm_source <> '' GROUP BY 1, 2, 3 ORDER BY orders DESC LIMIT 50`).all(store.id);
    json(res, 200, { stats: rows });
  },
  'GET /api/referral-links': (req, res, user) => json(res, 200, {
    links: db.prepare('SELECT * FROM referral_links WHERE store_id = ? ORDER BY id DESC').all(getStoreForUser(user).id)
  }),
  'POST /api/referral-links': async (req, res, user) => {
    const b = await readJSON(req); if (!b || !String(b.code || '').trim()) return json(res, 400, { error: 'كود الإحالة مطلوب' });
    const code = String(b.code).trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!code) return json(res, 400, { error: 'الكود يجب أن يكون حروف إنجليزية أو أرقام' });
    const store = getStoreForUser(user);
    try {
      const r = db.prepare('INSERT INTO referral_links (store_id, code, name) VALUES (?, ?, ?)').run(store.id, code, String(b.name || '').trim());
      json(res, 201, { id: r.lastInsertRowid, code });
    } catch (e) { json(res, 409, { error: 'هذا الكود مستخدم بالفعل' }); }
  },
  'DELETE /api/referral-links/:id': (req, res, user, p) => {
    db.prepare('DELETE FROM referral_links WHERE id = ? AND store_id = ?').run(p.id, getStoreForUser(user).id);
    json(res, 200, { ok: true });
  },

  // public: marketing config for storefront + recent orders for sales popup
  'GET /api/public/:slug/marketing': (req, res, user, p) => {
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const s = Object.fromEntries(db.prepare('SELECT key, value FROM store_settings WHERE store_id = ?').all(store.id).map(r => [r.key, r.value]));
    const crossSells = db.prepare(`SELECT c.product_id, r.id AS rel_id, r.name, r.price, r.compare_at_price, r.images FROM cross_sells c JOIN products r ON r.id = c.related_product_id AND r.status = 'active' AND r.stock > 0 WHERE c.store_id = ?`).all(store.id);
    json(res, 200, {
      min_order: +(s.min_order || 0), sales_popup: s.sales_popup === '1',
      downsell: s.downsell ? JSON.parse(s.downsell) : null, cross_sells: crossSells
    });
  },
  'GET /api/public/:slug/recent-orders': (req, res, user, p) => {
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const rows = db.prepare(`SELECT o.customer_name, o.governorate, o.created_at, (SELECT name FROM order_items WHERE order_id = o.id LIMIT 1) AS product FROM orders o WHERE o.store_id = ? ORDER BY o.id DESC LIMIT 10`).all(store.id);
    json(res, 200, { orders: rows.map(r => ({ name: (r.customer_name || '').split(' ')[0], governorate: r.governorate, product: r.product || '', at: r.created_at })) });
  },
  // one-click downsell from the thank-you page: repeats customer data from the original order
  'POST /api/public/:slug/orders/:number/downsell': async (req, res, user, p) => {
    const b = await readJSON(req); if (!b || !b.product_id) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(p.slug);
    if (!store) return json(res, 404, { error: 'المتجر غير موجود' });
    const orig = db.prepare('SELECT * FROM orders WHERE store_id = ? AND number = ?').get(store.id, p.number);
    if (!orig) return json(res, 404, { error: 'الطلب غير موجود' });
    const s = Object.fromEntries(db.prepare('SELECT key, value FROM store_settings WHERE store_id = ?').all(store.id).map(r => [r.key, r.value]));
    const ds = s.downsell ? JSON.parse(s.downsell) : null;
    if (!ds || ds.product_id !== b.product_id) return json(res, 400, { error: 'العرض غير متاح' });
    const prod = db.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ? AND status = 'active'`).get(b.product_id, store.id);
    if (!prod || prod.stock < 1) return json(res, 400, { error: 'المنتج غير متاح' });
    const price = Math.max(1, Math.round(prod.price * (100 - (ds.discount_pct || 0)) / 100));
    const count = db.prepare('SELECT COUNT(*) c FROM orders WHERE store_id = ?').get(store.id).c;
    const number = `${store.slug.slice(0, 2).toUpperCase()}-${1021 + count}`;
    const r = db.prepare(`INSERT INTO orders (store_id, number, customer_name, customer_phone, customer_address, governorate, notes, subtotal, shipping, discount, total, coupon_code, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 'cod')`)
      .run(store.id, number, orig.customer_name, orig.customer_phone, orig.customer_address, orig.governorate, 'عرض ما بعد الشراء', price, price, 'DOWNSELL');
    db.prepare('INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, 1)').run(r.lastInsertRowid, prod.id, prod.name, price);
    db.prepare('UPDATE products SET stock = stock - 1 WHERE id = ?').run(prod.id);
    json(res, 201, { number });
  },

  // merchant manual order (dashboard "أنشاء طلب")
  'POST /api/orders': async (req, res, user) => {
    const b = await readJSON(req); if (!b) return json(res, 400, { error: 'بيانات غير صالحة' });
    const store = getStoreForUser(user);
    const phone = normalizePhone(b.phone);
    if (!b.name || !EG_PHONE.test(phone) || !b.address) return json(res, 400, { error: 'تأكد من الاسم ورقم الهاتف المصري والعنوان' });
    if (!Array.isArray(b.items) || !b.items.length) return json(res, 400, { error: 'اختر منتجاً واحداً على الأقل' });
    const lineItems = [];
    for (const it of b.items) {
      const prod = db.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?').get(it.product_id, store.id);
      if (!prod) return json(res, 400, { error: 'منتج غير موجود' });
      const qty = Math.max(1, Math.min(parseInt(it.qty) || 1, 99));
      if (prod.stock < qty) return json(res, 400, { error: `الكمية غير متوفرة من "${prod.name}"` });
      lineItems.push({ prod, qty });
    }
    const subtotal = lineItems.reduce((s, li) => s + li.prod.price * li.qty, 0);
    let shipping = 0;
    const zones = db.prepare('SELECT * FROM shipping_zones WHERE store_id = ?').all(store.id);
    const zone = zones.find(z => (z.governorates || '').split(',').map(x => x.trim()).includes(b.governorate)) || zones[0];
    if (zone) shipping = (zone.free_over && subtotal >= zone.free_over) ? 0 : zone.price * (zone.per_item ? lineItems.reduce((s, li) => s + li.qty, 0) : 1);
    if (store.free_shipping_over && subtotal >= store.free_shipping_over) shipping = 0;
    const total = Math.max(0, subtotal + shipping);
    const count = db.prepare('SELECT COUNT(*) c FROM orders WHERE store_id = ?').get(store.id).c;
    const number = `${store.slug.slice(0, 2).toUpperCase()}-${1021 + count}`;
    const r = db.prepare(`INSERT INTO orders (store_id, number, customer_name, customer_phone, customer_address, governorate, notes, subtotal, shipping, discount, total, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'dashboard')`)
      .run(store.id, number, b.name.trim(), phone, b.address.trim(), b.governorate || '', (b.notes || '').trim(), subtotal, shipping, total);
    const oid = r.lastInsertRowid;
    const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)');
    for (const li of lineItems) {
      itemStmt.run(oid, li.prod.id, li.prod.name, li.prod.price, li.qty, JSON.parse(li.prod.images)[0] || '');
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(li.qty, li.prod.id);
    }
    db.prepare('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)').run(oid, 'new');
    json(res, 201, { ok: true, id: oid, number });
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
    // affiliate commission: 20% of the activation amount goes to the referrer, once per referred user
    try {
      const ref = db.prepare(`SELECT * FROM referrals WHERE referred_user_id = ? AND status = 'pending'`).get(r.user_id);
      if (ref) db.prepare(`UPDATE referrals SET commission = ?, status = 'credited' WHERE id = ?`).run(r.amount * 0.2, ref.id);
    } catch (e) {}
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
    const products = db.prepare(`SELECT id, name, description, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0 ORDER BY created_at DESC`).all(store.id);
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
      let pset = {}; try { pset = JSON.parse(prod.settings || '{}'); } catch (e) {}
      const qty = Math.max(1, Math.min(parseInt(it.qty) || 1, 20));
      if (prod.stock_tracking && prod.stock <= 0 && prod.disable_on_zero) return json(res, 400, { error: `منتج غير متاح: ${prod.name}` });
      if (prod.stock_tracking && prod.stock < qty) return json(res, 400, { error: `الكمية غير متوفرة من "${prod.name}"` });
      lineItems.push({ prod, qty, pset });
    }
    const subtotal = lineItems.reduce((s, li) => s + li.prod.price * li.qty, 0);

    // shipping by governorate
    let shipping = 0;
    const zones = db.prepare('SELECT * FROM shipping_zones WHERE store_id = ?').all(store.id);
    const zone = zones.find(z => (z.governorates || '').split(',').map(x => x.trim()).includes(b.governorate)) || zones[0];
    if (zone) shipping = (zone.free_over && subtotal >= zone.free_over) ? 0 : zone.price * (zone.per_item ? lineItems.reduce((s, li) => s + li.qty, 0) : 1);
    if (store.free_shipping_over && subtotal >= store.free_shipping_over) shipping = 0;
    if (lineItems.some(li => li.pset && li.pset.free_shipping)) shipping = 0;

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
    // min order value (F4 marketing setting)
    const minOrder = +(db.prepare('SELECT value FROM store_settings WHERE store_id = ? AND key = \'min_order\'').get(store.id)?.value || 0);
    if (minOrder > 0 && total < minOrder) return json(res, 400, { error: `الحد الأدنى للطلب ${minOrder} ج.م — أضف منتجات بقيمة ${minOrder - total} ج.م على الأقل` });
    // fake-order protection (F6): max items per order
    const maxItems = +(db.prepare('SELECT value FROM store_settings WHERE store_id = ? AND key = \'max_items\'').get(store.id)?.value || 0);
    const totalQty = lineItems.reduce((t, li) => t + li.qty, 0);
    if (maxItems > 0 && totalQty > maxItems) return json(res, 400, { error: `الحد الأقصى لعناصر الطلب الواحد ${maxItems} — قسّم طلبك أو تواصل مع المتجر` });
    const count = db.prepare('SELECT COUNT(*) c FROM orders WHERE store_id = ?').get(store.id).c;
    const number = `${store.slug.slice(0, 2).toUpperCase()}-${1021 + count}`;
    const paymentsCfg = (JSON.parse(store.theme_settings || '{}').payments) || { cod: true, online: false };
    let payMethod = 'cod';
    if (b.payment_method === 'online') {
      if (!paymentsCfg.online) return json(res, 400, { error: 'الدفع الأونلاين غير مفعّل لهذا المتجر — اختر الدفع عند الاستلام' });
      payMethod = 'online';
    }

    const refCode = String(b.ref_code || '').trim().toLowerCase();
    const isDemo = isDemoStore(store.id) ? 1 : 0;
    const r = db.prepare(`INSERT INTO orders (store_id, number, customer_name, customer_phone, customer_address, governorate, notes, subtotal, shipping, discount, total, coupon_code, payment_method, utm_source, utm_medium, utm_campaign, ref_code, demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(store.id, number, b.name.trim(), phone, b.address.trim(), b.governorate || '', (b.notes || '').trim(), subtotal, shipping, discount, total, couponCode, payMethod,
        String(b.utm_source || '').slice(0, 100), String(b.utm_medium || '').slice(0, 100), String(b.utm_campaign || '').slice(0, 100), refCode, isDemo);
    // funnel attribution
    if (b.funnel_id) db.prepare('UPDATE funnels SET orders = orders + 1 WHERE id = ? AND store_id = ?').run(b.funnel_id | 0, store.id);
    // referral attribution
    if (refCode) db.prepare('UPDATE referral_links SET orders = orders + 1 WHERE store_id = ? AND code = ?').run(store.id, refCode);
    // WhatsApp order confirmation (F4): auto-send when the merchant enabled it — never for demo stores
    if (!isDemo) {
      try {
        const waOn = (db.prepare("SELECT value FROM store_settings WHERE store_id = ? AND key = 'wa_order_confirm'").get(store.id) || {}).value === '1';
        if (waOn && integ.configured('whatsapp')) {
          integ.waSendTemplate({ to: phone, storeName: store.name, orderNumber: number, totalText: `${total} ج.م` })
            .then(s => { if (!s.simulated && !s.error) db.prepare('UPDATE orders SET whatsapp_confirmed = 1 WHERE id = ?').run(r.lastInsertRowid); })
            .catch(() => {});
        }
      } catch (e) { /* confirmation must never break checkout */ }
    }
    // Merchant order notifications (F6): email alert on new order when enabled + platform email configured
    try {
      if (!isDemo) {
        const n = JSON.parse((db.prepare("SELECT value FROM store_settings WHERE store_id = ? AND key = 'notifications'").get(store.id) || {}).value || '{}');
        if (n.enabled !== false && n.new_order !== false && n.email_on && n.email && integ.configured('email')) {
          integ.sendMerchantOrderEmail({ to: String(n.email).slice(0, 200), storeName: store.name, orderNumber: number, totalText: `${total} ج.م`, customerName: b.name.trim() }).catch(() => {});
        }
      }
    } catch (e) { /* notifications must never break checkout */ }
    // Meta Conversion API (server-to-server), fire-and-forget
    try {
      const pxs = (JSON.parse(store.theme_settings || '{}').pixels) || {};
      if (!isDemo && pxs.meta && pxs.capi) {
        const sha = s => crypto.createHash('sha256').update(String(s)).digest('hex');
        fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(pxs.meta)}/events?access_token=${encodeURIComponent(pxs.capi)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [{
            event_name: 'Purchase', event_time: Math.floor(Date.now() / 1000), event_id: number,
            action_source: 'website', event_source_url: `https://${req.headers.host || ''}/s/${store.slug}`,
            user_data: { ph: [sha(phone)], country: [sha('eg')] },
            custom_data: { value: total, currency: 'EGP' }
          }], ...(pxs.capi_test ? { test_event_code: pxs.capi_test } : {}) })
        }).catch(() => {});
      }
    } catch (e) { /* CAPI must never break checkout */ }
    const oid = r.lastInsertRowid;
    const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)');
    for (const li of lineItems) {
      itemStmt.run(oid, li.prod.id, li.prod.name, li.prod.price, li.qty, JSON.parse(li.prod.images)[0] || '');
      if (li.prod.stock_tracking) db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(li.qty, li.prod.id);
      if (li.pset && li.pset.fake_stock && li.pset.fake_stock_count > 0) {
        li.pset.fake_stock_count = Math.max(0, li.pset.fake_stock_count - li.qty);
        db.prepare('UPDATE products SET settings = ? WHERE id = ?').run(JSON.stringify(li.pset), li.prod.id);
      }
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

function isDemoStore(storeId) {
  try { return (db.prepare("SELECT value FROM store_settings WHERE store_id = ? AND key = 'demo_mode'").get(storeId) || {}).value === '1'; } catch (e) { return false; }
}

// F4: abandoned-cart recovery via WhatsApp — every 10 minutes, carts idle 60+ minutes
// with a phone number and items, one message per cart, never for demo stores.
function runCartRecovery() {
  try {
    if (!integ.configured('whatsapp')) return;
    const carts = db.prepare(`SELECT c.id, c.customer_phone, c.store_id, s.name AS store_name, s.slug FROM carts c JOIN stores s ON s.id = c.store_id
      WHERE c.customer_phone IS NOT NULL AND c.customer_phone <> '' AND c.items <> '[]' AND c.recovered_at IS NULL
        AND c.updated_at < datetime('now', '-60 minutes')`).all();
    for (const c of carts) {
      if (isDemoStore(c.store_id)) continue;
      const on = (db.prepare("SELECT value FROM store_settings WHERE store_id = ? AND key = 'wa_cart_recovery'").get(c.store_id) || {}).value === '1';
      if (!on) continue;
      db.prepare("UPDATE carts SET recovered_at = datetime('now') WHERE id = ?").run(c.id);
      integ.waSendCartRecovery({ to: c.customer_phone, storeName: c.store_name, storeUrl: `https://active-order.onrender.com/s/${c.slug}` }).catch(() => {});
    }
  } catch (e) { /* recovery pass must never crash the server */ }
}
setInterval(runCartRecovery, 10 * 60 * 1000).unref();

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
      const isPublic = key.includes('/api/public/') || key.includes('/api/auth/') || key.includes('/api/webhooks/') || key.startsWith('GET /api/v1/');
      if (!isPublic && !user) return json(res, 401, { error: 'unauthenticated' });
      if (isAdminRoute && (!user || !user.is_admin)) return json(res, 403, { error: 'admin only' });
      if (!isPublic && !isAdminRoute && !getStoreForUser(user)) return json(res, 400, { error: 'لا يوجد متجر لهذا الحساب' });
      return await api[key](req, res, user, params, url);
    }

    // pages
    if (req.method !== 'GET') { res.writeHead(405); return res.end('Method not allowed'); }
    if (pathname === '/') return html(res, 200, views.landing());
    if (pathname === '/pricing' || pathname === '/pricing/') return html(res, 200, views.pricingPage());
    if (pathname === '/themes' || pathname === '/themes/') return html(res, 200, views.themesPage());
    if (pathname === '/blog' || pathname === '/blog/') return html(res, 200, views.blogIndex());
    if (pathname.startsWith('/blog/')) {
      const bslug = pathname.replace(/^\/blog\//, '').replace(/\/$/, '');
      const post = views.BLOG_POSTS.find(p => p.slug === bslug);
      if (post) return html(res, 200, views.blogPostPage(post));
      if (['about-us', 'contact-us', 'conditions', 'privacy-policy'].includes(bslug)) return html(res, 200, views.blogStaticPage(bslug));
      return html(res, 404, views.notFound('الصفحة غير موجودة', 'المقال الذي تبحث عنه غير موجود'));
    }
    if (pathname === '/login') return html(res, 200, views.login());
    if (pathname === '/register') return html(res, 200, views.register());
    if (pathname === '/app' || pathname.startsWith('/app/')) return html(res, 200, views.appShell());
    if (pathname === '/onboarding') {
      if (!user) { res.writeHead(302, { Location: '/login' }); return res.end(); }
      return html(res, 200, views.onboarding(getStoreForUser(user)));
    }
    if (pathname === '/admin') return html(res, 200, views.adminShell());

    const storeMatch = pathname.match(/^\/s\/([a-z0-9\u0600-\u06FF-]+)(\/p\/(\d+)|\/f\/(\d+)|\/checkout|\/verified|\/policies|\/cat\/([^\/]+)|\/blog|\/blog\/([^\/]+)|\/order\/([A-Z0-9-]+))?\/?$/i);
    if (storeMatch) {
      const [, slug, sub, productId, funnelId, catName, , orderNumber] = storeMatch;
      const store = db.prepare('SELECT * FROM stores WHERE slug = ?').get(slug);
      if (!store) return html(res, 404, views.notFound('المتجر غير موجود', 'تأكد من الرابط أو تواصل مع صاحب المتجر.'));
      let theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(store.theme_id);
      const previewThemeId = url.searchParams.get('theme');
      if (previewThemeId && user && user.id === store.user_id) {
        const pt = db.prepare('SELECT * FROM themes WHERE id = ?').get(previewThemeId);
        if (pt) theme = pt;
      }
      const tsFull = JSON.parse(store.theme_settings || '{}');
      const { pixels, payments, couriers, ...themeOverrides } = tsFull;
      const themeConfig = { ...(theme ? JSON.parse(theme.config) : {}), ...themeOverrides };
      if (theme) themeConfig.__id = theme.id;
      const owner = user && user.id === store.user_id;
      if (!store.is_published && !owner && !sub) return html(res, 200, views.comingSoon(store));
      if (sub && sub.startsWith('/p/')) {
        const product = db.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ? AND status = 'active'`).get(productId, store.id);
        if (!product) return html(res, 404, views.notFound('المنتج غير موجود', 'ربما تم حذفه أو إيقافه.'));
        return html(res, 200, views.productPage(store, product, themeConfig, owner));
      }
      if (sub && sub.startsWith('/f/')) {
        const funnel = db.prepare(`SELECT * FROM funnels WHERE id = ? AND store_id = ? AND status = 'active'`).get(funnelId, store.id);
        if (!funnel || !funnel.product_id) return html(res, 404, views.notFound('الصفحة غير موجودة', 'ربما توقف هذا الرابط أو حُذف.'));
        const product = db.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ? AND status = 'active'`).get(funnel.product_id, store.id);
        if (!product) return html(res, 404, views.notFound('المنتج غير متاح', 'ربما تم حذفه أو إيقافه.'));
        if (!store.is_published && !owner) return html(res, 200, views.comingSoon(store));
        db.prepare('UPDATE funnels SET views = views + 1 WHERE id = ?').run(funnel.id);
        return html(res, 200, views.funnelPage(store, funnel, product, themeConfig, owner));
      }
      if (sub === '/blog') return html(res, 200, views.storeBlogIndex(store, themeConfig));
      if (sub && sub.startsWith('/blog/')) {
        const post = db.prepare(`SELECT p.*, c.name AS category_name FROM blog_posts p LEFT JOIN blog_categories c ON c.id = p.category_id WHERE p.store_id = ? AND p.slug = ? AND p.status = 'published'`).get(store.id, sub.slice(6));
        if (!post) return html(res, 404, views.notFound());
        return html(res, 200, views.storeBlogPost(store, post, themeConfig));
      }
      if (sub === '/policies') return html(res, 200, views.policiesPage(store, themeConfig));
      if (sub && sub.startsWith('/cat/')) return html(res, 200, views.categoryPage(store, catName, themeConfig, owner, url.searchParams.get('sort') || ''));
      if (sub === '/verified') {
        const stats = db.prepare(`SELECT COUNT(*) c, COALESCE(SUM(total),0) t FROM orders WHERE store_id = ? AND status NOT IN ('cancelled','returned')`).get(store.id);
        return html(res, 200, views.verifiedPage(store, stats, themeConfig));
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
