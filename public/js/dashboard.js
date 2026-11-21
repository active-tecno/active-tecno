// dashboard.js — Active Tecno merchant dashboard SPA (zero-dependency)
const $ = s => document.querySelector(s);
const egp = n => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => new Date(d.replace(' ', 'T') + (d.includes('Z') || d.includes('+') ? '' : 'Z')).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

async function api(path, opts = {}) {
  if (opts.body) { opts.headers = { 'Content-Type': 'application/json' }; opts.body = JSON.stringify(opts.body); }
  const r = await fetch(path, opts);
  if (r.status === 401) { location.href = '/login'; throw new Error('auth'); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { toast(d.error || 'حدث خطأ', 'err'); throw new Error(d.error || 'err'); }
  return d;
}
function toast(msg, type = 'ok') {
  let wrap = $('.d-toasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'd-toasts'; document.body.appendChild(wrap); }
  const t = document.createElement('div'); t.className = `d-toast ${type}`; t.textContent = msg;
  wrap.appendChild(t); setTimeout(() => t.remove(), 3200);
}
function openModal(title, bodyHTML, onMount) {
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'modal-ov'; ov.id = 'modalOv';
  ov.innerHTML = `<div class="modal"><h2>${title}<button onclick="closeModal()">✕</button></h2><div class="m-body">${bodyHTML}</div></div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('open'));
  if (onMount) onMount(ov);
}
function closeModal() { $('#modalOv')?.remove(); }

const STATUS = {
  new: { ar: 'جديد', cls: 'st-new' }, confirmed: { ar: 'مؤكد', cls: 'st-confirmed' },
  shipped: { ar: 'تم الشحن', cls: 'st-shipped' }, delivered: { ar: 'تم التسليم', cls: 'st-delivered' },
  cancelled: { ar: 'ملغي', cls: 'st-cancelled' }, returned: { ar: 'مرتجع', cls: 'st-returned' }
};
const stChip = s => `<span class="chip ${STATUS[s]?.cls || ''}">${STATUS[s]?.ar || s}</span>`;

let ME = null, STORE = null;

// ---------- layout ----------
const ICONS = {
  overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 8.3L12 13l8.7-4.7M12 13v9"/></svg>',
  products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  carts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.5 12h10L20 8H7"/></svg>',
  customers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M16.5 15.4a5 5 0 0 1 4.7 4.6"/></svg>',
  coupons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z"/><path d="M13 5v2m0 4v2m0 4v2" stroke-dasharray="1 3"/></svg>',
  shipping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h13v9H1zM14 10h4l4 4v2h-8z"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/></svg>',
  couriers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h13l3 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"/><path d="M4 9h16M9 4v5"/></svg>',
  payments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></svg>',
  blocked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/></svg>',
  customize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.8 2-1.8 0-.9-.7-1.4-.7-2.3 0-1 .8-1.7 2-1.7H17a4 4 0 0 0 4-4c0-4.4-4-8.2-9-8.2z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="11" cy="7.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/></svg>',
  tracking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7.5" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.7M12 18.5v2.7M21.2 12h-2.7M5.5 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4L5.5 5.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/></svg>',
  plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8zM12 18v4"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="3"/><circle cx="12" cy="12" r="2.6"/></svg>',
};
const I = k => ICONS[k] || ICONS.settings;

const NAV = [
  ['overview', 'overview', 'نظرة عامة'], ['orders', 'orders', 'الطلبات'], ['products', 'products', 'المنتجات'],
  ['carts', 'carts', 'السلات المتروكة'], ['customers', 'customers', 'العملاء'], ['coupons', 'coupons', 'الكوبونات'],
  ['shipping', 'shipping', 'الشحن'], ['couriers', 'couriers', 'شركات الشحن'], ['payments', 'payments', 'بوابات الدفع'],
  ['blocked', 'blocked', 'الأرقام المحظورة'], ['customize', 'customize', 'تخصيص المتجر'],
  ['tracking', 'tracking', 'البيكسلات والتتبع'], ['team', 'team', 'الفريق'], ['settings', 'settings', 'الإعدادات']
];
function shell(content) {
  const hash = location.hash.replace('#/', '') || 'overview';
  return `<div class="d-layout">
  <aside class="d-side" id="dSide">
    <a class="brand" href="/"><svg viewBox="0 0 32 32" width="28" height="28"><rect width="32" height="32" rx="8" fill="rgba(255,255,255,.12)"/><path d="M9 20l7-11 7 11" stroke="#27cd27" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="brand-name">اكتف <b>اوردر</b></span></a>
    ${NAV.map(([k, ic, l]) => `<button class="d-link ${hash === k ? 'on' : ''}" onclick="go('${k}')"><span class="ic">${I(ic)}</span>${l}${k === 'orders' && ME?.newOrders ? `<span class="badge">${ME.newOrders}</span>` : ''}</button>`).join('')}
    <div class="d-side-foot">
      <a class="d-viewstore" href="/s/${esc(STORE.slug)}" target="_blank">${I('eye')} معاينة المتجر <span style="margin-inline-start:auto">↗</span></a>
      ${ME.user.is_admin ? `<a class="d-link" href="/admin"><span class="ic">${I('shield')}</span>لوحة الإدارة</a>` : ''}
      <button class="d-link" onclick="logout()"><span class="ic">${I('logout')}</span>تسجيل الخروج</button>
    </div>
  </aside>
  <main class="d-main">${content}</main></div>`;
}
function go(k) { location.hash = '#/' + k; $('#dSide')?.classList.remove('open'); }
async function logout() { await api('/api/auth/logout', { method: 'POST' }); location.href = '/'; }
const topBar = (title, sub, actions = '') => `<div class="d-top">
  <button class="d-burger" onclick="document.getElementById('dSide').classList.toggle('open')">☰</button>
  <div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
  <div class="d-actions">${actions}</div></div>`;

function activationBanner() {
  if (STORE.is_published) {
    return `<div class="act-banner live"><div class="txt"><h3>متجرك منشور ويعمل</h3><p>النشر فعّال حتى ${esc(STORE.published_until || '')} — رابط متجرك: <a href="/s/${esc(STORE.slug)}" target="_blank" style="color:#fff;text-decoration:underline" class="mono">/s/${esc(STORE.slug)}</a></p></div>
    <a class="btn btn-teal" href="/s/${esc(STORE.slug)}" target="_blank">افتح المتجر ↗</a></div>`;
  }
  const pending = (ME.activations || []).find(a => a.status === 'pending');
  if (pending) return `<div class="act-banner pending"><div class="txt"><h3>⏳ طلب التفعيل قيد المراجعة</h3><p>استلمنا طلبك (${pending.method === 'instapay' ? 'InstaPay' : 'Vodafone Cash'} — مرجع ${esc(pending.reference)}) وسيتم تفعيل النشر خلال ساعات.</p></div></div>`;
  return `<div class="act-banner"><div class="txt"><h3>🚀 متجرك جاهز — بقي التفعيل فقط</h3><p>فعّل النشر بـ 50 ج.م كل 30 يوم عبر InstaPay أو Vodafone Cash وابدأ استقبال الطلبات. 0% عمولة.</p></div>
  <button class="btn btn-teal" onclick="openActivation()">تفعيل النشر — 50 ج.م</button></div>`;
}
function openActivation() {
  openModal('تفعيل نشر المتجر', `
    <div class="card" style="background:var(--bg);margin-bottom:16px">
      <b>خطة النشر الشهرية — 50 ج.م / 30 يوم</b>
      <p class="muted small" style="margin-top:6px">حوّل 50 ج.م إلى حساب اكتف اوردر ثم أدخل رقم المرجع. فريقنا يراجع ويفعّل خلال ساعات.</p>
    </div>
    <div class="f-grid">
      <div class="f-field full"><label>طريقة الدفع</label>
        <select id="actMethod"><option value="instapay">InstaPay — activetecno@instapay</option><option value="vodafone_cash">Vodafone Cash — 01011206670</option></select></div>
      <div class="f-field full"><label>رقم المرجع / آخر 4 أرقام من رقم التحويل</label><input id="actRef" placeholder="مثال: INSTA-99213" dir="ltr"></div>
    </div>
    <div class="m-actions"><button class="btn btn-teal" onclick="submitActivation()">إرسال طلب التفعيل</button></div>`);
}
async function submitActivation() {
  const method = $('#actMethod').value, reference = $('#actRef').value.trim();
  if (!reference) return toast('أدخل رقم المرجع', 'err');
  await api('/api/activation', { method: 'POST', body: { method, reference } });
  closeModal(); toast('تم إرسال طلب التفعيل — سنراجعه قريباً'); route();
}

// ---------- overview ----------
function assistantCard(d, products) {
  const tips = [];
  if (d.conversion < 3 && d.views > 50) tips.push(`معدل التحويل ${d.conversion}% أقل من المعتاد — جرّب كوبون ترحيبي أو قلّل خطوات صفحة الشراء.`);
  const low = products.filter(p => p.status === 'active' && p.stock > 0 && p.stock <= p.low_stock_threshold);
  if (low.length) tips.push(`مخزون منخفض: ${low.map(p => `«${p.name}» (${p.stock})`).join('، ')} — أعد التعبئة قبل نفاده.`);
  const out = products.filter(p => p.status === 'active' && p.stock <= 0);
  if (out.length) tips.push(`🚫 نفد: ${out.map(p => `«${p.name}»`).join('، ')} — يظهر للعملاء كغير متاح.`);
  if (d.top[0]) tips.push(`«${d.top[0].name}» هو الأكثر مبيعاً (${d.top[0].qty} قطعة) — فعّل عليه كروس سيل لرفع متوسط الطلب.`);
  if (d.statusCounts.new > 2) tips.push(`لديك ${d.statusCounts.new} طلبات جديدة لم تُؤكد — أرسل أكتف كونفيرم الآن لتقليل الإلغاء.`);
  if (!tips.length) tips.push('كل شيء يسير بشكل ممتاز — شارك رابط متجرك لزيادة الزيارات.');
  return `<div class="card" style="background:linear-gradient(90deg,oklch(.18 .012 260),oklch(.24 .012 260));color:#fff;margin-bottom:16px">
    <h3 style="color:#fff">مساعد اكتف الذكي</h3>
    <div style="display:grid;gap:8px">${tips.map(t => `<div style="background:rgba(255,255,255,.07);border-radius:11px;padding:10px 14px;font-size:13.5px;line-height:1.8">${t}</div>`).join('')}</div></div>`;
}
function drawChart(daily) {
  const cv = $('#revChart'); if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth || 520, H = 220;
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  const days = [];
  for (let i = 29; i >= 0; i--) { const dt = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10); days.push(dt); }
  const map = Object.fromEntries(daily.map(r => [r.day, r.revenue]));
  const vals = days.map(d => map[d] || 0);
  const max = Math.max(...vals, 100);
  const px = 34, py = 16, cw = (W - px * 2) / (days.length - 1), ch = H - py * 2 - 14;
  ctx.strokeStyle = '#E6ECF5'; ctx.fillStyle = '#63729A'; ctx.font = '10.5px IBM Plex Sans Arabic'; ctx.textAlign = 'left';
  for (let g = 0; g <= 3; g++) { const y = py + ch * g / 3; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(W - px, y); ctx.stroke(); ctx.fillText(Math.round(max * (3 - g) / 3), 2, y + 3); }
  const grad = ctx.createLinearGradient(0, py, 0, H - py);
  grad.addColorStop(0, 'rgba(0,191,175,.25)'); grad.addColorStop(1, 'rgba(0,191,175,0)');
  ctx.beginPath();
  vals.forEach((v, i) => { const x = px + cw * i, y = py + ch * (1 - v / max); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.strokeStyle = '#27cd27'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.lineTo(px + cw * (days.length - 1), py + ch); ctx.lineTo(px, py + ch); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
}

// ---------- orders ----------
let ordersCache = [], ordersView = 'board';
async function viewOrders() {
  const d = await api('/api/orders');
  ordersCache = d.orders;
  return shell(topBar('الطلبات', `${d.orders.length} طلب`,
    `<a class="btn btn-soft btn-sm" href="/api/orders-export.csv?status=confirmed" download>⬇️ تصدير شركات الشحن (CSV)</a>
     <div class="pill-tabs"><button class="${ordersView === 'board' ? 'on' : ''}" onclick="ordersView='board';route()">لوحة</button><button class="${ordersView === 'list' ? 'on' : ''}" onclick="ordersView='list';route()">قائمة</button></div>`) +
    `<div class="frow"><input type="search" id="ordQ" placeholder="🔍 ابحث برقم الطلب، الاسم أو الهاتف…" oninput="filterOrders(this.value)"></div>
     <div id="ordersWrap">${renderOrders(d.orders)}</div>`);
}
function renderOrders(orders) {
  if (!orders.length) return `<div class="card"><div class="empty"><div class="big">${ICONS.orders}</div><b>لا توجد طلبات بعد</b><p>شارك رابط متجرك وستظهر الطلبات هنا فوراً</p><a class="btn btn-teal" href="/s/${esc(STORE.slug)}" target="_blank">افتح متجرك</a></div></div>`;
  if (ordersView === 'list') {
    return `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>الطلب</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead><tbody>
      ${orders.map(o => `<tr><td class="mono">${esc(o.number)}</td><td><b>${esc(o.customer_name)}</b></td><td class="mono">${esc(o.customer_phone)}</td><td><b>${egp(o.total)}</b></td><td>${stChip(o.status)}</td><td class="muted small">${fmtDate(o.created_at)}</td><td><button class="btn btn-soft btn-sm" onclick="openOrder(${o.id})">التفاصيل</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  const cols = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  return `<div class="kb">${cols.map(s => {
    const list = orders.filter(o => o.status === s);
    return `<div class="kb-col"><div class="kb-col-head"><span>${STATUS[s].ar}</span><span class="n">${list.length}</span></div><div class="kb-cards">
      ${list.map(o => `<div class="kb-card" onclick="openOrder(${o.id})">
        <div class="num mono">${esc(o.number)}</div><div class="who">${esc(o.customer_name)} ${o.whatsapp_confirmed ? '<span class="wa-ok">· واتساب ✓</span>' : ''}</div>
        <div class="what">${esc(o.items.map(i => `${i.name} ×${i.qty}`).join('، ').slice(0, 60))}</div>
        <div class="amt">${egp(o.total)}</div>
        <div class="kb-move" onclick="event.stopPropagation()">${nextStatuses(s).map(n => `<button onclick="moveOrder(${o.id},'${n}')">${STATUS[n].ar}</button>`).join('')}</div>
      </div>`).join('') || '<div class="muted small" style="text-align:center;padding:14px">لا طلبات</div>'}</div></div>`;
  }).join('')}</div>`;
}
function nextStatuses(s) {
  return { new: ['confirmed', 'cancelled'], confirmed: ['shipped', 'cancelled'], shipped: ['delivered', 'returned'], delivered: ['returned'], cancelled: ['new'] }[s] || [];
}
async function moveOrder(id, status) {
  await api(`/api/orders/${id}/status`, { method: 'PUT', body: { status } });
  toast(`تم نقل الطلب إلى "${STATUS[status].ar}"`);
  route();
}
async function filterOrders(q) {
  const d = await api('/api/orders' + (q ? `?q=${encodeURIComponent(q)}` : ''));
  ordersCache = d.orders;
  $('#ordersWrap').innerHTML = renderOrders(d.orders);
}
async function openOrder(id) {
  const o = ordersCache.find(x => x.id === id) || (await api('/api/orders')).orders.find(x => x.id === id);
  const h = await api(`/api/orders/${id}/history`);
  const waText = encodeURIComponent(`أهلاً ${o.customer_name} 👋\nطلبك رقم ${o.number} من ${STORE.name} تم تأكيده ✅\nالإجمالي: ${egp(o.total)} — الدفع عند الاستلام\nشحنك في الطريق قريباً 🚚`);
  openModal(`الطلب <span class="mono">${esc(o.number)}</span>`, `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">${stChip(o.status)} ${o.whatsapp_confirmed ? '<span class="chip st-delivered">واتساب ✓</span>' : ''} <span class="muted small">${fmtDate(o.created_at)}</span></div>
    <div class="card" style="background:var(--bg);margin-bottom:14px">
      <b>${esc(o.customer_name)}</b> — <span class="mono">${esc(o.customer_phone)}</span><br>
      <span class="muted small">${esc(o.governorate)} — ${esc(o.customer_address)}</span>
      ${o.notes ? `<br><span class="small">📝 ${esc(o.notes)}</span>` : ''}
    </div>
    <table class="tbl"><tbody>${o.items.map(i => `<tr><td class="prod-cell"><img src="${esc(i.image)}">${esc(i.name)} ×${i.qty}</td><td><b>${egp(i.price * i.qty)}</b></td></tr>`).join('')}
      <tr><td>الشحن</td><td>${o.shipping ? egp(o.shipping) : 'مجاني'}</td></tr>
      ${o.discount ? `<tr><td>الخصم ${o.coupon_code ? `(${esc(o.coupon_code)})` : ''}</td><td>−${egp(o.discount)}</td></tr>` : ''}
      <tr><td><b>الإجمالي (COD)</b></td><td><b style="color:var(--teal)">${egp(o.total)}</b></td></tr></tbody></table>
    <h3 style="margin:16px 0 8px;font-size:14px">سجل الحالات</h3>
    <div class="muted small">${h.history.map(x => `${STATUS[x.status]?.ar || x.status} — ${fmtDate(x.created_at)}`).join(' ← ')}</div>
    <h3 style="margin:16px 0 8px;font-size:14px">أكتف كونفيرم — تأكيد واتساب برد 1 أو 2</h3>
    <div class="wa-msg-preview" id="waPreview">أهلاً ${esc(o.customer_name)} 👋
طلبك ${esc(o.number)} من ${esc(STORE.name)}
الإجمالي: ${egp(o.total)} — الدفع عند الاستلام

رد بـ 1 لتأكيد الطلب ✅
رد بـ 2 للإلغاء ❌</div>
    <div id="waSimStatus" class="muted small" style="margin:8px 0 0"></div>
    <div class="m-actions" style="flex-wrap:wrap">
      <button class="btn btn-teal btn-sm" style="flex:1" onclick="sendActiveConfirm(${o.id})">📨 إرسال تأكيد أكتف كونفيرم</button>
      <a class="btn btn-soft btn-sm" style="flex:1" href="https://wa.me/2${esc(o.customer_phone)}?text=${waText}" target="_blank" rel="noopener" onclick="markWa(${o.id})">فتح واتساب يدوياً</a>
      ${nextStatuses(o.status).map(n => `<button class="btn btn-navy btn-sm" style="flex:1" onclick="moveOrder(${o.id},'${n}');closeModal()">${STATUS[n].ar}</button>`).join('')}
      <button class="btn btn-danger-soft btn-sm" style="flex:1" onclick="blockPhone(${o.id})">🚫 حظر الرقم</button>
    </div>`);
}
async function markWa(id) { await api(`/api/orders/${id}/whatsapp`, { method: 'PUT' }); setTimeout(route, 400); }
async function sendActiveConfirm(id) {
  const st = $('#waSimStatus');
  st.innerHTML = '<span class="muted">جارٍ الإرسال عبر WhatsApp Cloud API…</span>';
  try {
    const d = await api(`/api/orders/${id}/whatsapp`, { method: 'PUT' });
    if (d.delivered) {
      st.innerHTML = '<span class="chip st-live">تم الإرسال فعلياً إلى واتساب العميل</span><p class="muted small" style="margin-top:8px">عند رد العميل بـ 1 أو 2 تتحدث حالة الطلب تلقائياً عبر الـ webhook.</p>';
    } else if (d.simulated) {
      st.innerHTML = '<span class="chip st-sim">وضع المحاكاة</span><p class="muted small" style="margin-top:8px">لم تُرسل رسالة فعلية — مفاتيح WhatsApp Cloud API غير مفعّلة بعد على المنصة. عند إدخالها من لوحة الإدارة يعمل الإرسال والردود التلقائية فوراً.</p>';
    } else {
      st.innerHTML = '<span class="chip st-rejected">فشل الإرسال</span><p class="muted small" style="margin-top:8px">' + esc(d.error || 'تحقق من مفاتيح WhatsApp') + '</p>';
    }
  } catch (_) { st.innerHTML = '<span class="chip st-rejected">تعذر الإرسال</span>'; }
  setTimeout(route, 1200);
}
async function blockPhone(id) {
  await api(`/api/orders/${id}/block-phone`, { method: 'POST' });
  toast('تم حظر الرقم — لن يستطيع الطلب مرة أخرى 🚫'); closeModal(); route();
}

// ---------- products ----------
async function viewProducts() {
  const d = await api('/api/products');
  return shell(topBar('المنتجات', `${d.products.length} منتج`, `<button class="btn btn-teal" onclick="openProduct()">+ منتج جديد</button>`) +
    (d.products.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>المنتج</th><th>السعر</th><th>المخزون</th><th>القسم</th><th>الحالة</th><th></th></tr></thead><tbody>
      ${d.products.map(p => { const img = JSON.parse(p.images || '[]')[0] || '';
        const stock = p.stock <= 0 ? '<span class="stock-out">نفد</span>' : p.stock <= p.low_stock_threshold ? `<span class="stock-low">${p.stock} قطع</span>` : `<span class="stock-ok">${p.stock}</span>`;
        return `<tr><td class="prod-cell">${img ? `<img src="${esc(img)}">` : ''}<b>${esc(p.name)}</b></td>
        <td><b>${egp(p.price)}</b>${p.compare_at_price ? `<br><s class="muted small">${egp(p.compare_at_price)}</s>` : ''}</td>
        <td>${stock}</td><td class="muted">${esc(p.category || '—')}</td>
        <td><span class="chip ${p.status === 'active' ? 'st-delivered' : 'st-returned'}">${p.status === 'active' ? 'نشط' : 'مسودة'}</span></td>
        <td style="white-space:nowrap"><button class="btn btn-soft btn-sm" onclick="openProduct(${p.id})">تعديل</button> <button class="btn btn-danger-soft btn-sm" onclick="delProduct(${p.id})">حذف</button></td></tr>`; }).join('')}</tbody></table></div>`
    : `<div class="card"><div class="empty"><div class="big">🛍️</div><b>لا منتجات بعد</b><p>أضف أول منتج وابدأ البيع اليوم</p><button class="btn btn-teal" onclick="openProduct()">+ أضف منتجك الأول</button></div></div>`));
}
let productImages = [];
async function openProduct(id) {
  const d = await api('/api/products');
  const p = id ? d.products.find(x => x.id === id) : null;
  productImages = p ? JSON.parse(p.images || '[]') : [];
  const others = d.products.filter(x => !p || x.id !== p.id);
  openModal(p ? 'تعديل المنتج' : 'منتج جديد', `
    <div class="f-grid">
      <div class="f-field full"><label>اسم المنتج *</label><input id="pName" value="${esc(p?.name || '')}" placeholder="مثال: عباية كلاسيك سوداء"></div>
      <div class="f-field full"><label>الوصف</label><textarea id="pDesc" rows="3" placeholder="وصف يقنع العميل بالشراء…">${esc(p?.description || '')}</textarea></div>
      <div class="f-field"><label>السعر (ج.م) *</label><input id="pPrice" type="number" min="1" value="${p?.price || ''}"></div>
      <div class="f-field"><label>السعر قبل الخصم<label class="hint">يظهر مشطوباً</label></label><input id="pCompare" type="number" min="0" value="${p?.compare_at_price || ''}"></div>
      <div class="f-field"><label>المخزون</label><input id="pStock" type="number" min="0" value="${p?.stock ?? 10}"></div>
      <div class="f-field"><label>حد تنبيه النفاد</label><input id="pLow" type="number" min="0" value="${p?.low_stock_threshold ?? 3}"></div>
      <div class="f-field"><label>القسم</label><input id="pCat" value="${esc(p?.category || '')}" placeholder="مثال: عبايات"></div>
      <div class="f-field"><label>الحالة</label><select id="pStatus"><option value="active" ${p?.status !== 'draft' ? 'selected' : ''}>نشط</option><option value="draft" ${p?.status === 'draft' ? 'selected' : ''}>مسودة</option></select></div>
      <div class="f-field full"><label>كروس سيل — منتج يُقترح معه</label><select id="pUpsell"><option value="">بدون</option>${others.map(o => `<option value="${o.id}" ${p?.upsell_product_id === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select></div>
      <div class="f-field full"><label>الصور</label>
        <div id="pImgs" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"></div>
        <input type="file" id="pFile" accept="image/*" multiple>
        <label class="hint">أو أضف رابط صورة:</label>
        <div style="display:flex;gap:8px"><input id="pImgUrl" placeholder="https://…" dir="ltr"><button class="btn btn-soft btn-sm" type="button" onclick="addImgUrl()">إضافة</button></div>
      </div>
    </div>
    <div class="m-actions"><button class="btn btn-teal" onclick="saveProduct(${p?.id || 'null'})">${p ? 'حفظ التعديلات' : 'إضافة المنتج'}</button></div>`,
    () => {
      drawImgs();
      $('#pFile').addEventListener('change', async e => {
        for (const f of e.target.files) {
          const dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
          try { const up = await api('/api/upload', { method: 'POST', body: { dataUrl } }); productImages.push(up.url); } catch { }
        }
        drawImgs();
      });
    });
}
function drawImgs() {
  $('#pImgs').innerHTML = productImages.map((u, i) => `<div style="position:relative"><img src="${esc(u)}" style="width:64px;height:64px;border-radius:12px;object-fit:cover"><button onclick="productImages.splice(${i},1);drawImgs()" style="position:absolute;top:-6px;inset-inline-end:-6px;background:var(--red);color:#fff;border:0;border-radius:50%;width:20px;height:20px;font-size:11px">✕</button></div>`).join('');
}
function addImgUrl() { const v = $('#pImgUrl').value.trim(); if (v) { productImages.push(v); $('#pImgUrl').value = ''; drawImgs(); } }
async function saveProduct(id) {
  const body = {
    name: $('#pName').value.trim(), description: $('#pDesc').value.trim(),
    price: +$('#pPrice').value, compare_at_price: +$('#pCompare').value || null,
    stock: +$('#pStock').value, low_stock_threshold: +$('#pLow').value,
    category: $('#pCat').value.trim(), status: $('#pStatus').value,
    upsell_product_id: +$('#pUpsell').value || null, images: productImages
  };
  if (!body.name || !(body.price > 0)) return toast('أدخل الاسم والسعر', 'err');
  await api(id ? `/api/products/${id}` : '/api/products', { method: id ? 'PUT' : 'POST', body });
  closeModal(); toast(id ? 'تم حفظ المنتج' : 'تمت إضافة المنتج'); route();
}
async function delProduct(id) {
  if (!confirm('حذف هذا المنتج نهائياً؟')) return;
  await api(`/api/products/${id}`, { method: 'DELETE' }); toast('تم الحذف'); route();
}

// ---------- abandoned carts ----------
async function viewCarts() {
  const d = await api('/api/carts');
  const active = d.carts.filter(c => !c.recovered);
  return shell(topBar('السلات المتروكة', `${active.length} سلة لم تكتمل`) +
    (d.carts.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>المنتجات</th><th>القيمة</th><th>الهاتف</th><th>آخر تحديث</th><th></th></tr></thead><tbody>
      ${d.carts.map(c => `<tr style="${c.recovered ? 'opacity:.5' : ''}">
        <td>${c.items.map(i => `${esc(i.name)} ×${i.qty}`).join('، ')}</td>
        <td><b>${egp(c.items.reduce((s, i) => s + i.price * i.qty, 0))}</b></td>
        <td class="mono">${esc(c.customer_phone || '—')}</td>
        <td class="muted small">${fmtDate(c.updated_at)}</td>
        <td style="white-space:nowrap">${c.recovered ? '<span class="chip st-delivered">تم الاسترجاع</span>' : `
          ${c.customer_phone ? `<a class="btn btn-teal btn-sm" target="_blank" rel="noopener" href="https://wa.me/2${esc(c.customer_phone)}?text=${encodeURIComponent(`أهلاً 👋 لاحظنا أنك تركت بعض المنتجات في سلتك من ${STORE.name} — أكمل طلبك الآن قبل نفاد الكمية 🛒`)}">تذكير واتساب</a>` : ''}
          <button class="btn btn-soft btn-sm" onclick="markRecovered(${c.id})">تم الاسترجاع</button>`}</td></tr>`).join('')}</tbody></table></div>
      <div class="card"><h3>💡 نصيحة</h3><p class="muted small">التواصل خلال أول ساعة من ترك السلة يرفع الاسترجاع 3 أضعاف. أرسل تذكير واتساب بخصم بسيط عبر كوبون.</p></div>`
    : `<div class="card"><div class="empty"><div class="big">${ICONS.carts}</div><b>لا سلات متروكة</b><p>عندما يضيف عميل منتجات ولا يكمل الشراء ستظهر سلته هنا مع زر استرجاع واتساب</p></div></div>`));
}
async function markRecovered(id) { await api(`/api/carts/${id}/recovered`, { method: 'PUT' }); toast('تم تعليم السلة كمسترجعة'); route(); }

// ---------- customers ----------
async function viewCustomers() {
  const d = await api('/api/customers');
  return shell(topBar('العملاء', `${d.customers.length} عميل`) +
    (d.customers.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>العميل</th><th>الهاتف</th><th>الطلبات</th><th>إجمالي الإنفاق</th><th>ملغاة</th><th>آخر طلب</th><th></th></tr></thead><tbody>
      ${d.customers.map(c => `<tr><td><b>${esc(c.name)}</b></td><td class="mono">${esc(c.phone)}</td><td>${c.orders_count}</td><td><b>${egp(c.total_spent)}</b></td>
      <td>${c.cancelled ? `<span class="stock-out">${c.cancelled}</span>` : '0'}</td><td class="muted small">${fmtDate(c.last_order)}</td>
      <td>${c.blocked ? '<span class="chip st-cancelled">محظور</span>' : `<button class="btn btn-danger-soft btn-sm" onclick="blockCustomer('${esc(c.phone)}')">حظر</button>`}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="card"><div class="empty"><div class="big">👥</div><b>لا عملاء بعد</b><p>كل عميل يطلب من متجرك يظهر هنا مع سجل إنفاقه</p></div></div>`));
}
async function blockCustomer(phone) { await api('/api/blocked', { method: 'POST', body: { phone, reason: 'حظر من قائمة العملاء' } }); toast('تم الحظر 🚫'); route(); }

// ---------- coupons ----------
async function viewCoupons() {
  const d = await api('/api/coupons');
  return shell(topBar('الكوبونات', '', `<button class="btn btn-teal" onclick="openCoupon()">+ كوبون جديد</button>`) +
    (d.coupons.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>الخصم</th><th>حد أدنى</th><th>الاستخدام</th><th>الحالة</th><th></th></tr></thead><tbody>
      ${d.coupons.map(c => `<tr><td class="mono"><b>${esc(c.code)}</b></td><td>${c.type === 'percent' ? c.value + '%' : egp(c.value)}</td><td>${c.min_order ? egp(c.min_order) : '—'}</td>
      <td>${c.used_count}${c.usage_limit ? ' / ' + c.usage_limit : ''}</td>
      <td><span class="chip ${c.active ? 'st-delivered' : 'st-returned'}">${c.active ? 'نشط' : 'موقوف'}</span></td>
      <td style="white-space:nowrap"><button class="btn btn-soft btn-sm" onclick="toggleCoupon(${c.id},${c.active ? 0 : 1})">${c.active ? 'إيقاف' : 'تفعيل'}</button> <button class="btn btn-danger-soft btn-sm" onclick="delCoupon(${c.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>`
    : `<div class="card"><div class="empty"><div class="big">🎟️</div><b>لا كوبونات بعد</b><p>الكوبونات تحفّز الطلب الأول وتزيد التحويل</p><button class="btn btn-teal" onclick="openCoupon()">+ أنشئ أول كوبون</button></div></div>`));
}
function openCoupon() {
  openModal('كوبون جديد', `<div class="f-grid">
    <div class="f-field"><label>الكود *</label><input id="cCode" placeholder="SALE20" dir="ltr" style="text-transform:uppercase"></div>
    <div class="f-field"><label>النوع</label><select id="cType"><option value="percent">نسبة مئوية %</option><option value="fixed">مبلغ ثابت ج.م</option></select></div>
    <div class="f-field"><label>القيمة *</label><input id="cValue" type="number" min="1"></div>
    <div class="f-field"><label>حد أدنى للطلب (ج.م)</label><input id="cMin" type="number" min="0" value="0"></div>
    <div class="f-field"><label>حد الاستخدام (0 = بلا حد)</label><input id="cLimit" type="number" min="0" value="0"></div>
  </div><div class="m-actions"><button class="btn btn-teal" onclick="saveCoupon()">إنشاء الكوبون</button></div>`);
}
async function saveCoupon() {
  await api('/api/coupons', { method: 'POST', body: { code: $('#cCode').value, type: $('#cType').value, value: +$('#cValue').value, min_order: +$('#cMin').value, usage_limit: +$('#cLimit').value } });
  closeModal(); toast('تم إنشاء الكوبون 🎟️'); route();
}
async function toggleCoupon(id, active) { await api(`/api/coupons/${id}`, { method: 'PUT', body: { active } }); route(); }
async function delCoupon(id) { await api(`/api/coupons/${id}`, { method: 'DELETE' }); toast('تم الحذف'); route(); }

// ---------- shipping ----------
async function viewShipping() {
  const d = await api('/api/shipping');
  return shell(topBar('مناطق الشحن', 'حدد سعر التوصيل لكل محافظة') +
    `<div class="card"><h3>+ منطقة جديدة</h3><div class="f-grid">
      <div class="f-field"><label>اسم المنطقة *</label><input id="sName" placeholder="مثال: القاهرة والجيزة"></div>
      <div class="f-field"><label>المحافظات (مفصولة بفاصلة)</label><input id="sGovs" placeholder="القاهرة,الجيزة"></div>
      <div class="f-field"><label>سعر الشحن (ج.م)</label><input id="sPrice" type="number" min="0" value="50"></div>
      <div class="f-field"><label>شحن مجاني فوق (ج.م — 0 لتعطيل)</label><input id="sFree" type="number" min="0" value="0"></div>
    </div><div class="m-actions"><button class="btn btn-teal" onclick="saveZone()">إضافة المنطقة</button></div></div>
    ${d.zones.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>المنطقة</th><th>المحافظات</th><th>السعر</th><th>مجاني فوق</th><th></th></tr></thead><tbody>
      ${d.zones.map(z => `<tr><td><b>${esc(z.name)}</b></td><td class="muted small">${esc(z.governorates)}</td><td>${egp(z.price)}</td><td>${z.free_over ? egp(z.free_over) : '—'}</td><td><button class="btn btn-danger-soft btn-sm" onclick="delZone(${z.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>` : ''}
    <div class="card"><h3>الشحن المجاني العام</h3><div class="f-grid"><div class="f-field"><label>شحن مجاني لكل الطلبات فوق (ج.م — 0 لتعطيل)</label><input id="freeOver" type="number" min="0" value="${STORE.free_shipping_over || 0}"></div></div>
    <div class="m-actions"><button class="btn btn-teal" onclick="saveFreeOver()">حفظ</button></div></div>`);
}
async function saveZone() {
  const name = $('#sName').value.trim(); if (!name) return toast('أدخل اسم المنطقة', 'err');
  await api('/api/shipping', { method: 'POST', body: { name, governorates: $('#sGovs').value, price: +$('#sPrice').value, free_over: +$('#sFree').value } });
  toast('تمت إضافة المنطقة 🚚'); route();
}
async function delZone(id) { await api(`/api/shipping/${id}`, { method: 'DELETE' }); route(); }
async function saveFreeOver() { await api('/api/store', { method: 'PUT', body: { free_shipping_over: +$('#freeOver').value } }); toast('تم الحفظ ✅'); route(); }

// ---------- blocked ----------
async function viewBlocked() {
  const d = await api('/api/blocked');
  return shell(topBar('الأرقام المحظورة', 'أرقام الطلبات الوهمية لا تستطيع الطلب من متجرك') +
    `<div class="card"><h3>+ حظر رقم</h3><div class="frow"><input id="bPhone" placeholder="01xxxxxxxxx" dir="ltr"><input id="bReason" placeholder="السبب (اختياري)"><button class="btn btn-teal" onclick="addBlocked()">حظر</button></div></div>
    ${d.blocked.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>الرقم</th><th>السبب</th><th>التاريخ</th><th></th></tr></thead><tbody>
      ${d.blocked.map(b => `<tr><td class="mono"><b>${esc(b.phone)}</b></td><td class="muted">${esc(b.reason || '—')}</td><td class="muted small">${fmtDate(b.created_at)}</td><td><button class="btn btn-soft btn-sm" onclick="unblock(${b.id})">إلغاء الحظر</button></td></tr>`).join('')}</tbody></table></div>`
    : `<div class="card"><div class="empty"><div class="big">🚫</div><b>لا أرقام محظورة</b><p>احظر أرقام الطلبات الوهمية من هنا أو من صفحة الطلب مباشرة</p></div></div>`}`);
}
async function addBlocked() {
  const phone = $('#bPhone').value.trim(); if (!phone) return;
  await api('/api/blocked', { method: 'POST', body: { phone, reason: $('#bReason').value.trim() } }); toast('تم حظر الرقم 🚫'); route();
}
async function unblock(id) { await api(`/api/blocked/${id}`, { method: 'DELETE' }); toast('تم إلغاء الحظر'); route(); }

// ---------- customize ----------
let custDirty = false;
async function viewCustomize() {
  const d = await api('/api/themes');
  const cur = STORE.theme_id;
  const settings = JSON.parse(STORE.theme_settings || '{}');
  return shell(topBar('تخصيص المتجر', 'كل تعديل يظهر فوراً في المعاينة') +
    `<div class="cust"><div>
    <div class="card"><h3>القالب</h3><div class="theme-pick">
      ${d.themes.map(t => `<div class="theme-opt ${t.id === cur ? 'on' : ''}" onclick="pickTheme('${t.id}')">
        <div class="dots"><span style="background:${t.config.primary}"></span><span style="background:${t.config.accent}"></span><span style="background:${t.config.surface}"></span></div>
        <b>${esc(t.name_ar)}</b><small>${esc(t.category)}${t.is_premium ? ` · ${egp(t.price)}` : ' · مجاني'}</small></div>`).join('')}
    </div></div>
    <div class="card"><h3>الألوان</h3>
      <div class="color-row"><label>اللون الأساسي</label><input type="color" id="cPrimary" value="${settings.primary || d.themes.find(t => t.id === cur)?.config.primary || '#141924'}"></div>
      <div class="color-row"><label>لون الأزرار والتمييز</label><input type="color" id="cAccent" value="${settings.accent || d.themes.find(t => t.id === cur)?.config.accent || '#27cd27'}"></div>
      <button class="btn btn-soft btn-sm" onclick="previewColors()">معاينة فورية</button>
    </div>
    <div class="card"><h3>إعلان أعلى المتجر</h3>
      <div class="f-field"><input id="cAnnounce" value="${esc(STORE.announcement || '')}" placeholder="مثال: شحن مجاني فوق 600 ج.م ⚡"></div>
      <div class="m-actions"><button class="btn btn-teal" onclick="saveCustomize()">حفظ ونشر التغييرات</button></div>
    </div></div>
    <div class="cust-preview"><div class="bar"><span>معاينة حية — ${esc(STORE.name)}</span><span class="mono" style="direction:ltr">/s/${esc(STORE.slug)}</span></div>
      <iframe id="custFrame" src="/s/${esc(STORE.slug)}?t=${Date.now()}"></iframe></div>
    </div>`);
}
let pendingTheme = null;
function pickTheme(id) {
  pendingTheme = id;
  document.querySelectorAll('.theme-opt').forEach(el => el.classList.remove('on'));
  event.currentTarget.classList.add('on');
  custDirty = true;
}
async function previewColors() { custDirty = true; await saveCustomize(true); }
async function saveCustomize(silent) {
  const body = { announcement: $('#cAnnounce').value };
  if (pendingTheme) body.theme_id = pendingTheme;
  const existing = JSON.parse(STORE.theme_settings || '{}');
  body.theme_settings = { ...existing, primary: $('#cPrimary').value, accent: $('#cAccent').value };
  const d = await api('/api/store', { method: 'PUT', body });
  STORE = d.store; pendingTheme = null;
  $('#custFrame').src = `/s/${STORE.slug}?t=${Date.now()}`;
  if (!silent) toast('تم حفظ التخصيص ونشره 🎨');
}

// ---------- tracking ----------
async function viewTracking() {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  const px = settings.pixels || {};
  return shell(topBar('البيكسلات والتتبع', 'اربط منصات الإعلانات بمتجرك') +
    `<div class="card"><h3>بيكسلات المنصات</h3><div class="f-grid">
      <div class="f-field"><label>Meta Pixel ID</label><input id="pxMeta" dir="ltr" value="${esc(px.meta || '')}" placeholder="1234567890"></div>
      <div class="f-field"><label>TikTok Pixel ID</label><input id="pxTiktok" dir="ltr" value="${esc(px.tiktok || '')}"></div>
      <div class="f-field"><label>Snapchat Pixel ID</label><input id="pxSnap" dir="ltr" value="${esc(px.snap || '')}"></div>
      <div class="f-field"><label>Google Tag ID</label><input id="pxGoogle" dir="ltr" value="${esc(px.google || '')}" placeholder="G-XXXXXXX"></div>
      <div class="f-field full"><label>Meta Conversions API Token</label><input id="pxCapi" dir="ltr" value="${esc(px.capi || '')}"><label class="hint">يُرسل أحداث الشراء من الخادم مباشرة لدقة أعلى في الاستهداف</label></div>
    </div><div class="m-actions"><button class="btn btn-teal" onclick="savePixels()">حفظ إعدادات التتبع</button></div></div>
    <div class="card"><h3>📡 الأحداث المتتبعة تلقائياً</h3><p class="muted small">PageView · ViewContent · AddToCart · InitiateCheckout · Purchase — تُسجَّل لكل زائر وتظهر في فانل التحليلات.</p></div>`);
}
async function savePixels() {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  settings.pixels = { meta: $('#pxMeta').value.trim(), tiktok: $('#pxTiktok').value.trim(), snap: $('#pxSnap').value.trim(), google: $('#pxGoogle').value.trim(), capi: $('#pxCapi').value.trim() };
  const d = await api('/api/store', { method: 'PUT', body: { theme_settings: settings } });
  STORE = d.store; toast('تم حفظ إعدادات التتبع');
}

// ---------- team ----------
async function viewTeam() {
  const d = await api('/api/team');
  return shell(topBar('الفريق والصلاحيات', '') +
    `<div class="card"><h3>+ إضافة عضو</h3><div class="frow"><input id="tName" placeholder="الاسم"><input id="tEmail" placeholder="البريد الإلكتروني" dir="ltr"><select id="tRole"><option value="staff">موظف</option><option value="owner">مالك</option></select><button class="btn btn-teal" onclick="addMember()">إضافة</button></div>
    <p class="muted small">الموظف يدير الطلبات والمنتجات فقط. المالك له صلاحية كاملة.</p></div>
    <div class="card tbl-wrap"><table class="tbl"><thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th></th></tr></thead><tbody>
    ${d.members.map(m => `<tr><td><b>${esc(m.name)}</b></td><td class="mono">${esc(m.email)}</td><td><span class="chip ${m.role === 'owner' ? 'st-shipped' : 'st-new'}">${m.role === 'owner' ? 'مالك' : 'موظف'}</span></td>
    <td>${m.role !== 'owner' ? `<button class="btn btn-danger-soft btn-sm" onclick="delMember(${m.id})">إزالة</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`);
}
async function addMember() {
  const name = $('#tName').value.trim(), email = $('#tEmail').value.trim();
  if (!name || !email) return toast('أدخل الاسم والبريد', 'err');
  await api('/api/team', { method: 'POST', body: { name, email, role: $('#tRole').value } }); toast('تمت إضافة العضو 🤝'); route();
}
async function delMember(id) { await api(`/api/team/${id}`, { method: 'DELETE' }); route(); }

// ---------- settings ----------
async function viewSettings() {
  return shell(topBar('إعدادات المتجر', '') +
    `<div class="card"><h3>البيانات الأساسية</h3><div class="f-grid">
      <div class="f-field"><label>اسم المتجر</label><input id="stName" value="${esc(STORE.name)}"></div>
      <div class="f-field"><label>رابط المتجر</label><div style="display:flex;align-items:center;gap:6px"><span class="muted mono small">/s/</span><input id="stSlug" dir="ltr" value="${esc(STORE.slug)}"></div></div>
      <div class="f-field full"><label>وصف المتجر</label><textarea id="stDesc" rows="2">${esc(STORE.description || '')}</textarea></div>
      <div class="f-field"><label>هاتف المتجر</label><input id="stPhone" dir="ltr" value="${esc(STORE.phone || '')}"></div>
      <div class="f-field"><label>رقم واتساب (بكود الدولة)</label><input id="stWa" dir="ltr" value="${esc(STORE.whatsapp || '')}" placeholder="2010xxxxxxxx"></div>
    </div><div class="m-actions"><button class="btn btn-teal" onclick="saveSettings()">حفظ الإعدادات</button></div></div>
    <div class="card"><h3>🌐 ربط دومين خاص</h3><p class="muted small">اربط نطاقك الخاص (مثل store.com) بمتجرك لروابط أنظف وثقة أعلى. أضف سجل CNAME يشير إلى <span class="mono">stores.activetecno.software</span> ثم أدخل النطاق:</p>
      <div class="frow" style="margin-top:10px"><input placeholder="www.mystore.com" dir="ltr"><button class="btn btn-soft" onclick="toast('تم إرسال طلب ربط النطاق — سيظهر التحقق خلال 24 ساعة ✅')">ربط النطاق</button></div></div>`);
}
async function saveSettings() {
  const d = await api('/api/store', { method: 'PUT', body: { name: $('#stName').value.trim(), slug: $('#stSlug').value.trim(), description: $('#stDesc').value.trim(), phone: $('#stPhone').value.trim(), whatsapp: $('#stWa').value.trim() } });
  STORE = d.store; toast('تم حفظ الإعدادات ✅'); route();
}

// ---------- payment gateways (production wiring) ----------
async function viewPayments() {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  const pm = settings.payments || { cod: true, online: false };
  let integ = { paymob: { configured: false, own_keys: false }, whatsapp: { configured: false } };
  try { integ = await api('/api/store/integrations'); } catch (_) {}
  const live = integ.paymob.configured;
  const paymobStatus = live
    ? '<span class="chip st-live">متصل — مدفوعات حقيقية</span>'
    : '<span class="chip st-sim">وضع المحاكاة — أضف المفاتيح لتفعيل الدفع الحقيقي</span>';
  const waStatus = integ.whatsapp.configured
    ? '<span class="chip st-live">متصل — إرسال حقيقي</span>'
    : '<span class="chip st-sim">وضع المحاكاة</span>';
  return shell(topBar('بوابات الدفع', 'تحكم في طرق الدفع المتاحة لعملائك') +
    `<div class="integ-row">
      <div class="integ-ic">${I('cash')}</div>
      <div style="flex:1;min-width:220px"><h3>الدفع عند الاستلام (COD) <span class="chip ${pm.cod ? 'st-live' : 'st-returned'}">${pm.cod ? 'مفعّل' : 'موقوف'}</span></h3>
      <p class="muted small">الطريقة الأساسية في السوق المصري — العميل يدفع عند التسليم.</p></div>
      <button class="btn ${pm.cod ? 'btn-danger-soft' : 'btn-teal'}" onclick="toggleCod(${pm.cod ? 0 : 1})">${pm.cod ? 'إيقاف' : 'تفعيل'}</button></div>
    <div class="integ-row">
      <div class="integ-ic">${I('payments')}</div>
      <div style="flex:1;min-width:220px"><h3>Paymob — بطاقات ومحافظ ${paymobStatus}</h3>
      <p class="muted small">${live
        ? (integ.paymob.own_keys ? 'متصل بمفاتيح حسابك في Paymob. المدفوعات تُنفَّذ عبر بوابة Paymob الفعلية وتظهر في حسابك.' : 'متصل عبر بوابة المنصة المركزية.')
        : 'البوابة تعمل في وضع المحاكاة داخلياً حتى تُدخل مفاتيح حسابك في Paymob — لا تظهر أي إشارة لذلك لعملائك.'}</p>
      ${pm.online ? '<p class="small" style="margin:6px 0 0;color:var(--green)">يظهر للعملاء في صفحة إتمام الطلب كـ«بطاقة بنكية / محفظة إلكترونية».</p>' : ''}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-soft" onclick="editPaymobKeys()">${integ.paymob.own_keys ? 'تحديث المفاتيح' : 'إضافة مفاتيح Paymob'}</button>
        <button class="btn ${pm.online ? 'btn-soft' : 'btn-teal'}" onclick="toggleOnline(${pm.online ? 0 : 1})">${pm.online ? 'إخفاء من المتجر' : 'إظهار في المتجر'}</button>
      </div></div>
    <div class="integ-row">
      <div class="integ-ic">${I('chat')}</div>
      <div style="flex:1;min-width:220px"><h3>WhatsApp Cloud API — أكتف كونفيرم ${waStatus}</h3>
      <p class="muted small">${integ.whatsapp.configured
        ? 'رسائل تأكيد الطلبات تُرسل فعلياً عبر WhatsApp Cloud API، وردود العملاء (1 للتأكيد / 2 للإلغاء) تحدّث حالة الطلب تلقائياً عبر الـ webhook.'
        : 'تُدار المفاتيح مركزياً من لوحة إدارة المنصة (WHATSAPP_TOKEN و WHATSAPP_PHONE_NUMBER_ID). عند توفرها يتحول الإرسال للوضع الحقيقي تلقائياً.'}</p></div>
    </div>
    <div class="card"><h3>${I('shield')}أمان المفاتيح</h3><p class="muted small">تُخزَّن المفاتيح مشفّرة على الخادم ولا تظهر بعد الحفظ. تقدر تحدّثها أو تمسحها في أي وقت، وأولوية العمل: مفاتيح متجرك ← مفاتيح المنصة ← وضع المحاكاة.</p></div>`);
}
async function toggleCod(on) {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  settings.payments = { ...(settings.payments || {}), cod: !!on };
  const d = await api('/api/store', { method: 'PUT', body: { theme_settings: settings } });
  STORE = d.store; toast(on ? 'تم تفعيل الدفع عند الاستلام' : 'تم إيقاف COD'); route();
}
async function toggleOnline(on) {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  settings.payments = { ...(settings.payments || {}), cod: settings.payments?.cod !== false, online: !!on };
  const d = await api('/api/store', { method: 'PUT', body: { theme_settings: settings } });
  STORE = d.store; toast(on ? 'الدفع بالبطاقة ظاهر الآن في متجرك' : 'تم إخفاء الدفع بالبطاقة'); route();
}
function editPaymobKeys() {
  openModal('مفاتيح Paymob', `
    <div class="f-grid">
      <div class="f-field full"><label>API Key</label><input id="pmKey" dir="ltr" placeholder="ZXlKaGJHY2lP…" autocomplete="off"><span class="hint">من لوحة Paymob: Settings → Account info → API Key</span></div>
      <div class="f-field"><label>Integration ID (Card)</label><input id="pmInt" dir="ltr" inputmode="numeric" placeholder="4xxxxxx"><span class="hint">Developers → Payment integrations</span></div>
      <div class="f-field"><label>iFrame ID</label><input id="pmIframe" dir="ltr" inputmode="numeric" placeholder="8xxxx"><span class="hint">Developers → iFrames</span></div>
    </div>
    <p class="muted small" style="margin-top:12px">بعد الحفظ تعمل المدفوعات الحقيقية فوراً على حسابك — اترك الحقول فارغة واحفظ لإزالة مفاتيحك والعودة لبوابة المنصة.</p>
    <div class="m-actions"><button class="btn btn-teal" onclick="savePaymobKeys()">حفظ وتفعيل</button></div>`);
}
async function savePaymobKeys() {
  const body = { PAYMOB_API_KEY: $('#pmKey').value.trim(), PAYMOB_INTEGRATION_ID: $('#pmInt').value.trim(), PAYMOB_IFRAME_ID: $('#pmIframe').value.trim() };
  const allEmpty = !body.PAYMOB_API_KEY && !body.PAYMOB_INTEGRATION_ID && !body.PAYMOB_IFRAME_ID;
  const allFull = body.PAYMOB_API_KEY && body.PAYMOB_INTEGRATION_ID && body.PAYMOB_IFRAME_ID;
  if (!allEmpty && !allFull) return toast('أدخل المفاتيح الثلاثة كاملة، أو اتركها كلها فارغة للإزالة', 'err');
  const d = await api('/api/store/payments-config', { method: 'PUT', body });
  closeModal();
  if (d.configured) {
    const settings = JSON.parse(STORE.theme_settings || '{}');
    settings.payments = { ...(settings.payments || {}), cod: settings.payments?.cod !== false, online: true };
    const r = await api('/api/store', { method: 'PUT', body: { theme_settings: settings } });
    STORE = r.store; toast('تم الربط — المدفوعات الحقيقية مفعّلة الآن في متجرك');
  } else { toast('تمت إزالة المفاتيح'); }
  route();
}

// ---------- courier integrations ----------
async function viewCouriers() {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  const cr = settings.couriers || {};
  const card = (id, name, ic, desc) => `<div class="card" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
    <div style="font-size:30px">${ic}</div>
    <div style="flex:1;min-width:200px"><h3 style="margin:0 0 4px">${name} ${cr[id] ? '<span class="chip st-delivered">متصل</span>' : '<span class="chip st-returned">غير متصل</span>'}</h3>
    <p class="muted small" style="margin:0">${desc}</p></div>
    <button class="btn ${cr[id] ? 'btn-danger-soft' : 'btn-teal'}" onclick="toggleCourier('${id}', ${cr[id] ? 0 : 1}, '${name}')">${cr[id] ? 'فصل' : 'ربط'}</button></div>`;
  return shell(topBar('شركات الشحن', 'اربط شركة الشحن وأرسل الطلبات المؤكدة بضغطة') +
    card('bosta', 'Bosta', '🟣', 'إرسال الطلبات المؤكدة تلقائياً إلى بوسطة مع تتبع الحالة.')
    + card('mylerz', 'MylerZ', '🔵', 'شحن سريع داخل القاهرة والجيزة مع استلام من باب المتجر.')
    + card('aramex', '🔴', 'تغطية كل المحافظات وشحن دولي.')
    + `<div class="card"><h3>⬇️ تصدير يدوي</h3><p class="muted small">بدون ربط مباشر، صدّر الطلبات المؤكدة بصيغة CSV جاهزة للرفع في لوحة أي شركة شحن.</p>
      <a class="btn btn-navy" href="/api/orders-export.csv?status=confirmed" download>تصدير الطلبات المؤكدة (CSV)</a></div>
    <div class="card"><h3>تصدير مباشر</h3><p class="muted small">التصدير اليدوي بصيغة CSV يعمل الآن ومتوافق مع لوحات شركات الشحن. الإرسال التلقائي عبر API كل شركة يُفعَّل من لوحة إدارة المنصة عند إدخال مفاتيحها.</p></div>`);
}
async function toggleCourier(id, on, name) {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  settings.couriers = { ...(settings.couriers || {}), [id]: !!on };
  const d = await api('/api/store', { method: 'PUT', body: { theme_settings: settings } });
  STORE = d.store; toast(on ? `تم ربط ${name} 📮` : `تم فصل ${name}`); route();
}

// ---------- router ----------
async function viewOverview() {
  const d = await api('/api/analytics?days=30');
  const prods = await api('/api/products');
  const hasProducts = prods.products.length > 0;
  const checklist = [
    { done: hasProducts, label: 'أضف أول منتج لمتجرك', go: 'products' },
    { done: Object.keys(JSON.parse(STORE.theme_settings || '{}')).length > 0, label: 'خصّص ألوان وقالب متجرك', go: 'customize' },
    { done: !!STORE.phone, label: 'أكمل بيانات متجرك (هاتف، وصف)', go: 'settings' },
    { done: !!STORE.is_published, label: 'فعّل النشر واستقبل الطلبات', go: null }
  ];
  const allDone = checklist.every(c => c.done);
  const funnelMax = Math.max(d.funnel.page_view, 1);
  const funnelSteps = [['page_view', 'زيارة المتجر'], ['product_view', 'مشاهدة منتج'], ['add_to_cart', 'إضافة للسلة'], ['begin_checkout', 'بدء الشراء'], ['purchase', 'طلب مكتمل']];
  const html = shell(topBar('نظرة عامة', `أهلاً ${esc(ME.user.name)}`) +
    activationBanner() +
    (allDone ? '' : `<div class="card"><h3>خطوات إطلاق متجرك</h3><div class="check">${checklist.map(c => `<div class="check-item ${c.done ? 'done' : ''}"><span class="tick">✓</span>${c.label}${!c.done && c.go ? `<button class="btn btn-soft btn-sm go" onclick="go('${c.go}')">ابدأ</button>` : ''}</div>`).join('')}</div></div>`) +
    `<div class="stat-grid">
      <div class="stat"><span class="ic">${ICONS.payments}</span><div class="lbl">الإيرادات (30 يوم)</div><div class="val">${egp(d.revenue)}</div></div>
      <div class="stat"><span class="ic">${ICONS.orders}</span><div class="lbl">الطلبات</div><div class="val">${d.orders}</div></div>
      <div class="stat"><span class="ic">${ICONS.eye}</span><div class="lbl">زيارات المتجر</div><div class="val">${d.views}</div></div>
      <div class="stat"><span class="ic">${ICONS.overview}</span><div class="lbl">معدل التحويل</div><div class="val">${d.conversion}<small>%</small></div></div>
      <div class="stat"><span class="ic">${ICONS.coupons}</span><div class="lbl">متوسط قيمة الطلب</div><div class="val">${egp(d.aov)}</div></div>
    </div>
    ${assistantCard(d, prods.products)}
    <div class="grid-2">
      <div class="card chart-card"><h3>الإيرادات اليومية <span class="hint">آخر 30 يوم</span></h3><canvas id="revChart"></canvas></div>
      <div class="card"><h3>فانل المبيعات</h3><div class="funnel">
        ${funnelSteps.map(([k, l]) => `<div class="f-step"><span>${l}</span><div class="f-bar" style="width:${Math.max(6, 100 * d.funnel[k] / funnelMax)}%">${d.funnel[k]}</div><span class="pct">${d.funnel.page_view ? Math.round(100 * d.funnel[k] / d.funnel.page_view) : 0}%</span></div>`).join('')}
      </div></div>
    </div>
    <div class="grid-2" style="margin-top:16px">
      <div class="card"><h3>🏆 الأكثر مبيعاً</h3>${d.top.length ? `<table class="tbl"><tbody>${d.top.map(t => `<tr><td>${esc(t.name)}</td><td>${t.qty} قطعة</td><td><b>${egp(t.revenue)}</b></td></tr>`).join('')}</tbody></table>` : '<div class="empty"><div class="big">🛍️</div><b>لا مبيعات بعد</b><p>أضف منتجات وشارك رابط متجرك</p></div>'}</div>
      <div class="card"><h3>حالة الطلبات</h3><table class="tbl"><tbody>${Object.keys(STATUS).map(s => `<tr><td>${stChip(s)}</td><td><b>${d.statusCounts[s]}</b></td></tr>`).join('')}</tbody></table></div>
    </div>`);
  return { html, after: () => drawChart(d.daily) };
};

const VIEWS = { overview: viewOverview, orders: viewOrders, products: viewProducts, carts: viewCarts, customers: viewCustomers, coupons: viewCoupons, shipping: viewShipping, couriers: viewCouriers, payments: viewPayments, blocked: viewBlocked, customize: viewCustomize, tracking: viewTracking, team: viewTeam, settings: viewSettings };
async function route() {
  const hash = location.hash.replace('#/', '') || 'overview';
  const view = VIEWS[hash] || VIEWS.overview;
  $('#root').innerHTML = '<div class="d-main"><div class="skel" style="height:200px;margin-bottom:14px"></div><div class="skel" style="height:300px"></div></div>';
  try {
    const out = await view();
    if (typeof out === 'string') { $('#root').innerHTML = out; }
    else { $('#root').innerHTML = out.html; out.after && out.after(); }
  } catch (e) { if (e.message !== 'auth' && e.message !== 'err') $('#root').innerHTML = '<div class="d-main"><div class="card"><div class="empty"><b>حدث خطأ</b><p>حاول تحديث الصفحة</p></div></div></div>'; }
}

async function boot() {
  try {
    const me = await api('/api/me');
    ME = me; STORE = me.store;
    const acts = await api('/api/activation'); ME.activations = acts.requests;
    const newOrders = await api('/api/orders?status=new'); ME.newOrders = newOrders.orders.length;
  } catch { return; }
  window.addEventListener('hashchange', route);
  route();
}
boot();
