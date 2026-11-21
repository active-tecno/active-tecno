// views.js — server-rendered pages (landing, auth, storefront). Dashboard/admin are SPA shells.
const { db } = require('./db');
const fs = require('fs');
const path = require('path');
function themeHeroImg(lay) { if (!lay) return ''; const p = path.join(__dirname, 'public', 'theme-heroes', `eo-${lay}.jpg`); return fs.existsSync(p) ? `/public/theme-heroes/eo-${lay}.jpg` : ''; }


const GOVS = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'القليوبية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'طنطا', 'المنصورة', 'الزقازيق'];
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


// ---------- site chrome ----------
function siteHeader(mode) {
  const dark = `
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
    <div class="hidden items-center gap-1 lg:flex">
      <details class="relative group"><summary class="list-none flex items-center gap-1.5 rounded-full px-3 py-2 text-[13.5px] font-medium cursor-pointer transition-colors text-night-foreground/85 hover:text-white"><svg width="18" height="13" viewBox="0 0 18 13" class="rounded-[3px] shadow-sm"><rect width="18" height="13" fill="#fff"/><rect width="18" height="4.33" fill="#ce1126"/><rect y="8.67" width="18" height="4.33" fill="#000"/></svg><span>مصر · AR</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></summary><div class="absolute left-0 top-11 w-44 rounded-2xl border border-night-border bg-night/95 backdrop-blur-xl p-2 shadow-elevated"><span class="flex items-center gap-2 rounded-xl px-3 py-2 text-[13.5px] font-medium text-night-foreground/85 hover:bg-white/[0.06]"><svg width="18" height="13" viewBox="0 0 18 13" class="rounded-[3px] shadow-sm"><rect width="18" height="13" fill="#fff"/><rect width="18" height="4.33" fill="#ce1126"/><rect y="8.67" width="18" height="4.33" fill="#000"/></svg> مصر — العربية</span></div></details>
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
</header>`;
  const light = `
<header class="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border">
  <div class="relative mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:px-8 max-w-6xl">
    ${logo}
    <nav class="hidden items-center gap-0.5 lg:flex text-foreground/80">
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground" href="/">الرئيسية</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground" href="/blog">الكورسات</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground" href="/pricing">الأسعار</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground" href="/blog">المدونة</a>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground" href="/themes">القوالب</a>
    </nav>
    <div class="hidden items-center gap-1 lg:flex">
      <details class="relative group"><summary class="list-none flex items-center gap-1.5 rounded-full px-3 py-2 text-[13.5px] font-medium cursor-pointer transition-colors text-foreground/80 hover:text-foreground"><svg width="18" height="13" viewBox="0 0 18 13" class="rounded-[3px] shadow-sm"><rect width="18" height="13" fill="#fff"/><rect width="18" height="4.33" fill="#ce1126"/><rect y="8.67" width="18" height="4.33" fill="#000"/></svg><span>مصر · AR</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></summary><div class="absolute left-0 top-11 w-44 rounded-2xl border border-border bg-background/95 backdrop-blur-xl p-2 shadow-elevated"><span class="flex items-center gap-2 rounded-xl px-3 py-2 text-[13.5px] font-medium text-foreground/80 hover:bg-foreground/[0.06]"><svg width="18" height="13" viewBox="0 0 18 13" class="rounded-[3px] shadow-sm"><rect width="18" height="13" fill="#fff"/><rect width="18" height="4.33" fill="#ce1126"/><rect y="8.67" width="18" height="4.33" fill="#000"/></svg> مصر — العربية</span></div></details>
      <a class="rounded-full px-3.5 py-2 text-[14px] font-medium text-foreground/80 transition-colors hover:text-foreground" href="/login">تسجيل دخول</a>
      <a class="rounded-full bg-night px-4 py-2 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-brand hover:text-night hover:shadow-[0_0_28px_-6px_var(--color-brand)]" href="/register">ابدأ متجرك مجاناً</a>
    </div>
    <details class="lg:hidden relative" id="mnav">
      <summary class="list-none grid place-items-center w-10 h-10 rounded-full text-foreground/80 hover:bg-foreground/[0.06] cursor-pointer"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></summary>
      <div class="absolute left-0 top-12 w-56 rounded-2xl border border-border bg-background/95 backdrop-blur-xl p-2 shadow-elevated">
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground/80 hover:bg-foreground/[0.06]" href="/">الرئيسية</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground/80 hover:bg-foreground/[0.06]" href="/blog">الكورسات</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground/80 hover:bg-foreground/[0.06]" href="/pricing">الأسعار</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground/80 hover:bg-foreground/[0.06]" href="/blog">المدونة</a>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground/80 hover:bg-foreground/[0.06]" href="/themes">القوالب</a>
        <div class="my-1 border-t border-night-border"></div>
        <a class="block rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground/80 hover:bg-foreground/[0.06]" href="/login">تسجيل دخول</a>
        <a class="block rounded-xl bg-night px-4 py-2.5 text-[14px] font-semibold text-white text-center" href="/register">ابدأ متجرك مجاناً</a>
      </div>
    </details>
  </div>
</header>`;
  return mode === 'light' ? light : dark;
}
const siteFooter = `
<footer class="bg-night text-night-foreground border-t border-night-border"><div class="mx-auto max-w-6xl px-4 sm:px-8 py-14">
  <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
    <div>${logo}<p class="mt-4 text-[13.5px] leading-6 text-night-muted">منصة عربية متكاملة لإنشاء المتاجر الإلكترونية، مبنية خصيصاً لتجار الدفع عند الاستلام في مصر والوطن العربي.</p></div>
    <div><h4 class="text-[14px] font-bold mb-4">المنصة</h4><div class="flex flex-col gap-2.5 text-[13.5px] text-night-muted"><a class="hover:text-brand-bright transition-colors" href="/">الرئيسية</a><a class="hover:text-brand-bright transition-colors" href="/pricing">الأسعار</a><a class="hover:text-brand-bright transition-colors" href="/themes">القوالب</a><a class="hover:text-brand-bright transition-colors" href="/blog">الكورسات</a><a class="hover:text-brand-bright transition-colors" href="/s/noura" target="_blank">متجر تجريبي</a></div></div>
    <div><h4 class="text-[14px] font-bold mb-4">الشركة</h4><div class="flex flex-col gap-2.5 text-[13.5px] text-night-muted"><a class="hover:text-brand-bright transition-colors" href="/blog/about-us/">من نحن</a><a class="hover:text-brand-bright transition-colors" href="/blog">المدونة</a><a class="hover:text-brand-bright transition-colors" href="/blog/contact-us/">اتصل بنا</a><a class="hover:text-brand-bright transition-colors" href="/blog/contact-us/">طلب تطويرات</a></div></div>
    <div><h4 class="text-[14px] font-bold mb-4">قانوني</h4><div class="flex flex-col gap-2.5 text-[13.5px] text-night-muted"><a class="hover:text-brand-bright transition-colors" href="/blog/conditions/">سياسة الاستخدام</a><a class="hover:text-brand-bright transition-colors" href="/blog/privacy-policy/">سياسة الخصوصية</a></div></div>
  </div>
  <div class="mt-12 pt-6 border-t border-night-border flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-night-muted"><span>اكتف اوردر © 2026 — جميع الحقوق محفوظة</span><span>صُنعت في القاهرة</span></div>
</div></footer>
<a href="https://wa.me/201011206670" target="_blank" rel="noopener" aria-label="تواصل معنا واتساب" class="fixed bottom-6 right-6 z-50 grid place-items-center w-14 h-14 rounded-full bg-brand text-night shadow-[0_8px_30px_-6px_var(--color-brand)] transition-transform duration-200 hover:scale-110 animate__animated animate__fadeInUp"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.2.2-.4.4-.2.8.2.4 1 1.7 2.2 2.7 1.5 1.3 2.7 1.7 3.1 1.9.4.2.6.1.8-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.3 1.1z"/></svg></a>`;

