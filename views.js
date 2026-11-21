// views.js — server-rendered pages (landing, auth, storefront). Dashboard/admin are SPA shells.
const { db } = require('./db');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const egp = n => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
// placeholder image for products without one
const ph = (name = '?') => 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12213E"/><stop offset="1" stop-color="#00BFAF"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="400" y="460" font-size="260" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="rgba(255,255,255,.85)">${name.trim().charAt(0)}</text></svg>`).toString('base64');

function base(title, body, extraHead = '') {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/main.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2312213E'/%3E%3Cpath d='M9 20l7-11 7 11' stroke='%2300BFAF' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
${extraHead}</head><body>${body}</body></html>`;
}

const logo = `<a class="brand" href="/"><span class="brand-mark"><svg viewBox="0 0 32 32" width="30" height="30"><rect width="32" height="32" rx="8" fill="#12213E"/><path d="M9 20l7-11 7 11" stroke="#00BFAF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="brand-name">اكتف <b>تكنو</b></span></a>`;

// ---------- landing ----------
function landing() {
  const storesCount = db.prepare('SELECT COUNT(*) c FROM stores').get().c;
  return base('اكتف تكنو | أنشئ متجرك الإلكتروني في دقائق', `
<header class="land-nav"><div class="wrap">${logo}
<nav><a href="#features">المميزات</a><a href="#themes">القوالب</a><a href="#pricing">التسعير</a><a href="/login">دخول</a></nav>
<a class="btn btn-teal" href="/register">ابدأ مجاناً</a></div></header>

<section class="hero"><div class="wrap">
<div class="hero-badge">✦ منصة المتاجر العربية — صُنعت للسوق المصري</div>
<h1>أطلق متجرك الإلكتروني<br><span class="grad">واستقبل أول طلب اليوم</span></h1>
<p class="hero-sub">قوالب عربية جاهزة، دفع عند الاستلام، تحليلات دقيقة، وأدوات بيع ترفع تحويلك — كل ذلك من لوحة واحدة، بدون سطر كود واحد.</p>
<div class="hero-cta"><a class="btn btn-teal btn-lg" href="/register">أنشئ متجرك مجاناً</a><a class="btn btn-ghost btn-lg" href="/s/noura" target="_blank">شاهد متجراً تجريبياً</a></div>
<div class="hero-trust"><span>بدون بطاقة بنكية</span><span>إطلاق خلال دقائق</span><span>0% عمولة على المبيعات</span><span>أكتف كونفيرم لتأكيد الطلبات</span></div>
<div class="hero-shot"><img src="/public/img/hero-dashboard.svg" alt="لوحة تحكم اكتف تكنو"></div>
</div></section>

<section class="strip"><div class="wrap strip-grid">
<div><b>${storesCount > 1 ? '+' + storesCount : ''} متجر</b><span>يعمل على اكتف تكنو</span></div>
<div><b>0%</b><span>عمولة على الطلبات</span></div>
<div><b>50 ج.م</b><span>فقط كل 30 يوم</span></div>
<div><b>100%</b><span>عربي و RTL</span></div>
</div></section>

<section id="features" class="section"><div class="wrap">
<h2>كل ما يحتاجه تاجر الـ COD المصري</h2><p class="section-sub">أدوات مترابطة تختصر وقت التشغيل وترفع معدل إتمام الطلبات على الموبايل.</p>
<div class="feat-grid">
<div class="feat"><div class="feat-ic">🛍️</div><h3>متجر جاهز في دقائق</h3><p>قوالب عربية سريعة متوافقة مع الموبايل. اختر قالباً، عدّل الألوان، وانشر.</p></div>
<div class="feat"><div class="feat-ic">📦</div><h3>لوحة طلبات ذكية</h3><p>كانبان للطلبات بحالاتها من جديد إلى مُسلَّم، مع سجل كامل لكل حركة وتصدير شركات الشحن.</p></div>
<div class="feat"><div class="feat-ic">💬</div><h3>تأكيد واتساب</h3><p>أرسل تأكيد الطلب للعميل على واتساب بضغطة واحدة برسالة جاهزة تلقائياً.</p></div>
<div class="feat"><div class="feat-ic">🛒</div><h3>السلات المتروكة</h3><p>شاهد من أضاف للسلة ولم يشترِ، واسترجعه برسالة واتساب جاهزة قبل أن يذهب لمنافس.</p></div>
<div class="feat"><div class="feat-ic">🚫</div><h3>حظر الطلبات الوهمية</h3><p>احظر أرقام الهواتف المزعجة مرة واحدة وتتوقف طلباتها نهائياً عن الوصول.</p></div>
<div class="feat"><div class="feat-ic">📈</div><h3>Upsell و Cross-sell</h3><p>اقترح منتجات مكملة قبل الدفع وارفع متوسط قيمة الطلب بدون مجهود.</p></div>
<div class="feat"><div class="feat-ic">🎯</div><h3>بيكسلات و CAPI</h3><p>اربط Meta و TikTok و Snap و Google مع Conversions API من إعدادات التتبع.</p></div>
<div class="feat"><div class="feat-ic">📊</div><h3>تحليلات وفانل</h3><p>إيرادات، طلبات، معدل تحويل، وفانل كامل من الزيارة حتى الشراء.</p></div>
<div class="feat"><div class="feat-ic">🎟️</div><h3>كوبونات وشحن مرن</h3><p>كوبونات بنسبة أو مبلغ ثابت، مناطق شحن بأسعار مختلفة، وشحن مجاني فوق حد معين.</p></div>
</div></div></section>

${activeConfirmSection()}
<section id="themes" class="section alt"><div class="wrap">
<h2>قوالب عربية تبيع عنك</h2><p class="section-sub">خصّص الألوان والشعار والأقسام مباشرة من لوحة التحكم — بدون كود.</p>
<div class="theme-row">
<div class="theme-card"><div class="theme-prev" style="--tp:#12213E;--ta:#00BFAF"><span>عصري</span></div><h3>عصري — أزياء</h3><p>شبكة صور جريئة لمتاجر الموضة</p></div>
<div class="theme-card"><div class="theme-prev" style="--tp:#0B1526;--ta:#3B82F6"><span>تقني</span></div><h3>تقني — إلكترونيات</h3><p>يبرز المواصفات والشراء السريع</p></div>
<div class="theme-card"><div class="theme-prev" style="--tp:#4A2C3D;--ta:#D98E9A"><span>بوتيك</span></div><h3>بوتيك — تجميل</h3><p>ألوان هادئة وإحساس راقٍ يبني الثقة</p></div>
<div class="theme-card"><div class="theme-prev" style="--tp:#14532D;--ta:#F59E0B"><span>طازج</span></div><h3>طازج — عروض</h3><p>مثالي للعروض والسوبرماركت</p></div>
</div></div></section>

<section id="pricing" class="section"><div class="wrap">
<h2>تسعير بسيط بلا مفاجآت</h2>
<div class="price-card">
<div class="price-head"><span class="price-badge">الخطة الوحيدة — كل شيء مشمول</span>
<div class="price-num">50 <small>ج.م / 30 يوم</small></div>
<p>جهّز متجرك مجاناً بالكامل، وادفع فقط عندما تقرر النشر.</p></div>
<ul class="price-list">
<li>منتجات وطلبات غير محدودة</li><li>0% عمولة على مبيعاتك</li><li>كل القوالب والتحليلات</li><li>ربط دومين خاص</li><li>فريق وصلاحيات</li><li>دفع عبر InstaPay أو Vodafone Cash</li>
</ul>
<a class="btn btn-teal btn-lg" href="/register">ابدأ الآن مجاناً</a>
</div></div></section>

<section class="cta-final"><div class="wrap">
<h2>جاهز تبيع أونلاين؟</h2><p>انضم لتجار اكتف تكنو وابدأ رحلتك اليوم.</p>
<a class="btn btn-teal btn-lg" href="/register">أنشئ متجرك مجاناً</a>
</div></section>

<footer class="land-foot"><div class="wrap">${logo}<p>اكتف تكنو © 2026 — صُنع بحب في القاهرة 🇪🇬</p></div></footer>
`);
}

// ---------- auth ----------
function authCard(kind) {
  const isLogin = kind === 'login';
  return base(isLogin ? 'تسجيل الدخول | اكتف تكنو' : 'إنشاء حساب | اكتف تكنو', `
<div class="auth-wrap"><div class="auth-card" id="authCard">
${logo}
<h1>${isLogin ? 'أهلاً بعودتك' : 'أنشئ متجرك مجاناً'}</h1>
<p class="auth-sub">${isLogin ? 'سجّل دخولك لإدارة متجرك' : '30 ثانية وتكون جاهز — بدون بطاقة بنكية'}</p>
<form id="authForm" class="auth-form">
${isLogin ? '' : `<label>اسمك<input name="name" required placeholder="مثال: نورا محمود"></label>
<label>اسم المتجر<input name="storeName" required placeholder="مثال: متجر نورا"></label>`}
<label>البريد الإلكتروني<input name="email" type="email" required placeholder="you@example.com" dir="ltr"></label>
<label>كلمة المرور<input name="password" type="password" required minlength="8" placeholder="8 أحرف على الأقل" dir="ltr"></label>
<div class="auth-err" id="authErr"></div>
<button class="btn btn-teal btn-lg full" type="submit">${isLogin ? 'دخول' : 'إنشاء الحساب'}</button>
</form>
${isLogin ? `<p class="auth-alt">ليس لديك حساب؟ <a href="/register">ابدأ مجاناً</a></p>
<div class="auth-demo">حساب تجريبي: <code dir="ltr">demo@activetecno.software / demo1234</code></div>`
: `<p class="auth-alt">لديك حساب بالفعل؟ <a href="/login">سجّل دخولك</a></p>`}
</div></div>
<script>
const IS_LOGIN = ${isLogin};
document.getElementById('authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target); const body = Object.fromEntries(f.entries());
  const err = document.getElementById('authErr'); err.textContent = '';
  const r = await fetch('/api/auth/${kind}', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error || 'حدث خطأ'; return; }
  if (IS_LOGIN) { location.href = '/app'; return; }
  showVerify(body.email, d.dev_code);
});
function showVerify(email, devCode) {
  document.getElementById('authCard').innerHTML = \`
  <h1>تحقق من بريدك 📬</h1>
  <p class="auth-sub">أرسلنا كود تحقق من 6 أرقام إلى <b dir="ltr">\` + email + \`</b></p>
  <div class="mail-sim">
    <div class="mail-sim-head">📧 بريد وارد — اكتف تكنو</div>
    <div class="mail-sim-body">كود التحقق الخاص بك:<div class="mail-sim-code">\` + devCode + \`</div><span>محاكاة إرسال البريد — في النسخة الحقيقية يصل الكود إلى بريدك</span></div>
  </div>
  <form id="verifyForm" class="auth-form">
    <label>كود التحقق<input name="code" required inputmode="numeric" maxlength="6" placeholder="______" dir="ltr" style="text-align:center;font-size:22px;letter-spacing:8px"></label>
    <div class="auth-err" id="vErr"></div>
    <button class="btn btn-teal btn-lg full" type="submit">تأكيد البريد وإنشاء المتجر</button>
  </form>\`;
  document.getElementById('verifyForm').addEventListener('submit', async e => {
    e.preventDefault();
    const code = new FormData(e.target).get('code');
    const r = await fetch('/api/auth/verify', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, code }) });
    const d = await r.json();
    if (!r.ok) { document.getElementById('vErr').textContent = d.error || 'كود غير صحيح'; return; }
    location.href = '/onboarding';
  });
}
</script>`);
}

// ---------- onboarding (3 steps: theme, first product, launch) ----------
function onboarding(store) {
  const themes = db.prepare('SELECT * FROM themes').all().map(t => ({ ...t, config: JSON.parse(t.config) }));
  return base('خطوات إطلاق متجرك | اكتف تكنو', `
<div class="auth-wrap"><div class="auth-card" style="max-width:520px">
${logo}
<div class="ob-steps"><span class="ob-dot on" id="dot1">1</span><span class="ob-line"></span><span class="ob-dot" id="dot2">2</span><span class="ob-line"></span><span class="ob-dot" id="dot3">3</span></div>
<div id="obStep1">
  <h1 style="font-size:21px">اختر قالب متجرك 🎨</h1>
  <p class="auth-sub">كل القوالب عربية وسريعة ومتوافقة مع الموبايل — تقدر تغيّرها في أي وقت</p>
  <div class="ob-themes">${themes.map(t => `
    <div class="theme-opt ${t.id === store.theme_id ? 'on' : ''}" data-t="${t.id}" onclick="pickObTheme(this)">
      <div class="dots"><span style="background:${t.config.primary}"></span><span style="background:${t.config.accent}"></span><span style="background:${t.config.surface}"></span></div>
      <b>${esc(t.name_ar)}</b><small>${esc(t.category)}${t.is_premium ? ' · بريميوم' : ' · مجاني'}</small></div>`).join('')}</div>
  <button class="btn btn-teal btn-lg full" onclick="obGo(2)">التالي — أضف أول منتج</button>
</div>
<div id="obStep2" hidden>
  <h1 style="font-size:21px">أضف أول منتج 🛍️</h1>
  <p class="auth-sub">منتج واحد يكفي للانطلاق — تقدر تضيف الباقي من لوحة التحكم</p>
  <form class="auth-form" id="obProdForm">
    <label>اسم المنتج<input name="name" placeholder="مثال: عباية كلاسيك"></label>
    <label>السعر (ج.م)<input name="price" type="number" min="1" placeholder="500"></label>
    <div class="auth-err" id="obErr"></div>
    <button class="btn btn-teal btn-lg full" type="submit">حفظ المنتج والمتابعة</button>
    <button class="btn full" type="button" style="background:transparent;color:var(--mut)" onclick="obGo(3)">تخطَّ الآن</button>
  </form>
</div>
<div id="obStep3" hidden>
  <div style="text-align:center;font-size:52px;margin:8px 0 14px">🎉</div>
  <h1 style="font-size:21px;text-align:center">متجرك جاهز!</h1>
  <p class="auth-sub" style="text-align:center">رابط متجرك: <b class="mono" dir="ltr">/s/${esc(store.slug)}</b><br>فعّل النشر بـ 50 ج.م كل 30 يوم وابدأ استقبال الطلبات.</p>
  <a class="btn btn-teal btn-lg full" href="/app">الذهاب إلى لوحة التحكم</a>
</div>
</div></div>
<style>
.ob-steps{display:flex;align-items:center;justify-content:center;gap:0;margin:6px 0 22px}
.ob-dot{width:34px;height:34px;border-radius:50%;background:var(--bg);color:var(--mut);display:grid;place-items:center;font-weight:700;font-size:14px;border:2px solid var(--line)}
.ob-dot.on{background:var(--teal);border-color:var(--teal);color:#fff}
.ob-line{width:60px;height:2px;background:var(--line)}
.ob-themes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.ob-themes .theme-opt{border:2px solid var(--line);border-radius:14px;padding:12px;cursor:pointer;transition:all .15s}
.ob-themes .theme-opt.on{border-color:var(--teal);background:var(--teal-soft)}
.ob-themes .dots{display:flex;gap:6px;margin-bottom:8px}
.ob-themes .dots span{width:20px;height:20px;border-radius:7px}
.ob-themes b{font-size:13.5px;display:block}
.ob-themes small{color:var(--mut);font-size:11.5px}
.mail-sim{background:#F0F7FF;border:1px solid #BFDBFE;border-radius:14px;overflow:hidden;margin-bottom:18px;text-align:start}
.mail-sim-head{background:#DBEAFE;padding:9px 14px;font-size:12.5px;color:#1E40AF;font-weight:600}
.mail-sim-body{padding:14px;font-size:13.5px;color:var(--ink)}
.mail-sim-body span{display:block;color:var(--mut);font-size:11.5px;margin-top:6px}
.mail-sim-code{font-size:28px;font-weight:700;letter-spacing:10px;text-align:center;color:var(--teal);margin:8px 0;direction:ltr}
</style>
<script>
let obTheme = '${esc(store.theme_id)}';
function pickObTheme(el){ document.querySelectorAll('.ob-themes .theme-opt').forEach(x=>x.classList.remove('on')); el.classList.add('on'); obTheme = el.dataset.t; saveObTheme(); }
async function saveObTheme(){ await fetch('/api/store',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({theme_id:obTheme})}); }
function obGo(n){ for(let i=1;i<=3;i++){ document.getElementById('obStep'+i).hidden = i!==n; document.getElementById('dot'+i).classList.toggle('on', i<=n); } }
document.getElementById('obProdForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const b = Object.fromEntries(new FormData(e.target).entries());
  if(!b.name || !(+b.price>0)){ document.getElementById('obErr').textContent='أدخل اسم المنتج وسعره، أو تخطَّ'; return; }
  const r = await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:b.name,price:+b.price,stock:10,images:[]})});
  if(!r.ok){ document.getElementById('obErr').textContent=(await r.json()).error||'حدث خطأ'; return; }
  obGo(3);
});
</script>`);
}

// ---------- SPA shells ----------
function appShell() {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>لوحة التحكم | اكتف تكنو</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/dashboard.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2312213E'/%3E%3Cpath d='M9 20l7-11 7 11' stroke='%2300BFAF' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
</head><body class="dash"><div id="root"></div><script src="/public/js/dashboard.js"></script></body></html>`;
}

function adminShell() {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>لوحة الإدارة | اكتف تكنو</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/dashboard.css">
</head><body class="dash admin"><div id="root"></div><script src="/public/js/admin.js"></script></body></html>`;
}

// ---------- storefront ----------
function themeVars(t) {
  return `--sp:${t.primary || '#12213E'};--sa:${t.accent || '#00BFAF'};--sbg:${t.bg || '#fff'};--ssf:${t.surface || '#F6F8FC'};--sr:${t.radius ?? 16}px;`;
}
function storeHead(store, t, title) {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/store.css">
<style>:root{${themeVars(t)}}</style>`;
}

function storeHeader(store, t) {
  return `${store.announcement ? `<div class="s-announce">${esc(store.announcement)}</div>` : ''}
<header class="s-header ${t.header === 'split' ? 'split' : ''}">
  <a class="s-brand" href="/s/${esc(store.slug)}"><span class="s-logo">${esc((store.logo_text || store.name).trim().charAt(0))}</span><span>${esc(store.name)}</span></a>
  <button class="s-cart-btn" onclick="toggleCart(true)" aria-label="السلة">🛒<span class="s-cart-count" id="cartCount">0</span></button>
</header>`;
}
const storeScripts = store => `<script>window.STORE_SLUG=${JSON.stringify(store.slug)};</script><script src="/public/js/store.js"></script>`;

function storefront(store, t, owner) {
  const products = db.prepare(`SELECT id, name, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' ORDER BY created_at DESC`).all(store.id);
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  const cards = products.map(p => {
    const imgs = JSON.parse(p.images || '[]');
    const off = p.compare_at_price && p.compare_at_price > p.price ? Math.round(100 - p.price * 100 / p.compare_at_price) : 0;
    return `<a class="p-card" data-cat="${esc(p.category)}" href="/s/${esc(store.slug)}/p/${p.id}">
      ${off ? `<span class="p-off">-${off}%</span>` : ''}
      ${p.stock <= 0 ? `<span class="p-out">نفدت الكمية</span>` : ''}
      <div class="p-img"><img src="${esc(imgs[0] || ph(p.name))}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="p-info"><h3>${esc(p.name)}</h3>
      <div class="p-price"><b>${egp(p.price)}</b>${p.compare_at_price ? `<s>${egp(p.compare_at_price)}</s>` : ''}</div></div>
    </a>`;
  }).join('');
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, store.name)}</head>
<body class="store ${t.dark ? 'dark' : ''}">
${owner ? `<div class="s-ownerbar">👁️ وضع المعاينة — <a href="/app">العودة للوحة التحكم</a></div>` : ''}
${storeHeader(store, t)}
<section class="s-hero"><h1>${esc(store.name)}</h1><p>${esc(store.description)}</p>
<div class="s-hero-cta"><a class="s-btn" href="#products">تسوّق الآن</a>
${store.whatsapp ? `<a class="s-btn ghost" href="https://wa.me/${esc(store.whatsapp)}" target="_blank" rel="noopener">تواصل واتساب</a>` : ''}</div></section>
${cats.length ? `<nav class="s-cats" id="products">${['الكل', ...cats].map(c => `<button class="s-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</nav>` : '<div id="products"></div>'}
<main class="s-grid">${cards || `<div class="s-empty">لا توجد منتجات بعد — تابعنا قريباً ✨</div>`}</main>
${store.free_shipping_over ? `<div class="s-freeship">🚚 شحن مجاني للطلبات فوق ${egp(store.free_shipping_over)}</div>` : ''}
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف تكنو</a> — الدفع عند الاستلام متاح</p></footer>
${cartDrawer(store)}
${storeScripts(store)}
<script>track('page_view');</script>
</body></html>`;
}

function productPage(store, p, t, owner) {
  const imgs = JSON.parse(p.images || '[]');
  const upsell = p.upsell_product_id ? db.prepare(`SELECT id, name, price, images FROM products WHERE id = ? AND status = 'active' AND stock > 0`).get(p.upsell_product_id) : null;
  const off = p.compare_at_price && p.compare_at_price > p.price ? Math.round(100 - p.price * 100 / p.compare_at_price) : 0;
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `${p.name} | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''}">
${owner ? `<div class="s-ownerbar">👁️ وضع المعاينة — <a href="/app">العودة للوحة التحكم</a></div>` : ''}
${storeHeader(store, t)}
<main class="pd">
<div class="pd-gallery"><img id="pdImg" src="${esc(imgs[0] || ph(p.name))}" alt="${esc(p.name)}">
${imgs.length > 1 ? `<div class="pd-thumbs">${imgs.map((im, i) => `<img src="${esc(im)}" onclick="document.getElementById('pdImg').src=this.src" class="${i === 0 ? 'on' : ''}">`).join('')}</div>` : ''}</div>
<div class="pd-info">
<span class="pd-cat">${esc(p.category)}</span>
<h1>${esc(p.name)}</h1>
<div class="pd-price"><b>${egp(p.price)}</b>${p.compare_at_price ? `<s>${egp(p.compare_at_price)}</s>` : ''}${off ? `<span class="p-off">وفّر ${off}%</span>` : ''}</div>
<p class="pd-desc">${esc(p.description)}</p>
${p.stock > 0 && p.stock <= (p.low_stock_threshold || 3) ? `<div class="pd-low">🔥 باقي ${p.stock} فقط — اطلب الآن</div>` : ''}
${p.stock <= 0 ? `<div class="pd-low out">نفدت الكمية مؤقتاً</div>` : `
<div class="pd-qty"><button onclick="pdQty(-1)">−</button><span id="pdQty">1</span><button onclick="pdQty(1)">+</button></div>
<button class="s-btn btn-lg full" onclick="addToCart(${p.id}, '${esc(p.name).replace(/'/g, '')}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, +document.getElementById('pdQty').textContent)">أضف إلى السلة 🛒</button>
<button class="s-btn btn-lg full buy" onclick="buyNow(${p.id}, '${esc(p.name).replace(/'/g, '')}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, +document.getElementById('pdQty').textContent)">اشتري الآن — دفع عند الاستلام</button>`}
${upsell ? `<div class="pd-upsell"><h4>💡 يُشترى معه غالباً</h4>
<div class="pd-upsell-card"><img src="${esc(JSON.parse(upsell.images || '[]')[0] || '')}"><div><b>${esc(upsell.name)}</b><span>${egp(upsell.price)}</span></div>
<button onclick="addToCart(${upsell.id}, '${esc(upsell.name).replace(/'/g, '')}', ${upsell.price}, ${JSON.stringify(JSON.parse(upsell.images || '[]')[0] || '')}, 1)">أضف</button></div></div>` : ''}
</div></main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف تكنو</a></p></footer>
${cartDrawer(store)}
${storeScripts(store)}
<script>track('product_view', ${p.id});</script>
</body></html>`;
}

function checkoutPage(store, t, owner) {
  const govs = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'القليوبية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'طنطا', 'المنصورة', 'الزقازيق'];
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `إتمام الطلب | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''}">
${storeHeader(store, t)}
<main class="co">
<h1>إتمام الطلب</h1>
<p class="co-sub">خطوة واحدة وطلبك يوصلك — الدفع عند الاستلام 💵</p>
<div id="coEmpty" class="s-empty" hidden>سلتك فارغة — <a href="/s/${esc(store.slug)}">ارجع للتسوق</a></div>
<div class="co-grid" id="coGrid">
<form id="coForm" class="co-form">
<h3>بيانات التوصيل</h3>
<label>الاسم بالكامل<input name="name" required placeholder="مثال: مريم أحمد"></label>
<label>رقم الموبايل<input name="phone" required inputmode="tel" dir="ltr" placeholder="01xxxxxxxxx" pattern="01[0125][0-9]{8}"></label>
<label>المحافظة<select name="governorate" required>${govs.map(g => `<option>${g}</option>`).join('')}</select></label>
<label>العنوان بالتفصيل<textarea name="address" required placeholder="الشارع، رقم العمارة، الدور، الشقة، علامة مميزة"></textarea></label>
<label>ملاحظات (اختياري)<input name="notes" placeholder="أي تفاصيل إضافية"></label>
<h3 style="margin-top:6px">طريقة الدفع</h3>
<div class="pay-methods">
<label class="pay-method"><input type="radio" name="payment_method" value="cod" checked><div class="pm-body"><b>💵 الدفع عند الاستلام</b><span>ادفع كاش أو بالمحفظة عند وصول طلبك</span></div><span class="pm-check"></span></label>
<label class="pay-method" id="pmOnline"><input type="radio" name="payment_method" value="online"><div class="pm-body"><b>💳 بطاقة بنكية / محفظة إلكترونية</b><span id="pmOnlineHint">عبر بوابة دفع آمنة (Paymob)</span></div><span class="pm-check"></span></label>
</div>
<div class="co-coupon"><input name="coupon" placeholder="كود الخصم" dir="ltr"><button type="button" onclick="applyCoupon()">تطبيق</button></div>
<div class="auth-err" id="coErr"></div>
<button type="submit" class="s-btn btn-lg full buy" id="coSubmit">تأكيد الطلب — دفع عند الاستلام</button>
<div class="co-trust"><span>🔒 بياناتك آمنة</span><span>🚚 توصيل سريع</span><span>↩️ إرجاع سهل</span></div>
</form>
<aside class="co-summary" id="coSummary"></aside>
</div></main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف تكنو</a></p></footer>
${storeScripts(store)}
<script>track('begin_checkout'); renderCheckout(); loadPayMethods();</script>
</body></html>`;
}

function orderPage(store, o, t) {
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
  const waMsg = encodeURIComponent(`أهلاً ${o.customer_name} 👋\nتم استلام طلبك رقم ${o.number} من ${store.name} بنجاح ✅\nالإجمالي: ${egp(o.total)} — الدفع عند الاستلام\nسنتواصل معك قريباً لتأكيد الشحن 🚚`);
  const waLink = store.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`أهلاً، أريد الاستفسار عن طلبي رقم ${o.number}`)}` : null;
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `طلبك ${o.number} | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''}">
<main class="done">
<div class="done-card">
<div class="done-check">✓</div>
<h1>شكراً ${esc(o.customer_name)}! 🎉</h1>
<p>تم استلام طلبك <b>${esc(o.number)}</b> بنجاح وسنتواصل معك لتأكيد الشحن.</p>
<div class="done-items">${items.map(i => `<div class="done-item"><span>${esc(i.name)} × ${i.qty}</span><b>${egp(i.price * i.qty)}</b></div>`).join('')}
<div class="done-item dim"><span>الشحن</span><b>${o.shipping ? egp(o.shipping) : 'مجاني'}</b></div>
${o.discount ? `<div class="done-item dim"><span>الخصم${o.coupon_code ? ` (${esc(o.coupon_code)})` : ''}</span><b>−${egp(o.discount)}</b></div>` : ''}
<div class="done-item total"><span>الإجمالي عند الاستلام</span><b>${egp(o.total)}</b></div></div>
<div class="done-actions">
${waLink ? `<a class="s-btn" href="${waLink}" target="_blank" rel="noopener">تواصل معنا واتساب 💬</a>` : ''}
<a class="s-btn ghost" href="/s/${esc(store.slug)}">متابعة التسوق</a></div>
</div></main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف تكنو</a></p></footer>
</body></html>`;
}

