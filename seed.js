// seed.js — seeds themes, an admin, a demo merchant with a full demo store.
const { db, migrate } = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const THEMES = [
  { id: 'modern', name_ar: 'عصري — أزياء', category: 'أزياء وموضة', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#27cd27', bg: '#FFFFFF', surface: '#F6F8FC', radius: 18, header: 'centered', card: 'elevated', font: 'IBM Plex Sans Arabic' } },
  { id: 'tech', name_ar: 'تقني — إلكترونيات', category: 'إلكترونيات', is_premium: 0, price: 0,
    config: { primary: '#0B1526', accent: '#3B82F6', bg: '#FFFFFF', surface: '#F1F5F9', radius: 12, header: 'split', card: 'flat', font: 'IBM Plex Sans Arabic' } },
  { id: 'boutique', name_ar: 'بوتيك — تجميل وعناية', category: 'تجميل وعناية', is_premium: 0, price: 0,
    config: { primary: '#4A2C3D', accent: '#D98E9A', bg: '#FDF8F6', surface: '#F7ECEA', radius: 24, header: 'centered', card: 'soft', font: 'IBM Plex Sans Arabic' } },
  { id: 'royal', name_ar: 'ملكي — Premium', category: 'متاجر فاخرة', is_premium: 1, price: 450,
    config: { primary: '#101623', accent: '#C9A24B', bg: '#0F1420', surface: '#171E2E', radius: 14, header: 'split', card: 'elevated', font: 'IBM Plex Sans Arabic', dark: true } },
  { id: 'fresh', name_ar: 'طازج — سوبرماركت وعروض', category: 'أغذية وعروض', is_premium: 0, price: 0,
    config: { primary: '#14532D', accent: '#F59E0B', bg: '#FFFFFF', surface: '#F0FDF4', radius: 16, header: 'centered', card: 'soft', font: 'IBM Plex Sans Arabic' } }
];

function productImage(name, hue) {
  // Generated SVG placeholder — deterministic gradient + initial letter.
  const letter = name.trim().charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},60%,88%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},55%,72%)"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><circle cx="400" cy="380" r="170" fill="hsla(${hue},45%,40%,0.25)"/><text x="400" y="470" font-size="220" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="hsl(${hue},45%,32%)">${letter}</text></svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function seed() {
  migrate();
  const hasUsers = db.prepare('SELECT COUNT(*) c FROM users').get().c > 0;

  const themeStmt = db.prepare(`INSERT INTO themes (id, name_ar, category, is_premium, price, config)
    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`);
  for (const t of THEMES) themeStmt.run(t.id, t.name_ar, t.category, t.is_premium, t.price, JSON.stringify(t.config));

  if (hasUsers) { console.log('Seed: users exist, themes synced, done.'); return; }

  const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().replace('T', ' ').slice(0, 19);

  // Admin + demo merchant
  const admin = db.prepare(`INSERT INTO users (email, password_hash, name, is_admin) VALUES (?, ?, ?, 1)`)
    .run('admin@activetecno.software', hashPassword('admin1234'), 'إدارة اكتف اوردر');
  const merchant = db.prepare(`INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)`)
    .run('demo@activetecno.software', hashPassword('demo1234'), 'نورا محمود', '01011206670');

  const publishedUntil = new Date(Date.now() + 22 * 86400000).toISOString().slice(0, 10);
  const store = db.prepare(`INSERT INTO stores (user_id, name, slug, description, phone, whatsapp, theme_id, announcement, free_shipping_over, is_published, published_until)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`)
    .run(merchant.lastInsertRowid, 'متجر نورا', 'noura', 'أزياء نسائية عصرية — عبايات، حقائب وإكسسوارات مختارة بعناية. شحن سريع لكل المحافظات والدفع عند الاستلام.', '01011206670', '201011206670', 'modern', 'شحن مجاني للطلبات فوق 600 ج.م ⚡', 600, publishedUntil);
  const storeId = store.lastInsertRowid;

  const products = [
    ['عباية كلاسيك سوداء', 'عباية كلاسيكية بقصة واسعة وقماش كريب فاخر، تناسب الخروج والعمل. متوفرة بمقاسات S إلى XXL.', 740, 950, 14, 'عبايات', 210],
    ['حقيبة جلد فاخرة', 'حقيبة يد جلد طبيعي بتصميم إيطالي، بطانة داخلية قطنية وحزام كتف قابل للتعديل.', 490, 650, 22, 'حقائب', 25],
    ['ساعة نسائية راقية', 'ساعة يد نسائية بسوار معدني ذهبي ووجه صدفي مقاوم للخدش، ضد الماء حتى 30 متر.', 1150, null, 8, 'إكسسوارات', 45],
    ['طقم حجاب قطن (3 قطع)', 'ثلاثة أحجبة قطنية ناعمة بألوان أساسية تناسب كل الإطلالات، خامة تسمح بالتهوية.', 220, 300, 40, 'حجاب', 150],
    ['فستان صيفي مزهر', 'فستان صيفي خفيف بنقشة زهور، قماش فيسكوز مريح ومثالي للجو الحار.', 560, 720, 11, 'فساتين', 320],
    ['إيشارب حرير مطبوع', 'إيشارب حرير بطبعة فنية حصرية، مقاس 180×70 سم، يليق بالمناسبات.', 340, null, 17, 'إكسسوارات', 60],
    ['نظارة شمس كبيرة', 'نظارة شمسية بإطار كبير عصري وعدسات UV400 بحماية كاملة من الشمس.', 380, 480, 26, 'إكسسوارات', 20],
    ['كارديجان شتوي طويل', 'كارديجان صوف طويل بأزرار خشبية، دافئ وأنيق لإطلالات الشتاء.', 620, 800, 2, 'ملابس', 270]
  ];
  const prodStmt = db.prepare(`INSERT INTO products (store_id, name, description, price, compare_at_price, stock, category, images, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const prodIds = [];
  for (const [i, p] of products.entries()) {
    const img = JSON.stringify([productImage(p[0], p[6])]);
    const r = prodStmt.run(storeId, p[0], p[1], p[2], p[3], p[4], p[5], img, daysAgo(30 - i * 3));
    prodIds.push(r.lastInsertRowid);
  }
  // cross-sell: عباية -> إيشارب حرير
  db.prepare('UPDATE products SET upsell_product_id = ? WHERE id = ?').run(prodIds[5], prodIds[0]);

  db.prepare(`INSERT INTO coupons (store_id, code, type, value, min_order, usage_limit, used_count, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`)
    .run(storeId, 'WELCOME10', 'percent', 10, 300, 100, 14);
  db.prepare(`INSERT INTO coupons (store_id, code, type, value, min_order, active) VALUES (?, ?, 'fixed', 50, 500, 1)`)
    .run(storeId, 'NOURA50');

  db.prepare(`INSERT INTO shipping_zones (store_id, name, governorates, price, per_item, free_over) VALUES (?, ?, ?, ?, 0, ?)`)
    .run(storeId, 'القاهرة والجيزة', 'القاهرة,الجيزة', 40, 600);
  db.prepare(`INSERT INTO shipping_zones (store_id, name, governorates, price, per_item, free_over) VALUES (?, ?, ?, ?, 0, ?)`)
    .run(storeId, 'باقي المحافظات', 'الإسكندرية,الدقهلية,الشرقية,المنصورة,أسيوط,المنيا,سوهاج,قنا,أسوان,الأقصر,بورسعيد,الإسماعيلية,السويس,طنطا,الزقازيق', 65, 900);

  db.prepare(`INSERT INTO blocked_numbers (store_id, phone, reason) VALUES (?, ?, ?)`)
    .run(storeId, '01000000000', 'طلبات وهمية متكررة — لا يرد على التأكيد');

  db.prepare(`INSERT INTO team_members (store_id, email, name, role) VALUES (?, ?, ?, 'owner')`)
    .run(storeId, 'demo@activetecno.software', 'نورا محمود');
  db.prepare(`INSERT INTO team_members (store_id, email, name, role) VALUES (?, ?, ?, 'staff')`)
    .run(storeId, 'salma@noura.shop', 'سلمى أحمد');

  // Orders across statuses, spread over the past weeks
  const orders = [
    ['مريم السيد', '01098765432', '15 شارع التحرير، الدقي', 'الجيزة', 'delivered', [0, 1], '', 12],
    ['أحمد حسن', '01123456789', '22 شارع فيصل الرئيسي', 'الجيزة', 'delivered', [2], 'WELCOME10', 11],
    ['سارة محمد', '01234567890', '8 شارع جامعة الدول، المهندسين', 'الجيزة', 'shipped', [4, 6], '', 9],
    ['فاطمة علي', '01055544433', '3 شارع عباس العقاد، مدينة نصر', 'القاهرة', 'shipped', [3, 5], '', 8],
    ['منى كامل', '01122233344', '17 شارع الهرم، برج السلام', 'الجيزة', 'confirmed', [0], '', 5],
    ['هدير مصطفى', '01099988877', '45 شارع رمسيس، وسط البلد', 'القاهرة', 'confirmed', [1, 6], 'NOURA50', 4],
    ['دينا عادل', '01211100099', '9 شارع سوريا، المعادي', 'القاهرة', 'new', [7, 3], '', 2],
    ['رنا سامي', '01066677788', '30 شارع البحر، طنطا', 'طنطا', 'new', [4], '', 1],
    ['ولاء نبيل', '01155566677', '12 شارع الجلاء، المنصورة', 'المنصورة', 'cancelled', [2], '', 6],
    ['ياسمين طارق', '01044455566', '5 شارع فؤاد، الإسكندرية', 'الإسكندرية', 'delivered', [0, 5, 3], '', 15]
  ];
  const orderStmt = db.prepare(`INSERT INTO orders (store_id, number, customer_name, customer_phone, customer_address, governorate, status, subtotal, shipping, discount, total, coupon_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const itemStmt = db.prepare(`INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)`);
  const histStmt = db.prepare(`INSERT INTO order_status_history (order_id, status, created_at) VALUES (?, ?, ?)`);
  const pRows = db.prepare('SELECT * FROM products WHERE store_id = ? ORDER BY id').all(storeId);
  orders.forEach((o, idx) => {
    const items = o[5].map(pi => ({ p: pRows[pi], qty: 1 }));
    const subtotal = items.reduce((s, it) => s + it.p.price * it.qty, 0);
    const shipping = (o[3] === 'القاهرة' || o[3] === 'الجيزة') ? (subtotal >= 600 ? 0 : 40) : 65;
    let discount = 0;
    if (o[6] === 'WELCOME10') discount = Math.round(subtotal * 0.10);
    if (o[6] === 'NOURA50') discount = 50;
    const total = subtotal + shipping - discount;
    const num = 'NO-' + String(1021 + idx);
    const r = orderStmt.run(storeId, num, o[0], o[1], o[2], o[3], o[4], subtotal, shipping, discount, total, o[6] || null, daysAgo(o[7]));
    const oid = r.lastInsertRowid;
    for (const it of items) itemStmt.run(oid, it.p.id, it.p.name, it.p.price, it.qty, JSON.parse(it.p.images)[0]);
    const flow = ['new', 'confirmed', 'shipped', 'delivered'];
    const upto = o[4] === 'cancelled' ? 0 : flow.indexOf(o[4]);
    for (let s = 0; s <= upto; s++) histStmt.run(oid, flow[s], daysAgo(o[7]));
    if (o[4] === 'cancelled') histStmt.run(oid, 'cancelled', daysAgo(o[7]));
  });

  // Analytics events: funnel over 30 days, declining counts
  const evStmt = db.prepare(`INSERT INTO events (store_id, type, session_id, product_id, created_at) VALUES (?, ?, ?, ?, ?)`);
  const evCount = { page_view: 420, product_view: 260, add_to_cart: 90, begin_checkout: 38, purchase: 24 };
  let sess = 1000;
  for (const [type, count] of Object.entries(evCount)) {
    for (let i = 0; i < count; i++) {
      const d = Math.floor(Math.random() * 30);
      evStmt.run(storeId, type, 's' + (sess++), type === 'product_view' || type === 'add_to_cart' ? prodIds[i % prodIds.length] : null, daysAgo(d));
    }
  }
  // A couple of abandoned carts
  const cartItems = JSON.stringify([{ product_id: prodIds[0], name: 'عباية كلاسيك سوداء', price: 740, qty: 1 }, { product_id: prodIds[5], name: 'إيشارب حرير مطبوع', price: 340, qty: 1 }]);
  db.prepare(`INSERT INTO carts (store_id, session_id, customer_phone, items, updated_at) VALUES (?, 'abandoned-1', '01077788899', ?, ?)`).run(storeId, cartItems, daysAgo(0));
  db.prepare(`INSERT INTO carts (store_id, session_id, items, updated_at) VALUES (?, 'abandoned-2', ?, ?)`)
    .run(storeId, JSON.stringify([{ product_id: prodIds[4], name: 'فستان صيفي مزهر', price: 560, qty: 2 }]), daysAgo(1));

  // A pending activation request from another demo merchant for the admin panel
  const m2 = db.prepare(`INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)`)
    .run('karim@techmart.shop', hashPassword('demo1234'), 'كريم عمر', '01144455566');
  const s2 = db.prepare(`INSERT INTO stores (user_id, name, slug, description, theme_id, is_published) VALUES (?, ?, ?, ?, 'tech', 0)`)
    .run(m2.lastInsertRowid, 'تك مارت', 'techmart', 'إلكترونيات وإكسسوارات موبايل بأفضل الأسعار.');
  db.prepare(`INSERT INTO activation_requests (store_id, user_id, amount, method, reference, status) VALUES (?, ?, 50, 'instapay', 'INSTA-99213', 'pending')`)
    .run(s2.lastInsertRowid, m2.lastInsertRowid);

  console.log('Seed complete: admin@activetecno.software / admin1234 — demo@activetecno.software / demo1234');
}

if (require.main === module) seed();
module.exports = { seed, hashPassword, productImage, THEMES };