// ---------- landing ----------
function landing() {
  const storesCount = db.prepare('SELECT COUNT(*) c FROM stores').get().c;
  return base('اكتف اوردر | أنشئ متجرك الإلكتروني في دقائق', `
${siteHeader('dark')}

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
    <div class="rounded-3xl bg-brand p-8 text-white shadow-float relative overflow-hidden" data-reveal="pop">
      <span class="inline-block rounded-full bg-night/90 px-4 py-1.5 text-[12.5px] font-bold text-white">أقل سعر (مجاني)</span>
      <h3 class="mt-5 text-[26px] font-bold">الباقة العادية</h3>
      <p class="mt-2 text-[14px] leading-6 opacity-90">جهّز متجرك بالكامل مجاناً، وادفع فقط عندما تقرر النشر.</p>
      <div class="mt-5 text-[46px] font-bold leading-none">0 <span class="text-[15px] font-semibold opacity-80">ج.م / للتجهيز</span></div>
      <div class="my-6 border-t border-white/25"></div>
      <ul class="space-y-3 text-[14px]">
        ${['عدد غير محدود من المنتجات','عدد غير محدود من الطلبات','زيارات غير محدودة','متجرك يظل محفوظاً حتى لو لم تشترك','دعم سريع على مدار الساعة'].map(x=>`<li class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-white text-brand-foreground">${IC.check}</span>${x}</li>`).join('')}
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

${siteFooter}
`);
}


// ---------- auth ----------
const inputCls = 'w-full rounded-xl border border-input bg-surface px-4 py-3 text-[14px] outline-none transition-all duration-150 focus:ring-4 focus:ring-ring/30 focus:border-brand';
// ---------- auth pages (EO layout) ----------
const logoWhite = `<a class="flex items-center gap-2 shrink-0" href="/"><span class="grid place-items-center"><svg viewBox="0 0 32 32" width="30" height="30"><rect width="32" height="32" rx="8" fill="rgba(255,255,255,.16)"/><path d="M9 20l7-11 7 11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="text-[17px] font-bold tracking-tight text-white">اكتف <b class="text-white/85">اوردر</b></span></a>`;
const egFlag = '<svg width="18" height="13" viewBox="0 0 18 13" class="rounded-[3px] shadow-sm"><rect width="18" height="13" fill="#fff"/><rect width="18" height="4.33" fill="#ce1126"/><rect y="8.67" width="18" height="4.33" fill="#000"/></svg>';
const fieldBox = 'flex items-stretch rounded-xl border border-input bg-surface overflow-hidden transition-all duration-150 focus-within:ring-4 focus-within:ring-ring/30 focus-within:border-brand';
const fieldInput = 'flex-1 min-w-0 px-4 py-3 text-[14px] outline-none bg-transparent';

function registerPage() {
  return base('إنشاء حساب | اكتف اوردر', `
${siteHeader('light')}
<div class="min-h-screen bg-background px-4 pt-32 pb-20">
  <div class="mx-auto max-w-md">
    <div class="flex justify-center"><span class="scale-125 origin-center inline-block">${logo}</span></div>
    <h1 class="mt-9 text-center text-[26px] font-bold tracking-tight">أنشئ حسابك المجاني</h1>
    <div class="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft" id="regCard" data-reveal="fade-up">
      <form id="regForm" class="space-y-4">
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">اسم موقعك</span>
          <div class="${fieldBox}" dir="ltr">
            <input class="${fieldInput}" name="slug" required placeholder="store-name" pattern="[a-z0-9][a-z0-9-]*" title="حروف إنجليزية صغيرة وأرقام وشرطات فقط" autocomplete="off">
            <span class="grid place-items-center px-3 text-[12.5px] text-muted-foreground bg-muted border-s border-input whitespace-nowrap">.active-order.store</span>
          </div>
        </label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">اختر العملة</span>
          <select class="${inputCls}" name="currency">
            <option value="EGP" selected>جنيه مصري - ج.م</option>
            <option value="SAR">ريال سعودي - ر.س</option>
            <option value="AED">درهم إماراتي - د.إ</option>
            <option value="USD">دولار أمريكي - $</option>
          </select>
        </label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">الاسم بالكامل</span><input class="${inputCls}" name="name" required placeholder="اسمك واسم العائلة"></label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">رقم الهاتف</span>
          <div class="${fieldBox}" dir="ltr">
            <span class="flex items-center gap-1.5 px-3 text-[13.5px] font-semibold bg-muted border-e border-input">${egFlag}<span dir="ltr">+20</span></span>
            <input class="${fieldInput}" name="phone" required inputmode="tel" autocomplete="tel" placeholder="1X XXX XXXX">
          </div>
        </label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">البريد الإلكتروني</span><input class="${inputCls}" name="email" type="email" required placeholder="name@company.com" dir="ltr" autocomplete="email"></label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">كلمة المرور</span><input class="${inputCls}" name="password" type="password" required minlength="8" placeholder="8 أحرف على الأقل" dir="ltr" autocomplete="new-password"></label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">تأكيد كلمة المرور</span><input class="${inputCls}" name="password2" type="password" required minlength="8" dir="ltr" autocomplete="new-password"></label>
        <div class="text-[13px] font-medium text-red-600 min-h-[18px]" id="regErr"></div>
        <button class="btn-sheen w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:bg-brand-bright" type="submit">إنشاء الحساب</button>
      </form>
      <p class="mt-5 text-center text-[13.5px] text-muted-foreground">لديك حساب بالفعل؟ <a class="font-bold text-brand-foreground hover:underline" href="/login">سجّل دخولك</a></p>
    </div>
  </div>
</div>
${siteFooter}
<script>
document.getElementById('regForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(e.target); const body = Object.fromEntries(f.entries());
  const err = document.getElementById('regErr'); err.textContent = '';
  if (body.password !== body.password2) { err.textContent = 'كلمتا المرور غير متطابقتين'; return; }
  delete body.password2;
  body.phone = '+20' + String(body.phone || '').replace(/\D/g, '').replace(/^0+/, '');
  body.storeName = body.slug;
  body.ref = new URLSearchParams(location.search).get('ref') || '';
  const r = await fetch('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error || 'حدث خطأ'; return; }
  showVerify(body.email, d.dev_code, d.email_sent);
});
function showVerify(email, devCode, emailSent) {
  document.getElementById('regCard').innerHTML = \`
  <h2 class="text-center text-[24px] font-bold tracking-tight">تحقق من بريدك</h2>
  <p class="mt-1.5 text-center text-[14px] text-muted-foreground">أرسلنا رمز تحقق من 6 أرقام إلى <b dir="ltr">\` + email + \`</b></p>
  \` + (devCode ? '<div class="mt-5 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-center"><div class="text-[12px] font-semibold text-muted-foreground">بيئة العرض — خدمة البريد غير مفعّلة بعد</div><div dir="ltr" class="mt-2 text-[30px] font-bold tracking-[10px] text-brand-foreground">' + devCode + '</div><div class="mt-1 text-[12px] text-muted-foreground">أدخل الرمز بالأسفل لإتمام إنشاء متجرك</div></div>' : '') + \`
  <form id="verifyForm" class="mt-6 space-y-4">
    <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">كود التحقق</span><input class="${inputCls}" name="code" required inputmode="numeric" maxlength="6" placeholder="______" dir="ltr" style="text-align:center;font-size:22px;letter-spacing:8px"></label>
    <div class="text-[13px] font-medium text-red-600 min-h-[18px]" id="vErr"></div>
    <button class="btn-sheen w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:bg-brand-bright" type="submit">تأكيد البريد وإنشاء المتجر</button>
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

function loginPage() {
  const feats = [
    ['<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>', 'إدارة الطلبات والشحن بضغطة واحدة'],
    ['<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>', 'صفحات هبوط احترافية ترفع مبيعاتك'],
    ['<path d="M4 20V10m6 10V4m6 16v-8M2 20h20"/>', 'تقارير وإحصائيات لحظية عن أداء متجرك'],
  ];
  return base('تسجيل الدخول | اكتف اوردر', `
<div class="min-h-screen bg-background lg:grid lg:grid-cols-2">
  <section class="relative hidden lg:flex flex-col overflow-hidden text-white p-12" style="background:linear-gradient(155deg,#0cbb4a 0%,#079a3c 38%,#056b2b 72%,#045122 100%)">
    <div class="hero-grid absolute inset-0 opacity-20"></div>
    <div class="relative">${logoWhite}</div>
    <div class="relative my-auto max-w-md">
      <h1 class="text-[32px] font-bold leading-snug">كل ما يحتاجه متجرك في مكان واحد</h1>
      <p class="mt-3 text-[15px] leading-7 text-white/85">منصة اكتف اوردر تساعدك على البيع أونلاين بسهولة واحترافية</p>
      <div class="mt-10 space-y-4">
        ${feats.map(f => `
        <div class="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-5 py-4">
          <span class="grid place-items-center w-11 h-11 rounded-xl bg-white/15 shrink-0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${f[0]}</svg></span>
          <span class="text-[15px] font-semibold">${f[1]}</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="relative flex items-center gap-1.5 text-[13.5px] text-white/85"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span dir="ltr">active-order.store</span></div>
  </section>
  <section class="flex items-center justify-center px-4 py-14 min-h-screen lg:min-h-0">
    <div class="w-full max-w-sm" id="loginCard" data-reveal="fade-up">
      <div class="mb-8 lg:hidden">${logo}</div>
      <h1 class="text-[26px] font-bold tracking-tight">مرحباً بعودتك 👋</h1>
      <p class="mt-1.5 text-[14px] text-muted-foreground">سجّل دخولك لمتابعة متجرك وطلباتك</p>
      <form id="loginForm" class="mt-8 space-y-4">
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">البريد الإلكتروني</span>
          <span class="relative block" dir="ltr">
            <input class="${inputCls} !pl-11" name="email" type="email" required placeholder="name@company.com" autocomplete="email">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></svg>
          </span>
        </label>
        <label class="block"><span class="block mb-1.5 text-[13.5px] font-semibold">كلمة المرور</span>
          <span class="relative block" dir="ltr">
            <input id="loginPw" class="${inputCls} !pl-11" name="password" type="password" required autocomplete="current-password">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <button type="button" onclick="const i=document.getElementById('loginPw');i.type=i.type==='password'?'text':'password'" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="إظهار كلمة المرور"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
          </span>
        </label>
        <a class="inline-block text-[13px] font-bold text-brand-foreground hover:underline" href="https://wa.me/201011206670" target="_blank" rel="noopener">نسيت كلمة المرور؟</a>
        <div class="text-[13px] font-medium text-red-600 min-h-[18px]" id="loginErr"></div>
        <button class="w-full rounded-xl bg-night py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:opacity-90" type="submit">تسجيل الدخول</button>
      </form>
      <div class="my-6 border-t border-border"></div>
      <p class="text-center text-[13.5px] text-foreground">ليس لديك حساب؟ <a class="font-bold text-brand-foreground hover:underline" href="/register">سجّل من هنا</a></p>
      <div class="mt-6 rounded-xl bg-muted px-4 py-3 text-center text-[12.5px] text-muted-foreground">حساب تجريبي: <code dir="ltr" class="font-semibold text-foreground">demo@activetecno.software / demo1234</code></div>
    </div>
  </section>
</div>
<script>
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target).entries());
  const err = document.getElementById('loginErr'); err.textContent = '';
  const r = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error || 'بيانات الدخول غير صحيحة'; return; }
  location.href = '/app';
});
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
</head><body class="dash"><div id="root"></div><script src="/public/js/dash-core.js"></script><script src="/public/js/dash-legacy.js"></script><script src="/public/js/dash-home.js"></script><script src="/public/js/dash-orders.js"></script><script src="/public/js/dash-products.js"></script><script src="/public/js/dash-funnels.js"></script><script src="/public/js/dash-marketing.js"></script><script src="/public/js/dash-f5.js"></script><script src="/public/js/dash-f6.js"></script><script src="/public/js/dash-builder.js"></script><script src="/public/js/dash-i18n.js"></script></body></html>`;
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
  return `--sp:${t.primary || '#141924'};--sa:${t.accent || '#27cd27'};--sbg:${t.bg || '#fff'};--ssf:${t.surface || '#F6F8FC'};--sr:${t.radius ?? 16}px;--p:${t.primary || '#141924'};--sf:${t.surface || '#F6F8FC'};--anbg:${t.announce_bg || t.accent || '#27cd27'};--ancol:${t.announce_color || '#fff'}`;
}
function pixelSnippets(store) {
  let px = {}; try { px = (JSON.parse(store.theme_settings || '{}').pixels) || {}; } catch (e) {}
  let out = '';
  if (px.meta) out += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(px.meta)});fbq('track','PageView');<\/script>`;
  if (px.tiktok) out += `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load(${JSON.stringify(px.tiktok)});ttq.page();}(window,document,'ttq');<\/script>`;
  if (px.snap) out += `<script>(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init',${JSON.stringify(px.snap)});snaptr('track','PAGE_VIEW');<\/script>`;
  if (px.ga) out += `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(px.ga)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(px.ga)});<\/script>`;
  if (out) out += `<script>function pxPurchase(value){try{if(window.fbq)fbq('track','Purchase',{value:value,currency:'EGP'});if(window.ttq)ttq.track('CompletePayment',{value:value,currency:'EGP'});if(window.snaptr)snaptr('track','PURCHASE',{price:value,currency:'EGP'});if(window.gtag)gtag('event','purchase',{value:value,currency:'EGP'});}catch(e){}}<\/script>`;
  return out;
}
function isDemo(store) {
  try { return (db.prepare("SELECT value FROM store_settings WHERE store_id = ? AND key = 'demo_mode'").get(store.id) || {}).value === '1'; } catch (e) { return false; }
}
function demoBar(store) {
  if (!isDemo(store)) return '';
  return `<div class="demo-bar">نسخة تجريبية — متجر للعرض فقط · الطلبات هنا تجريبية ولن يتم شحنها</div>`;
}
function demoFormNotice(store) {
  if (!isDemo(store)) return '';
  return `<div class="demo-notice">طلب تجريبي: سيظهر الطلب في لوحة التحكم للتجربة فقط — لن يتم توصيله أو تحصيل أي مبلغ.</div>`;
}

function storeSettingsKV(store) {
  return Object.fromEntries(db.prepare('SELECT key, value FROM store_settings WHERE store_id = ?').all(store.id).map(r => [r.key, r.value]));
}
function storeHead(store, t, title) {
  const kv = storeSettingsKV(store);
  let seo = {}; try { seo = JSON.parse(kv.seo || '{}'); } catch (_) {}
  const meta = [
    seo.desc ? `<meta name="description" content="${esc(seo.desc)}">` : '',
    seo.keywords ? `<meta name="keywords" content="${esc(seo.keywords)}">` : '',
    seo.title ? `<meta property="og:title" content="${esc(seo.title)}">` : '',
  ].join('');
  const headCode = kv.head_code && !isDemo(store) ? kv.head_code : '';
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(seo.title || title)}</title>
${meta}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Rubik:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/public/css/store.css">
<style>:root{${themeVars(t)}}</style>${isDemo(store) ? '' : pixelSnippets(store)}${headCode}`;
}
function socialLinks(store) {
  let s = {}; try { s = JSON.parse(storeSettingsKV(store).social || '{}'); } catch (_) {}
  const links = [
    ['facebook', 'فيسبوك'], ['instagram', 'انستجرام'], ['tiktok', 'تيك توك'],
  ].filter(([k]) => s[k]).map(([k, label]) => `<a href="${esc(s[k])}" target="_blank" rel="noopener">${label}</a>`);
  if (store.whatsapp) links.push(`<a href="https://wa.me/${esc(store.whatsapp)}" target="_blank" rel="noopener">واتساب</a>`);
  if (!links.length) return '';
  return `<p class="s-social">${links.join(' · ')} · <a href="/s/${esc(store.slug)}/policies">السياسات</a></p>`;
}

function eoLayout(store, t) { const id = (t && t.__id) || store.theme_id || ''; return id.startsWith('eo-') ? id.slice(3) : null; }
IC.search = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
IC.heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.4 3 5 6.2 5c2 0 3.4 1.1 4.2 2.3h3.2C14.4 6.1 15.8 5 17.8 5c3.2 0 5 3.4 3.4 6.4C19 15.6 12 20 12 20z"/></svg>';
IC.menu = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
function storeHeader(store, t, cats = []) {
  const lay = eoLayout(store, t);
  if (!lay) {
    return `${store.announcement && !t.hide_announcement ? `<div class="s-announce">${esc(store.announcement)}</div>` : ''}
<header class="s-header ${t.header === 'split' ? 'split' : ''}">
  <a class="s-brand" href="/s/${esc(store.slug)}"><span class="s-logo">${esc((store.logo_text || store.name).trim().charAt(0))}</span><span>${esc(store.name)}</span></a>
  <button class="s-cart-btn" onclick="toggleCart(true)" aria-label="السلة">${IC.cart}<span class="s-cart-count" id="cartCount">0</span></button>
</header>`;
  }
  const brand = `<a class="s-brand" href="/s/${esc(store.slug)}"><span class="s-logo">${esc((store.logo_text || store.name).trim().charAt(0))}</span><span class="s-brand-name">${esc(store.name)}</span></a>`;
  const cartBtn = `<button class="s-cart-btn" onclick="toggleCart(true)" aria-label="السلة">${IC.cart}<span class="s-cart-count" id="cartCount">0</span></button>`;
  const ctaBtn = t.header_cta_text ? `<a class="s-btn s-header-cta" href="${esc(t.header_cta_link || '#products')}">${esc(t.header_cta_text)}</a>` : '';
  const searchBtn = `<button class="s-icon-btn" aria-label="بحث" onclick="document.getElementById('products')?.scrollIntoView({behavior:'smooth'})">${IC.search}</button>`;
  const navLinks = [...cats.slice(0, 4).map(c => ({ label: c, href: `/s/${esc(store.slug)}/cat/${encodeURIComponent(c)}` })),
    { label: 'سياسة الاستبدال والاسترجاع', href: `/s/${esc(store.slug)}/policies` },
    { label: 'سياسة الشحن', href: `/s/${esc(store.slug)}/policies` }];
  const linksHtml = navLinks.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
  const announce = `<div class="s-announce">${esc(store.announcement || 'شحن سريع لكل المحافظات والدفع عند الاستلام')}</div>`;
  if (lay === 'sphinx') {
    return `${store.announcement && !t.hide_announcement ? announce : ''}
<header class="s-header eo sphinx">
  <div class="sh-row">${brand}<div class="sh-search">${IC.search}<input id="hSearch" placeholder="ابحث عن منتج..."></div>${cartBtn}</div>
  <nav class="sh-links">${linksHtml}</nav>
</header>`;
  }
  if (lay === 'fasty') {
    return `${announce}
<header class="s-header eo fasty">
  <div class="fh-side fh-right"><button class="s-icon-btn" onclick="document.querySelector('.fh-links').classList.toggle('open')">${IC.menu}<span>القائمة</span></button><button class="s-icon-btn" aria-label="المفضلة">${IC.heart}</button>${searchBtn}</div>
  ${brand}
  <div class="fh-side fh-left">${cartBtn}<span class="fh-total" id="cartTotalHead"></span></div>
  <nav class="fh-links">${linksHtml}</nav>
</header>`;
  }
  if (lay === 'blast' || lay === 'clear') {
    return `${store.announcement && !t.hide_announcement ? announce : ''}
<header class="s-header eo hcenter ${lay}">
  <nav class="hc-links">${linksHtml}</nav>${brand}<div class="hc-icons">${searchBtn}${cartBtn}</div>
</header>`;
  }
  if (lay === 'elegance' || lay === 'shine') {
    return `${store.announcement && !t.hide_announcement ? announce : ''}
<header class="s-header eo hsplit ${lay}">
  <div class="hs-top">${brand}<div class="hs-icons">${searchBtn}${cartBtn}</div></div>
  <nav class="hs-links">${linksHtml}</nav>
</header>`;
  }
  if (lay === 'vantage-el' || lay === 'vantage-cos') {
    return `${store.announcement && !t.hide_announcement ? announce : ''}
<header class="s-header eo hcontact ${lay}">
  <div class="hk-row"><span class="hk-phone">${store.phone ? `عندك استفسار؟ ${esc(store.phone)}` : ''}</span>${brand}<div class="hk-icons">${searchBtn}${cartBtn}<span class="fh-total" id="cartTotalHead"></span></div></div>
</header>`;
  }
  if (lay === 'phoenix') {
    return `${store.announcement && !t.hide_announcement ? announce : ''}
<header class="s-header eo sphinx phoenix">
  <div class="sh-row">${brand}<div class="sh-search">${IC.search}<input id="hSearch" placeholder="ابحث عن منتج..."></div>${cartBtn}</div>
  <nav class="sh-links">${linksHtml}</nav>
</header>`;
  }
  if (lay === 'luxify') {
    return `<header class="s-header eo luxify">
  <div class="lx-row">${brand}<nav class="lx-links">${linksHtml}</nav><div class="lx-icons"><button class="s-icon-btn" aria-label="المفضلة">${IC.heart}</button>${searchBtn}${cartBtn}</div></div>
</header>
${announce}`;
  }
  return `${announce}
<header class="s-header eo ${lay}">
  <div class="dh-row">${brand}<nav class="dh-links">${linksHtml}</nav><div class="dh-icons">${ctaBtn}${searchBtn}${cartBtn}</div></div>
</header>`;
}
function eoHero(store, products) {
  const slides = [`<div class="h-slide grad-a on"><div class="h-slide-in"><h2>${esc(store.name)}</h2><p>${esc(store.description || 'تسوق أحدث المنتجات بأفضل الأسعار')}</p><a class="s-btn" href="#products">تسوق الآن</a></div></div>`];
  const disc = products.filter(p => p.compare_at_price && p.compare_at_price > p.price)
    .sort((a, b) => (1 - b.price / b.compare_at_price) - (1 - a.price / a.compare_at_price))[0];
  if (disc) {
    const pct = Math.round(100 - disc.price * 100 / disc.compare_at_price);
    slides.push(`<div class="h-slide grad-b"><div class="h-slide-in"><h2>خصم حتى ${pct}%</h2><p>${esc(disc.name)}</p><a class="s-btn" href="/s/${esc(store.slug)}/p/${disc.id}">اطلبه الآن</a></div></div>`);
  }
  if (store.free_shipping_over > 0) slides.push(`<div class="h-slide grad-c"><div class="h-slide-in"><h2>شحن مجاني</h2><p>للطلبات فوق ${egp(store.free_shipping_over)}</p><a class="s-btn" href="#products">ابدأ التسوق</a></div></div>`);
  return `<section class="h-slider" id="hSlider">${slides.join('')}${slides.length > 1 ? `<div class="h-dots">${slides.map((_, i) => `<button class="h-dot${i ? '' : ' on'}" data-i="${i}" aria-label="شريحة ${i + 1}"></button>`).join('')}</div>` : ''}</section>`;
}
const storeScripts = store => `<script>window.STORE_SLUG=${JSON.stringify(store.slug)};</script><script src="/public/js/store.js"></script>`;

function productCardHTML(store, lay, p, t) {
  t = t || {};
  const imgs = JSON.parse(p.images || '[]');
  const off = p.compare_at_price && p.compare_at_price > p.price ? Math.round(100 - p.price * 100 / p.compare_at_price) : 0;
  const badgeStyle = (t.sale_badge_bg_color || t.sale_badge_text_color) ? ` style="background:${esc(t.sale_badge_bg_color || '')};color:${esc(t.sale_badge_text_color || '')}"` : '';
  const badge = off && t.show_sale_badge === false ? ''
    : off ? (t.custom_badge_title ? `<span class="p-off"${badgeStyle}>${esc(t.custom_badge_title)}</span>`
    : (lay === 'fasty' || lay === 'luxify' ? `<span class="p-off"${badgeStyle}>تخفيضات</span>` : `<span class="p-off"${badgeStyle}>-${off}%</span>`)) : '';
  const cardBg = t.card_background_product ? ` style="background:${esc(t.card_background_product)};color:${esc(t.card_background_product_color || 'inherit')}"` : '';
  return `<a class="p-card pc-${esc(t.card || 'flat')}" data-cat="${esc(p.category)}" data-name="${esc(p.name)}" href="/s/${esc(store.slug)}/p/${p.id}"${cardBg}>
    ${badge}
    ${p.stock <= 0 ? `<span class="p-out">نفدت الكمية</span>` : ''}
    <div class="p-img"><img src="${esc(imgs[0] || ph(p.name))}" alt="${esc(p.name)}" loading="lazy"></div>
    <div class="p-info"><h3>${esc(p.name)}</h3>
    <div class="p-price"><b>${egp(p.price)}</b>${p.compare_at_price ? `<s>${egp(p.compare_at_price)}</s>` : ''}</div></div>
    ${lay === 'fasty' ? `<div class="p-actions"><span class="p-heart">${IC.heart}</span><span class="p-add">أضف إلى السلة ${IC.cart}</span></div>` : ''}
  </a>`;
}
function categoryPage(store, cat, t, owner, sort) {
  const lay = eoLayout(store);
  const order = sort === 'price_asc' ? 'price ASC' : sort === 'price_desc' ? 'price DESC' : 'created_at DESC';
  const products = db.prepare(`SELECT id, name, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' AND category = ? AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0 ORDER BY ${order}`).all(store.id, cat);
  const allCats = [...new Set(db.prepare(`SELECT category FROM products WHERE store_id = ? AND status = 'active' AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0`).all(store.id).map(r => r.category).filter(Boolean))];
  const sortSel = `<select class="cat-sort" onchange="location.href='/s/${esc(store.slug)}/cat/${encodeURIComponent(cat)}'+(this.value?'?sort='+this.value:'')">
    <option value="" ${!sort ? 'selected' : ''}>الأحدث</option>
    <option value="price_asc" ${sort === 'price_asc' ? 'selected' : ''}>السعر: من الأقل</option>
    <option value="price_desc" ${sort === 'price_desc' ? 'selected' : ''}>السعر: من الأعلى</option></select>`;
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `${cat} | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}
${owner ? `<div class="s-ownerbar">وضع المعاينة — <a href="/app">العودة للوحة التحكم</a></div>` : ''}
${storeHeader(store, t, allCats)}
<main class="cat-page">
<div class="cat-head"><h1>${esc(cat)}</h1>${sortSel}</div>
${products.length ? `<div class="s-grid">${products.map(p => productCardHTML(store, lay, p, t)).join('')}</div>` : `<div class="s-empty">لا توجد منتجات في هذا القسم حالياً — <a href="/s/${esc(store.slug)}">تصفح كل المنتجات</a></div>`}
</main>
<footer class="s-footer">${socialLinks(store)}<p>يعمل بواسطة <a href="/">اكتف اوردر</a> — الدفع عند الاستلام متاح</p></footer>
${cartDrawer(store)}
${storeScripts(store)}
</body></html>`;
}

// ---------- H2: sections engine (home builder) ----------
const SECTION_DEFAULTS = {
  hero: { title: '', subtitle: '', cta_text: 'تسوّق الآن', cta_link: '#products', img: '' },
  slider: { slides: [] },
  categories: { title: '' },
  product_grid: { title: '', limit: 24, sort: 'newest' },
  product_list: { title: 'احدث المنتجات', limit: 10 },
  featured_products: { title: 'الأكثر مبيعاً', limit: 8 },
  promo_banner: { text: '', bg: '#27cd27', color: '#ffffff', link: '' },
  image: { img: '', link: '', alt: '' },
  heading: { title: '', subtitle: '' },
  rich_text: { html: '' },
  html_code: { html: '' },
  faq: { title: 'الأسئلة الشائعة', items: [] },
  features: { title: '', items: [] },
  newsletter: { title: 'اشترك في نشرتنا البريدية', desc: 'عروض ومنتجات جديدة على بريدك أولاً بأول' },
  reviews: { title: 'آراء العملاء', limit: 6 },
  blog: { title: 'من المدونة', limit: 3 },
  marquee: { items: ['شحن سريع لكل المحافظات', 'الدفع عند الاستلام', 'إرجاع سهل خلال 14 يوم'], speed: 22, bg: '#141924', color: '#ffffff' },
};
const SECTION_NAMES = { hero: 'سلايدر', slider: 'سلايدر صور', categories: 'الفئات', product_grid: 'شبكة المنتجات', product_list: 'قائمة المنتجات', featured_products: 'المنتجات المميزة', promo_banner: 'لافتة ترويجية', image: 'صورة', heading: 'عنوان رئيسي وفرعي', rich_text: 'نص متقدم', html_code: 'كود HTML', faq: 'الأسئلة الشائعة', features: 'مميزات المتجر', newsletter: 'النشرة البريدية', reviews: 'التقييمات', blog: 'المدونة', marquee: 'شريط متحرك' };
function seedHomeSections(store) {
  const rows = [
    ['below_header', 'hero', { title: store.name, subtitle: store.description }],
    ['content', 'categories', {}],
    ['content', 'product_grid', { limit: 24 }],
    ['above_footer', 'newsletter', {}],
  ];
  rows.forEach(([zone, type, stg], i) => {
    db.prepare('INSERT INTO store_sections (store_id, page, zone, position, type, settings) VALUES (?, ?, ?, ?, ?, ?)')
      .run(store.id, 'home', zone, i + 1, type, JSON.stringify({ ...(SECTION_DEFAULTS[type] || {}), ...stg }));
  });
}
function getSections(store, page) {
  let rows = db.prepare('SELECT * FROM store_sections WHERE store_id = ? AND page = ? ORDER BY position, id').all(store.id, page);
  if (!rows.length && page === 'home') { seedHomeSections(store); rows = db.prepare('SELECT * FROM store_sections WHERE store_id = ? AND page = ? ORDER BY position, id').all(store.id, page); }
  return rows;
}
function sectionSettings(s) { try { return { ...(SECTION_DEFAULTS[s.type] || {}), ...JSON.parse(s.settings || '{}') }; } catch (e) { return { ...(SECTION_DEFAULTS[s.type] || {}) }; } }
function renderSection(store, s, ctx) {
  const st = sectionSettings(s);
  const { products, cats, lay, t } = ctx;
  const escAttr = esc;
  switch (s.type) {
    case 'hero': {
      const hv = t.hero || 'classic';
      const title = esc(st.title || store.name), sub = esc(st.subtitle || '');
      const cta = st.cta_text ? `<a class="s-btn" href="${escAttr(st.cta_link || '#products')}">${esc(st.cta_text)}</a>` : '';
      const bg = st.img ? ` style="background-image:url('${escAttr(st.img)}');background-size:cover;background-position:center"` : '';
      if (hv === 'none') return '';
      if (hv === 'minimal') { const bgm = st.img ? bg : (themeHeroImg(lay) ? ` style="background-image:linear-gradient(to top, color-mix(in srgb, var(--sp) 58%, transparent), color-mix(in srgb, var(--sp) 10%, transparent)), url('${themeHeroImg(lay)}');background-size:cover;background-position:center"` : bg); return `<section class="s-hero hv-minimal"${bgm}><div class="hv-m-in"><h1>${title}</h1><p>${sub}</p><div class="s-hero-cta">${cta}</div></div></section>`; }
      if (hv === 'split') {
        const img0 = st.img || themeHeroImg(lay) || (products[0] ? (JSON.parse(products[0].images || '[]')[0] || '') : '');
        return `<section class="s-hero hv-split"><div class="hv-s-text"><h1>${title}</h1><p>${sub}</p><div class="s-hero-cta">${cta}</div></div>${img0 ? `<div class="hv-s-img"><img src="${escAttr(img0)}" alt="" loading="lazy"></div>` : ''}</section>`;
      }

      if (hv === 'banner') { const bgh = st.img ? bg : (themeHeroImg(lay) ? ` style="background-image:linear-gradient(to top, color-mix(in srgb, var(--sp) 72%, transparent), color-mix(in srgb, var(--sp) 22%, transparent)), url('${themeHeroImg(lay)}');background-size:cover;background-position:center"` : bg); return `<section class="s-hero hv-banner"${bgh}><div class="hv-b-in"><span class="hv-b-kicker">${esc(store.name)}</span><h1>${title}</h1><p>${sub}</p><div class="s-hero-cta">${cta}</div></div></section>`; }
      if (hv === 'photo') {
        const him = st.img || themeHeroImg(lay);
        const style = him ? ` style="background-image:linear-gradient(to top, color-mix(in srgb, var(--sp) 62%, transparent), color-mix(in srgb, var(--sp) 12%, transparent)), url('${escAttr(him)}');background-size:cover;background-position:center"` : ` style="background:linear-gradient(135deg, var(--sp) 0%, color-mix(in srgb, var(--sa) 70%, var(--sp)) 100%)"`;
        return `<section class="s-hero hv-photo hv-photo--${escAttr(lay || 'default')}"${style}><div class="hv-p-in"><h1>${title}</h1><p>${sub}</p><div class="s-hero-cta">${cta}</div></div></section>`;
      }
      if (hv === 'promo') {
        const disc = products.filter(p => p.compare_at_price && p.compare_at_price > p.price).sort((a, b) => (1 - b.price / b.compare_at_price) - (1 - a.price / a.compare_at_price))[0];
        const pct = disc ? Math.round(100 - disc.price * 100 / disc.compare_at_price) : 0;
        const pim = disc ? (JSON.parse(disc.images || '[]')[0] || '') : '';
        return `<section class="s-hero hv-promo"><div class="hv-pr-text"><span class="hv-pr-big">${pct ? `خصم حتى ${pct}%` : title}</span><p>${sub}</p><div class="s-hero-cta">${disc ? `<a class="s-btn" href="/s/${escAttr(store.slug)}/p/${disc.id}">${esc(st.cta_text || 'تسوق الآن')}</a>` : cta}</div></div>${pim ? `<div class="hv-pr-img"><img src="${escAttr(pim)}" alt="" loading="lazy"></div>` : ''}</section>`;
      }
      if (hv === 'grid') {
        const tiles = (cats || []).slice(0, 4).map(c => { const p = products.find(x => x.category === c); const im = p ? JSON.parse(p.images || '[]')[0] : ''; return `<a class="hv-g-t" href="/s/${escAttr(store.slug)}/cat/${encodeURIComponent(c)}">${im ? `<img src="${escAttr(im)}" alt="" loading="lazy">` : ''}<span>${esc(c)}</span></a>`; }).join('');
        return `<section class="s-hero hv-grid"><div class="hv-g-head"><h1>${title}</h1><p>${sub}</p><div class="s-hero-cta">${cta}</div></div>${tiles ? `<div class="hv-g-tiles">${tiles}</div>` : ''}</section>`;
      }
      return `<section class="s-hero"${bg}><h1>${title}</h1><p>${sub}</p>
<div class="s-hero-cta">${cta}
${store.whatsapp ? `<a class="s-btn ghost" href="https://wa.me/${escAttr(store.whatsapp)}" target="_blank" rel="noopener">تواصل واتساب</a>` : ''}</div></section>`;
    }
    case 'slider': {
      const slides = (st.slides || []).filter(x => x.img);
      if (!slides.length) return '';
      return `<div class="s-slider">${slides.map((x, i) => `<a class="s-slide${i ? ' hidden' : ''}" href="${escAttr(x.link || '#')}" style="background-image:url('${escAttr(x.img)}')">${x.title ? `<span class="s-slide-cap"><b>${esc(x.title)}</b>${x.subtitle ? `<i>${esc(x.subtitle)}</i>` : ''}</span>` : ''}</a>`).join('')}${slides.length > 1 ? `<div class="s-slide-dots">${slides.map((x, i) => `<button data-slide="${i}" class="${i ? '' : 'on'}"></button>`).join('')}</div>` : ''}</div>`;
    }
    case 'categories': {
      if (!cats.length) return '';
      const cvariant = st.variant || t.cats_style || 'pills';
      if (cvariant === 'none') return '';
      if (cvariant === 'circles' || cvariant === 'cards' || cvariant === 'icons') {
        const cell = (c) => { const p = products.find(x => x.category === c); const im = p ? JSON.parse(p.images || '[]')[0] : ''; return `<a class="cat-cell" href="/s/${escAttr(store.slug)}/cat/${encodeURIComponent(c)}">${cvariant !== 'icons' ? `<span class="cat-thumb">${im ? `<img src="${escAttr(im)}" alt="" loading="lazy">` : `<i>${esc(c.trim().charAt(0))}</i>`}</span>` : `<span class="cat-ico">${IC.menu}</span>`}<b>${esc(c)}</b></a>`; };
        return `${st.title ? `<h2 class="s-sec-t">${esc(st.title)}</h2>` : ''}<nav class="s-cats v-${esc(cvariant)}" id="products"><a class="cat-cell" href="/s/${escAttr(store.slug)}">${cvariant !== 'icons' ? `<span class="cat-thumb"><i>ك</i></span>` : `<span class="cat-ico">${IC.menu}</span>`}<b>الكل</b></a>${cats.map(cell).join('')}</nav>`;
      }
      return `${st.title ? `<h2 class="s-sec-t">${esc(st.title)}</h2>` : ''}<nav class="s-cats v-pills" id="products">${['الكل', ...cats].map(c => `<button class="s-cat" data-cat="${escAttr(c)}">${esc(c)}</button>`).join('')}</nav>`;
    }
    case 'product_grid': {
      let list = products; if (st.sort === 'price_asc') list = [...products].sort((a, b) => a.price - b.price); if (st.sort === 'price_desc') list = [...products].sort((a, b) => b.price - a.price);
      list = list.slice(0, st.limit || 24);
      return `${st.title ? `<h2 class="s-sec-t">${esc(st.title)}</h2>` : ''}<main class="s-grid">${list.map(p => productCardHTML(store, lay, p, ctx.t)).join('') || `<div class="s-empty">لا توجد منتجات بعد</div>`}</main>`;
    }
    case 'product_list': {
      const list = products.slice(0, st.limit || 10);
      return `<section class="s-plist">${st.title ? `<div class="s-plist-h"><h2>${esc(st.title)}</h2><a href="#products">عرض الكل</a></div>` : ''}<div class="s-plist-row">${list.map(p => productCardHTML(store, lay, p, ctx.t)).join('')}</div></section>`;
    }
    case 'featured_products': {
      const list = products.filter(p => p.compare_at_price && p.compare_at_price > p.price).slice(0, st.limit || 8);
      if (!list.length) return '';
      return `<section class="s-plist"><div class="s-plist-h"><h2>${esc(st.title || 'الأكثر مبيعاً')}</h2></div><div class="s-plist-row">${list.map(p => productCardHTML(store, lay, p, ctx.t)).join('')}</div></section>`;
    }
    case 'promo_banner': return st.text ? `<a class="s-promo" href="${escAttr(st.link || '#')}" style="background:${escAttr(st.bg)};color:${escAttr(st.color)}">${esc(st.text)}</a>` : '';
    case 'image': return st.img ? `<a class="s-image" href="${escAttr(st.link || '#')}"><img src="${escAttr(st.img)}" alt="${escAttr(st.alt || '')}" loading="lazy"></a>` : '';
    case 'heading': return `<header class="s-heading"><h2>${esc(st.title || '')}</h2>${st.subtitle ? `<p>${esc(st.subtitle)}</p>` : ''}</header>`;
    case 'rich_text': return `<div class="s-richtext">${st.html || ''}</div>`;
    case 'html_code': return st.html || '';
    case 'faq': return `${st.title ? `<h2 class="s-sec-t">${esc(st.title)}</h2>` : ''}<div class="s-faq v-${esc(st.variant || 'simple')}">${(st.items || []).map(x => `<details><summary>${esc(x.q || '')}</summary><p>${esc(x.a || '')}</p></details>`).join('')}</div>`;
    case 'features': return `${st.title ? `<h2 class="s-sec-t">${esc(st.title)}</h2>` : ''}<div class="s-features v-${esc(st.variant || 'cards')}">${(st.items || []).map(x => `<div class="s-feat"><b>${esc(x.title || '')}</b><p>${esc(x.text || '')}</p></div>`).join('')}</div>`;
    case 'newsletter': return `<section class="s-newsletter"><h3>${esc(st.title)}</h3><p>${esc(st.desc || '')}</p><form id="nlForm"><input type="email" id="nlEmail" placeholder="بريدك الإلكتروني" required dir="ltr"><button class="s-btn" type="submit">اشترك</button></form><div id="nlMsg"></div></section>`;
    case 'reviews': {
      const revs = db.prepare("SELECT customer_name, rating, text FROM reviews WHERE store_id = ? AND status = 'published' ORDER BY created_at DESC LIMIT ?").all(store.id, st.limit || 6);
      if (!revs.length) return '';
      return `<section class="s-revs v-${esc(st.variant || 'cards')}"><h2 class="s-sec-t">${esc(st.title)}</h2><div class="s-revs-row">${revs.map(r => `<div class="s-rev"><div class="s-rev-stars">${'★'.repeat(r.rating || 5)}</div><p>${esc(r.text || '')}</p><b>${esc(r.customer_name || '')}</b></div>`).join('')}</div></section>`;
    }
    case 'blog': {
      let posts = []; try { posts = db.prepare("SELECT title, slug, substr(body,1,120) excerpt FROM blog_posts WHERE store_id = ? AND status = 'published' ORDER BY created_at DESC LIMIT ?").all(store.id, st.limit || 3); } catch (e) {}
      if (!posts.length) return '';
      return `<section class="s-blog v-${esc(st.variant || 'grid')}"><h2 class="s-sec-t">${esc(st.title)}</h2><div class="s-blog-row">${posts.map(p2 => `<a class="s-blog-card" href="/s/${escAttr(store.slug)}/blog/${escAttr(p2.slug)}"><b>${esc(p2.title)}</b>${p2.excerpt ? `<p>${esc(p2.excerpt)}</p>` : ''}</a>`).join('')}</div></section>`;
    }
    case 'marquee': {
      const items = (st.items || []).filter(Boolean);
      if (!items.length) return '';
      const strip = items.map(x => `<span class="s-mq-i">${esc(x)}</span>`).join('<span class="s-mq-dot"></span>');
      return `<div class="s-mq" style="background:${escAttr(st.bg)};color:${escAttr(st.color)}"><div class="s-mq-t" style="animation-duration:${Math.max(8, +st.speed || 22)}s">${strip}<span class="s-mq-dot"></span>${strip}<span class="s-mq-dot"></span></div></div>`;
    }
    default: return '';
  }
}
function renderZone(store, page, zone, ctx) {
  return getSections(store, page).filter(s => s.zone === zone && s.enabled).map(s => renderSection(store, s, ctx)).join('');
}

function storefront(store, t, owner) {
  const lay = eoLayout(store, t);
  const products = db.prepare(`SELECT id, name, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0 ORDER BY created_at DESC`).all(store.id);
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  const cards = products.map(p => productCardHTML(store, lay, p, t)).join('');
  const hero = lay ? eoHero(store, products)
    : `<section class="s-hero"><h1>${esc(store.name)}</h1><p>${esc(store.description)}</p>
<div class="s-hero-cta"><a class="s-btn" href="#products">تسوّق الآن</a>
${store.whatsapp ? `<a class="s-btn ghost" href="https://wa.me/${esc(store.whatsapp)}" target="_blank" rel="noopener">تواصل واتساب</a>` : ''}</div></section>`;
  const ctx = { products, cats, lay, t };
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, store.name)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}
${owner ? `<div class="s-ownerbar">وضع المعاينة — <a href="/app">العودة للوحة التحكم</a></div>` : ''}
${renderZone(store, 'home', 'above_header', ctx)}
${storeHeader(store, t, cats)}
${renderZone(store, 'home', 'below_header', ctx)}
${renderZone(store, 'home', 'content', ctx)}
${store.free_shipping_over ? `<div class="s-freeship">${IC.truck}شحن مجاني للطلبات فوق ${egp(store.free_shipping_over)}</div>` : ''}
${renderZone(store, 'home', 'above_footer', ctx)}
<footer class="s-footer">${socialLinks(store)}${t.footer_text ? `<p>${esc(t.footer_text)}</p>` : ''}${t.trust_line ? `<p class="s-trust">${esc(t.trust_line)}</p>` : ''}<p>يعمل بواسطة <a href="/">اكتف اوردر</a> — الدفع عند الاستلام متاح</p></footer>
${renderZone(store, 'home', 'below_footer', ctx)}
${cartDrawer(store)}
${storeScripts(store)}
<script>track('page_view');</script>
</body></html>`;
}

function productPage(store, p, t, owner) {
  const imgs = JSON.parse(p.images || '[]');
  const S = {}; try { Object.assign(S, JSON.parse(p.settings || '{}')); } catch (e) {}
  const cur = String(p.currency || '').trim();
  const money = v => cur ? `${(+v).toLocaleString('ar-EG')} ${esc(cur)}` : egp(v);
  const upsell = p.upsell_product_id ? db.prepare(`SELECT id, name, price, images FROM products WHERE id = ? AND status = 'active' AND stock > 0`).get(p.upsell_product_id) : null;
  const off = p.compare_at_price && p.compare_at_price > p.price ? Math.round(100 - p.price * 100 / p.compare_at_price) : 0;
  const out = !!(p.stock_tracking && p.stock <= 0);
  const buyText = (S.buy_button_text || '').trim() || 'اضغط هنا للشراء';
  const fvMin = Math.max(1, +S.fake_visitors_min || 20), fvMax = Math.max(fvMin, +S.fake_visitors_max || 70);
  const jsName = esc(p.name).replace(/'/g, '');
  const similar = S.hide_similar ? [] : db.prepare(`SELECT id, name, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' AND id != ? AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0 ORDER BY CASE WHEN category = ? THEN 0 ELSE 1 END, priority ASC, created_at DESC LIMIT 8`).all(store.id, p.id, p.category || '');
  const reviews = S.reviews_enabled ? db.prepare(`SELECT customer_name, rating, text, created_at FROM reviews WHERE product_id = ? AND status = 'published' ORDER BY id DESC LIMIT 20`).all(p.id) : [];
  const lay = eoLayout(store, t);
  const ctxProds = db.prepare(`SELECT id, name, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0 ORDER BY created_at DESC`).all(store.id);
  const ctx = { products: ctxProds, cats: [...new Set(ctxProds.map(x => x.category).filter(Boolean))], lay, t };
  const qtyCtl = out || S.hide_qty_counter ? '' : `<div class="pd-qty"><button type="button" onclick="pdQty(-1)">−</button><span id="pdQty">1</span><button type="button" onclick="pdQty(1)">+</button></div>`;
  const qtyVal = `+(document.getElementById('pdQty')?.textContent || 1)`;
  const orderFormHtml = out ? '' : `
<section class="pd-order" id="pdOrder">
  <h2>اطلب الآن — الدفع عند الاستلام</h2>
  <form id="pdForm" class="co-form">
    <label>الاسم بالكامل<input name="name" required placeholder="مثال: مريم أحمد"></label>
    <label>رقم الموبايل<input name="phone" required inputmode="tel" dir="ltr" placeholder="01xxxxxxxxx" pattern="01[0125][0-9]{8}"></label>
    <label>المحافظة<select name="governorate" required>${GOVS.map(g => `<option>${g}</option>`).join('')}</select></label>
    <label>العنوان بالتفصيل<textarea name="address" required placeholder="الشارع، رقم العمارة، الدور، الشقة، علامة مميزة"></textarea></label>
    <label>ملاحظات (اختياري)<input name="notes" placeholder="أي تفاصيل إضافية"></label>
    <div class="auth-err" id="pdErr"></div>
    ${demoFormNotice(store)}
    <button type="submit" class="s-btn btn-lg full buy" id="pdSubmit">${esc(buyText)} — ${money(p.price)}</button>
    <div class="co-trust"><span>${IC.lock}بياناتك آمنة ومشفّرة</span><span>${IC.truck}توصيل سريع</span><span>${IC.ret}إرجاع سهل</span></div>
  </form>
</section>`;
  const buyButtons = out ? `<div class="pd-low out">نفدت الكمية مؤقتاً</div>`
    : S.buy_same_page ? `${qtyCtl}<button class="s-btn btn-lg full buy" onclick="document.getElementById('pdOrder').scrollIntoView({behavior:'smooth'})">${IC.cart} ${esc(buyText)}</button>`
    : S.skip_cart ? `${qtyCtl}<button class="s-btn btn-lg full buy" onclick="buyNow(${p.id}, '${jsName}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, ${qtyVal})">${IC.cart} ${esc(buyText)}</button>`
    : `${qtyCtl}
<button class="s-btn btn-lg full" onclick="addToCart(${p.id}, '${jsName}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, ${qtyVal})">${IC.cart} أضف إلى السلة</button>
<button class="s-btn btn-lg full buy" onclick="buyNow(${p.id}, '${jsName}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, ${qtyVal})">${esc(buyText)} — دفع عند الاستلام</button>`;
  const descBlock = `<div class="pd-desc">${p.description && p.description.trim().startsWith('<') ? p.description : esc(p.description)}</div>`;
  const widgets = [];
  if (S.fake_visitors) widgets.push(`<div class="pd-live">${IC.eye}<b id="pdLiveN">${fvMin}</b> شخص يشاهدون هذا المنتج الآن</div>`);
  if (S.fake_countdown) widgets.push(`<div class="pd-cd">${IC.flame}ينتهي العرض خلال <b id="pdCd">--:--:--</b></div>`);
  const stockLine = out ? ''
    : S.fake_stock && S.fake_stock_count > 0 ? `<div class="pd-low">${IC.flame}باقي ${S.fake_stock_count} قطعة فقط — اطلب الآن</div>`
    : p.stock_tracking && p.stock > 0 && p.stock <= (p.low_stock_threshold || 3) ? `<div class="pd-low">${IC.flame}باقي ${p.stock} فقط — اطلب الآن</div>` : '';
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `${p.name} | ${store.name}`)}${cur ? '' : ''}${p.custom_pixel && p.custom_pixel.trim() ? p.custom_pixel : ''}</head>
<body class="store pd-adv ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}
${owner ? `<div class="s-ownerbar">وضع المعاينة — <a href="/app">العودة للوحة التحكم</a></div>` : ''}
${renderZone(store, 'product', 'above_header', ctx)}
${S.hide_header ? '' : storeHeader(store, t)}
${renderZone(store, 'product', 'below_header', ctx)}
<main class="pd">
<div class="pd-gallery"><img id="pdImg" src="${esc(imgs[0] || ph(p.name))}" alt="${esc(p.name)}">
${imgs.length > 1 ? `<div class="pd-thumbs">${imgs.map((im, i) => `<img src="${esc(im)}" onclick="document.getElementById('pdImg').src=this.src" class="${i === 0 ? 'on' : ''}">`).join('')}</div>` : ''}</div>
<div class="pd-info">
${p.category ? `<span class="pd-cat">${esc(p.category)}</span>` : ''}
<h1>${esc(p.name)}</h1>
<div class="pd-price"><b>${money(p.price)}</b>${p.compare_at_price ? `<s>${money(p.compare_at_price)}</s>` : ''}${off ? `<span class="p-off">وفّر ${off}%</span>` : ''}</div>
${S.free_shipping ? `<div class="s-freeship pd-free">${IC.truck}شحن مجاني لهذا المنتج</div>` : ''}
${widgets.join('\n')}
${stockLine}
${S.form_before_desc && S.buy_same_page ? orderFormHtml + descBlock : descBlock}
${buyButtons}
${upsell ? `<div class="pd-upsell"><h4>${IC.bulb}يُشترى معه غالباً</h4>
<div class="pd-upsell-card"><img src="${esc(JSON.parse(upsell.images || '[]')[0] || '')}"><div><b>${esc(upsell.name)}</b><span>${egp(upsell.price)}</span></div>
<button onclick="addToCart(${upsell.id}, '${esc(upsell.name).replace(/'/g, '')}', ${upsell.price}, ${JSON.stringify(JSON.parse(upsell.images || '[]')[0] || '')}, 1)">أضف</button></div></div>` : ''}
</div></main>
${S.buy_same_page && !S.form_before_desc ? `<div class="pd-order-wrap">${orderFormHtml}</div>` : ''}
${S.reviews_enabled ? `
<section class="pd-reviews wrap"><h2>آراء العملاء</h2>
${reviews.length ? reviews.map(r => `<div class="pd-review"><div class="pd-review-head"><b>${esc(r.customer_name)}</b><span class="stars">${'★'.repeat(r.rating)}<span class="muted">${'★'.repeat(5 - r.rating)}</span></span></div>${r.text ? `<p>${esc(r.text)}</p>` : ''}</div>`).join('') : '<p class="muted">كن أول من يقيّم هذا المنتج</p>'}
<form id="rvForm" class="co-form pd-review-form"><h3>أضف تقييمك</h3>
<label>اسمك<input name="customer_name" required maxlength="60"></label>
<label>تقييمك<select name="rating"><option value="5">5 — ممتاز</option><option value="4">4 — جيد جداً</option><option value="3">3 — جيد</option><option value="2">2 — مقبول</option><option value="1">1 — ضعيف</option></select></label>
<label>تعليقك (اختياري)<textarea name="text" maxlength="1000"></textarea></label>
<button type="submit" class="s-btn">إرسال التقييم</button><div id="rvMsg"></div></form></section>` : ''}
${similar.length ? `<section class="pd-similar wrap"><h2>منتجات مشابهة</h2><div class="s-grid">${similar.map(sp => productCardHTML(store, lay, sp, t)).join('')}</div></section>` : ''}
${renderZone(store, 'product', 'content', ctx)}
${renderZone(store, 'product', 'above_footer', ctx)}
<footer class="s-footer">${socialLinks(store)}${t.footer_text ? `<p>${esc(t.footer_text)}</p>` : ''}<p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
${renderZone(store, 'product', 'below_footer', ctx)}
${S.sticky_buy && !out ? `<div class="pd-sticky"><img src="${esc(imgs[0] || '')}" alt=""><div class="pd-sticky-info"><b>${esc(p.name)}</b><span>${money(p.price)}</span></div><button class="s-btn buy" onclick="${S.buy_same_page ? `document.getElementById('pdOrder').scrollIntoView({behavior:'smooth'})` : `buyNow(${p.id}, '${jsName}', ${p.price}, ${JSON.stringify(imgs[0] || '')}, ${qtyVal})`}">${esc(buyText)}</button></div>` : ''}
${cartDrawer(store)}
${storeScripts(store)}
<script>track('product_view', ${p.id});</script>
<script>
(function(){
var PID=${p.id},PPRICE=${Number(p.price) || 0},PXVAL=${Number(S.pixel_price) || 0};
var f=document.getElementById('pdForm');
if(f)f.addEventListener('submit',async function(e){
  e.preventDefault();
  var btn=document.getElementById('pdSubmit');btn.disabled=true;btn.textContent='جاري تأكيد الطلب…';
  var body={};new FormData(f).forEach(function(v,k){body[k]=v});
  body.session_id=sid();body.payment_method='cod';
  var q=+(document.getElementById('pdQty')?document.getElementById('pdQty').textContent:1)||1;
  body.items=[{product_id:PID,name:${JSON.stringify(p.name)},qty:q}];
  var r=await fetch('/api/public/'+SLUG+'/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var d=await r.json();
  if(!r.ok){document.getElementById('pdErr').textContent=d.error||'حدث خطأ، حاول مرة أخرى';btn.disabled=false;btn.textContent=${JSON.stringify(buyText)};return;}
  if(window.pxPurchase)pxPurchase(PXVAL>0?PXVAL:PPRICE*q);
  location.href='/s/'+SLUG+'/order/'+d.number;
});
var rv=document.getElementById('rvForm');
if(rv)rv.addEventListener('submit',async function(e){
  e.preventDefault();
  var body={product_id:PID};new FormData(rv).forEach(function(v,k){body[k]=v});
  var r=await fetch('/api/public/'+SLUG+'/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  var m=document.getElementById('rvMsg');
  if(r.ok){m.innerHTML='<p class="ok-text">شكراً! تقييمك وصل وسيظهر بعد المراجعة.</p>';rv.reset();}
  else m.innerHTML='<p class="err-text">تعذر إرسال التقييم، حاول مرة أخرى.</p>';
});
${S.fake_visitors ? `var lvMin=${fvMin},lvMax=${fvMax},lvN=document.getElementById('pdLiveN');
function lvTick(){lvN.textContent=lvMin+Math.floor(Math.random()*(lvMax-lvMin+1));}
lvTick();setInterval(lvTick,8000);` : ''}
${S.fake_countdown ? `var cdH=${Math.max(1, +S.fake_countdown_hours || 1)},cdEl=document.getElementById('pdCd'),cdKey='pd_cd_${p.id}';
var cdEnd=+localStorage.getItem(cdKey)||0;
if(!cdEnd||cdEnd<Date.now()){cdEnd=Date.now()+cdH*3600*1000;localStorage.setItem(cdKey,cdEnd);}
function cdTick(){var d=cdEnd-Date.now();if(d<=0){cdEnd=Date.now()+cdH*3600*1000;localStorage.setItem(cdKey,cdEnd);d=cdEnd-Date.now();}
var h=Math.floor(d/3600000),m=Math.floor(d%3600000/60000),s=Math.floor(d%60000/1000);
cdEl.textContent=(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;}
cdTick();setInterval(cdTick,1000);` : ''}
})();
</script>
</body></html>`;
}

function checkoutPage(store, t, owner) {
  const govs = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'القليوبية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'طنطا', 'المنصورة', 'الزقازيق'];
  const ctxProds = db.prepare(`SELECT id, name, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0 ORDER BY created_at DESC`).all(store.id);
  const ctx = { products: ctxProds, cats: [...new Set(ctxProds.map(x => x.category).filter(Boolean))], lay: eoLayout(store, t), t };
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `إتمام الطلب | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}
${renderZone(store, 'checkout', 'above_header', ctx)}
${storeHeader(store, t)}
${renderZone(store, 'checkout', 'below_header', ctx)}
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
${demoFormNotice(store)}
<button type="submit" class="s-btn btn-lg full buy" id="coSubmit">تأكيد الطلب — دفع عند الاستلام</button>
<div class="co-trust"><span>${IC.lock}بياناتك آمنة ومشفّرة</span><span>${IC.truck}توصيل سريع</span><span>${IC.ret}إرجاع سهل</span></div>
</form>
<aside class="co-summary" id="coSummary"></aside>
</div></main>
${renderZone(store, 'checkout', 'content', ctx)}
${renderZone(store, 'checkout', 'above_footer', ctx)}
<footer class="s-footer">${socialLinks(store)}${t.footer_text ? `<p>${esc(t.footer_text)}</p>` : ''}<p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
${renderZone(store, 'checkout', 'below_footer', ctx)}
${storeScripts(store)}
<script>track('begin_checkout'); renderCheckout(); loadPayMethods();</script>
</body></html>`;
}

function funnelPage(store, funnel, p, t, owner) {
  const imgs = JSON.parse(p.images || '[]');
  const off = p.compare_at_price && p.compare_at_price > p.price ? Math.round(100 - p.price * 100 / p.compare_at_price) : 0;
  const govs = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'القليوبية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'طنطا', 'المنصورة', 'الزقازيق'];
  const out = p.stock <= 0;
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `${p.name} | ${store.name}`)}</head>
<body class="store funnel ${t.dark ? 'dark' : ''}">
${demoBar(store)}
${owner ? `<div class="s-ownerbar">وضع المعاينة — <a href="/app#/funnels">العودة للوحة التحكم</a></div>` : ''}
<header class="fn-brand"><span class="s-logo">${esc((store.logo_text || store.name).trim().charAt(0))}</span><b>${esc(store.name)}</b></header>
<main class="fn">
<section class="fn-hero">
  <div class="fn-gallery"><img id="fnImg" src="${esc(imgs[0] || ph(p.name))}" alt="${esc(p.name)}">
  ${imgs.length > 1 ? `<div class="pd-thumbs">${imgs.map((im, i) => `<img src="${esc(im)}" onclick="document.getElementById('fnImg').src=this.src" class="${i === 0 ? 'on' : ''}">`).join('')}</div>` : ''}</div>
  <div class="fn-info">
    <h1>${esc(p.name)}</h1>
    <div class="pd-price"><b>${egp(p.price)}</b>${p.compare_at_price ? `<s>${egp(p.compare_at_price)}</s>` : ''}${off ? `<span class="p-off">وفّر ${off}%</span>` : ''}</div>
    <div class="fn-desc">${p.description || ''}</div>
    ${store.free_shipping_over ? `<div class="s-freeship">${IC.truck}شحن مجاني للطلبات فوق ${egp(store.free_shipping_over)}</div>` : ''}
  </div>
</section>
<section class="fn-order" id="order">
  <h2>اطلب الآن — الدفع عند الاستلام</h2>
  ${out ? `<div class="s-empty">نفدت الكمية مؤقتاً — تابعنا قريباً</div>` : `
  <form id="fnForm" class="co-form">
    <div class="fn-qty"><span>الكمية</span><div class="qty-ctl"><button type="button" onclick="fnQty(-1)">−</button><b id="fnQty">1</b><button type="button" onclick="fnQty(1)">+</button></div></div>
    <label>الاسم بالكامل<input name="name" required placeholder="مثال: مريم أحمد"></label>
    <label>رقم الموبايل<input name="phone" required inputmode="tel" dir="ltr" placeholder="01xxxxxxxxx" pattern="01[0125][0-9]{8}"></label>
    <label>المحافظة<select name="governorate" required>${govs.map(g => `<option>${g}</option>`).join('')}</select></label>
    <label>العنوان بالتفصيل<textarea name="address" required placeholder="الشارع، رقم العمارة، الدور، الشقة، علامة مميزة"></textarea></label>
    <label>ملاحظات (اختياري)<input name="notes" placeholder="أي تفاصيل إضافية"></label>
    <div class="auth-err" id="fnErr"></div>
    ${demoFormNotice(store)}
    <button type="submit" class="s-btn btn-lg full buy" id="fnSubmit">تأكيد الطلب — ${egp(p.price)} <span id="fnTotal"></span></button>
    <div class="co-trust"><span>${IC.lock}بياناتك آمنة</span><span>${IC.truck}توصيل سريع</span><span>${IC.ret}إرجاع سهل</span></div>
  </form>`}
</section>
</main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a> — الدفع عند الاستلام متاح</p></footer>
${storeScripts(store)}
<script>
track('page_view', ${p.id});
const FN_PRICE = ${Number(p.price)}, FN_ID = ${funnel.id}, FN_PID = ${p.id}, FN_NAME = ${JSON.stringify(p.name)};
let fnQ = 1;
function fnQty(d) { fnQ = Math.max(1, Math.min(20, fnQ + d)); document.getElementById('fnQty').textContent = fnQ; document.getElementById('fnTotal').textContent = fnQ > 1 ? '× ' + fnQ + ' = ' + (FN_PRICE * fnQ).toLocaleString('ar-EG') + ' ج.م' : ''; }
document.getElementById('fnForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('fnSubmit'); btn.disabled = true; btn.textContent = 'جاري تأكيد الطلب…';
  const body = Object.fromEntries(new FormData(e.target).entries());
  body.session_id = sid(); body.funnel_id = FN_ID; body.payment_method = 'cod';
  body.items = [{ product_id: FN_PID, name: FN_NAME, qty: fnQ }];
  const r = await fetch('/api/public/' + SLUG + '/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) { document.getElementById('fnErr').textContent = d.error || 'حدث خطأ، حاول مرة أخرى'; btn.disabled = false; btn.textContent = 'تأكيد الطلب'; return; }
  if (window.pxPurchase) pxPurchase(FN_PRICE * fnQ);
  location.href = '/s/' + SLUG + '/order/' + d.number;
});
</script>
</body></html>`;
}