// ---------- landing: Active Confirm section ----------
function activeConfirmSection() {
  return `
<section class="section ac-sec"><div class="wrap ac-grid">
<div class="ac-copy">
<div class="hero-badge" style="background:rgba(0,191,175,.1);border-color:rgba(0,191,175,.35)">✦ أكتف كونفيرم — حصرياً في اكتف تكنو</div>
<h2 style="text-align:start">أكّد طلبات COD على واتساب<br>برسالة واحدة ورد <b class="grad">1 أو 2</b></h2>
<p class="section-sub" style="text-align:start;margin:14px 0 22px">كل طلب جديد يصل عميلك تلقائياً رسالة واتساب جاهزة: يرد <b>1</b> فيتأكد الطلب، أو <b>2</b> فيُلغى — ويتحدث وضعه في لوحتك لحظياً. قلّل الطلبات الوهمية ووفّر ساعات المكالمات.</p>
<div class="ac-points"><span>✓ تأكيد فوري بدون مكالمات</span><span>✓ تحديث حالة الطلب تلقائياً</span><span>✓ يقلل المرتجعات والوهمي</span></div>
<a class="btn btn-teal btn-lg" href="/register">جرّب أكتف كونفيرم مجاناً</a>
</div>
<div class="ac-phone">
<div class="ac-chat">
<div class="wa-in">أهلاً مريم 👋<br>طلبك <b>NO-1027</b> من متجر نورا<br>الإجمالي: 780 ج.م — دفع عند الاستلام<br><br>رد بـ <b>1</b> لتأكيد الطلب ✅<br>رد بـ <b>2</b> للإلغاء ❌</div>
<div class="wa-out">1</div>
<div class="wa-in">تم تأكيد طلبك بنجاح 🎉<br>شحنك في الطريق قريباً 🚚</div>
<div class="ac-sys">✓ تحدّثت حالة الطلب إلى «مؤكد» في لوحة التحكم</div>
</div>
</div>
</div></section>`;
}

