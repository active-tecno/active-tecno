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
  { id: 'royal', name_ar: 'ملكي', category: 'متاجر فاخرة', is_premium: 0, price: 0,
    config: { primary: '#101623', accent: '#C9A24B', bg: '#0F1420', surface: '#171E2E', radius: 14, header: 'split', card: 'elevated', font: 'IBM Plex Sans Arabic', dark: true } },
  { id: 'fresh', name_ar: 'طازج — سوبرماركت وعروض', category: 'أغذية وعروض', is_premium: 0, price: 0,
    config: { primary: '#14532D', accent: '#F59E0B', bg: '#FFFFFF', surface: '#F0FDF4', radius: 16, header: 'centered', card: 'soft', font: 'IBM Plex Sans Arabic' } },
  // Stage G: EO-look theme family (own code, same structure/look)
  { id: 'eo-default', name_ar: 'ديفولت', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#111111', bg: '#FFFFFF', surface: '#F3F4F6', radius: 12, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#F3E8FF', announce_color: '#141924',
      schema: [
        { key: 'header_cta_text', label: 'نص زر الهيدر (اختياري)', kind: 'text' },
        { key: 'header_cta_link', label: 'رابط زر الهيدر', kind: 'text' },
        { key: 'trust_line', label: 'سطر الثقة أعلى الفوتر', kind: 'text' },
      ] } },
  { id: 'eo-sphinx', name_ar: 'سفينكس', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#111111', bg: '#FFFFFF', surface: '#F3F4F6', radius: 10, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#0E7A3D', announce_color: '#FFFFFF', header_bg: '#0E7A3D', header_color: '#FFFFFF' } },
  { id: 'eo-fasty', name_ar: 'فاستي', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#E63946', bg: '#FFFFFF', surface: '#F3F4F6', radius: 10, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#111111', announce_color: '#FFFFFF' } },
  { id: 'eo-luxify', name_ar: 'لوكسيفاي', category: 'متاجر فاخرة', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#111111', bg: '#FFFFFF', surface: '#F5F4F2', radius: 8, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#F3E8FF', announce_color: '#141924' } },
  { id: 'eo-nue', name_ar: 'نيو', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#C8F31D', bg: '#F7F3E8', surface: '#FFFFFF', radius: 0, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#F3E8FF', announce_color: '#141924' } },
  // H3: EO free catalog equivalents (independent configs from observed demo palettes)
  { id: 'eo-void', name_ar: 'فويد — تجميل', category: 'تجميل وعناية', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#CE7D7F', bg: '#FFFFFF', surface: '#FAF4F4', radius: 14, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#CE7D7F', announce_color: '#FFFFFF' } },
  { id: 'eo-nature', name_ar: 'ناتشر — نظارات', category: 'نظارات وإكسسوارات', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#4FA355', bg: '#FFFFFF', surface: '#EBE8DF', radius: 10, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#EBE8DF', announce_color: '#141924' } },
  { id: 'eo-blast', name_ar: 'بلاست — أطفال', category: 'أطفال', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#FF3B30', bg: '#FFFFFF', surface: '#FFF6E5', radius: 20, header: 'eo', card: 'soft', font: 'Rubik', announce_bg: '#FF3B30', announce_color: '#FFFFFF' } },
  { id: 'eo-hype', name_ar: 'هايب — إلكترونيات', category: 'إلكترونيات', is_premium: 0, price: 0,
    config: { primary: '#212A2F', accent: '#F54E05', bg: '#FFFFFF', surface: '#F4F6F8', radius: 4, header: 'eo', card: 'flat', font: 'Inter', announce_bg: '#212A2F', announce_color: '#F06736' } },
  { id: 'eo-vantage-el', name_ar: 'فانتاج — إلكترونيات', category: 'إلكترونيات', is_premium: 0, price: 0,
    config: { primary: '#00003C', accent: '#00003C', bg: '#FFFFFF', surface: '#F2F3F8', radius: 8, header: 'eo', card: 'flat', font: 'Inter', announce_bg: '#00003C', announce_color: '#FFFFFF' } },
  { id: 'eo-vantage-cos', name_ar: 'فانتاج — تجميل', category: 'تجميل وعناية', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#AF6570', bg: '#FFFFFF', surface: '#FAF3F4', radius: 14, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#AF6570', announce_color: '#FFFFFF' } },
  { id: 'eo-trendy', name_ar: 'تريندي', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#141924', bg: '#FFFFFF', surface: '#F5F5F5', radius: 16, header: 'eo', card: 'flat', font: 'Inter', announce_bg: '#141924', announce_color: '#FFFFFF' } },
  { id: 'eo-elegance', name_ar: 'إليجانس — أزياء', category: 'أزياء', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#FABCCA', bg: '#FFFFFF', surface: '#FDF5F7', radius: 18, header: 'eo', card: 'soft', font: 'IBM Plex Sans Arabic', announce_bg: '#FABCCA', announce_color: '#141924' } },
  { id: 'eo-phoenix', name_ar: 'فوينكس', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#212A2F', accent: '#212A2F', bg: '#FFFFFF', surface: '#F5F4F1', radius: 12, header: 'eo', card: 'flat', font: 'IBM Plex Sans Arabic', announce_bg: '#E1DBD1', announce_color: '#212A2F',
      schema: [
        { key: 'show_sale_badge', label: 'إظهار شارة الخصم على المنتجات', kind: 'check' },
        { key: 'sale_badge_bg_color', label: 'لون خلفية شارة الخصم', kind: 'color' },
        { key: 'sale_badge_text_color', label: 'لون نص شارة الخصم', kind: 'color' },
        { key: 'custom_badge_title', label: 'نص شارة مخصص بدل نسبة الخصم (اختياري)', kind: 'text' },
        { key: 'card_background_product', label: 'لون خلفية كرت المنتج', kind: 'color' },
        { key: 'card_background_product_color', label: 'لون نص كرت المنتج', kind: 'color' },
        { key: 'header_cta_text', label: 'نص زر الهيدر (اختياري)', kind: 'text' },
        { key: 'header_cta_link', label: 'رابط زر الهيدر', kind: 'text' },
        { key: 'trust_line', label: 'سطر الثقة أعلى الفوتر', kind: 'text' },
      ] } },
  { id: 'eo-shine', name_ar: 'شاين', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#5334EB', bg: '#FFFFFF', surface: '#F5F4FE', radius: 14, header: 'eo', card: 'flat', font: 'Inter', announce_bg: '#5334EB', announce_color: '#FFFFFF' } },
  { id: 'eo-clear', name_ar: 'كلير', category: 'عام', is_premium: 0, price: 0,
    config: { primary: '#141924', accent: '#141924', bg: '#FFFFFF', surface: '#FAFAFA', radius: 8, header: 'eo', card: 'flat', font: 'Inter', announce_bg: '#F5F5F5', announce_color: '#141924' } }
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

  const NICHES = {
    modern: ['ملابس وأزياء'], tech: ['الإلكترونيات'], boutique: ['مستحضرات تجميل', 'عطور'], royal: ['إكسسوارات ومجوهرات'], fresh: ['الطعام والمشروبات', 'متجر عام'],
    'eo-default': ['متجر عام'], 'eo-sphinx': ['المنزل والمطبخ'], 'eo-fasty': ['ملابس وأزياء'], 'eo-luxify': ['إكسسوارات ومجوهرات', 'مستحضرات تجميل'], 'eo-nue': ['ملابس وأزياء', 'أحذية وشنط'],
    'eo-void': ['مستحضرات تجميل', 'عطور'], 'eo-nature': ['ساعات ونظارات'], 'eo-blast': ['مستلزمات الأطفال', 'الألعاب والهوايات'], 'eo-hype': ['الإلكترونيات'],
    'eo-vantage-el': ['الإلكترونيات'], 'eo-vantage-cos': ['مستحضرات تجميل'], 'eo-trendy': ['ملابس وأزياء'], 'eo-elegance': ['ملابس وأزياء', 'مستحضرات تجميل'],
    'eo-phoenix': ['متجر عام', 'ملابس وأزياء'], 'eo-shine': ['مستحضرات تجميل'], 'eo-clear': ['متجر عام']
  };
  const HERO_CARD = {
    'eo-default': ['classic', 'flat', 'pills'], 'eo-sphinx': ['photo', 'shadow', 'cards'], 'eo-fasty': ['none', 'bordered', 'none'], 'eo-luxify': ['photo', 'shadow', 'pills'], 'eo-nue': ['promo', 'brutal', 'circles'],
    'eo-void': ['photo', 'shadow', 'circles'], 'eo-nature': ['split', 'flat', 'cards'], 'eo-blast': ['photo', 'pill', 'icons'], 'eo-hype': ['photo', 'bordered', 'cards'],
    'eo-vantage-el': ['minimal', 'bordered', 'pills'], 'eo-vantage-cos': ['split', 'shadow', 'circles'], 'eo-trendy': ['photo', 'bordered', 'circles'], 'eo-elegance': ['banner', 'shadow', 'circles'],
    'eo-phoenix': ['photo', 'flat', 'cards'], 'eo-shine': ['banner', 'pill', 'circles'], 'eo-clear': ['minimal', 'bordered', 'pills']
  };
  const themeStmt = db.prepare(`INSERT INTO themes (id, name_ar, category, is_premium, price, config)
    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name_ar = excluded.name_ar, category = excluded.category, is_premium = excluded.is_premium, price = excluded.price, config = excluded.config`);
  for (const t of THEMES) {
    const hc = HERO_CARD[t.id];
    const base = { niches: NICHES[t.id] || ['متجر عام'], ...t.config };
    if (hc) { if (!base.hero) base.hero = hc[0]; if (!base.card) base.card = hc[1]; if (!base.cats_style) base.cats_style = hc[2]; }
    themeStmt.run(t.id, t.name_ar, t.category, t.is_premium, t.price, JSON.stringify(base));
  }

  if (hasUsers) { console.log('Seed: users exist, themes synced, done.'); return; }

  const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().replace('T', ' ').slice(0, 19);

  // Admin + demo merchant
  const admin = db.prepare(`INSERT INTO users (email, password_hash, name, is_admin) VALUES (?, ?, ?, 1)`)
    .run('admin@activetecno.software', hashPassword('admin1234'), 'إدارة اكتف اوردر');
  const merchant = db.prepare(`INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)`)
    .run('demo@activetecno.software', hashPassword('demo1234'), 'نورا محمود', '01055512345');

  const publishedUntil = new Date(Date.now() + 22 * 86400000).toISOString().slice(0, 10);
  const store = db.prepare(`INSERT INTO stores (user_id, name, slug, description, phone, whatsapp, theme_id, announcement, free_shipping_over, is_published, published_until)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`)
    .run(merchant.lastInsertRowid, 'متجر نورا', 'noura', 'أزياء نسائية عصرية — عبايات، حقائب وإكسسوارات مختارة بعناية. شحن سريع لكل المحافظات والدفع عند الاستلام.', '01055512345', '201055512345', 'modern', 'شحن مجاني للطلبات فوق 600 ج.م ⚡', 600, publishedUntil);
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