function storeBlogIndex(store, t) {
  const posts = db.prepare(`SELECT p.*, c.name AS category_name FROM blog_posts p LEFT JOIN blog_categories c ON c.id = p.category_id WHERE p.store_id = ? AND p.status = 'published' ORDER BY p.id DESC`).all(store.id);
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `المدونة | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}${storeHeader(store, t)}
<main class="wrap">
<h1 class="pg-title">المدونة</h1>
${posts.length ? `<div class="blog-grid">${posts.map(p => `
<a class="blog-card" href="/s/${esc(store.slug)}/blog/${esc(p.slug)}">
${p.category_name ? `<span class="blog-cat">${esc(p.category_name)}</span>` : ''}
<h3>${esc(p.title)}</h3>
<p>${esc((p.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140))}…</p>
<span class="blog-date">${esc((p.created_at || '').slice(0, 10))}</span></a>`).join('')}</div>`
  : `<div class="s-empty">لا توجد مقالات منشورة بعد — تابعنا قريباً</div>`}
</main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
${storeScripts(store)}
</body></html>`;
}

function storeBlogPost(store, p, t) {
  const more = db.prepare(`SELECT title, slug FROM blog_posts WHERE store_id = ? AND status = 'published' AND id != ? ORDER BY id DESC LIMIT 3`).all(store.id, p.id);
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `${p.title} | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}${storeHeader(store, t)}
<main class="wrap blog-post">
<a class="blog-back" href="/s/${esc(store.slug)}/blog">→ كل المقالات</a>
${p.category_name ? `<span class="blog-cat">${esc(p.category_name)}</span>` : ''}
<h1 class="pg-title">${esc(p.title)}</h1>
<span class="blog-date">${esc((p.created_at || '').slice(0, 10))}</span>
<article class="blog-body">${p.body}</article>
${more.length ? `<h3 class="blog-more-t">مقالات أخرى</h3><div class="blog-grid">${more.map(m => `<a class="blog-card" href="/s/${esc(store.slug)}/blog/${esc(m.slug)}"><h3>${esc(m.title)}</h3></a>`).join('')}</div>` : ''}
</main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
${storeScripts(store)}
</body></html>`;
}

