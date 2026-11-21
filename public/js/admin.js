// admin.js — Active Tecno platform admin panel (zero-dependency)
const $ = s => document.querySelector(s);
const egp = n => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => new Date(String(d).replace(' ', 'T') + 'Z').toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

async function api(path, opts = {}) {
  if (opts.body) { opts.headers = { 'Content-Type': 'application/json' }; opts.body = JSON.stringify(opts.body); }
  const r = await fetch(path, opts);
  if (r.status === 401) { location.href = '/login'; throw new Error('auth'); }
  if (r.status === 403) { location.href = '/app'; throw new Error('forbidden'); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { toast(d.error || 'حدث خطأ', 'err'); throw new Error('err'); }
  return d;
}
function toast(msg, type = 'ok') {
  let wrap = $('.d-toasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'd-toasts'; document.body.appendChild(wrap); }
  const t = document.createElement('div'); t.className = `d-toast ${type}`; t.textContent = msg;
  wrap.appendChild(t); setTimeout(() => t.remove(), 3200);
}
const stChip = s => {
  const m = { new: ['جديد', 'st-new'], confirmed: ['مؤكد', 'st-confirmed'], shipped: ['تم الشحن', 'st-shipped'], delivered: ['مُسلَّم', 'st-delivered'], cancelled: ['ملغي', 'st-cancelled'], returned: ['مرتجع', 'st-returned'], pending: ['قيد المراجعة', 'st-pending'], approved: ['مقبول', 'st-approved'], rejected: ['مرفوض', 'st-rejected'] };
  return `<span class="chip ${m[s]?.[1] || ''}">${m[s]?.[0] || s}</span>`;
};

const NAV = [
  ['overview', '📊', 'نظرة عامة'], ['activations', '💳', 'طلبات التفعيل'], ['merchants', '🧑‍💼', 'التجار'], ['stores', '🏪', 'المتاجر'], ['orders', '📦', 'آخر الطلبات']
];
function shell(content) {
  const hash = location.hash.replace('#/', '') || 'overview';
  return `<div class="d-layout">
  <aside class="d-side" id="dSide">
    <a class="brand" href="/"><svg viewBox="0 0 32 32" width="28" height="28"><rect width="32" height="32" rx="8" fill="rgba(255,255,255,.12)"/><path d="M9 20l7-11 7 11" stroke="#00BFAF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="brand-name">اكتف <b>تكنو</b></span></a>
    <div style="padding:0 10px 14px"><span class="chip st-shipped">🛡️ لوحة إدارة المنصة</span></div>
    ${NAV.map(([k, ic, l]) => `<button class="d-link ${hash === k ? 'on' : ''}" onclick="location.hash='#/${k}'"><span class="ic">${ic}</span>${l}${k === 'activations' && window._pending ? `<span class="badge">${window._pending}</span>` : ''}</button>`).join('')}
    <div class="d-side-foot"><a class="d-link" href="/app"><span class="ic">🏪</span>لوحة التاجر</a><button class="d-link" onclick="logout()"><span class="ic">🚪</span>تسجيل الخروج</button></div>
  </aside>
  <main class="d-main">${content}</main></div>`;
}
async function logout() { await api('/api/auth/logout', { method: 'POST' }); location.href = '/'; }
const topBar = (t, s) => `<div class="d-top"><button class="d-burger" onclick="document.getElementById('dSide').classList.toggle('open')">☰</button><div><h1>${t}</h1>${s ? `<div class="sub">${s}</div>` : ''}</div></div>`;

async function viewOverview() {
  const s = await api('/api/admin/stats');
  return shell(topBar('نظرة عامة على المنصة', 'أرقام اكتف تكنو لحظياً') +
    `<div class="stat-grid">
      <div class="stat"><span class="ic">🧑‍💼</span><div class="lbl">التجار</div><div class="val">${s.merchants}</div></div>
      <div class="stat"><span class="ic">🏪</span><div class="lbl">المتاجر</div><div class="val">${s.stores}</div></div>
      <div class="stat"><span class="ic">🟢</span><div class="lbl">متاجر منشورة</div><div class="val">${s.published}</div></div>
      <div class="stat"><span class="ic">📦</span><div class="lbl">إجمالي الطلبات</div><div class="val">${s.orders}</div></div>
      <div class="stat"><span class="ic">💰</span><div class="lbl">GMV عبر المنصة</div><div class="val">${egp(s.gmv)}</div></div>
      <div class="stat"><span class="ic">💳</span><div class="lbl">إيراد الاشتراكات</div><div class="val">${egp(s.activationRevenue)}</div></div>
      <div class="stat"><span class="ic">⏳</span><div class="lbl">طلبات تفعيل معلقة</div><div class="val" style="color:${s.pendingActivations ? 'var(--amber)' : 'inherit'}">${s.pendingActivations}</div></div>
    </div>
    ${s.pendingActivations ? `<div class="act-banner pending"><div class="txt"><h3>⏳ ${s.pendingActivations} طلب تفعيل بانتظار المراجعة</h3><p>راجع التحويلات وفعّل المتاجر.</p></div><button class="btn btn-teal" onclick="location.hash='#/activations'">مراجعة الآن</button></div>` : ''}`);
}

async function viewActivations() {
  const d = await api('/api/admin/activations');
  return shell(topBar('طلبات التفعيل', 'تحويلات InstaPay و Vodafone Cash من التجار') +
    `<div class="frow"><div class="pill-tabs" id="actTabs">
      <button data-s="" class="on">الكل</button><button data-s="pending">قيد المراجعة</button><button data-s="approved">مقبولة</button><button data-s="rejected">مرفوضة</button></div></div>
    <div class="card tbl-wrap" id="actWrap">${actTable(d.requests)}</div>`);
}
function actTable(reqs) {
  if (!reqs.length) return '<div class="empty"><div class="big">💳</div><b>لا طلبات</b></div>';
  return `<table class="tbl"><thead><tr><th>التاجر</th><th>المتجر</th><th>الطريقة</th><th>المرجع</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead><tbody>
  ${reqs.map(r => `<tr><td><b>${esc(r.user_name)}</b><br><span class="muted small mono">${esc(r.email)}</span></td>
    <td>${esc(r.store_name)} <span class="mono muted small">/s/${esc(r.slug)}</span></td>
    <td>${r.method === 'instapay' ? 'InstaPay' : 'Vodafone Cash'}</td><td class="mono">${esc(r.reference)}</td><td><b>${egp(r.amount)}</b></td>
    <td class="muted small">${fmtDate(r.created_at)}</td><td>${stChip(r.status)}</td>
    <td style="white-space:nowrap">${r.status === 'pending' ? `<button class="btn btn-teal btn-sm" onclick="approveAct(${r.id})">✓ قبول وتفعيل</button> <button class="btn btn-danger-soft btn-sm" onclick="rejectAct(${r.id})">رفض</button>` : (r.admin_note ? `<span class="muted small">${esc(r.admin_note)}</span>` : '')}</td></tr>`).join('')}</tbody></table>`;
}
async function approveAct(id) {
  const d = await api(`/api/admin/activations/${id}/approve`, { method: 'POST' });
  toast(`تم التفعيل حتى ${d.published_until} ✅`); route();
}
async function rejectAct(id) {
  const note = prompt('سبب الرفض (يظهر للتاجر):') || '';
  await api(`/api/admin/activations/${id}/reject`, { method: 'POST', body: { note } });
  toast('تم الرفض'); route();
}

async function viewMerchants() {
  const d = await api('/api/admin/merchants');
  return shell(topBar('التجار', `${d.merchants.length} تاجر`) +
    `<div class="frow"><input type="search" placeholder="🔍 ابحث بالاسم أو البريد أو المتجر…" oninput="searchMerchants(this.value)"></div>
    <div class="card tbl-wrap" id="merchWrap">${merchTable(d.merchants)}</div>`);
}
function merchTable(ms) {
  if (!ms.length) return '<div class="empty"><div class="big">🧑‍💼</div><b>لا نتائج</b></div>';
  return `<table class="tbl"><thead><tr><th>التاجر</th><th>المتجر</th><th>الحالة</th><th>الطلبات</th><th>GMV</th><th>انضم</th><th></th></tr></thead><tbody>
  ${ms.map(m => `<tr><td><b>${esc(m.name)}</b><br><span class="muted small mono">${esc(m.email)}</span></td>
    <td>${esc(m.store_name || '—')} <span class="mono muted small">${m.slug ? '/s/' + esc(m.slug) : ''}</span></td>
    <td>${m.is_published ? `<span class="chip st-delivered">منشور حتى ${esc(m.published_until || '')}</span>` : '<span class="chip st-pending">غير منشور</span>'}</td>
    <td>${m.orders_count}</td><td><b>${egp(m.gmv)}</b></td><td class="muted small">${fmtDate(m.created_at)}</td>
    <td style="white-space:nowrap">${m.slug ? `<a class="btn btn-soft btn-sm" href="/s/${esc(m.slug)}" target="_blank">معاينة</a> ` : ''}<button class="btn ${m.is_published ? 'btn-danger-soft' : 'btn-teal'} btn-sm" onclick="togglePublish(${m.store_id || 0}, ${m.is_published ? 0 : 1})">${m.is_published ? 'إيقاف النشر' : 'نشر يدوي'}</button></td></tr>`).join('')}</tbody></table>`;
}
async function togglePublish(storeId, published) {
  if (!storeId) return toast('لا يوجد متجر', 'err');
  await api(`/api/admin/stores/${storeId}/publish`, { method: 'PUT', body: { published: !!published } });
  toast(published ? 'تم النشر ✅' : 'تم إيقاف النشر'); route();
}
async function searchMerchants(q) {
  const d = await api('/api/admin/merchants' + (q ? `?q=${encodeURIComponent(q)}` : ''));
  $('#merchWrap').innerHTML = merchTable(d.merchants);
}

async function viewStores() {
  const d = await api('/api/admin/stores');
  return shell(topBar('المتاجر', `${d.stores.length} متجر`) +
    `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>المتجر</th><th>المالك</th><th>المنتجات</th><th>الطلبات</th><th>الحالة</th><th></th></tr></thead><tbody>
    ${d.stores.map(s => `<tr><td><b>${esc(s.name)}</b> <span class="mono muted small">/s/${esc(s.slug)}</span></td><td class="mono muted small">${esc(s.owner_email)}</td>
    <td>${s.products_count}</td><td>${s.orders_count}</td>
    <td>${s.is_published ? `<span class="chip st-delivered">منشور</span>` : '<span class="chip st-pending">غير منشور</span>'}</td>
    <td style="white-space:nowrap"><a class="btn btn-soft btn-sm" href="/s/${esc(s.slug)}" target="_blank">معاينة</a> <button class="btn ${s.is_published ? 'btn-danger-soft' : 'btn-teal'} btn-sm" onclick="togglePublish(${s.id}, ${s.is_published ? 0 : 1}, '')">${s.is_published ? 'إيقاف' : 'نشر'}</button></td></tr>`).join('')}</tbody></table></div>`);
}

async function viewOrders() {
  const d = await api('/api/admin/orders');
  return shell(topBar('آخر الطلبات عبر المنصة', '') +
    `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>الطلب</th><th>المتجر</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>
    ${d.orders.map(o => `<tr><td class="mono">${esc(o.number)}</td><td>${esc(o.store_name)}</td><td>${esc(o.customer_name)}</td><td><b>${egp(o.total)}</b></td><td>${stChip(o.status)}</td><td class="muted small">${fmtDate(o.created_at)}</td></tr>`).join('')}</tbody></table></div>`);
}

const VIEWS = { overview: viewOverview, activations: viewActivations, merchants: viewMerchants, stores: viewStores, orders: viewOrders };
async function route() {
  const hash = location.hash.replace('#/', '') || 'overview';
  $('#root').innerHTML = '<div class="d-main"><div class="skel" style="height:200px;margin-bottom:14px"></div><div class="skel" style="height:300px"></div></div>';
  try { $('#root').innerHTML = await (VIEWS[hash] || viewOverview)(); }
  catch (e) { if (!['auth', 'forbidden', 'err'].includes(e.message)) $('#root').innerHTML = '<div class="d-main"><div class="card"><div class="empty"><b>حدث خطأ</b></div></div></div>'; }
  const tabs = $('#actTabs');
  if (tabs) tabs.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const d = await api('/api/admin/activations' + (b.dataset.s ? `?status=${b.dataset.s}` : ''));
    $('#actWrap').innerHTML = actTable(d.requests);
  });
}
async function boot() {
  try { const s = await api('/api/admin/stats'); window._pending = s.pendingActivations; } catch { return; }
  window.addEventListener('hashchange', route);
  route();
}
boot();