function comingSoon(store) {
  return base(store.name, `<div class="cs"><h1>${esc(store.name)}</h1><p>المتجر تحت التجهيز حالياً — عد قريباً ✨</p></div>`);
}
function notFound(title, msg) {
  return base(title, `<div class="cs"><h1>${esc(title)}</h1><p>${esc(msg)}</p><a class="btn btn-teal" href="/">العودة للرئيسية</a></div>`);
}

function cartDrawer(store) {
  return `<div class="cart-overlay" id="cartOverlay" onclick="toggleCart(false)"></div>
<aside class="cart-drawer" id="cartDrawer">
<div class="cart-head"><h3>سلة التسوق</h3><button onclick="toggleCart(false)">✕</button></div>
<div class="cart-items" id="cartItems"></div>
<div class="cart-foot">
<div class="cart-total"><span>الإجمالي</span><b id="cartTotal">0 ج.م</b></div>
<a class="s-btn btn-lg full buy" href="/s/${esc(store.slug)}/checkout" onclick="track('begin_checkout')">إتمام الطلب — دفع عند الاستلام</a>
</div></aside>`;
}

module.exports = { landing, login: () => authCard('login'), register: () => authCard('register'), appShell, adminShell, storefront, productPage, checkoutPage, orderPage, comingSoon, notFound, onboarding, egp, esc };