function verifiedPage(store, stats, t) {
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `طلبات موثقة | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}
<main class="done">
<div class="done-card">
<div class="done-check">${IC.check}</div>
<h1>${esc(store.name)}</h1>
<p>متجر موثّق على منصة اكتف اوردر</p>
<div class="done-items">
<div class="done-item total"><span>طلبات مكتملة موثقة</span><b>${Number(stats.c).toLocaleString('ar-EG')}</b></div>
<div class="done-item dim"><span>إجمالي قيمة الطلبات</span><b>${egp(stats.t)}</b></div></div>
<p style="font-size:13px;color:#777;margin-top:14px">هذه الأرقام محسوبة لحظياً من سجلات الطلبات الفعلية على المنصة، ولا يمكن للمتجر تعديلها.</p>
<a class="s-btn" href="/s/${esc(store.slug)}">تصفح المتجر</a>
</div></main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
</body></html>`;
}

function orderPage(store, o, t) {
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
  // F4: one-click downsell card
  let downsellCard = '';
  try {
    const s = Object.fromEntries(db.prepare('SELECT key, value FROM store_settings WHERE store_id = ?').all(store.id).map(r => [r.key, r.value]));
    const ds = s.downsell ? JSON.parse(s.downsell) : null;
    if (ds && ds.product_id) {
      const dp = db.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ? AND status = 'active' AND stock > 0`).get(ds.product_id, store.id);
      if (dp && !items.some(i => i.product_id === dp.id)) {
        const dPrice = Math.max(1, Math.round(dp.price * (100 - (ds.discount_pct || 0)) / 100));
        const dImg = JSON.parse(dp.images || '[]')[0] || ph(dp.name);
        downsellCard = `<div class="dsell-card">
          <h3>عرض خاص لك فقط — خصم ${ds.discount_pct}%</h3>
          <div class="dsell-body"><img src="${esc(dImg)}" alt="${esc(dp.name)}">
          <div><b>${esc(dp.name)}</b><div class="pd-price"><b>${egp(dPrice)}</b><s>${egp(dp.price)}</s></div>
          <p style="font-size:12.5px;color:#777">أضِفه لطلبك الآن بضغطة واحدة — نفس بياناتك وعنوانك، والدفع عند الاستلام.</p>
          <button class="s-btn" onclick="dsellBuy(this, ${dp.id}, '${esc(o.number)}')">أضِفه لطلبي بـ ${egp(dPrice)}</button>
          <div class="auth-err" id="dsellErr"></div></div></div>
        </div>
        <script>async function dsellBuy(btn, pid, num){btn.disabled=true;btn.textContent='جاري الإضافة…';const r=await fetch('/api/public/${esc(store.slug)}/orders/'+num+'/downsell',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_id:pid})});const d=await r.json();if(!r.ok){document.getElementById('dsellErr').textContent=d.error||'حدث خطأ';btn.disabled=false;btn.textContent='حاول مرة أخرى';return;}location.href='/s/${esc(store.slug)}/order/'+d.number;}</script>`;
      }
    }
  } catch (e) {}
  const waMsg = encodeURIComponent(`أهلاً ${o.customer_name} 👋\nتم استلام طلبك رقم ${o.number} من ${store.name} بنجاح ✅\nالإجمالي: ${egp(o.total)} — الدفع عند الاستلام\nسنتواصل معك قريباً لتأكيد الشحن 🚚`);
  const waLink = store.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`أهلاً، أريد الاستفسار عن طلبي رقم ${o.number}`)}` : null;
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `طلبك ${o.number} | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}
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
</div>
${downsellCard}</main>
<footer class="s-footer"><p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
<script>if(window.pxPurchase)pxPurchase(${Number(o.total) || 0});</script>
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

// ---------- standalone pages (EO clone) ----------
function faqBlock(items) {
  return `<div class="mt-12 space-y-3">${items.map(q=>`
    <details class="group rounded-2xl border border-border bg-card px-6 shadow-soft" data-reveal="fade-up">
      <summary class="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-[15px] font-semibold">${q[0]}<span class="grid place-items-center w-7 h-7 rounded-full bg-muted text-muted-foreground transition-transform duration-200 group-open:rotate-45">${IC.plus || '+'}</span></summary>
      <p class="pb-5 text-[14px] leading-7 text-muted-foreground">${q[1]}</p>
    </details>`).join('')}</div>`;
}

function pricingPage() {
  return base('الأسعار | اكتف اوردر', `
