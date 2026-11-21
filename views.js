// views.js — server-rendered pages (landing, auth, storefront). Dashboard/admin are SPA shells.
const { db } = require('./db');


const IC = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 8.3L12 13l8.7-4.7M12 13v9"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.5 12h10L20 8H7"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z"/><path d="M13 5v2m0 4v2m0 4v2" stroke-dasharray="1 3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h13v9H1zM14 10h4l4 4v2h-8z"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="3"/><circle cx="12" cy="12" r="2.6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  ret: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 3.5 10.9c-.7.5-1 1.2-1 2.1h-5c0-.9-.3-1.6-1-2.1A6 6 0 0 1 12 3z"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5S9 10 10 10c0-3 2-7 2-7z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>',
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const egp = n => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
// placeholder image for products without one
const ph = (name = '?') => 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#141924"/><stop offset="1" stop-color="#27cd27"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="400" y="460" font-size="260" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="rgba(255,255,255,.85)">${name.trim().charAt(0)}</text></svg>`).toString('base64');

function base(title, body, extraHead = '') {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/animate.min.css">
<link rel="stylesheet" href="/public/css/app.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23141924'/%3E%3Cpath d='M9 20l7-11 7 11' stroke='%2327cd27' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
${extraHead}</head><body class="bg-background text-foreground font-arabic antialiased">${body}<script src="/public/js/reveal.js"></script></body></html>`;
}

const logo = `<a class="flex items-center gap-2 shrink-0" href="/"><span class="grid place-items-center"><svg viewBox="0 0 32 32" width="30" height="30"><rect width="32" height="32" rx="8" fill="#141924"/><path d="M9 20l7-11 7 11" stroke="#27cd27" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="text-[17px] font-bold tracking-tight">اكتف <b class="text-brand">اوردر</b></span></a>`;

// ---------- landing ----------
function landing() {
  const storesCount = db.prepare('SELECT COUNT(*) c FROM stores').get().c;
  return base('اكتف اوردر | أنشئ متجرك الإلكتروني في دقائق', `
<header class="fixed top-0 inset-x-0 z-50 bg-night/80 backdrop-blur-xl border-b border-night-border">
  <div class="relative mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:px-8 max-w-6xl">
    ${logo}
    <nav class="hidden items-center gap-0.5 lg:flex text-night-foreground/85">
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-white/[0.06] hover:text-white" href="/">الرئيسية</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-white/[0.06] hover:text-white" href="/blog">الكورسات</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-white/[0.06] hover:text-white" href="/pricing">الأسعار</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-white/[0.06] hover:text-white" href="/blog">المدونة</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-white/[0.06] hover:text-white" href="/themes">القوالب</a>
    </nav>
    <div class="hidden items-center gap-2 lg:flex">
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium text-night-foreground/85 transition-colors hover:text-white" href="/login">تسجيل دخول</a>
      <a class="rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-night transition-all duration-200 hover:bg-brand hover:text-night hover:shadow-[0_0_28px_-6px_var(--color-brand)]" href="/register">ابدأ متجرك مجاناً</a>
    </div>
    <details class="lg:hidden relative" id="mnav">
      <summary class="list-none grid place-items-center w-10 h-10 rounded-full text-night-foreground/85 hover:bg-white/[0.06] cursor-pointer"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></summary>
      <div class="absolute left-0 top-12 w-56 rounded-2xl border border-night-border bg-night/95 backdrop-blur-xl p-2 shadow-elevated">
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-night-foreground/85 hover:bg-white/[0.06]" href="/">الرئيسية</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-night-foreground/85 hover:bg-white/[0.06]" href="/blog">الكورسات</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-night-foreground/85 hover:bg-white/[0.06]" href="/pricing">الأسعار</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-night-foreground/85 hover:bg-white/[0.06]" href="/blog">المدونة</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-night-foreground/85 hover:bg-white/[0.06]" href="/themes">القوالب</a>
        <div class="my-1 border-t border-night-border"></div>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-night-foreground/85 hover:bg-white/[0.06]" href="/login">تسجيل دخول</a>
        <a class="block rounded-xl bg-white px-4 py-2.5 text-[14px] font-semibold text-night text-center" href="/register">ابدأ متجرك مجاناً</a>
      </div>
    </details>
  </div>
</header>

<section class="relative overflow-hidden bg-night text-night-foreground pt-32 pb-10">
  <div class="hero-grid absolute inset-0"></div>
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full opacity-25 blur-[120px]" style="background: radial-gradient(closest-side, var(--color-brand), transparent)"></div>
  <div class="absolute top-24 -right-40 w-[420px] h-[420px] rounded-full opacity-15 blur-[100px]" style="background: radial-gradient(closest-side, var(--color-chart-2), transparent); animation: rv-aurora-a 14s ease-in-out infinite"></div>
  <div class="absolute bottom-0 -left-40 w-[420px] h-[420px] rounded-full opacity-10 blur-[100px]" style="background: radial-gradient(closest-side, var(--color-brand), transparent); animation: rv-aurora-b 16s ease-in-out infinite"></div>

  <div class="relative mx-auto max-w-6xl px-4 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
    <div>
      <div class="glass inline-flex items-center gap-2.5 rounded-full pe-4 ps-1.5 py-1.5 text-[13px] font-medium text-night-foreground/90 animate__animated animate__fadeInDown">
        <span class="grid place-items-center rounded-full bg-brand/15 text-brand-bright text-[12px] font-bold px-2.5 py-0.5">#1</span>
        المنصة العربية الأولى لتجار الدفع عند الاستلام
      </div>
      <h1 class="mt-6 text-[42px] sm:text-[56px] leading-[1.15] font-bold tracking-tight animate__animated animate__fadeInUp">
        أطلق متجرك الإلكتروني<br><span class="text-brand-bright">واستقبل أول طلب اليوم</span>
      </h1>
      <p class="mt-5 text-[17px] leading-8 text-night-muted max-w-xl animate__animated animate__fadeInUp animate__delay-1s">
        قوالب عربية جاهزة، دفع عند الاستلام، تحليلات دقيقة، وأدوات بيع ترفع تحويلك — كل ذلك من لوحة واحدة، بدون سطر كود واحد.
      </p>
      <div class="mt-8 flex flex-wrap items-center gap-3 animate__animated animate__fadeInUp animate__delay-1s">
        <a class="btn-sheen rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand hover:shadow-[0_0_32px_-6px_var(--color-brand)]" href="/register">ابدأ متجرك مجاناً ←</a>
        <a class="glass rounded-full px-7 py-3.5 text-[15px] font-semibold text-night-foreground transition-colors duration-200 hover:bg-white/10" href="/themes">تصفّح القوالب الجاهزة</a>
      </div>
      <p class="mt-5 text-[12.5px] text-night-muted animate__animated animate__fadeInUp animate__delay-2s">إنشاء المتجر مجاني · 0% عمولة على الطلبات · جاهز في أقل من 10 دقائق</p>
      <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-night-muted animate__animated animate__fadeInUp animate__delay-2s">
        <span class="flex items-center gap-1.5"><span class="text-brand">${IC.check}</span>دعم عربي 24/7</span>
        <span class="flex items-center gap-1.5"><span class="text-brand">${IC.check}</span>دعم تسويقي</span>
        <span class="flex items-center gap-1.5"><span class="text-brand">${IC.check}</span>طلبات غير محدودة</span>
        <span class="flex items-center gap-1.5"><span class="text-brand">${IC.check}</span>أكتف كونفيرم لتأكيد الطلبات</span>
      </div>
    </div>

    <div class="relative hidden lg:block animate__animated animate__fadeInLeft animate__delay-1s">
      <div class="glass rounded-2xl p-2 shadow-float glow-brand" style="--fl-rot:-2deg">
        <div class="rounded-xl overflow-hidden bg-[#0d1117]">
          <div class="flex items-center gap-1.5 px-3 py-2 border-b border-white/10"><span class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span><span class="ms-2 flex-1 rounded-md bg-white/10 px-3 py-1 text-[10px] text-white/60 text-left" dir="ltr">mystore.active-order.store</span></div>
          <div class="bg-gradient-to-l from-brand to-[#1a9e1f] px-4 py-3 flex items-center justify-between"><span class="text-[13px] font-bold text-night">متجري</span><span class="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-night">تسوّق الآن</span></div>
          <div class="grid grid-cols-3 gap-2.5 p-3" dir="rtl">
            ${[['#264653','عباية كاجوال','٣٥٠ ج.م'],['#5b4b8a','شنطة جلد','٤٢٠ ج.م'],['#1f6f4a','سنيكرز أبيض','٨٩٠ ج.م']].map(c=>`<div class="rounded-lg bg-white/[0.07] p-2"><div class="rounded-md h-14 grid place-items-center" style="background:${c[0]}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg></div><div class="mt-1.5 text-[9.5px] font-semibold text-white/90">${c[1]}</div><div class="text-[9px] text-brand-bright font-bold">${c[2]}</div><div class="mt-1.5 rounded-full bg-brand text-night text-[9px] font-bold text-center py-1">اطلب الآن</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="glass absolute z-10 top-1/3 -left-10 rounded-full px-3.5 py-2 flex items-center gap-2 animate-float whitespace-nowrap" style="animation-delay:.4s">
        <span class="grid place-items-center w-6 h-6 rounded-full bg-brand/20 text-brand">${IC.truck || IC.check}</span>
        <span class="text-[12px] font-semibold">تم الشحن</span>
      </div>
      <div class="glass absolute z-10 -top-10 -left-6 rounded-2xl px-5 py-4 animate-float-soft whitespace-nowrap" style="--fl-rot:2deg">
        <div class="text-[26px] font-bold text-brand-bright">#1</div>
        <div class="text-[12px] text-night-muted mt-0.5">منصة التجارة الإلكترونية<br>الأولى في مصر</div>
      </div>
      <div class="glass absolute z-10 -bottom-8 -left-6 rounded-2xl px-4 py-3 flex items-center gap-3 animate-float whitespace-nowrap" style="animation-delay:.8s">
        <span class="grid place-items-center w-10 h-10 rounded-full bg-brand text-night">${IC.bag}</span>
        <div><div class="text-[13px] font-semibold">طلب جديد</div><div class="text-[12px] text-night-muted flex items-center gap-1"><span class="text-brand">${IC.check}</span>تم الدفع — جاهز للشحن الآن</div></div>
      </div>
    </div>
  </div>

  <div class="relative mx-auto max-w-6xl px-4 sm:px-8 mt-20">
    <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-night-border border-t border-night-border">
      <div class="py-8 text-center" data-reveal="fade-up"><div class="text-[34px] font-bold text-brand-bright">${storesCount > 1 ? '+' + storesCount : '1'}</div><div class="text-[13px] text-night-muted mt-1">متجر يعمل على اكتف اوردر</div></div>
      <div class="py-8 text-center" data-reveal="fade-up" style="--rv-delay:.1s"><div class="text-[34px] font-bold text-brand-bright">0%</div><div class="text-[13px] text-night-muted mt-1">عمولة على الطلبات</div></div>
      <div class="py-8 text-center" data-reveal="fade-up" style="--rv-delay:.2s"><div class="text-[34px] font-bold text-brand-bright">50 <span class="text-[16px]">ج.م</span></div><div class="text-[13px] text-night-muted mt-1">فقط كل 30 يوم</div></div>
      <div class="py-8 text-center" data-reveal="fade-up" style="--rv-delay:.3s"><div class="text-[34px] font-bold text-brand-bright">100%</div><div class="text-[13px] text-night-muted mt-1">عربي و RTL</div></div>
    </div>
  </div>
</section>

<section id="features" class="py-24 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">المميزات</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">كل ما يحتاجه تاجر الـ <span class="text-brand-foreground">COD</span> المصري</h2>
    <p class="mt-3 text-[16px] leading-7 text-muted-foreground">أدوات مترابطة تختصر وقت التشغيل وترفع معدل إتمام الطلبات على الموبايل.</p>
  </div>
  <div class="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    ${[
      [IC.bag,'متجر جاهز في دقائق','قوالب عربية سريعة متوافقة مع الموبايل. اختر قالباً، عدّل الألوان، وانشر.'],
      [IC.box,'لوحة طلبات ذكية','كانبان للطلبات بحالاتها من جديد إلى مُسلَّم، مع سجل كامل لكل حركة وتصدير شركات الشحن.'],
      [IC.chat,'تأكيد واتساب','أرسل تأكيد الطلب للعميل على واتساب بضغطة واحدة برسالة جاهزة تلقائياً.'],
      [IC.cart,'السلات المتروكة','شاهد من أضاف للسلة ولم يشترِ، واسترجعه برسالة واتساب جاهزة قبل أن يذهب لمنافس.'],
      [IC.shield,'حظر الطلبات الوهمية','احظر أرقام الهواتف المزعجة مرة واحدة وتتوقف طلباتها نهائياً عن الوصول.'],
      [IC.trend,'Upsell و Cross-sell','اقترح منتجات مكملة قبل الدفع وارفع متوسط قيمة الطلب بدون مجهود.'],
      [IC.target,'بيكسلات و CAPI','اربط Meta و TikTok و Snap و Google مع Conversions API من إعدادات التتبع.'],
      [IC.chart,'تحليلات وفانل','إيرادات، طلبات، معدل تحويل، وفانل كامل من الزيارة حتى الشراء.'],
      [IC.ticket,'كوبونات وشحن مرن','كوبونات بنسبة أو مبلغ ثابت، مناطق شحن بأسعار مختلفة، وشحن مجاني فوق حد معين.'],
    ].map((f,i)=>`
    <div class="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1 hover:border-brand/40" data-reveal="fade-up" style="--rv-delay:${(i%3)*0.08}s">
      <div class="grid place-items-center w-11 h-11 rounded-xl bg-brand-soft text-brand-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-night">${f[0]}</div>
      <h3 class="mt-4 text-[16px] font-bold">${f[1]}</h3>
      <p class="mt-1.5 text-[14px] leading-6 text-muted-foreground">${f[2]}</p>
    </div>`).join('')}
  </div>
</div></section>

<section id="how" class="py-24 bg-subtle"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">الخطوات</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">أنشئ متجرك الإلكتروني في 3 خطوات</h2>
  </div>
  <div class="mt-12 grid md:grid-cols-3 gap-4">
    ${[['1','سجّل حسابك مجاناً','أقل من دقيقة: اسمك وبريدك وكلمة سر، وبدون بطاقة بنكية.'],['2','اختر قالباً وأضف منتجاتك','قوالب عربية جاهزة بالصور والأقسام — بدّل الألوان وارفع منتجاتك مباشرة.'],['3','اربط الشحن والدفع وابدأ البيع','فعّل الدفع عند الاستلام أو Paymob، اضبط مناطق الشحن، وانشر رابط متجرك.']].map((s,i)=>`
    <div class="relative rounded-2xl border border-border bg-card p-7 shadow-soft" data-reveal="fade-up" style="--rv-delay:${i*0.1}s">
      <div class="grid place-items-center w-12 h-12 rounded-full bg-brand text-night text-[20px] font-bold">${s[0]}</div>
      <h3 class="mt-5 text-[17px] font-bold">${s[1]}</h3>
      <p class="mt-2 text-[14px] leading-7 text-muted-foreground">${s[2]}</p>
    </div>`).join('')}
  </div>
</div></section>

<section class="relative overflow-hidden bg-night text-night-foreground py-24"><div class="mx-auto max-w-6xl px-4 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
  <div data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-bright">حرية التصميم</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">صمّم متجرك بحرية كاملة</h2>
    <p class="mt-4 text-[16px] leading-8 text-night-muted">غيّر الألوان والخطوط والأقسام والبانرات من لوحة تخصيص حية ترى نتيجتها فوراً — بدون مصمم وبدون كود. كل قالب قابل للتعديل بالكامل ليطابق هوية برندك.</p>
    <div class="mt-7 flex flex-col gap-3 text-[14.5px]">
      ${['ألوان وخطوط عربية جاهزة بضغطة','أقسام ترتّبها بالسحب والإفلات','معاينة موبايل وديسكتوب لحظية'].map(x=>`<span class="flex items-center gap-2"><span class="text-brand">${IC.check}</span>${x}</span>`).join('')}
    </div>
  </div>
  <div class="glass rounded-2xl p-5 shadow-float" data-reveal="fade-left">
    <div class="flex items-center gap-2 pb-3 border-b border-white/10 text-[12px] text-night-muted"><span class="w-2.5 h-2.5 rounded-full bg-brand"></span>تخصيص القالب — معاينة حية</div>
    <div class="mt-4 grid grid-cols-4 gap-3">
      <div class="rounded-xl bg-white/[0.06] p-3 flex flex-col gap-2.5">${['الألوان','الخطوط','الأقسام','البانر','المنتجات'].map((x,i)=>`<span class="rounded-lg px-2.5 py-2 text-[11.5px] ${i===0?'bg-brand/20 text-brand-bright font-semibold':'text-night-muted'}">${x}</span>`).join('')}</div>
      <div class="col-span-3 rounded-xl bg-white/[0.06] p-3">
        <div class="h-16 rounded-lg bg-gradient-to-l from-brand to-[#1a9e1f]"></div>
        <div class="mt-3 grid grid-cols-3 gap-2">${[0,1,2].map(()=>'<div class="h-14 rounded-lg bg-white/10"></div>').join('')}</div>
        <div class="mt-3 flex gap-2">${['#27cd27','#141924','#5b4b8a','#c9a227'].map(c=>`<span class="w-7 h-7 rounded-full border-2 border-white/20" style="background:${c}"></span>`).join('')}</div>
      </div>
    </div>
  </div>
</div></section>

${activeConfirmSection()}

<section class="py-24 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">حماية من المرتجعات</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">اعرف نسبة استلام العميل قبل أن تشحن طلبه</h2>
    <p class="mt-3 text-[16px] leading-7 text-muted-foreground">أكتف كونفيرم يتحقق من العميل على واتساب قبل الشحن، فتقل المرتجعات ولا يضيع الشحن.</p>
  </div>
  <div class="mt-12 grid md:grid-cols-3 gap-4">
    ${[[IC.truck,'مرتجعات أقل، وشحن لا يضيع','لا تشحن إلا الطلبات المؤكدة فتتوقف خسائر الشحن ذهاباً وإياباً.'],[IC.chart,'قرار مبني على بيانات','حالة تأكيد كل طلب ظاهرة في اللوحة مع سجل كامل لرسائل العميل.'],[IC.shield,'القرار لك قبل الشحن','اشحن المؤكد، راجع المتأخر، وألغِ الوهمي — كل ذلك بضغطة واحدة.']].map((f,i)=>`
    <div class="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1" data-reveal="fade-up" style="--rv-delay:${i*0.1}s">
      <div class="grid place-items-center w-11 h-11 rounded-xl bg-brand-soft text-brand-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-night">${f[0]}</div>
      <h3 class="mt-4 text-[16px] font-bold">${f[1]}</h3>
      <p class="mt-1.5 text-[14px] leading-6 text-muted-foreground">${f[2]}</p>
    </div>`).join('')}
  </div>
</div></section>

<section class="py-24 bg-subtle"><div class="mx-auto max-w-6xl px-4 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
  <div class="rounded-2xl border border-border bg-card p-6 shadow-soft order-2 lg:order-1" data-reveal="fade-right">
    <div class="flex items-center gap-2 pb-4 border-b border-border text-[13px] font-semibold text-muted-foreground"><span class="grid place-items-center w-7 h-7 rounded-lg bg-brand-soft text-brand-foreground">${IC.target}</span>مساعد اكتف الذكي</div>
    <div class="mt-4 space-y-3">
      <div class="rounded-xl bg-muted px-4 py-3 text-[13.5px] leading-6">صفّ لي متجرك وسأقترح لك الأقسام والألوان والنصوص</div>
      <div class="rounded-xl border border-brand/30 bg-brand-soft/40 px-4 py-3 text-[13.5px] leading-6"><b class="text-brand-foreground">اقتراح جاهز:</b> هيرو بعرض خصم 20% + قسم الأكثر مبيعاً + بانر شحن مجاني فوق 600 ج.م</div>
      <div class="flex gap-2">${['هيرو','أقسام','نصوص','ألوان'].map(x=>`<span class="rounded-full border border-border px-3 py-1 text-[11.5px] text-muted-foreground">${x}</span>`).join('')}</div>
    </div>
  </div>
  <div class="order-1 lg:order-2" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">الذكاء الاصطناعي</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">صمّم صفحات احترافية بالذكاء الاصطناعي</h2>
    <p class="mt-4 text-[16px] leading-8 text-muted-foreground">مساعد اكتف الذكي يراجع أرقام متجرك ويقترح التحسينات: سيلات متروكة، كوبونات، تسعير، وأقسام الصفحة — توصيات عملية بناءً على بياناتك الحقيقية.</p>
    <a class="mt-6 inline-flex items-center gap-2 rounded-full bg-night px-6 py-3 text-[14px] font-bold text-white transition-all duration-200 hover:bg-brand hover:text-night" href="/register">جرّبه مجاناً</a>
  </div>
</div></section>

<section id="themes" class="py-24 bg-subtle"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">القوالب</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight">شاهد نماذج حية في مجالك</h2>
    <p class="mt-3 text-[16px] leading-7 text-muted-foreground">قوالب عربية جاهزة تنطلق في دقائق — خصّص الألوان والشعار والأقسام من لوحة التحكم، بدون كود.</p>
  </div>
  <div class="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
    ${[
      ['#141924','#27cd27','عصري','عصري — أزياء','شبكة صور جريئة لمتاجر الموضة'],
      ['#0B1526','#3B82F6','تقني','تقني — إلكترونيات','يبرز المواصفات والشراء السريع'],
      ['#4A2C3D','#D98E9A','بوتيك','بوتيك — تجميل','ألوان هادئة وإحساس راقٍ يبني الثقة'],
      ['#14532D','#F59E0B','طازج','طازج — عروض','مثالي للعروض والسوبرماركت'],
    ].map((t,i)=>`
    <div class="group rounded-2xl border border-border bg-card overflow-hidden shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1" data-reveal="fade-up" style="--rv-delay:${i*0.08}s">
      <div class="h-36 grid place-items-center transition-transform duration-500 group-hover:scale-[1.04]" style="background:linear-gradient(135deg,${t[0]},color-mix(in oklab,${t[0]} 70%,${t[1]}))"><span class="rounded-full px-4 py-1.5 text-[13px] font-bold" style="background:${t[1]};color:#0a0f14">${t[2]}</span></div>
      <div class="p-5"><h3 class="text-[15px] font-bold">${t[3]}</h3><p class="mt-1 text-[13px] leading-6 text-muted-foreground">${t[4]}</p></div>
    </div>`).join('')}
  </div>
</div></section>

<section class="py-24 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">التسويق</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">متجرك جاهز للتسويق من اليوم الأول</h2>
    <p class="mt-3 text-[16px] leading-7 text-muted-foreground">أدوات حملات مدمجة تربط إعلاناتك بالمبيعات الفعلية، بدون إضافات خارجية.</p>
  </div>
  <div class="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    ${[[IC.target,'بيكسلات كل المنصات','Meta و TikTok و Snap و Google مع Conversions API — تتبع دقيق حتى مع حاصرات الإعلانات.'],[IC.ticket,'كوبونات وعروض','كوبونات بنسبة أو مبلغ ثابت بحد أدنى وعدد استخدامات — أطلق عرضك في دقيقة.'],[IC.cart,'استرجاع السلات المتروكة','من أضاف ولم يشترِ؟ استرجعه برسالة واتساب جاهزة قبل أن يشتري من منافس.']].map((f,i)=>`
    <div class="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1" data-reveal="fade-up" style="--rv-delay:${i*0.1}s">
      <div class="grid place-items-center w-11 h-11 rounded-xl bg-brand-soft text-brand-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-night">${f[0]}</div>
      <h3 class="mt-4 text-[16px] font-bold">${f[1]}</h3>
      <p class="mt-1.5 text-[14px] leading-6 text-muted-foreground">${f[2]}</p>
    </div>`).join('')}
  </div>
</div></section>

<section class="py-24 bg-subtle"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">قنوات البيع</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">اعرض منتجاتك في كل المنصات</h2>
  </div>
  <div class="mt-12 grid md:grid-cols-3 gap-4">
    ${[['على متجرك','متجر سريع برابطك الخاص، مرتبط بلوحة الطلبات والشحن مباشرة.'],['فيسبوك وإنستجرام وتيك توك','بيكسلاتك مربوطة: كل زيارة وطلب يظهر في حملاتك تلقائياً.'],['Google Shopping','اربط منتجاتك بإعلانات جوجل وتابع التحويل من نفس اللوحة.']].map((f,i)=>`
    <div class="rounded-2xl border border-border bg-card p-6 shadow-soft" data-reveal="fade-up" style="--rv-delay:${i*0.1}s"><h3 class="text-[16px] font-bold" dir="auto">${f[0]}</h3><p class="mt-1.5 text-[14px] leading-6 text-muted-foreground">${f[1]}</p></div>`).join('')}
  </div>
  <div class="mt-14 grid md:grid-cols-2 gap-4">
    <div class="rounded-2xl border border-border bg-card p-7 shadow-soft" data-reveal="fade-up">
      <h3 class="text-[17px] font-bold">أسطول شحن متكامل في خدمة منتجاتك</h3>
      <p class="mt-2 text-[14px] leading-7 text-muted-foreground">مناطق شحن بأسعار مختلفة لكل محافظة، شحن مجاني فوق حد تختاره، وتصدير الطلبات جاهز لشركات الشحن.</p>
      <div class="mt-4 flex flex-wrap gap-2">${['بوسطة','مايلرز','أرامكس','SMSA','شحن خاص','تصدير CSV'].map(x=>`<span class="rounded-full border border-border bg-subtle px-3.5 py-1.5 text-[12.5px] font-medium text-muted-foreground">${x}</span>`).join('')}</div>
    </div>
    <div class="rounded-2xl border border-border bg-card p-7 shadow-soft" data-reveal="fade-up" style="--rv-delay:.1s">
      <h3 class="text-[17px] font-bold">مدفوعات آمنة لتجارة مستدامة</h3>
      <p class="mt-2 text-[14px] leading-7 text-muted-foreground">الدفع عند الاستلام مدعوم بالكامل، ومع مفاتيح Paymob يتحول متجرك للدفع الإلكتروني فوراً — بدون سطر كود.</p>
      <div class="mt-4 flex flex-wrap gap-2">${['الدفع عند الاستلام','Paymob','بطاقات','محافظ إلكترونية','فوري'].map(x=>`<span class="rounded-full border border-border bg-subtle px-3.5 py-1.5 text-[12.5px] font-medium text-muted-foreground">${x}</span>`).join('')}</div>
    </div>
  </div>
</div></section>

<section class="py-24 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">معك في كل خطوة</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">هدفنا بناء جيل من أقوى المتاجر العربية</h2>
  </div>
  <div class="mt-12 grid md:grid-cols-2 gap-4">
    <a href="/blog" class="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1 block" data-reveal="fade-up">
      <div class="grid place-items-center w-11 h-11 rounded-xl bg-brand-soft text-brand-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-night">${IC.chart}</div>
      <h3 class="mt-4 text-[17px] font-bold">أكاديمية اكتف اوردر</h3>
      <p class="mt-1.5 text-[14px] leading-7 text-muted-foreground">تعلّم التجارة الإلكترونية مجاناً: شحن، تسويق، تسعير، وإدارة طلبات — مقالات عملية من واقع السوق المصري.</p>
      <span class="mt-3 inline-block text-[13.5px] font-bold text-brand-foreground">تصفّح المدونة ←</span>
    </a>
    <a href="/blog/contact-us/" class="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1 block" data-reveal="fade-up" style="--rv-delay:.1s">
      <div class="grid place-items-center w-11 h-11 rounded-xl bg-brand-soft text-brand-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-night">${IC.chat}</div>
      <h3 class="mt-4 text-[17px] font-bold">خدمات التجار</h3>
      <p class="mt-1.5 text-[14px] leading-7 text-muted-foreground">تحتاج تصميم هوية، تصوير منتجات، أو إدارة حملات؟ فريقنا يساعدك تطلع بأفضل نسخة من متجرك.</p>
      <span class="mt-3 inline-block text-[13.5px] font-bold text-brand-foreground">تواصل معنا ←</span>
    </a>
  </div>
</div></section>

<section id="pricing" class="py-24 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="text-center max-w-2xl mx-auto" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">الأسعار</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight">إنشاء متجرك الإلكتروني أسهل مما تتوقع</h2>
  </div>
  <div class="mt-12 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
    <div class="rounded-3xl bg-brand p-8 text-night shadow-float relative overflow-hidden" data-reveal="pop">
      <span class="inline-block rounded-full bg-night/90 px-4 py-1.5 text-[12.5px] font-bold text-white">أقل سعر (مجاني)</span>
      <h3 class="mt-5 text-[26px] font-bold">الباقة العادية</h3>
      <p class="mt-2 text-[14px] leading-6 opacity-90">جهّز متجرك بالكامل مجاناً، وادفع فقط عندما تقرر النشر.</p>
      <div class="mt-5 text-[46px] font-bold leading-none">0 <span class="text-[15px] font-semibold opacity-80">ج.م / للتجهيز</span></div>
      <div class="my-6 border-t border-night/15"></div>
      <ul class="space-y-3 text-[14px]">
        ${['عدد غير محدود من المنتجات','عدد غير محدود من الطلبات','زيارات غير محدودة','متجرك يظل محفوظاً حتى لو لم تشترك','دعم سريع على مدار الساعة'].map(x=>`<li class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-night/90 text-white">${IC.check}</span>${x}</li>`).join('')}
      </ul>
      <a class="mt-8 block text-center rounded-full bg-night px-7 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:opacity-90" href="/register">اشترك الآن</a>
    </div>
    <div class="rounded-3xl border border-border bg-card p-8 shadow-soft relative overflow-hidden" data-reveal="pop" style="--rv-delay:.1s">
      <span class="inline-block rounded-full bg-night px-4 py-1.5 text-[12.5px] font-bold text-white">للمتاجر المنشورة</span>
      <h3 class="mt-5 text-[26px] font-bold">الباقة الاحترافية</h3>
      <p class="mt-2 text-[14px] leading-6 text-muted-foreground">انشر متجرك بكل المميزات باشتراك بسيط، وبدون أي عمولة على الطلبات.</p>
      <div class="mt-5 text-[46px] font-bold leading-none">50 <span class="text-[15px] font-semibold text-muted-foreground">ج.م / كل 30 يوم</span></div>
      <div class="my-6 border-t border-border"></div>
      <ul class="space-y-3 text-[14px]">
        ${['نشر المتجر برابطك الخاص','0% عمولة على مبيعاتك','كل القوالب والتحليلات والبيكسلات','تأكيد واتساب والسلات المتروكة','ربط دومين خاص وفريق وصلاحيات','دفع عبر InstaPay أو Vodafone Cash'].map(x=>`<li class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-brand-soft text-brand-foreground">${IC.check}</span>${x}</li>`).join('')}
      </ul>
      <a class="btn-sheen mt-8 block text-center rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="/register">اشترك الآن</a>
    </div>
  </div>
</div></section>

<section class="py-24 bg-subtle"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">تعلّم مجاناً</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight leading-snug">دليلك لإنشاء متجر إلكتروني ناجح</h2>
  </div>
  <div class="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    ${['ما الذي يحتاجه متجرك الإلكتروني لينجح؟','كم تكلفة إنشاء متجر إلكتروني؟','كيف تبدأ متجرك مجاناً وبدون خبرة؟','ربط شركات الشحن بالمتجر','بوابات الدفع والدفع عند الاستلام','التسويق: كيف تجلب عملاءك الأوائل؟','متجر دروب شيبنج أو منتجاتك الخاصة؟','لماذا يختار التجار المنصات العربية؟','تعلّم التجارة مع أكاديمية اكتف اوردر'].map((q,i)=>`
    <a href="/blog" class="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1 hover:border-brand/40 block" data-reveal="fade-up" style="--rv-delay:${(i%3)*0.08}s">
      <h3 class="text-[15px] font-bold leading-7">${q}</h3>
      <span class="mt-3 inline-block text-[13px] font-bold text-brand-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">اقرأ في المدونة ←</span>
    </a>`).join('')}
  </div>
</div></section>

<section class="py-24 bg-subtle"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">قالوا عنا</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight">تجار يبيعون كل يوم على اكتف اوردر</h2>
    <p class="mt-3 text-[16px] leading-7 text-muted-foreground">من أول طلب حتى مئات الطلبات شهرياً — هكذا تغيّرت شغلتهم معنا.</p>
  </div>
  <div class="mt-12 grid lg:grid-cols-3 gap-4">
    ${[
      ['ن','نورهان سامي','متجر أزياء نسائية — القاهرة','أول مرة أطلق متجر بدون ما أحتاج مطوّر. القالب جاهز والطلبات دخلت من أول أسبوع، ولوحة الطلبات وفّرت عليّا ساعات شغل يومياً.'],
      ['م','محمد عبد الرحمن','إلكترونيات وموبايلات — الجيزة','أكتف كونفيرم غيّر اللعبة. نسبة الطلبات الوهمية نزلت لأقل من النص لأن العميل بيأكد بنفسه على واتساب قبل ما أشحن.'],
      ['س','سارة المصري','مستحضرات تجميل — الإسكندرية','التحليلات خلتني أعرف بالظبط أنهي منتج بييجي منه الربح، والسلات المتروكة رجّعتلي عملاء كنت بخسرهم من غير ما أعرف.'],
    ].map((t,i)=>`
    <figure class="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1" data-reveal="fade-up" style="--rv-delay:${i*0.1}s">
      <div class="flex gap-0.5 text-brand text-[15px]">★★★★★</div>
      <blockquote class="mt-3 text-[14.5px] leading-7">«${t[3]}»</blockquote>
      <figcaption class="mt-5 flex items-center gap-3">
        <span class="grid place-items-center w-10 h-10 rounded-full bg-brand-soft text-brand-foreground font-bold">${t[0]}</span>
        <div><div class="text-[14px] font-bold">${t[1]}</div><div class="text-[12.5px] text-muted-foreground">${t[2]}</div></div>
      </figcaption>
    </figure>`).join('')}
  </div>
</div></section>

<section id="faq" class="py-24 bg-background"><div class="mx-auto max-w-3xl px-4 sm:px-8">
  <div class="text-center" data-reveal="fade-up">
    <span class="text-[13px] font-semibold text-brand-foreground">أسئلة شائعة</span>
    <h2 class="mt-2 text-[32px] sm:text-[38px] font-bold tracking-tight">هل لا زلت متردّداً؟</h2>
    <p class="mt-3 text-[15px] leading-7 text-muted-foreground">نحن هنا لنوضّح لك كل شيء ببساطة وبدون مصطلحات تقنية.</p>
    <p class="mt-3 text-[16px] text-muted-foreground">إجابات مباشرة بدون مصطلحات معقدة.</p>
  </div>
  <div class="mt-10 space-y-3">
    ${[
      ['هل أحتاج خبرة برمجية لإطلاق متجري؟','إطلاقاً. تختار القالب، تضيف منتجاتك من لوحة التحكم، وتنشر. كل شيء يعمل بالعربي ومن الموبايل، ولا تكتب سطر كود واحد.'],
      ['كيف يصلني فلوس المبيعات؟','الدفع عند الاستلام يصلك مباشرة من شركة الشحن. ومع ربط Paymob تستقبل مدفوعات البطاقات والمحافظ في حسابك البنكي تلقائياً — اكتف اوردر لا تأخذ أي عمولة.'],
      ['ما هو أكتف كونفيرم؟','نظام تأكيد طلبات تلقائي: عميلك يستلم رسالة واتساب بمجرد الطلب، يرد 1 للتأكيد أو 2 للإلغاء، وتتحدث الحالة في لوحتك فوراً. يحميك من الشحن لعناوين وهمية.'],
      ['هل أستطيع إيقاف الاشتراك في أي وقت؟','نعم. الاشتراك 50 ج.م كل 30 يوماً بدون التزام سنوي، ومتجرك وبياناتك تظل محفوظة لو قررت العودة.'],
      ['هل أستطيع ربط دومين خاص بمتجري؟','نعم، من إعدادات المتجر تربط دومينك الخاص (مثل store.com) خلال دقائق مع شهادة حماية تلقائية.'],
    ].map((q,i)=>`
    <details class="group rounded-2xl border border-border bg-card px-6 shadow-soft transition-colors duration-200 open:border-brand/40" data-reveal="fade-up" style="--rv-delay:${i*0.06}s">
      <summary class="flex cursor-pointer items-center justify-between py-5 text-[15px] font-bold list-none [&::-webkit-details-marker]:hidden">${q[0]}<span class="grid place-items-center w-7 h-7 rounded-full bg-muted text-muted-foreground transition-transform duration-300 group-open:rotate-45 group-open:bg-brand-soft group-open:text-brand-foreground"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></summary>
      <p class="pb-5 text-[14px] leading-7 text-muted-foreground">${q[1]}</p>
    </details>`).join('')}
  </div>
  <div class="mt-10 rounded-3xl border border-border bg-card p-8 text-center shadow-soft" data-reveal="fade-up">
    <h3 class="text-[20px] font-bold">وإن لم تجد سؤالك هنا؟</h3>
    <p class="mt-2 text-[14px] text-muted-foreground">فريق الدعم في انتظارك… 24/7</p>
    <a class="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-[14px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="https://wa.me/201011206670" target="_blank" rel="noopener">تحدّث مع فريق الدعم</a>
  </div>
</div></section>

<section class="relative overflow-hidden bg-night text-night-foreground py-24">
  <div class="hero-grid absolute inset-0 opacity-60"></div>
  <div class="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[800px] h-[420px] rounded-full opacity-20 blur-[110px]" style="background: radial-gradient(closest-side, var(--color-brand), transparent)"></div>
  <div class="relative mx-auto max-w-3xl px-4 text-center" data-reveal="fade-up">
    <h2 class="text-[34px] sm:text-[44px] font-bold tracking-tight">متجرك الإلكتروني على بُعد دقائق</h2>
    <p class="mt-4 text-[16px] text-night-muted">انضم لتجار اكتف اوردر وابدأ رحلتك اليوم.</p>
    <a class="btn-sheen mt-8 inline-block rounded-full bg-brand px-9 py-4 text-[16px] font-bold text-night transition-all duration-200 hover:bg-brand-bright glow-brand" href="/register">أنشئ متجرك مجاناً</a>
  </div>
</section>

<footer class="bg-night text-night-foreground border-t border-night-border"><div class="mx-auto max-w-6xl px-4 sm:px-8 py-14">
  <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
    <div>${logo}<p class="mt-4 text-[13.5px] leading-6 text-night-muted">منصة عربية متكاملة لإنشاء المتاجر الإلكترونية، مبنية خصيصاً لتجار الدفع عند الاستلام في مصر والوطن العربي.</p></div>
    <div><h4 class="text-[14px] font-bold mb-4">المنصة</h4><div class="flex flex-col gap-2.5 text-[13.5px] text-night-muted"><a class="hover:text-brand-bright transition-colors" href="/">الرئيسية</a><a class="hover:text-brand-bright transition-colors" href="/pricing">الأسعار</a><a class="hover:text-brand-bright transition-colors" href="/themes">القوالب</a><a class="hover:text-brand-bright transition-colors" href="/blog">الكورسات</a><a class="hover:text-brand-bright transition-colors" href="/s/noura" target="_blank">متجر تجريبي</a></div></div>
    <div><h4 class="text-[14px] font-bold mb-4">الشركة</h4><div class="flex flex-col gap-2.5 text-[13.5px] text-night-muted"><a class="hover:text-brand-bright transition-colors" href="/blog/about-us/">من نحن</a><a class="hover:text-brand-bright transition-colors" href="/blog">المدونة</a><a class="hover:text-brand-bright transition-colors" href="/blog/contact-us/">اتصل بنا</a><a class="hover:text-brand-bright transition-colors" href="/blog/contact-us/">طلب تطويرات</a></div></div>
    <div><h4 class="text-[14px] font-bold mb-4">قانوني</h4><div class="flex flex-col gap-2.5 text-[13.5px] text-night-muted"><a class="hover:text-brand-bright transition-colors" href="/blog/conditions/">سياسة الاستخدام</a><a class="hover:text-brand-bright transition-colors" href="/blog/privacy-policy/">سياسة الخصوصية</a></div></div>
  </div>
  <div class="mt-12 pt-6 border-t border-night-border flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-night-muted"><span>اكتف اوردر © 2026 — جميع الحقوق محفوظة</span><span>صُنعت في القاهرة</span></div>
</div></footer>
<a href="https://wa.me/201011206670" target="_blank" rel="noopener" aria-label="تواصل معنا واتساب" class="fixed bottom-6 right-6 z-50 grid place-items-center w-14 h-14 rounded-full bg-brand text-night shadow-[0_8px_30px_-6px_var(--color-brand)] transition-transform duration-200 hover:scale-110 animate__animated animate__fadeInUp"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.2.2-.4.4-.2.8.2.4 1 1.7 2.2 2.7 1.5 1.3 2.7 1.7 3.1 1.9.4.2.6.1.8-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.3 1.1z"/></svg></a>
`);
}


// ---------- auth ----------
const inputCls = 'w-full rounded-xl border border-input bg-surface px-4 py-3 text-[14px] outline-none transition-all duration-150 focus:ring-4 focus:ring-ring/30 focus:border-brand';
function authCard(kind) {
  const isLogin = kind === 'login';
  return base(isLogin ? 'تسجيل الدخول | اكتف اوردر' : 'إنشاء حساب | اكتف اوردر', `
<div class="min-h-screen grid place-items-center bg-subtle px-4 py-14 relative overflow-hidden">
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.10] blur-[110px]" style="background:radial-gradient(closest-side,var(--color-brand),transparent)"></div>
  <div class="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-float" id="authCard" data-reveal="pop">
    <div class="flex justify-center">${logo}</div>
    <h1 class="mt-7 text-center text-[24px] font-bold tracking-tight">${isLogin ? 'أهلاً بعودتك' : 'أنشئ متجرك مجاناً'}</h1>
    <p class="mt-1.5 text-center text-[14px] text-muted-foreground">${isLogin ? 'سجّل دخولك لإدارة متجرك' : '30 ثانية وتكون جاهز — بدون بطاقة بنكية'}</p>
    <form id="authForm" class="mt-7 space-y-4">
      ${isLogin ? '' : `<label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">اسمك</span><input class="${inputCls}" name="name" required placeholder="مثال: نورا محمود"></label>
      <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">اسم المتجر</span><input class="${inputCls}" name="storeName" required placeholder="مثال: متجر نورا"></label>`}
      <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">البريد الإلكتروني</span><input class="${inputCls}" name="email" type="email" required placeholder="you@example.com" dir="ltr"></label>
      <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">كلمة المرور</span><input class="${inputCls}" name="password" type="password" required minlength="8" placeholder="8 أحرف على الأقل" dir="ltr"></label>
      <div class="text-[13px] font-medium text-red-600 min-h-[18px]" id="authErr"></div>
      <button class="btn-sheen w-full rounded-full bg-brand py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" type="submit">${isLogin ? 'دخول' : 'إنشاء الحساب'}</button>
    </form>
    ${isLogin ? `<p class="mt-5 text-center text-[13.5px] text-muted-foreground">ليس لديك حساب؟ <a class="font-bold text-brand-foreground hover:underline" href="/register">ابدأ مجاناً</a></p>
    <div class="mt-4 rounded-xl bg-muted px-4 py-3 text-center text-[12.5px] text-muted-foreground">حساب تجريبي: <code dir="ltr" class="font-semibold text-foreground">demo@activetecno.software / demo1234</code></div>`
    : `<p class="mt-5 text-center text-[13.5px] text-muted-foreground">لديك حساب بالفعل؟ <a class="font-bold text-brand-foreground hover:underline" href="/login">سجّل دخولك</a></p>`}
  </div>
</div>
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
  showVerify(body.email, d.dev_code, d.email_sent);
});
function showVerify(email, devCode, emailSent) {
  document.getElementById('authCard').innerHTML = \`
  <h1 class="text-center text-[24px] font-bold tracking-tight">تحقق من بريدك</h1>
  <p class="mt-1.5 text-center text-[14px] text-muted-foreground">أرسلنا رمز تحقق من 6 أرقام إلى <b dir="ltr">\` + email + \`</b></p>
  \` + (devCode ? '<div class="mt-5 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-center"><div class="text-[12px] font-semibold text-muted-foreground">بيئة العرض — خدمة البريد غير مفعّلة بعد</div><div dir="ltr" class="mt-2 text-[30px] font-bold tracking-[10px] text-brand-foreground">' + devCode + '</div><div class="mt-1 text-[12px] text-muted-foreground">أدخل الرمز بالأسفل لإتمام إنشاء متجرك</div></div>' : '') + \`
  <form id="verifyForm" class="mt-6 space-y-4">
    <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">كود التحقق</span><input class="${inputCls}" name="code" required inputmode="numeric" maxlength="6" placeholder="______" dir="ltr" style="text-align:center;font-size:22px;letter-spacing:8px"></label>
    <div class="text-[13px] font-medium text-red-600 min-h-[18px]" id="vErr"></div>
    <button class="btn-sheen w-full rounded-full bg-brand py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" type="submit">تأكيد البريد وإنشاء المتجر</button>
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
  return base('خطوات إطلاق متجرك | اكتف اوردر', `
<div class="min-h-screen grid place-items-center bg-subtle px-4 py-14 relative overflow-hidden">
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.10] blur-[110px]" style="background:radial-gradient(closest-side,var(--color-brand),transparent)"></div>
  <div class="relative w-full max-w-xl rounded-3xl border border-border bg-card p-8 shadow-float" data-reveal="pop">
    <div class="flex justify-center">${logo}</div>
    <div class="flex items-center justify-center gap-0 my-7">
      <span id="dot1" class="ob-dot on">1</span><span class="w-14 h-0.5 bg-border"></span>
      <span id="dot2" class="ob-dot">2</span><span class="w-14 h-0.5 bg-border"></span>
      <span id="dot3" class="ob-dot">3</span>
    </div>
    <div id="obStep1">
      <h1 class="text-center text-[21px] font-bold tracking-tight">اختر قالب متجرك</h1>
      <p class="mt-1.5 text-center text-[13.5px] text-muted-foreground">كل القوالب عربية وسريعة ومتوافقة مع الموبايل — تقدر تغيّرها في أي وقت</p>
      <div class="mt-6 grid grid-cols-2 gap-3 mb-6">${themes.map(t => `
        <div class="theme-opt ${t.id === store.theme_id ? 'on' : ''}" data-t="${t.id}" onclick="pickObTheme(this)">
          <div class="flex gap-1.5 mb-2.5"><span class="w-5 h-5 rounded-md" style="background:${t.config.primary}"></span><span class="w-5 h-5 rounded-md" style="background:${t.config.accent}"></span><span class="w-5 h-5 rounded-md" style="background:${t.config.surface}"></span></div>
          <b class="block text-[13.5px]">${esc(t.name_ar)}</b><small class="text-[11.5px] text-muted-foreground">${esc(t.category)}${t.is_premium ? ' · بريميوم' : ' · مجاني'}</small></div>`).join('')}</div>
      <button class="btn-sheen w-full rounded-full bg-brand py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" onclick="obGo(2)">التالي — أضف أول منتج</button>
    </div>
    <div id="obStep2" hidden>
      <h1 class="text-center text-[21px] font-bold tracking-tight">أضف أول منتج</h1>
      <p class="mt-1.5 text-center text-[13.5px] text-muted-foreground">منتج واحد يكفي للانطلاق — تقدر تضيف الباقي من لوحة التحكم</p>
      <form class="mt-6 space-y-4" id="obProdForm">
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">اسم المنتج</span><input class="${inputCls}" name="name" placeholder="مثال: عباية كلاسيك"></label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">السعر (ج.م)</span><input class="${inputCls}" name="price" type="number" min="1" placeholder="500"></label>
        <div class="text-[13px] font-medium text-red-600 min-h-[18px]" id="obErr"></div>
        <button class="btn-sheen w-full rounded-full bg-brand py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" type="submit">حفظ المنتج والمتابعة</button>
        <button class="w-full rounded-full py-3 text-[14px] font-semibold text-muted-foreground transition-colors hover:text-foreground" type="button" onclick="obGo(3)">تخطَّ الآن</button>
      </form>
    </div>
    <div id="obStep3" hidden>
      <div class="grid place-items-center my-4"><span class="grid place-items-center w-16 h-16 rounded-full bg-brand text-night glow-brand"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg></span></div>
      <h1 class="text-center text-[21px] font-bold tracking-tight">متجرك جاهز!</h1>
      <p class="mt-2 text-center text-[13.5px] leading-7 text-muted-foreground">رابط متجرك: <b class="font-mono text-foreground" dir="ltr">/s/${esc(store.slug)}</b><br>فعّل النشر بـ 50 ج.م كل 30 يوم وابدأ استقبال الطلبات.</p>
      <a class="btn-sheen mt-6 block text-center w-full rounded-full bg-brand py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="/app">الذهاب إلى لوحة التحكم</a>
    </div>
  </div>
</div>
<style>
.ob-dot{width:34px;height:34px;border-radius:50%;background:var(--color-surface);color:var(--color-muted-foreground);display:grid;place-items:center;font-weight:700;font-size:14px;border:2px solid var(--color-border);transition:all .25s var(--ease-out-quint)}
.ob-dot.on{background:var(--color-brand);border-color:var(--color-brand);color:var(--color-night)}
.ob-themes .theme-opt, .theme-opt{border:2px solid var(--color-border);border-radius:14px;padding:12px;cursor:pointer;transition:all .2s var(--ease-out-quint)}
.theme-opt:hover{border-color:color-mix(in oklab,var(--color-brand) 40%,transparent)}
.theme-opt.on{border-color:var(--color-brand);background:var(--color-brand-soft)}
</style>
<script>
let obTheme = '${esc(store.theme_id)}';
function pickObTheme(el){ document.querySelectorAll('.theme-opt').forEach(x=>x.classList.remove('on')); el.classList.add('on'); obTheme = el.dataset.t; saveObTheme(); }
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
<title>لوحة التحكم | اكتف اوردر</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/dashboard.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23141924'/%3E%3Cpath d='M9 20l7-11 7 11' stroke='%2327cd27' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
</head><body class="dash"><div id="root"></div><script src="/public/js/dashboard.js"></script></body></html>`;
}

function adminShell() {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>لوحة الإدارة | اكتف اوردر</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/dashboard.css">
</head><body class="dash admin"><div id="root"></div><script src="/public/js/admin.js"></script></body></html>`;
}

