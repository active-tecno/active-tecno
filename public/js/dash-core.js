// dash-core.js — Active Order merchant dashboard: shared helpers + EO-style chrome + router (zero-dependency)
const $ = s => document.querySelector(s);
const egp = n => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDateNum = d => { const dt = new Date(d.replace(' ', 'T') + (d.includes('Z') || d.includes('+') ? '' : 'Z')); return (dt.getMonth()+1) + '/' + dt.getDate() + '/' + dt.getFullYear(); };
const fmtDate = d => new Date(d.replace(' ', 'T') + (d.includes('Z') || d.includes('+') ? '' : 'Z')).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

async function api(path, opts = {}) {
  if (opts.body) { opts.headers = { 'Content-Type': 'application/json' }; opts.body = JSON.stringify(opts.body); }
  const r = await fetch(path, opts);
  // deploy handshake: if the server was redeployed under us, reload once to fetch matching assets
  const srvV = r.headers.get('x-app-version');
  if (srvV && window.__APP_VERSION && srvV !== window.__APP_VERSION) {
    const last = +(sessionStorage.getItem('at_vreload') || 0);
    if (Date.now() - last > 60000) { sessionStorage.setItem('at_vreload', Date.now()); location.reload(); }
  }
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
function openModal(title, bodyHTML, onMount, wide) {
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'modal-ov'; ov.id = 'modalOv';
  ov.innerHTML = `<div class="modal${wide ? ' wide' : ''}"><h2>${title}<button onclick="closeModal()">✕</button></h2><div class="m-body">${bodyHTML}</div></div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('open'));
  if (onMount) onMount(ov);
}
function closeModal() { $('#modalOv')?.remove(); }

const STATUS = {
  new: { ar: 'تحت المراجعة', cls: 'st-new' },
  confirmed: { ar: 'تم التأكيد', cls: 'st-confirmed' },
  pending_payment: { ar: 'في انتظار الدفع', cls: 'st-pending' },
  paid: { ar: 'تم الدفع', cls: 'st-paid' },
  payment_failed: { ar: 'فشل الدفع', cls: 'st-failed' },
  preparing: { ar: 'قيد التجهيز للشحن', cls: 'st-preparing' },
  awaiting_shipping: { ar: 'بانتظار الشحن', cls: 'st-awaiting' },
  shipped: { ar: 'قيد التوصيل', cls: 'st-shipped' },
  delivered: { ar: 'تم التوصيل', cls: 'st-delivered' },
  cancelled: { ar: 'تم الغاء الطلب', cls: 'st-cancelled' },
  returned_from_shipping: { ar: 'مرتجع من الشحن', cls: 'st-returned' },
  return_requested: { ar: 'العميل طلب الارجاع', cls: 'st-returned' },
  returning: { ar: 'جاري الارجاع', cls: 'st-returning' },
  returned: { ar: 'تم الارجاع', cls: 'st-returned' }
};
const stChip = s => `<span class="chip ${STATUS[s]?.cls || ''}">${STATUS[s]?.ar || s}</span>`;

let ME = null, STORE = null;

// ---------- icons (stroke SVG, no emoji) ----------
const ICONS = {
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 8.3L12 13l8.7-4.7M12 13v9"/></svg>',
  missed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/></svg>',
  blocked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/></svg>',
  otp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>',
  products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  categories: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>',
  reviews: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8L12 3z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  feed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 11a8 8 0 0 1 8 8M5 4a15 15 0 0 1 15 15"/><circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none"/></svg>',
  catalog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/><path d="M9 7.5h7M9 11h5"/></svg>',
  ab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M8 21H4a1 1 0 0 1-1-1v-4M16 21h4a1 1 0 0 0 1-1v-4M12 8v8M9.5 10.5L12 8l2.5 2.5"/></svg>',
  customize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.8 2-1.8 0-.9-.7-1.4-.7-2.3 0-1 .8-1.7 2-1.7H17a4 4 0 0 0 4-4c0-4.4-4-8.2-9-8.2z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="11" cy="7.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/></svg>',
  funnel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18l-7 8v6.5l-4 2.5v-9L3 4z"/></svg>',
  tracking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  pixel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  capi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V7l8-4 8 4v10"/><path d="M4 17l8 4 8-4M12 11v10"/></svg>',
  ga: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V12M10 20V6M16 20v-4M22 20H2"/></svg>',
  marketing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l14-5v12L3 13v-2z"/><path d="M7 13.5V17a2 2 0 0 0 4 0v-2.2M17 8.5a4 4 0 0 1 0 7"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H4v5M15 21h5v-5M4 3l7 7M20 21l-7-7M20 8V3h-5M4 16v5h5"/></svg>',
  coupons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z"/><path d="M13 5v2m0 4v2m0 4v2" stroke-dasharray="1 3"/></svg>',
  retarget: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/><path d="M9.5 9.8c.4 2.3 2.4 4.2 4.7 4.7l1.3-1.3 2.3 1.2c-.3 1.3-1.2 2.1-2.5 2-3.9-.3-7.4-3.8-7.7-7.7-.1-1.3.7-2.2 2-2.5l1.2 2.3-1.3 1.3z"/></svg>',
  badgecheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 2.1 3.1-.4 1.1 3 2.8 1.4-1.1 3 1.1 3-2.8 1.4-1.1 3-3.1-.4L12 22l-2.4-2.1-3.1.4-1.1-3-2.8-1.4 1.1-3-1.1-3 2.8-1.4 1.1-3 3.1.4L12 2z"/><path d="M9 12l2 2 4-4.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  merchant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l1.5-3.5h13L20 7M4 7h16v3a3 3 0 0 1-5.3 1.9A3 3 0 0 1 9.3 12 3 3 0 0 1 4 10V7z"/><path d="M6 13v7h12v-7M10 20v-4h4v4"/></svg>',
  popup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M8 21h8M7 9h7M7 12.5h10"/></svg>',
  mincart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.5 12h10L20 8H7"/><path d="M13 4h6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16V7"/><path d="M17 13.5h.01"/></svg>',
  transactions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>',
  apps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>',
  blog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5V4z"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l5 5L8.5 20.5 3 21l.5-5.5L14 5z"/><path d="M12.5 6.5l5 5"/></svg>',
  services: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2M4 13h16"/></svg>',
  percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M19 5L5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.7M12 18.5v2.7M21.2 12h-2.7M5.5 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4L5.5 5.5"/></svg>',
  carts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.5 12h10L20 8H7"/></svg>',
  customers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M16.5 15.4a5 5 0 0 1 4.7 4.6"/></svg>',
  shipping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h13v9H1zM14 10h4l4 4v2h-8z"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/></svg>',
  couriers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h13l3 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"/><path d="M4 9h16M9 4v5"/></svg>',
  payments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></svg>',
  team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7.5" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12z"/></svg>',
  plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8zM12 18v4"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="3"/><circle cx="12" cy="12" r="2.6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9z"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M21.5 12h-2.3M4.8 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l1.5-3.5h13L20 7M4 7h16v3a3 3 0 0 1-5.3 1.9A3 3 0 0 1 9.3 12 3 3 0 0 1 4 10V7z"/><path d="M6 13v7h12v-7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.7c0 1.6-2.4 2-2.4 3.3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-7 7"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11M7 10l5 5 5-5M4 21h16"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M6.5 7l1 13h9l1-13"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="14" height="12" rx="2.5"/><path d="M16.5 10.5l5-3v9l-5-3"/></svg>',
  burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  collapse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 11H4.8L3 8z"/></svg>',
};
ICONS.filter = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v5.5l-4 2v-7.5L3 5z"/></svg>';
const I = k => ICONS[k] || ICONS.settings;
const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

// legacy view adapters (legacy views call shell(topBar(...)) — chrome is global now)
function shell(content) { return content; }
const topBar = (title, sub, actions = '') => `<div class="d-top">
  <div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
  <div class="d-actions">${actions}</div></div>`;

// ---------- view registry ----------
const VIEWS = {};
function registerView(route, fn) { VIEWS[route] = fn; }

// ---------- EO sidebar structure ----------
// item: [route, icon, label, opts]  opts: {badge:'new'} | {count:()=>n}
const NAV_GROUPS = [
  { label: 'الرئيسية', items: [
    ['overview', 'stats', 'لوحة الإحصائيات'],
  ]},
  { label: null, items: [], group: ['orders', 'orders', 'الطلبات', [
    ['orders', null, 'كل الطلبات'],
    ['missed-orders', null, 'الطلبات المفقودة'],
    ['blocked-phone-numbers', null, 'الأرقام المحظورة من الطلب'],
    ['blocked-phones', null, 'الأرقام المحظورة OTP'],
    ['newsletter', null, 'NewsLetter'],
  ]]},
  { label: null, items: [], group: ['products', 'products', 'المنتجات', [
    ['products', null, 'المنتجات'],
    ['categories', null, 'الاقسام'],
    ['reviews', null, 'التقييمات'],
    ['product-feed', null, 'Product Feed'],
    ['easy-catalog', null, 'اكتف كتالوج'],
    ['ab-tests', null, 'A/B Tests'],
  ]]},
  { label: null, items: [], group: ['design', 'customize', 'تصميم المتجر', [
    ['customize', null, 'الثييمات'],
    ['builder', null, 'تعديل الصفحة الرئيسية'],
    ['pages', null, 'الصفحات'],
    ['checkout-fields', null, 'نموذج الشراء'],
    ['thanks-edit', null, 'تعديل صفحة الشكر'],
    ['ui-blocks', null, 'UI Blocks'],
    ['upload-assets', null, 'رفع ملفات التصاميم'],
  ]]},
  { label: null, items: [['funnels', 'funnel', 'Funnels']] },
  { label: null, items: [], group: ['tracking', 'tracking', 'ادوات التتبع', [
    ['pixels-settings', null, 'اعدادات البيكسل'],
    ['pixel-conversion', null, 'Conversion API'],
    ['ga', null, 'Google Analytics'],
  ]]},
  { label: null, items: [], group: ['marketing', 'marketing', 'ادوات التسويق', [
    ['cross-sell', null, 'Cross Sell'],
    ['coupons', null, 'الكوبونات'],
    ['retargeting', null, 'اعادة الاستهداف'],
    ['whatsapp-api', null, 'WhatsApp API'],
    ['top-mb', null, 'توثيق الطلبات'],
    ['utm-builder', null, 'UTM Builder'],
    ['google-merchant', null, 'Google Merchant'],
    ['sales-popup', null, 'Sales Popup'],
    ['referral-link', null, 'انشاء رابط احالة'],
    ['min-order', null, 'حد ادنى للطلب'],
    ['downsell', null, 'Downsell'],
  ]]},
  { label: null, items: [], group: ['wallet', 'wallet', 'محفظتك', [
    ['top-up', null, 'شحن المحفظة'],
    ['transactions', null, 'المعاملات'],
  ]]},
  { label: null, items: [['plugins', 'apps', 'التطبيقات']] },
  { label: null, items: [], group: ['blogs', 'blog', 'المدونات', [
    ['blogs', null, 'المقالات'],
    ['blog-categories', null, 'اقسام المدونة'],
  ]], newBadge: true },
  { label: 'خدمات مجتمع اكتف', items: [
    ['services', 'services', 'معرض الخدمات'],
    ['marketing-services', 'marketing', 'خدمات التسويق'],
    ['referral', 'percent', 'نظام التسويق بالعمولة'],
    ['support', 'chat', 'الدعم'],
    ['dev-requests', 'code', 'طلب تطويرات'],
    ['settings', 'settings', 'الأعدادات'],
  ]},
];

function currentRoute() { return location.hash.replace(/^#\//, '').split('?')[0] || 'overview'; }
function rerender() { route(); }
function go(k) { location.hash = '#/' + k; $('#dSide')?.classList.remove('open'); }
async function logout() { await api('/api/auth/logout', { method: 'POST' }); location.href = '/'; }

function sideHtml() {
  const cur = currentRoute();
  const openGroups = JSON.parse(localStorage.getItem('dGroups') || '[]');
  let html = '';
  for (const g of NAV_GROUPS) {
    if (g.label) html += `<div class="d-group-label">${g.label}</div>`;
    for (const [route, icon, label] of g.items) {
      if (!VIEWS[route]) continue;
      html += `<button class="d-link ${cur === route ? 'on' : ''}" onclick="go('${route}')"><span class="ic">${I(icon)}</span>${label}</button>`;
    }
    if (g.group) {
      const [gid, gicon, glabel, subs] = g.group;
      const visible = subs.filter(([r]) => VIEWS[r]);
      if (!visible.length) continue;
      const isOpen = openGroups.includes(gid) || visible.some(([r]) => r === cur);
      html += `<button class="d-link ${isOpen ? 'open' : ''}" onclick="toggleGroup('${gid}')"><span class="ic">${I(gicon)}</span>${glabel}${g.newBadge ? '<span class="new-badge">جديد</span>' : ''}${gid === 'orders' && ME?.newOrders ? `<span class="badge">${ME.newOrders}</span>` : `<span style="margin-inline-start:auto"></span>`}<span class="chev">${CHEV}</span></button>`;
      html += `<div class="d-sub ${isOpen ? 'open' : ''}" id="dsub-${gid}">` +
        visible.map(([r, , l]) => `<button class="d-link ${cur === r ? 'on' : ''}" onclick="go('${r}')">${l}${r === 'orders' && ME?.newOrders ? `<span class="badge">${ME.newOrders}</span>` : ''}</button>`).join('') + `</div>`;
    }
  }
  return html;
}
function toggleGroup(gid) {
  const open = JSON.parse(localStorage.getItem('dGroups') || '[]');
  const i = open.indexOf(gid);
  if (i > -1) open.splice(i, 1); else open.push(gid);
  localStorage.setItem('dGroups', JSON.stringify(open));
  const btn = document.querySelector(`#dsub-${gid}`)?.previousElementSibling;
  document.getElementById(`dsub-${gid}`)?.classList.toggle('open');
  btn?.classList.toggle('open');
}
function refreshSide() { const s = $('#dNav'); if (s) s.innerHTML = sideHtml(); }

function topbarHtml() {
  const theme = document.body.dataset.theme === 'dark';
  return `<div class="d-topbar">
    <button class="d-burger" onclick="document.getElementById('dSide').classList.toggle('open')">${I('burger')}</button>
    <div class="hello"><span class="store-ic">${I('store')}</span><span>مرحبا<br><b>${esc(STORE.name)}</b></span></div>
    <div class="spacer"></div>
    <div class="tb-wrap">
      <button class="tb-btn" onclick="toggleNotifs(event)" title="الاشعارات">${I('bell')}${notifCount() ? `<span class="dot">${notifCount()}</span>` : ''}</button>
      <div class="notif-dd" id="notifDd" style="display:none"></div>
    </div>
    <button class="tb-btn" onclick="toggleTheme()" title="${theme ? 'الوضع الفاتح' : 'الوضع الداكن'}">${theme ? I('sun') : I('moon')}</button>
    <button class="tb-btn" onclick="location.reload()" title="تحديث">${I('refresh')}</button>
    <a class="tb-btn" href="/s/${esc(STORE.slug)}" target="_blank" title="مشاهدة المتجر">${I('eye')}</a>
  </div>`;
}
function notifPrefs() {
  let n = {};
  try { n = JSON.parse((window.SETTINGS || {}).notifications || '{}'); } catch (_) {}
  return { enabled: n.enabled !== false, new_order: n.new_order !== false, low_stock: n.low_stock !== false, carts: n.carts === true };
}
function notifCount() {
  const p = notifPrefs();
  return (p.enabled && p.new_order ? (ME?.newOrders || 0) : 0) + ((ME?.activations || []).some(a => a.status === 'pending') ? 1 : 0);
}
async function toggleNotifs(e) {
  e.stopPropagation();
  const dd = $('#notifDd');
  if (dd.style.display === 'block') { dd.style.display = 'none'; return; }
  const p = notifPrefs();
  const items = [];
  if (p.enabled && p.new_order && ME.newOrders) items.push({ ic: 'orders', t: `لديك ${ME.newOrders} طلب جديد بانتظار التأكيد`, a: "go('orders')" });
  if ((ME.activations || []).some(a => a.status === 'pending')) items.push({ ic: 'cash', t: 'طلب التفعيل قيد المراجعة من فريقنا', a: "go('overview')" });
  const render = () => {
    if (!items.length) { dd.innerHTML = '<div class="notif-empty">لا اشعارات جديدة</div>'; return; }
    dd.innerHTML = `<h4>الاشعارات</h4>` + items.map(n => `<button class="notif-item" style="width:100%;background:transparent;border:0;text-align:start;cursor:pointer" onclick="document.getElementById('notifDd').style.display='none';${n.a}"><span class="n-ic">${I(n.ic)}</span><span>${n.t}</span></button>`).join('') + `<button class="notif-item" style="width:100%;background:transparent;border:0;text-align:start;cursor:pointer;color:var(--green-400)" onclick="document.getElementById('notifDd').style.display='none';go('notifications')"><span class="n-ic">${I('bell')}</span><span>اظهار الكل</span></button>`;
  };
  if (!p.enabled) dd.innerHTML = `<div class="notif-empty">إشعارات الطلبات موقوفة — <a href="#/settings/notifications" style="color:var(--green-400)">إعادة التفعيل</a></div>`;
  else render();
  dd.style.display = 'block';
  setTimeout(() => document.addEventListener('click', () => { dd.style.display = 'none'; }, { once: true }), 10);
  if (p.enabled && (p.low_stock || p.carts)) {
    try {
      if (p.low_stock) {
        const prods = await api('/api/products');
        const low = (prods.products || []).filter(x => x.status === 'active' && x.stock <= x.low_stock_threshold);
        if (low.length) items.push({ ic: 'products', t: `تنبيه مخزون: ${low.length} منتج منخفض أو نافد`, a: "go('products')" });
      }
      if (p.carts) {
        const c = await api('/api/carts');
        const n2 = (c.carts || []).filter(x => (x.items || []).length).length;
        if (n2) items.push({ ic: 'mincart', t: `لديك ${n2} سلة متروكة بانتظار المتابعة`, a: "go('carts')" });
      }
      render();
    } catch (_) {}
  }
}
function toggleTheme() {
  const next = document.body.dataset.theme === 'dark' ? '' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('dTheme', next);
  const bar = $('.d-topbar'); if (bar) bar.outerHTML = topbarHtml();
}

// ---------- chrome ----------
function renderChrome() {
  $('#root').innerHTML = `<div class="d-layout">
    <aside class="d-side" id="dSide">
      <div class="d-side-head">
        <button class="iconbtn" onclick="document.getElementById('dSide').classList.remove('open')" style="display:none" id="dSideClose">${I('collapse')}</button>
        <a class="brand" href="/"><svg viewBox="0 0 32 32" width="26" height="26"><rect width="32" height="32" rx="8" fill="#141924"/><path d="M9 20l7-11 7 11" stroke="#27cd27" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="brand-name">اكتف <b>اوردر</b></span></a>
      </div>
      <nav id="dNav">${sideHtml()}</nav>
      <div class="d-upsell" id="dUpsell" ${STORE.is_published ? 'style="display:none"' : ''}>
        <h4>اشترك في الباقة المميزة</h4><p>ونمي متجرك!</p>
        <button class="btn btn-teal" onclick="go('subscriptions')">اشترك الآن</button>
      </div>
      <div class="d-side-foot">
        <a class="d-viewstore" href="/s/${esc(STORE.slug)}" target="_blank">${I('eye')} معاينة المتجر</a>
        ${ME.user.is_admin ? `<a class="d-link" href="/admin"><span class="ic">${I('shield')}</span>لوحة الإدارة</a>` : ''}
        <button class="d-link" onclick="logout()"><span class="ic">${I('logout')}</span>تسجيل الخروج</button>
        <div class="d-version">v1.0.0</div>
      </div>
    </aside>
    <div class="d-main-wrap">
      ${topbarHtml()}
      <main class="d-main" id="dContent"></main>
    </div>
  </div>
  <button class="ai-fab" onclick="aiToggle()"><span class="a-ic">${I('spark')}</span>أسأل مساعد اكتف</button>
  <div class="ai-panel" id="aiPanel">
    <div class="ai-head"><span class="a-ic">${I('spark')}</span><div><b>مساعد اكتف</b><small>يجيب من بيانات متجرك الفعلية</small></div></div>
    <div class="ai-body" id="aiBody"></div>
    <div class="ai-sugs" id="aiSugs"></div>
    <div class="ai-input"><input id="aiIn" placeholder="اكتب سؤالك..." onkeydown="if(event.key==='Enter')aiSend()"><button onclick="aiSend()">${I('send')}</button></div>
  </div>`;
}

// ---------- AI assistant (rule-based over real store data) ----------
let aiData = null;
async function aiToggle() {
  const p = $('#aiPanel');
  p.classList.toggle('open');
  if (p.classList.contains('open') && !aiData) {
    aiData = {};
    try {
      const [an, prods] = await Promise.all([api('/api/analytics?days=30'), api('/api/products')]);
      aiData.an = an; aiData.products = prods.products;
    } catch (_) {}
    aiSay('أهلاً بك! أنا مساعد اكتف. أسألني عن مبيعاتك، طلباتك، مخزونك، أو كيفية استخدام أي أداة في لوحة التحكم.');
    aiSuggestions(['ملخص المبيعات', 'حالة المخزون', 'كيف أضيف منتج؟', 'كيف أفعّل متجري؟']);
  }
}
function aiSuggestions(list) { $('#aiSugs').innerHTML = list.map(s => `<button onclick="aiAsk(this.textContent)">${s}</button>`).join(''); }
function aiSay(t) { const b = $('#aiBody'); b.insertAdjacentHTML('beforeend', `<div class="ai-msg bot">${t}</div>`); b.scrollTop = b.scrollHeight; }
function aiMe(t) { const b = $('#aiBody'); b.insertAdjacentHTML('beforeend', `<div class="ai-msg me">${esc(t)}</div>`); b.scrollTop = b.scrollHeight; }
function aiAsk(t) { $('#aiIn').value = t; aiSend(); }
async function aiSend() {
  const inp = $('#aiIn'); const q = inp.value.trim(); if (!q) return;
  inp.value = ''; aiMe(q);
  if (!aiData?.an) { try { const [an, prods] = await Promise.all([api('/api/analytics?days=30'), api('/api/products')]); aiData = { an, products: prods.products }; } catch (_) {} }
  aiSay(aiAnswer(q));
}
function aiAnswer(q) {
  const d = aiData?.an, prods = aiData?.products || [];
  if (/مبيعات|ملخص|اداء|أداء|تحويل/.test(q) && d) return `آخر 30 يوم: <b>${d.views}</b> زيارة، <b>${d.orders}</b> طلب، إيراد <b>${egp(d.revenue)}</b>، معدل تحويل <b>${d.conversion}%</b>. ${d.statusCounts.new ? `لديك ${d.statusCounts.new} طلب جديد لم يُؤكد بعد.` : 'لا طلبات معلقة.'}`;
  if (/مخزون|نواقص|نفد/.test(q)) {
    const low = prods.filter(p => p.status === 'active' && p.stock > 0 && p.stock <= p.low_stock_threshold);
    const out = prods.filter(p => p.status === 'active' && p.stock <= 0);
    if (!low.length && !out.length) return 'مخزونك بحالة جيدة، لا نواقص ولا أصناف على وشك النفاد.';
    return `${out.length ? `نفد تماماً: ${out.map(p => `«${esc(p.name)}»`).join('، ')}. ` : ''}${low.length ? `مخزون منخفض: ${low.map(p => `«${esc(p.name)}» (${p.stock})`).join('، ')}.` : ''} حدّث الكميات من صفحة المنتجات.`;
  }
  if (/منتج|اضافه|إضافة|اضافة/.test(q)) return 'من قائمة «المنتجات» اضغط «اضافة منتج»: أدخل الاسم والوصف والصور والسعر (وسعر التخفيض والتكلفة لحساب صافي ربحك)، ثم حدد القسم والمخزون واحفظ. يمكنك أيضاً الاستيراد من Excel أو JSON.';
  if (/تفعيل|نشر|اشتراك|شحن/.test(q)) return 'لتفعيل نشر متجرك: من بطاقة «اشترك في الباقة المميزة» في القائمة الجانبية اضغط «اشترك الآن»، حوّل 50 ج.م عبر InstaPay أو Vodafone Cash وأدخل رقم المرجع. يراجع فريقنا الطلب ويفعّل النشر خلال ساعات.';
  if (/طلب/.test(q) && d) return `إجمالي طلباتك: ${d.orders}. جديد: ${d.statusCounts.new || 0}، مؤكد: ${d.statusCounts.confirmed || 0}، تم شحنه: ${d.statusCounts.shipped || 0}، تم تسليمه: ${d.statusCounts.delivered || 0}.`;
  if (/كوبون|خصم/.test(q)) return 'من «ادوات التسويق ← الكوبونات» أنشئ كوبوناً بنسبة أو مبلغ ثابت، مع حد أدنى للطلب وحد استخدام اختياريين.';
  if (/بيكسل|تتبع/.test(q)) return 'من «ادوات التتبع ← اعدادات البيكسل» أضف معرف البيكسل (ID) فقط — نرسل كل الأحداث تلقائياً، فلا تربط البيكسل بصفحة الشكر حتى لا تتكرر البيانات.';
  return 'يمكنني إجابتك عن: ملخص المبيعات، حالة المخزون، الطلبات، إضافة منتج، تفعيل المتجر، الكوبونات، اعدادات البيكسل. جرّب أحد الاقتراحات بالأسفل.';
}

// ---------- activation (our real billing: 50 EGP / 30 days) ----------
function activationBanner() {
  const storeUrl = `${location.origin}/s/${STORE.slug}`;
  if (STORE.is_published) {
    return `<div class="act-banner live"><span class="bn-ic">${I('check')}</span><div class="txt"><h3>متجرك مفعّل ويعمل</h3><p>النشر فعّال حتى ${esc(STORE.published_until || '')} — رابط متجرك: <a href="/s/${esc(STORE.slug)}" target="_blank" style="text-decoration:underline" class="mono">${storeUrl}</a></p></div>
    <a class="btn btn-teal" href="/s/${esc(STORE.slug)}" target="_blank">افتح المتجر</a></div>`;
  }
  const pending = (ME.activations || []).find(a => a.status === 'pending');
  if (pending) return `<div class="act-banner pending"><span class="bn-ic">${I('cash')}</span><div class="txt"><h3>طلب التفعيل قيد المراجعة</h3><p>استلمنا طلبك (${pending.method === 'instapay' ? 'InstaPay' : 'Vodafone Cash'} — مرجع ${esc(pending.reference)}) وسيتم تفعيل النشر خلال ساعات.</p></div></div>`;
  return `<div class="act-banner"><span class="bn-ic">${I('wallet')}</span><div class="txt"><h3>متجرك غير فعّال</h3><p>فعّل النشر بـ 50 ج.م كل 30 يوم عبر InstaPay أو Vodafone Cash وابدأ استقبال الطلبات.</p>
    <div class="perks"><span>${I('check')} تفعيل فوري لمتجرك بمجرد المراجعة</span><span>${I('check')} بدون عمولة على المبيعات</span><span>${I('check')} 0% رسوم إضافية</span></div>
    <p style="margin-top:6px">رابط متجرك: <span class="mono">${storeUrl}</span></p></div>
  <button class="btn btn-navy" onclick="openActivation()">فعّل متجرك<div style="font-size:10.5px;font-weight:400;opacity:.8">يبدأ من 50 ج.م فقط</div></button></div>`;
}
function payChannels(pay) {
  const ch = [];
  if (pay && pay.instapay) ch.push({ value: 'instapay', label: 'InstaPay — ' + pay.instapay });
  if (pay && pay.vodafone_cash) ch.push({ value: 'vodafone_cash', label: 'Vodafone Cash — ' + pay.vodafone_cash });
  return ch;
}
const paySetupNotice = () => `<div class="card" style="background:var(--bg)">
    <b>تحصيل الاشتراكات غير مضبوط بعد</b>
    <p class="muted small" style="margin-top:6px">لم يضبط مالك المنصة قنوات استلام التحويلات بعد، لذلك لا يمكن إرسال طلب تفعيل حالياً. تُضبط القنوات من لوحة الإدارة ← الإضافات والتكامل ← قنوات المنصة، وتظهر هنا فور ضبطها.</p>
  </div>`;
async function openActivation() {
  const d = await api('/api/activation');
  const chans = payChannels(d.payment);
  if (!chans.length) return openModal('تفعيل نشر المتجر', paySetupNotice());
  openModal('تفعيل نشر المتجر', `
    <div class="card" style="background:var(--bg);margin-bottom:16px">
      <b>خطة النشر الشهرية — 50 ج.م / 30 يوم</b>
      <p class="muted small" style="margin-top:6px">حوّل 50 ج.م إلى حساب اكتف اوردر ثم أدخل رقم المرجع. فريقنا يراجع ويفعّل خلال ساعات.</p>
    </div>
    <div class="f-grid">
      <div class="f-field full"><label>طريقة الدفع</label>
        <select id="actMethod">${chans.map(c => `<option value="${c.value}">${esc(c.label)}</option>`).join('')}</select></div>
      <div class="f-field full"><label>رقم المرجع / آخر 4 أرقام من رقم التحويل</label><input id="actRef" placeholder="مثال: INSTA-99213" dir="ltr"></div>
    </div>
    <div class="m-actions"><button class="btn btn-teal" onclick="submitActivation()">إرسال طلب التفعيل</button></div>`);
}
async function submitActivation() {
  const method = $('#actMethod').value, reference = $('#actRef').value.trim();
  if (!reference) return toast('أدخل رقم المرجع', 'err');
  await api('/api/activation', { method: 'POST', body: { method, reference } });
  closeModal(); toast('تم إرسال طلب التفعيل — سنراجعه قريباً');
  const acts = await api('/api/activation'); ME.activations = acts.requests;
  route();
}

// ---------- shared chart ----------
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
  const dark = document.body.dataset.theme === 'dark';
  ctx.strokeStyle = dark ? '#232c3a' : '#E6ECF5'; ctx.fillStyle = dark ? '#9aa5bb' : '#63729A'; ctx.font = '10.5px IBM Plex Sans Arabic'; ctx.textAlign = 'left';
  for (let g = 0; g <= 3; g++) { const y = py + ch * g / 3; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(W - px, y); ctx.stroke(); ctx.fillText(Math.round(max * (3 - g) / 3), 2, y + 3); }
  const grad = ctx.createLinearGradient(0, py, 0, H - py);
  grad.addColorStop(0, 'rgba(39,205,39,.25)'); grad.addColorStop(1, 'rgba(39,205,39,0)');
  ctx.beginPath();
  vals.forEach((v, i) => { const x = px + cw * i, y = py + ch * (1 - v / max); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.strokeStyle = '#27cd27'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.lineTo(px + cw * (days.length - 1), py + ch); ctx.lineTo(px, py + ch); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
}

// ---------- router ----------
async function route() {
  closeModal();
  const hash = currentRoute();
  let view = VIEWS[hash], params = {};
  if (!view) {
    for (const k in VIEWS) {
      if (!k.includes('/:')) continue;
      const kp = k.split('/'), hp = hash.split('/');
      if (kp.length !== hp.length) continue;
      if (kp.every((seg, i) => seg.startsWith(':') || seg === hp[i])) {
        view = VIEWS[k];
        kp.forEach((seg, i) => { if (seg.startsWith(':')) params[seg.slice(1)] = hp[i]; });
        break;
      }
    }
  }
  view = view || VIEWS.overview;
  const c = $('#dContent');
  if (!c) return;
  c.innerHTML = '<div class="skel" style="height:120px;margin-bottom:14px"></div><div class="skel" style="height:300px"></div>';
  refreshSide();
  try {
    const out = await view(params);
    if (typeof out === 'string') { c.innerHTML = out; }
    else { c.innerHTML = out.html; out.after && out.after(); }
  } catch (e) { if (e.message !== 'auth' && e.message !== 'err') c.innerHTML = '<div class="card"><div class="empty"><b>حدث خطأ</b><p class="muted">حاول تحديث الصفحة</p></div></div>'; }
}

async function boot() {
  document.body.dataset.theme = localStorage.getItem('dTheme') || '';
  try {
    const me = await api('/api/me');
    ME = me; STORE = me.store;
    const acts = await api('/api/activation'); ME.activations = acts.requests;
    const newOrders = await api('/api/orders?status=new'); ME.newOrders = newOrders.orders.length;
    try { const s = await api('/api/store/settings'); window.SETTINGS = s.settings || {}; } catch (_) { window.SETTINGS = {}; }
  } catch { return; }
  renderChrome();
  window.addEventListener('hashchange', route);
  route();
}
boot();