${siteHeader('light')}
<section class="pt-32 pb-24 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="text-center max-w-2xl mx-auto" data-reveal="fade-up">
    <span class="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-[13px] font-semibold text-muted-foreground">الأسعار</span>
    <h1 class="mt-4 text-[36px] sm:text-[44px] font-bold tracking-tight leading-snug">إنشاء متجرك الإلكتروني <span class="text-brand-foreground">أسهل مما تتوقع</span></h1>
    <p class="mt-4 text-[16px] leading-8 text-muted-foreground">بدون خبرة برمجية وبدون الاستعانة بمطوّر: أنشئ متجرك بنفسك في أقل من 10 دقائق، بدون أكواد أو خطوات معقدة.</p>
  </div>
  <div class="mt-14 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
    <div class="rounded-3xl bg-brand p-8 text-white shadow-float" data-reveal="pop">
      <span class="inline-block rounded-full bg-night/90 px-4 py-1.5 text-[12.5px] font-bold text-white">أقل سعر (مجاني)</span>
      <h2 class="mt-5 text-[26px] font-bold">الباقة العادية</h2>
      <p class="mt-2 text-[14px] leading-6 opacity-90">جهّز متجرك بالكامل مجاناً، وادفع فقط عندما تقرر النشر.</p>
      <div class="mt-5 text-[46px] font-bold leading-none">0 <span class="text-[15px] font-semibold opacity-80">ج.م / للتجهيز</span></div>
      <div class="my-6 border-t border-white/25"></div>
      <ul class="space-y-3 text-[14px]">${['عدد غير محدود من المنتجات','عدد غير محدود من الطلبات','زيارات غير محدودة','متجرك يظل محفوظاً حتى لو لم تشترك','دعم سريع على مدار الساعة'].map(x=>`<li class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-white text-brand-foreground">${IC.check}</span>${x}</li>`).join('')}</ul>
      <a class="mt-8 block text-center rounded-full bg-night px-7 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:opacity-90" href="/register">اشترك الآن</a>
    </div>
    <div class="rounded-3xl border border-border bg-card p-8 shadow-soft" data-reveal="pop" style="--rv-delay:.1s">
      <span class="inline-block rounded-full bg-night px-4 py-1.5 text-[12.5px] font-bold text-white">للمتاجر المنشورة</span>
      <h2 class="mt-5 text-[26px] font-bold">الباقة الاحترافية</h2>
      <p class="mt-2 text-[14px] leading-6 text-muted-foreground">انشر متجرك بكل المميزات باشتراك بسيط، وبدون أي عمولة على الطلبات.</p>
      <div class="mt-5 text-[46px] font-bold leading-none">50 <span class="text-[15px] font-semibold text-muted-foreground">ج.م / كل 30 يوم</span></div>
      <div class="my-6 border-t border-border"></div>
      <ul class="space-y-3 text-[14px]">${['نشر المتجر برابطك الخاص','0% عمولة على مبيعاتك','كل القوالب والتحليلات والبيكسلات','تأكيد واتساب والسلات المتروكة','ربط دومين خاص وفريق وصلاحيات','دفع عبر InstaPay أو Vodafone Cash'].map(x=>`<li class="flex items-center gap-2.5"><span class="grid place-items-center w-5 h-5 rounded-full bg-brand-soft text-brand-foreground">${IC.check}</span>${x}</li>`).join('')}</ul>
      <a class="btn-sheen mt-8 block text-center rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="/register">اشترك الآن</a>
    </div>
  </div>
  <div class="mt-20 max-w-3xl mx-auto">
    <h2 class="text-center text-[28px] font-bold tracking-tight" data-reveal="fade-up">هل لا زلت متردّداً؟</h2>
    ${faqBlock([['ما وسائل الدفع التي تدعمونها؟','ندعم الدفع عند الاستلام بالكامل، ومع باقة النشر يمكنك ربط Paymob لقبول البطاقات والمحافظ الإلكترونية.'],['ماذا يحدث عند تأخير الدفع؟','يبقى متجرك وبياناتك محفوظة كاملة، ويتوقف النشر مؤقتاً حتى التجديد — تستعيد كل شيء بمجرد السداد.'],['هل هناك مصاريف خفية؟','لا، التكلفة معلنة بالكامل: الاشتراك فقط، بدون عمولة على الطلبات وبدون رسوم إضافية.'],['هل أحتاج دومين؟','متجرك يعمل برابط جاهز فوراً، ويمكنك ربط دومين خاص بك في أي وقت من الإعدادات.'],['هل يوجد دعم بالعربية؟','نعم، فريق الدعم متاح بالعربية على مدار الساعة عبر واتساب.']])}
    <div class="mt-10 rounded-3xl border border-border bg-card p-8 text-center shadow-soft" data-reveal="fade-up">
      <h3 class="text-[20px] font-bold">وإن لم تجد سؤالك هنا؟</h3>
      <p class="mt-2 text-[14px] text-muted-foreground">فريق الدعم في انتظارك… 24/7</p>
      <a class="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-[14px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="https://wa.me/201011206670" target="_blank" rel="noopener">تحدّث مع فريق الدعم</a>
    </div>
  </div>