// ---------- storefront ----------
function themeVars(t) {
  return `--sp:${t.primary || '#141924'};--sa:${t.accent || '#27cd27'};--sbg:${t.bg || '#fff'};--ssf:${t.surface || '#F6F8FC'};--sr:${t.radius ?? 16}px;`;
}
function storeHead(store, t, title) {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/store.css">
<style>:root{${themeVars(t)}}</style>`;
}

function storeHeader(store, t) {
  return `${store.announcement ? `<div class="s-announce">${esc(store.announcement)}</div>` : ''}
<header class="s-header ${t.header === 'split' ? 'split' : ''}">
  <a class="s-brand" href="/s/${esc(store.slug)}"><span class="s-logo">${esc((store.logo_text || store.name).trim().charAt(0))}</span><span>${esc(store.name)}</span></a>
  <button class="s-cart-btn" onclick="toggleCart(true)" aria-label="السلة">${IC.cart}<span class="s-cart-count" id="cartCount">0</span></button>
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
${owner ? `<div class="s-ownerbar">وضع المعاينة — <a href="/app">العودة للوحة التحكم</a></div>` : ''}
${storeHeader(store, t)}
<section class="s-hero"><h1>${esc(store.name)}</h1><p>${esc(store.description)}</p>
<div class="s-hero-cta"><a class="s-btn" href="#products">تسوّق الآن</a>
${store.whatsapp ? `<a class="s-btn ghost" href="https://wa.me/${esc(store.whatsapp)}" target="_blank" rel="noopener">تواصل واتساب</a>` : ''}</div></section>
${cats.length ? `<nav class="s-cats" id="products">${['الكل', ...cats].map(c => `<button class="s-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</nav>` : '<div id="products"></div>'}
<main class="s-grid">${cards || `<div class="s-empty">لا توجد منتجات بعد — تابعنا قريباً ✨</div>`}</main>
${store.free_shipping_over ? `<div class="s-freeship">${IC.truck}شحن مجاني للطلبات فوق ${egp(store.free_shipping_over)}</div>` : ''}
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a> — الدفع عند الاستلام متاح</p></footer>
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
${owner ? `<div class="s-ownerbar">وضع المعاينة — <a href="/app">العودة للوحة التحكم</a></div>` : ''}
${storeHeader(store, t)}
<main class="pd">
<div class="pd-gallery"><img id="pdImg" src="${esc(imgs[0] || ph(p.name))}" alt="${esc(p.name)}">
${imgs.length > 1 ? `<div class="pd-thumbs">${imgs.map((im, i) => `<img src="${esc(im)}" onclick="document.getElementById('pdImg').src=this.src" class="${i === 0 ? 'on' : ''}">`).join('')}</div>` : ''}</div>
<div class="pd-info">
<span class="pd-cat">${esc(p.category)}</span>
<h1>${esc(p.name)}</h1>
<div class="pd-price"><b>${egp(p.price)}</b>${p.compare_at_price ? `<s>${egp(p.compare_at_price)}</s>` : ''}${off ? `<span class="p-off">وفّر ${off}%</span>` : ''}</div>
<p class="pd-desc">${esc(p.description)}</p>
${p.stock > 0 && p.stock <= (p.low_stock_threshold || 3) ? `<div class="pd-low">${IC.flame}باقي ${p.stock} فقط — اطلب الآن</div>` : ''}
${p.stock <= 0 ? `<div class="pd-low out">نفدت الكمية مؤقتاً</div>` : `
<div class="pd-qty"><button onclick="pdQty(-1)">−</button><span id="pdQty">1</span><button onclick="pdQty(1)">+</button></div>
<button class="s-btn btn-lg full" onclick="addToCart(${p.id}, '${esc(p.name).replace(/'/g, '')}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, +document.getElementById('pdQty').textContent)">أضف إلى السلة 🛒</button>
<button class="s-btn btn-lg full buy" onclick="buyNow(${p.id}, '${esc(p.name).replace(/'/g, '')}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, +document.getElementById('pdQty').textContent)">اشتري الآن — دفع عند الاستلام</button>`}
${upsell ? `<div class="pd-upsell"><h4>${IC.bulb}يُشترى معه غالباً</h4>
<div class="pd-upsell-card"><img src="${esc(JSON.parse(upsell.images || '[]')[0] || '')}"><div><b>${esc(upsell.name)}</b><span>${egp(upsell.price)}</span></div>
<button onclick="addToCart(${upsell.id}, '${esc(upsell.name).replace(/'/g, '')}', ${upsell.price}, ${JSON.stringify(JSON.parse(upsell.images || '[]')[0] || '')}, 1)">أضف</button></div></div>` : ''}
</div></main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
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
<p class="co-sub">خطوة واحدة وطلبك في الطريق إليك</p>
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
<label class="pay-method"><input type="radio" name="payment_method" value="cod" checked><span class="pm-ic">${IC.cash}</span><div class="pm-body"><b>الدفع عند الاستلام</b><span>ادفع كاش أو بالمحفظة عند وصول طلبك</span></div><span class="pm-check"></span></label>
<label class="pay-method" id="pmOnline"><input type="radio" name="payment_method" value="online"><span class="pm-ic">${IC.card}</span><div class="pm-body"><b>بطاقة بنكية / محفظة إلكترونية</b><span id="pmOnlineHint">دفع آمن ومشفّر عبر Paymob</span></div><span class="pm-check"></span></label>
</div>
<div class="co-coupon"><input name="coupon" placeholder="كود الخصم" dir="ltr"><button type="button" onclick="applyCoupon()">تطبيق</button></div>
<div class="auth-err" id="coErr"></div>
<button type="submit" class="s-btn btn-lg full buy" id="coSubmit">تأكيد الطلب — دفع عند الاستلام</button>
<div class="co-trust"><span>${IC.lock}بياناتك آمنة ومشفّرة</span><span>${IC.truck}توصيل سريع</span><span>${IC.ret}إرجاع سهل</span></div>
</form>
<aside class="co-summary" id="coSummary"></aside>
</div></main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
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
<div class="done-check">${IC.check}</div>
<h1>شكراً ${esc(o.customer_name)}!</h1>
<p>تم استلام طلبك <b>${esc(o.number)}</b> بنجاح وسنتواصل معك لتأكيد الشحن.</p>
<div class="done-items">${items.map(i => `<div class="done-item"><span>${esc(i.name)} × ${i.qty}</span><b>${egp(i.price * i.qty)}</b></div>`).join('')}
<div class="done-item dim"><span>الشحن</span><b>${o.shipping ? egp(o.shipping) : 'مجاني'}</b></div>
${o.discount ? `<div class="done-item dim"><span>الخصم${o.coupon_code ? ` (${esc(o.coupon_code)})` : ''}</span><b>−${egp(o.discount)}</b></div>` : ''}
<div class="done-item total"><span>الإجمالي عند الاستلام</span><b>${egp(o.total)}</b></div></div>
<div class="done-actions">
${waLink ? `<a class="s-btn" href="${waLink}" target="_blank" rel="noopener">تواصل معنا واتساب</a>` : ''}
<a class="s-btn ghost" href="/s/${esc(store.slug)}">متابعة التسوق</a></div>
</div></main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
</body></html>`;
}

// ---------- landing: Active Confirm section ----------
function activeConfirmSection() {
  return `
<section class="py-24 bg-subtle overflow-hidden"><div class="mx-auto max-w-6xl px-4 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
<div data-reveal="fade-right">
  <span class="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 text-[13px] font-bold text-brand-foreground"><span class="inline-block w-2 h-2 rounded-full bg-brand pulse-dot"></span>أكتف كونفيرم — حصرياً في اكتف اوردر</span>
  <h2 class="mt-5 text-[30px] sm:text-[38px] font-bold tracking-tight leading-snug">أكّد طلبات COD على واتساب<br>برسالة واحدة ورد <span class="text-brand-foreground">1 أو 2</span></h2>
  <p class="mt-4 text-[16px] leading-8 text-muted-foreground">كل طلب جديد يصل عميلك تلقائياً رسالة واتساب جاهزة: يرد <b>1</b> فيتأكد الطلب، أو <b>2</b> فيُلغى — ويتحدث وضعه في لوحتك لحظياً. قلّل الطلبات الوهمية ووفّر ساعات المكالمات.</p>
  <div class="mt-6 space-y-2.5 text-[14.5px] font-medium">
    <span class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-brand-soft text-brand-foreground">${IC.check}</span>تأكيد فوري بدون مكالمات</span>
    <span class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-brand-soft text-brand-foreground">${IC.check}</span>تحديث حالة الطلب تلقائياً</span>
    <span class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-brand-soft text-brand-foreground">${IC.check}</span>يقلل المرتجعات والطلبات الوهمية</span>
  </div>
  <a class="btn-sheen mt-8 inline-block rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="/register">جرّب أكتف كونفيرم مجاناً</a>
</div>
<div class="relative" data-reveal="fade-left">
  <div class="absolute inset-0 -m-8 rounded-full opacity-25 blur-[80px]" style="background:radial-gradient(closest-side,var(--color-brand),transparent)"></div>
  <div class="relative mx-auto max-w-sm rounded-[28px] border border-border bg-card p-5 shadow-float space-y-3">
    <div class="flex items-center gap-3 pb-3 border-b border-border">
      <span class="grid place-items-center w-9 h-9 rounded-full bg-brand-soft text-brand-foreground font-bold text-[14px]">ن</span>
      <div><div class="text-[13.5px] font-bold">متجر نورا</div><div class="text-[11.5px] text-brand-foreground font-medium">متصل الآن</div></div>
    </div>
    <div class="max-w-[85%] rounded-2xl rounded-tr-md bg-muted px-4 py-3 text-[13.5px] leading-6" data-reveal="fade-up">أهلاً مريم 👋<br>طلبك <b>NO-1027</b> من متجر نورا<br>الإجمالي: 780 ج.م — دفع عند الاستلام<br><br>رد بـ <b>1</b> لتأكيد الطلب ✅<br>رد بـ <b>2</b> للإلغاء ❌</div>
    <div class="flex justify-start" dir="ltr"><div class="rounded-2xl rounded-tl-md bg-brand px-5 py-2.5 text-[14px] font-bold text-night" data-reveal="pop" style="--rv-delay:.2s">1</div></div>
    <div class="max-w-[85%] rounded-2xl rounded-tr-md bg-muted px-4 py-3 text-[13.5px] leading-6" data-reveal="fade-up" style="--rv-delay:.35s">تم تأكيد طلبك بنجاح 🎉<br>شحنك في الطريق قريباً 🚚</div>
    <div class="flex items-center justify-center gap-1.5 pt-1 text-[12px] font-semibold text-brand-foreground" data-reveal="fade-up" style="--rv-delay:.5s">${IC.check}تحدّثت حالة الطلب إلى «مؤكد» في لوحة التحكم</div>
  </div>
</div>
</div></section>`;
}

function comingSoon(store) {
  return base(store.name, `<div class="min-h-screen grid place-items-center bg-subtle px-4 text-center"><div data-reveal="pop"><div class="flex justify-center mb-6">${logo}</div><h1 class="text-[28px] font-bold">${esc(store.name)}</h1><p class="mt-2 text-[15px] text-muted-foreground">المتجر تحت التجهيز حالياً — عد قريباً ✨</p></div></div>`);
}
function notFound(title, msg) {
  return base(title, `<div class="min-h-screen grid place-items-center bg-subtle px-4 text-center"><div data-reveal="pop"><h1 class="text-[28px] font-bold">${esc(title)}</h1><p class="mt-2 text-[15px] text-muted-foreground">${esc(msg)}</p><a class="btn-sheen mt-6 inline-block rounded-full bg-brand px-7 py-3 text-[14px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="/">العودة للرئيسية</a></div></div>`);
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