</div></section>
${siteFooter}`);
}

function themesPage() {
  return base('القوالب | اكتف اوردر', `
${siteHeader('light')}
<section class="pt-32 pb-16 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="text-center max-w-2xl mx-auto" data-reveal="fade-up">
    <h1 class="text-[34px] sm:text-[42px] font-bold tracking-tight leading-snug">قوالب جديدة بتصميمات عصرية تساعدك على بدء البيع في دقائق</h1>
    <div class="mt-8 flex flex-wrap justify-center gap-8">
      ${[['+4','قوالب عصرية'],['0 ج.م','تكلفة التجربة'],['+10 دقائق','لإطلاق متجرك']].map(x=>`<div class="text-center"><div class="text-[30px] font-bold text-brand-foreground">${x[0]}</div><div class="text-[13px] text-muted-foreground mt-1">${x[1]}</div></div>`).join('')}
    </div>
  </div>
</div></section>
<section class="py-16 bg-subtle"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <h2 class="text-[26px] font-bold tracking-tight" data-reveal="fade-up">كل ما تحتاجه لنمو متجرك في قالب واحد</h2>
  <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
    ${[['تصميم يبرز علامتك التجارية','ألوان وخطوط عربية قابلة للتخصيص بالكامل.'],['سرعة الوصول للمنتجات','تصنيفات وفلاتر تقلّص خطوات الشراء.'],['تجربة متكاملة على جميع الأجهزة','موبايل أولاً، حيث يشتري عملاؤك فعلاً.'],['تصميمات جاهزة للانطلاق','أقسام وبنرات مرتبة — أضف منتجاتك فقط.']].map((f,i)=>`
    <div class="rounded-2xl border border-border bg-card p-6 shadow-soft" data-reveal="fade-up" style="--rv-delay:${i*0.08}s"><h3 class="text-[15.5px] font-bold">${f[0]}</h3><p class="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">${f[1]}</p></div>`).join('')}
  </div>
</div></section>
<section class="py-16 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <h2 class="text-[26px] font-bold tracking-tight" data-reveal="fade-up">ابدأ متجرك بسهولة مع قوالب جاهزة وقابلة للتعديل</h2>
  <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
    ${[['#141924','#27cd27','عصري','أزياء وموضة'],['#0B1526','#3B82F6','تقني','إلكترونيات'],['#4A2C3D','#D98E9A','بوتيك','مستحضرات تجميل'],['#14532D','#F59E0B','طازج','عروض وسوبرماركت'],['#1F2937','#F97316','دافئ','مأكولات وحلويات'],['#312E81','#A5B4FC','ليلي','ساعات وإكسسوارات'],['#3F3F1E','#EAB308','ذهبي','عطور وهدايا'],['#083344','#22D3EE','بحري','رياضة ولياقة']].map((t,i)=>`
    <div class="group rounded-2xl border border-border bg-card overflow-hidden shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1" data-reveal="fade-up" style="--rv-delay:${i*0.08}s">
      <div class="relative h-44 grid place-items-center transition-transform duration-500 group-hover:scale-[1.03]" style="background:linear-gradient(135deg,${t[0]},color-mix(in oklab,${t[0]} 70%,${t[1]}))">
        <span class="absolute top-3 start-3 rounded-full bg-brand-soft px-3 py-1 text-[11.5px] font-bold text-brand-foreground">مجاني</span>
        <span class="rounded-full px-5 py-2 text-[15px] font-bold" style="background:${t[1]};color:#0a0f14">${t[2]}</span>
      </div>
      <div class="p-5"><h3 class="text-[15px] font-bold">قالب ${t[2]}</h3><p class="mt-1 text-[13px] text-muted-foreground">تصميم سريع وبسيط لزيادة المبيعات</p><div class="mt-3"><span class="rounded-full border border-border px-3 py-1 text-[11.5px] text-muted-foreground">${t[3]}</span></div></div>
    </div>`).join('')}
  </div>
</div></section>
<section class="relative overflow-hidden bg-night text-night-foreground py-20">
  <div class="hero-grid absolute inset-0 opacity-60"></div>
  <div class="relative mx-auto max-w-3xl px-4 text-center" data-reveal="fade-up">
    <h2 class="text-[30px] sm:text-[38px] font-bold tracking-tight">مستعد لزيادة مبيعات متجرك؟</h2>
    <a class="btn-sheen mt-8 inline-block rounded-full bg-brand px-9 py-4 text-[16px] font-bold text-night transition-all duration-200 hover:bg-brand-bright glow-brand" href="/register">ابدأ متجرك مجاناً</a>
  </div>
</section>
<section class="py-20 bg-background"><div class="mx-auto max-w-3xl px-4 sm:px-8">
  <h2 class="text-center text-[28px] font-bold tracking-tight" data-reveal="fade-up">إجابات لأكثر الأسئلة شيوعاً حول القوالب</h2>
  ${faqBlock([['هل يمكنني تغيير القالب بعد الإطلاق؟','نعم، بدّل القالب في أي وقت من لوحة التحكم ومحتوى متجرك ينتقل كما هو.'],['هل أحتاج مصمماً لتعديل القالب؟','لا، الألوان والخطوط والأقسام تتعدل من لوحة تخصيص مرئية بدون كود.'],['هل القوالب متوافقة مع الموبايل؟','كل القوالب مصممة موبايل أولاً ومتجاوبة مع جميع الشاشات.'],['هل القوالب مجانية؟','نعم، كل القوالب مشمولة في كل الباقات بدون تكلفة إضافية.']])}
</div></section>
${siteFooter}`);
}

// ---------- blog ----------
const BLOG_POSTS = [
  { slug: 'what-your-store-needs', cat: 'إدارة متجرك', title: 'ما الذي يحتاجه متجرك الإلكتروني لينجح؟', excerpt: 'قبل أن تصرف جنيهاً واحداً على الإعلانات، تأكد أن هذه الأساسيات الخمسة موجودة في متجرك.', date: '18 نوفمبر 2026', read: '4 دقائق', hue: ['#0B1526', '#3B82F6'],
    body: [
      ['منتج واضح بعرض أوضح', 'الزائر يقرر في ثوانٍ هل يكمل التصفح أم يخرج. صور حقيقية، وصف يجاوب على أسئلة العميل قبل أن يسأل، وسعر واضح شامل بدون مفاجآت عند الطلب.'],
      ['طلب بأقل خطوات ممكنة', 'كل حقل إضافي في فورم الطلب يكلفك مبيعات. الاسم ورقم الهاتف والعنوان يكفون لبدء البيع بالدفع عند الاستلام، وأي شيء زيادة رفاهية تؤجلها.'],
      ['تأكيد الطلبات قبل الشحن', 'نسبة كبيرة من مرتجعات الشحن سببها طلبات غير جادة. تأكيد العميل لطلبه برسالة واتساب قبل الشحن يوفر عليك تكلفة الشحن ذهاباً وعودة.'],
      ['متابعة الأرقام أسبوعياً', 'عدد الزيارات، نسبة من أكملوا الطلب، وأكثر منتج يتصفحه الناس: ثلاثة أرقام تقرأها كل أسبوع تخبرك أين المشكلة قبل أن تكبر.'],
    ] },
  { slug: 'store-cost-breakdown', cat: 'ابدأ متجرك', title: 'كم تكلفة إنشاء متجر إلكتروني في مصر؟', excerpt: 'تفصيل صادق للتكاليف: المنصة، الدومين، الدفع الإلكتروني، والشحن — بدون مبالغة ولا وعود وردية.', date: '15 نوفمبر 2026', read: '5 دقائق', hue: ['#14532D', '#27cd27'],
    body: [
      ['المنصة', 'تقدر تبدأ مجاناً وتجهّز متجرك بالكامل قبل أن تدفع أي شيء. عند النشر، اشتراك شهري بسيط يغطي الاستضافة والقوالب والتحليلات، وهو أقل بكثير من تكلفة تطوير متجر خاص من الصفر.'],
      ['الدومين', 'اختياري في البداية لأن متجرك يعمل برابط جاهز. عندما تكبر، دومين خاص يكلف مئات قليلة من الجنيهات سنوياً ويضيف ثقة واضحة لعلامتك.'],
      ['الدفع الإلكتروني', 'الدفع عند الاستلام لا يكلفك شيئاً إضافياً. بوابات الدفع بالبطاقات تأخذ نسبة من كل عملية، فعّلها عندما يطلبها عملاؤك فعلاً.'],
      ['الشحن', 'شركات الشحن الداخلي تتقاضى رسماً لكل طلب يتضاعف مع المرتجعات. ابدأ بشركة واحدة موثوقة في محافظات عملائك الأساسية وتوسع تدريجياً.'],
      ['الخلاصة', 'البوابة الحقيقية ليست التكلفة بل الوقت: متجر جاهز للبيع اليوم يتفوق على متجر مثالي يتأخر شهوراً.'],
    ] },
  { slug: 'start-free-no-experience', cat: 'ابدأ متجرك', title: 'كيف تبدأ متجرك مجاناً وبدون خبرة تقنية؟', excerpt: 'خطوات عملية من إنشاء الحساب حتى أول طلب، مصممة لمن لم يبنِ موقعاً في حياته.', date: '11 نوفمبر 2026', read: '4 دقائق', hue: ['#4A2C3D', '#D98E9A'],
    body: [
      ['أنشئ حسابك في دقيقة', 'كل ما تحتاجه بريد إلكتروني ورقم هاتف. اختر اسم رابط متجرك، وستجده محجوزاً لك فوراً حتى قبل أن تدفع أي شيء.'],
      ['اختر قالباً وأضف منتجاتك', 'القوالب جاهزة بأقسامها وترتيبها. مهمتك فقط: صور منتجاتك وأسعارها ووصفها. ابدأ بثلاثة منتجات قوية بدلاً من كتالوج كامل.'],
      ['جرّب الطلب بنفسك', 'اطلب من متجرك كعميل قبل أن تنشره لأحد. ستكتشف بنفسك أي التباس في الفورم أو الوصف وتصلحه قبل أول زائر حقيقي.'],
      ['انشر وشارك رابطك', 'رابط متجرك جاهز للمشاركة على واتساب وصفحات التواصل من أول يوم. أول عشرة طلبات غالباً يأتون من دائرتك القريبة.'],
    ] },
  { slug: 'shipping-companies-linking', cat: 'الشحن والدفع', title: 'ربط شركات الشحن بمتجرك: من أين تبدأ؟', excerpt: 'كيف تختار شركة الشحن المناسبة، وماذا تجهّز قبل أول طلب يخرج من عندك.', date: '7 نوفمبر 2026', read: '5 دقائق', hue: ['#1F2937', '#F97316'],
    body: [
      ['اختر حسب محافظات عملائك', 'ليس كل شركة شحن تغطي كل المحافظات بنفس الجودة. اسأل عن أسعار وسرعة التوصيل في المحافظات التي يأتي منها معظم عملائك، وليس في القاهرة فقط.'],
      ['افهم سياسة المرتجعات مسبقاً', 'المرتجع هو التكلفة الخفية للدفع عند الاستلام. اعرف كم تدفع عن الطلب المرتجع وكم يوماً تنتظر تحصيل مستحقاتك.'],
      ['جهّز بيانات الشحنة مسبقاً', 'اسم عميل ورقم هاتف صحيح وعنوان مفصّل بالمعالم: ثلاثتها يقللون الرفض عند التسليم أكثر من أي شيء آخر.'],
      ['ابدأ يدوياً ثم automatisiere عند الحاجة', 'في البداية إدخال البوليصات يدوياً كافٍ تماماً. عندما تتجاوز عشرات الطلبات يومياً يصبح التكامل الآلي مع شركة الشحن وقتاً موفراً حقيقياً.'],
    ] },
  { slug: 'cod-and-payment-gateways', cat: 'الشحن والدفع', title: 'الدفع عند الاستلام وبوابات الدفع: ما الأنسب لمتجرك؟', excerpt: 'لماذا يبقى الكاش عند الاستلام ملك السوق المصري، ومتى يستحق الدفع الإلكتروني التفعيل.', date: '3 نوفمبر 2026', read: '4 دقائق', hue: ['#312E81', '#A5B4FC'],
    body: [
      ['لماذا يفضل عملاؤك الكاش', 'الثقة: العميل يدفع بعد أن يمسك المنتج. مقاومة هذه العادة في البداية تعني خسارة مبيعات، فابدأ بما يعرفه السوق.'],
      ['تكلفة الدفع عند الاستلام', 'ليست مجانية فعلياً: نسبة من الطلبات ترتجع، والشحن المرتجع يخصم من ربحك. تأكيد الطلبات قبل الشحن هو أقوى سلاح هنا.'],
      ['متى تفعّل الدفع الإلكتروني', 'عندما يبدأ عملاء متكررون يسألون عنه، أو عندما تبيع منتجات رقمية أو اشتراكات. وقتها بوابة مثل Paymob تفتح لك البطاقات والمحافظ.'],
      ['قاعدة عملية', 'كل وسيلة دفع إضافية يجب أن تخدم طلباً حقيقياً من عملائك، وليس انطباعاً تقنياً لديك.'],
    ] },
  { slug: 'first-customers-marketing', cat: 'التسويق', title: 'التسويق لمتجرك: كيف تجلب عملاءك الأوائل؟', excerpt: 'خطة أول 30 يوماً: من دائرتك القريبة إلى أول إعلان ممول بميزانية صغيرة محسوبة.', date: '29 أكتوبر 2026', read: '6 دقائق', hue: ['#3F3F1E', '#EAB308'],
    body: [
      ['ابدأ بمن يعرفك', 'شارك متجرك في مجموعات واتساب العائلية وصفحاتك الشخصية. أول عشرة عملاء يعطونك أهم شيء: ملاحظات صادقة وتقييمات أولى.'],
      ['محتوى قصير يعرض المنتج', 'فيديو قصير يعرض المنتج وهو يُستخدم يتفوق على صورة ثابتة. انشر باستمرار على المنصة التي يقضي عليها جمهورك وقته، وليس على كل المنصات.'],
      ['أول إعلان ممول', 'ابدأ بميزانية يومية صغيرة على جمهور محدد جغرافياً واهتماماته واضحة. قس نتيجة أسبوع كامل قبل أن تزيد أو توقف.'],
      ['العميل القديم أرخص عميل', 'رسالة واتساب لعميل اشترى منك بعرض على منتج مكمّل تكلفتها صفر وعائدها أعلى من أي إعلان. اجمع أرقام عملائك واعتنِ بهم.'],
    ] },
];
const BLOG_STATICS = {
  'about-us': { title: 'من نحن', body: [
    'اكتف اوردر منصة عربية لإنشاء المتاجر الإلكترونية، صُممت من البداية لتاجر الدفع عند الاستلام في مصر والوطن العربي: طلبات سريعة بدون تعقيد، تأكيد واتساب للطلبات، وقوالب عربية جاهزة للبيع من أول يوم.',
    'نؤمن أن التجارة الإلكترونية يجب ألا تكون حكراً على من يجيد البرمجة أو من يملك ميزانيات ضخمة. لذلك نبني أدوات تختصر الطريق من الفكرة إلى أول طلب: متجرك يتجهز مجاناً، وتدفع فقط عندما تقرر النشر.',
    'فريقنا يعمل من القاهرة، ودعمنا بالعربية على مدار الساعة عبر واتساب.',
  ] },
  'contact-us': { title: 'اتصل بنا', body: [
    'أسرع طريقة للوصول إلينا هي واتساب: فريق الدعم يرد بالعربية على مدار الساعة، سواء كان سؤالك قبل الاشتراك أو مشكلة في متجرك الحالي.',
    'اضغط زر واتساب الظاهر في أسفل الصفحة لبدء المحادثة مباشرة، وسيتولى فريقنا الرد في أقرب وقت.',
    'لطلبات التطوير الخاص — قالب مخصص، تكامل خاص، أو ميزة تحتاجها لنشاطك — اكتب لنا على نفس الرقم مع وصف موجز لما تحتاجه وسنعود إليك بتقييم.',
  ] },
  'conditions': { title: 'سياسة الاستخدام', body: [
    'باستخدامك منصة اكتف اوردر فأنت توافق على هذه الشروط: تقدم المنصة أدوات لإنشاء وإدارة متجرك الإلكتروني، وأنت مسؤول عن شرعية منتجاتك والتزامك بقوانين التجارة في بلدك.',
    'الباقة المجانية تتيح تجهيز متجرك بالكامل دون نشره. النشر يتطلب اشتراكاً فعالاً، ويبقى متجرك وبياناتك محفوظة إن توقف الاشتراك مؤقتاً حتى التجديد.',
    'يُحظر استخدام المنصة لبيع منتجات مخالفة للقانون أو منتهكة لحقوق الملكية الفكرية أو مضللة للعملاء، ويحق لنا إيقاف أي متجر يخالف ذلك.',
    'قد نحدّث هذه الشروط من وقت لآخر، وسنعلن عن التغييرات الجوهرية داخل لوحة التحكم قبل سريانها.',
  ] },
  'privacy-policy': { title: 'سياسة الخصوصية', body: [
    'نجمع الحد الأدنى من البيانات اللازمة لتشغيل حسابك ومتجرك: بيانات تسجيلك، ومحتوى متجرك، وبيانات الطلبات الواردة من عملائك لغرض إدارتها فقط.',
    'بيانات عملاء متجرك (الأسماء وأرقام الهواتف والعناوين) ملك لك كتاجر، ولا نبيعها ولا نشاركها مع أي طرف ثالث لأغراض تسويقية.',
    'نستخدم مزودي خدمة موثوقين للاستضافة وإرسال الرسائل، ويقتصر وصولهم على ما يلزم لتقديم الخدمة.',
    'يمكنك طلب تصدير بياناتك أو حذف حسابك نهائياً في أي وقت عبر واتساب الدعم، وننفذ الحذف الكامل خلال 30 يوماً.',
  ] },
};
const BLOG_CATS = ['الكل', 'ابدأ متجرك', 'إدارة متجرك', 'الشحن والدفع', 'التسويق'];

function postCard(p, i, big) {
  return `
  <a href="/blog/${p.slug}/" class="group rounded-2xl border border-border bg-card overflow-hidden shadow-soft transition-all duration-300 hover:shadow-float hover:-translate-y-1 block" data-reveal="fade-up" style="--rv-delay:${(i % 3) * 0.08}s">
    <div class="relative ${big ? 'h-56' : 'h-40'} grid place-items-center" style="background:linear-gradient(135deg,${p.hue[0]},color-mix(in oklab,${p.hue[0]} 55%,${p.hue[1]}))">
      <span class="absolute top-3 start-3 rounded-full bg-white/90 px-3 py-1 text-[11.5px] font-bold text-foreground">${p.cat}</span>
      <svg width="${big ? 46 : 34}" height="${big ? 46 : 34}" viewBox="0 0 24 24" fill="none" stroke="${p.hue[1]}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="opacity-90"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M7 13h6"/></svg>
    </div>
    <div class="p-5">
      <h3 class="${big ? 'text-[19px]' : 'text-[15px]'} font-bold leading-7 group-hover:text-brand-foreground transition-colors">${p.title}</h3>
      <p class="mt-1.5 text-[13px] leading-6 text-muted-foreground">${p.excerpt}</p>
      <div class="mt-3 flex items-center gap-3 text-[12px] text-muted-foreground"><span>${p.date}</span><span>·</span><span>قراءة ${p.read}</span></div>
    </div>
  </a>`;
}

function blogIndex() {
  const featured = BLOG_POSTS[0];
  return base('المدونة | اكتف اوردر', `
${siteHeader('light')}
<section class="pt-32 pb-14 bg-background"><div class="mx-auto max-w-6xl px-4 sm:px-8">
  <div class="max-w-2xl" data-reveal="fade-up">
    <span class="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-[13px] font-semibold text-muted-foreground">المدونة</span>
    <h1 class="mt-4 text-[34px] sm:text-[42px] font-bold tracking-tight leading-snug">تعلّم التجارة الإلكترونية <span class="text-brand-foreground">خطوة بخطوة</span></h1>
    <p class="mt-3 text-[16px] leading-7 text-muted-foreground">أدلة عملية مكتوبة لتجار الدفع عند الاستلام: إنشاء المتجر، الشحن، الدفع، وأولى حملاتك التسويقية.</p>
  </div>
  <div class="mt-10 grid md:grid-cols-2 gap-5">
    ${postCard(featured, 0, true)}
    <div class="grid gap-5">${BLOG_POSTS.slice(1, 3).map((p, i) => postCard(p, i + 1, false)).join('')}</div>
  </div>
  <div class="mt-10 flex flex-wrap gap-2" data-reveal="fade-up">
    ${BLOG_CATS.map((c, i) => `<span class="rounded-full px-4 py-2 text-[13px] font-semibold ${i === 0 ? 'bg-night text-white' : 'bg-muted text-muted-foreground'}">${c}</span>`).join('')}
  </div>
  <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    ${BLOG_POSTS.slice(3).map((p, i) => postCard(p, i, false)).join('')}
  </div>
</div></section>
<section class="relative overflow-hidden bg-night text-night-foreground py-20">
  <div class="hero-grid absolute inset-0 opacity-60"></div>
  <div class="relative mx-auto max-w-3xl px-4 text-center" data-reveal="fade-up">
    <h2 class="text-[28px] sm:text-[36px] font-bold tracking-tight">طبّق ما تقرأه فوراً — أنشئ متجرك مجاناً</h2>
    <a class="btn-sheen mt-8 inline-block rounded-full bg-brand px-9 py-4 text-[16px] font-bold text-night transition-all duration-200 hover:bg-brand-bright glow-brand" href="/register">ابدأ متجرك مجاناً</a>
  </div>
</section>
${siteFooter}`);
}

function blogPostPage(p) {
  const related = BLOG_POSTS.filter(x => x.slug !== p.slug).slice(0, 3);
  return base(p.title + ' | مدونة اكتف اوردر', `
${siteHeader('light')}
<article class="pt-32 pb-20 bg-background"><div class="mx-auto max-w-3xl px-4 sm:px-8">
  <div data-reveal="fade-up">
    <a href="/blog" class="text-[13px] font-bold text-brand-foreground hover:underline">← المدونة</a>
    <span class="mt-4 inline-block rounded-full bg-muted px-3.5 py-1.5 text-[12px] font-bold text-muted-foreground">${p.cat}</span>
    <h1 class="mt-3 text-[28px] sm:text-[36px] font-bold tracking-tight leading-snug">${p.title}</h1>
    <div class="mt-3 flex items-center gap-3 text-[13px] text-muted-foreground"><span>${p.date}</span><span>·</span><span>قراءة ${p.read}</span></div>
  </div>
  <div class="mt-8 h-52 sm:h-64 rounded-3xl grid place-items-center" style="background:linear-gradient(135deg,${p.hue[0]},color-mix(in oklab,${p.hue[0]} 55%,${p.hue[1]}))" data-reveal="fade-up">
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="${p.hue[1]}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="opacity-90"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M7 13h6"/></svg>
  </div>
  <p class="mt-8 text-[17px] leading-8 font-medium text-foreground/90">${p.excerpt}</p>
  ${p.body.map(sec => `
  <h2 class="mt-10 text-[21px] font-bold tracking-tight" data-reveal="fade-up">${sec[0]}</h2>
  <p class="mt-3 text-[15.5px] leading-8 text-foreground/80" data-reveal="fade-up">${sec[1]}</p>`).join('')}
  <div class="mt-12 rounded-3xl bg-night text-night-foreground p-8 text-center" data-reveal="fade-up">
    <h2 class="text-[20px] font-bold">جاهز تطبق؟ متجرك يتجهز مجاناً</h2>
    <a class="btn-sheen mt-5 inline-block rounded-full bg-brand px-8 py-3.5 text-[15px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="/register">ابدأ متجرك مجاناً</a>
  </div>
  <div class="mt-14">
    <h2 class="text-[20px] font-bold tracking-tight">مقالات ذات صلة</h2>
    <div class="mt-6 grid sm:grid-cols-3 gap-4">${related.map((r, i) => postCard(r, i, false)).join('')}</div>
  </div>
</div></article>
${siteFooter}`);
}

function blogStaticPage(key) {
  const p = BLOG_STATICS[key];
  return base(p.title + ' | اكتف اوردر', `
${siteHeader('light')}
<div class="pt-32 pb-20 bg-background"><div class="mx-auto max-w-2xl px-4 sm:px-8">
  <h1 class="text-[30px] sm:text-[38px] font-bold tracking-tight" data-reveal="fade-up">${p.title}</h1>
  <div class="mt-8 space-y-5">${p.body.map(par => `<p class="text-[15.5px] leading-8 text-foreground/80" data-reveal="fade-up">${par}</p>`).join('')}</div>
  <a class="mt-10 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-[14px] font-bold text-night transition-all duration-200 hover:bg-brand-bright" href="https://wa.me/201011206670" target="_blank" rel="noopener">تواصل معنا واتساب</a>
</div></div>
${siteFooter}`);
}

function policiesPage(store, t) {
  let pol = {}; try { pol = JSON.parse(storeSettingsKV(store).policies || '{}'); } catch (_) {}
  const secs = [
    ['terms', 'شروط الاستخدام'], ['privacy', 'سياسة الخصوصية'],
    ['returns', 'سياسة الاستبدال والاسترجاع'], ['shipping', 'سياسة الشحن والتوصيل'],
  ].filter(([k]) => (pol[k] || '').trim());
  const body = secs.length
    ? secs.map(([k, label]) => `<section class="card" style="margin-bottom:14px"><h2 style="font-size:18px;margin:0 0 8px">${label}</h2><p style="white-space:pre-wrap;line-height:1.9;margin:0">${esc(pol[k])}</p></section>`).join('')
    : `<div class="s-empty">لم يضف المتجر سياسات بعد.</div>`;
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head>${storeHead(store, t, `السياسات | ${store.name}`)}</head>
<body class="store ${t.dark ? 'dark' : ''} t-${esc((t && t.__id) || store.theme_id)}">
${demoBar(store)}
${storeHeader(store, t)}
<main style="max-width:760px;margin:24px auto;padding:0 16px">${body}</main>
<footer class="s-footer">${socialLinks(store)}<p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>
</body></html>`;
}

// ---------- builder live render (canvas preview for the visual editor) ----------
function productMainPreview(store, t, p) {
  if (!p) return `<div class="s-empty" style="padding:40px">لا توجد منتجات نشطة للمعاينة — أضف منتجاً أولاً</div>`;
  const imgs = JSON.parse(p.images || '[]');
  return `<main class="pd"><div class="pd-gallery"><img src="${esc(imgs[0] || ph(p.name))}" alt="${esc(p.name)}"></div>
<div class="pd-info">${p.category ? `<span class="pd-cat">${esc(p.category)}</span>` : ''}<h1>${esc(p.name)}</h1>
<div class="pd-price"><b>${egp(p.price)}</b>${p.compare_at_price ? `<s>${egp(p.compare_at_price)}</s>` : ''}</div>
<button class="s-btn btn-lg full buy" type="button">اضغط هنا للشراء</button></div></main>`;
}
function checkoutFormPreview(store, t) {
  return `<main class="co"><h1>إتمام الطلب</h1><p class="co-sub">خطوة واحدة وطلبك في الطريق إليك</p>
<div class="co-grid"><form class="co-form"><h3>بيانات التوصيل</h3>
<label>الاسم بالكامل<input disabled placeholder="مثال: مريم أحمد"></label>
<label>رقم الموبايل<input disabled dir="ltr" placeholder="01xxxxxxxxx"></label>
<label>المحافظة<select disabled><option>القاهرة</option></select></label>
<label>العنوان بالتفصيل<textarea disabled placeholder="الشارع، رقم العمارة، الدور، الشقة"></textarea></label>
<button type="button" class="s-btn btn-lg full buy">تأكيد الطلب — دفع عند الاستلام</button></form></div></main>`;
}
function builderRender(store, t, page) {
  const lay = eoLayout(store);
  let themeSchema = []; try { const row = db.prepare('SELECT config FROM themes WHERE id = ?').get(store.theme_id); themeSchema = row ? (JSON.parse(row.config).schema || []) : []; } catch (e) {}
  const products = db.prepare(`SELECT id, name, price, compare_at_price, stock, category, images FROM products WHERE store_id = ? AND status = 'active' AND COALESCE(json_extract(settings,'$.hidden_product'),0) = 0 ORDER BY created_at DESC`).all(store.id);
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  const ctx = { products, cats, lay, t };
  const zones = {};
  for (const z of ['above_header', 'below_header', 'content', 'above_footer', 'below_footer']) {
    zones[z] = getSections(store, page).filter(s => s.zone === z)
      .map(s => ({ id: s.id, type: s.type, name: SECTION_NAMES[s.type] || s.type, enabled: !!s.enabled, html: s.enabled ? renderSection(store, s, ctx) : '' }));
  }
  let fixed = '', fixedLabel = '';
  if (page === 'product') { fixed = productMainPreview(store, t, products[0]); fixedLabel = 'قالب صفحة المنتج (ثابت)' ; }
  if (page === 'checkout') { fixed = checkoutFormPreview(store, t); fixedLabel = 'نموذج الشراء (ثابت)'; }
  return {
    page,
    vars: themeVars(t),
    dark: !!t.dark,
    themeId: store.theme_id || '',
    theme: {
      primary: t.primary || '#141924', accent: t.accent || '#27cd27', bg: t.bg || '#ffffff', surface: t.surface || '#F6F8FC',
      radius: t.radius ?? 16, announce_bg: t.announce_bg || t.accent || '#27cd27', announce_color: t.announce_color || '#ffffff',
      header: t.header || '', footer_text: t.footer_text || '', hide_announcement: !!t.hide_announcement,
      ...Object.fromEntries(themeSchema.map(f => [f.key, t[f.key] ?? (f.kind === 'check' ? false : '')])),
    },
    announcement: store.announcement || '',
    header: storeHeader(store, t, cats),
    footer: `<footer class="s-footer">${socialLinks(store)}${t.footer_text ? `<p>${esc(t.footer_text)}</p>` : ''}${t.trust_line ? `<p class="s-trust">${esc(t.trust_line)}</p>` : ''}<p>يعمل بواسطة <a href="/">اكتف اوردر</a></p></footer>`,
    fixed, fixedLabel,
    zones,
    theme_schema: themeSchema,
  };
}

module.exports = { landing, login: loginPage, register: registerPage, appShell, adminShell, storefront, productPage, checkoutPage, funnelPage, orderPage, verifiedPage, policiesPage, categoryPage, storeBlogIndex, storeBlogPost, comingSoon, notFound, onboarding, egp, esc, pricingPage, themesPage, blogIndex, blogPostPage, blogStaticPage, BLOG_POSTS, builderRender };
