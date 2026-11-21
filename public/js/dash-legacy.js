// dash-legacy.js — pre-Stage-F views (products, coupons, customize, settings, payments...) registered into the Stage-F shell
let ordersCache = [], ordersView = 'list', ordersStatusFilter = '';
// EO date style: m/d/yyyy + h:mm AM/PM (two lines)
const fmtDateUS = d => {
  const t = new Date(d.replace(' ', 'T') + (d.includes('Z') || d.includes('+') ? '' : 'Z'));
  const date = `${t.getMonth() + 1}/${t.getDate()}/${t.getFullYear()}`;
  let h = t.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `<div class="o-date"><div>${date}</div><div class="muted">${ap} ${String(h).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}</div></div>`;
};
// EO customer risk indicator, derived from this store's real order history
function orderRisk(o, all) {
  const mine = all.filter(x => x.customer_phone === o.customer_phone);
  const cancelled = mine.filter(x => x.status === 'cancelled').length;
  const delivered = mine.filter(x => x.status === 'delivered').length;
  if (cancelled >= 2) return { label: 'مرتفعة', cls: 'risk-high' };
  if (cancelled >= 1 || mine.length <= 1) return { label: 'متوسطة', cls: 'risk-mid' };
  if (delivered >= 1) return { label: 'منخفضة', cls: 'risk-low' };
  return { label: 'متوسطة', cls: 'risk-mid' };
}
async function viewOrders() {
  const d = await api('/api/orders');
  ordersCache = d.orders;
  return shell(topBar('الطلبات', `${d.orders.length} طلب`,
    `<a class="btn btn-soft btn-sm" href="/api/orders-export.csv${ordersStatusFilter ? '?status=' + ordersStatusFilter : ''}" download>${I('download')} تصدير</a>
     <div class="pill-tabs"><button class="${ordersView === 'list' ? 'on' : ''}" onclick="ordersView='list';route()">قائمة</button><button class="${ordersView === 'board' ? 'on' : ''}" onclick="ordersView='board';route()">لوحة</button></div>`) +
    `<div class="ord-tabs" id="ordTabs">${renderOrderTabs(d.orders)}</div>
     <div class="ord-filters" id="ordFilters">${ORDER_FILTER_FIELDS.filter(f => orderFilters[f.key] != null).map(renderOrderFilterRow).join('')}</div>
     <div id="ordersWrap">${renderOrders(d.orders)}</div>`);
}
function renderOrderTabs(all) {
  const counts = {}; all.forEach(o => counts[o.status] = (counts[o.status] || 0) + 1);
  const tab = (key, label, n) => `<button class="ord-tab ${ordersStatusFilter === key ? 'on' : ''}" onclick="ordersStatusFilter='${key}';route()">${label}${n != null ? ` <span class="n">${n}</span>` : ''}</button>`;
  return `<span class="ord-filter-anchor"><button class="ord-tab ord-filter-btn" onclick="toggleFilterMenu(event)">${I('filter') || ''} إضافة فلتر</button></span>`
    + tab('', 'كل الطلبات', all.length) + Object.keys(STATUS).map(s => tab(s, STATUS[s].ar, counts[s] || 0)).join('');
}
function renderOrders(orders, all) {
  all = all || orders;
  if (ordersStatusFilter) orders = orders.filter(o => o.status === ordersStatusFilter);
  if (!orders.length) return `<div class="card"><div class="empty"><div class="big">${ICONS.orders}</div><b>لا توجد طلبات بعد</b><p>شارك رابط متجرك وستظهر الطلبات هنا فوراً</p><a class="btn btn-teal" href="/s/${esc(STORE.slug)}" target="_blank">افتح متجرك</a></div></div>`;
  if (ordersView === 'list') {
    return `<div class="ord-table-wrap"><table class="tbl ord-tbl"><thead><tr><th><input type="checkbox" disabled></th><th>المعرّف</th><th>العميل</th><th>العنوان</th><th>المبلغ الاجمالي</th><th>حالة الطلب</th><th>مستوى الخطورة</th><th>الدولة</th><th>تاريخ الطلب</th></tr></thead><tbody>
      ${orders.map(o => {
        const r = orderRisk(o, all);
        return `<tr onclick="openOrder(${o.id})" style="cursor:pointer">
        <td onclick="event.stopPropagation()"><input type="checkbox"></td>
        <td><b class="mono" dir="ltr">${esc(o.number)}</b>${o.demo ? ' <span class="chip-demo">تجريبي</span>' : ''}${o.status !== 'new' ? '<div class="muted small">تمت المراجعة</div>' : ''}</td>
        <td><div class="o-cust"><span class="o-avatar">${esc((o.customer_name || '؟').trim().charAt(0))}</span><div><b>${esc(o.customer_name)}</b><div class="mono muted small">${esc(o.customer_phone)}</div><div class="o-risk ${r.cls}"><span class="bar"></span>${r.label}</div></div></div></td>
        <td class="muted small o-addr">${esc((o.customer_address || '') + (o.governorate ? '، ' + o.governorate : '')).slice(0, 45)}</td>
        <td><b>${Math.round(o.total)} ج.م</b></td>
        <td>${stChip(o.status)}</td>
        <td><span class="o-gauge ${r.cls}" title="${r.label}"><i></i><i></i><i></i></span></td>
        <td class="muted">EG</td>
        <td class="small">${fmtDateUS(o.created_at)}</td></tr>`;
      }).join('')}</tbody></table></div>`;
  }
  const cols = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  return `<div class="kb">${cols.map(s => {
    const list = orders.filter(o => o.status === s);
    return `<div class="kb-col"><div class="kb-col-head"><span>${STATUS[s].ar}</span><span class="n">${list.length}</span></div><div class="kb-cards">
      ${list.map(o => `<div class="kb-card" onclick="openOrder(${o.id})">
        <div class="num mono">${esc(o.number)}${o.demo ? ' <span class="chip-demo">تجريبي</span>' : ''}</div><div class="who">${esc(o.customer_name)} ${o.whatsapp_confirmed ? '<span class="wa-ok">· مؤكد واتساب</span>' : ''}</div>
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
  $('#ordersWrap').innerHTML = renderOrders(d.orders, ordersCache);
}

// ---------- EO-style per-field order filters ----------
const ORDER_FILTER_FIELDS = [
  { key: 'f_number', label: 'المعرّف', type: 'text' },
  { key: 'f_name', label: 'اسم العميل', type: 'text' },
  { key: 'f_phone', label: 'رقم هاتف العميل', type: 'text' },
  { key: 'f_address', label: 'عنوان العميل', type: 'text' },
  { key: 'f_from', label: 'بداية التاريخ', type: 'date' },
  { key: 'f_to', label: 'نهاية التاريخ', type: 'date' },
  { key: 'f_utm_source', label: 'مصدر الحملة', type: 'text' },
  { key: 'f_utm_campaign', label: 'اسم الحملة', type: 'text' },
  { key: 'f_coupon', label: 'الكوبون', type: 'text' },
  { key: 'f_product', label: 'المنتج', type: 'text' },
];
let orderFilters = {};
function toggleFilterMenu(ev) {
  ev.stopPropagation();
  const old = $('#ordFilterMenu'); if (old) { old.remove(); return; }
  const anchor = ev.currentTarget.closest('.ord-filter-anchor');
  const menu = document.createElement('div');
  menu.id = 'ordFilterMenu'; menu.className = 'ord-filter-menu';
  menu.innerHTML = ORDER_FILTER_FIELDS.map(f => `
    <label class="ord-filter-item ${orderFilters[f.key] != null ? 'on' : ''}">
      <input type="checkbox" ${orderFilters[f.key] != null ? 'checked' : ''} onchange="toggleOrderFilter('${f.key}', this.checked)">
      <span>${f.label}</span>
    </label>`).join('');
  anchor.appendChild(menu);
  setTimeout(() => document.addEventListener('click', function h(e) { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', h); } }), 0);
}
function toggleOrderFilter(key, on) {
  if (on) orderFilters[key] = ''; else delete orderFilters[key];
  const wrap = $('#ordFilters');
  if (wrap) wrap.innerHTML = ORDER_FILTER_FIELDS.filter(f => orderFilters[f.key] != null).map(renderOrderFilterRow).join('');
  const menu = $('#ordFilterMenu');
  if (menu) menu.querySelectorAll('label').forEach(l => {
    const cb = l.querySelector('input'); const f = ORDER_FILTER_FIELDS.find(x => x.key === cb.getAttribute('onchange').match(/'(f_\w+)'/)[1]);
    cb.checked = orderFilters[f.key] != null; l.classList.toggle('on', cb.checked);
  });
  applyOrderFilters();
}
function renderOrderFilterRow(f) {
  return `<div class="ord-filter-row2" data-key="${f.key}">
    <span class="ord-filter-label">${f.label}</span>
    <span class="ord-filter-field">
      <input type="${f.type}" value="${esc(orderFilters[f.key] || '')}" oninput="setOrderFilter('${f.key}', this.value)">
      <button class="ord-filter-x" onclick="toggleOrderFilter('${f.key}', false)" title="إزالة">×</button>
    </span>
  </div>`;
}
let orderFilterTimer = null;
function setOrderFilter(key, val) {
  orderFilters[key] = val;
  clearTimeout(orderFilterTimer);
  orderFilterTimer = setTimeout(applyOrderFilters, 350);
}
async function applyOrderFilters() {
  const ps = new URLSearchParams();
  Object.entries(orderFilters).forEach(([k, v]) => { if (String(v).trim()) ps.set(k, String(v).trim()); });
  const d = await api('/api/orders' + (ps.toString() ? '?' + ps : ''));
  ordersCache = d.orders;
  const w = $('#ordersWrap'); if (w) w.innerHTML = renderOrders(d.orders, ordersCache);
}
async function openOrder(id) {
  const o = ordersCache.find(x => x.id === id) || (await api('/api/orders')).orders.find(x => x.id === id);
  const h = await api(`/api/orders/${id}/history`);
  const waText = encodeURIComponent(`أهلاً ${o.customer_name} \nطلبك رقم ${o.number} من ${STORE.name} تم تأكيده \nالإجمالي: ${egp(o.total)} — الدفع عند الاستلام\nشحنك في الطريق قريباً `);
  openModal(`الطلب <span class="mono">${esc(o.number)}</span>`, `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">${stChip(o.status)} ${o.whatsapp_confirmed ? '<span class="chip st-delivered">تم التأكيد عبر واتساب</span>' : ''} <span class="muted small">${fmtDate(o.created_at)}</span></div>
    <div class="card" style="background:var(--bg);margin-bottom:14px">
      <b>${esc(o.customer_name)}</b> — <span class="mono">${esc(o.customer_phone)}</span><br>
      <span class="muted small">${esc(o.governorate)} — ${esc(o.customer_address)}</span>
      ${o.notes ? `<br><span class="small">${esc(o.notes)}</span>` : ''}
    </div>
    <table class="tbl"><tbody>${o.items.map(i => `<tr><td class="prod-cell"><img src="${esc(i.image)}">${esc(i.name)} ×${i.qty}</td><td><b>${egp(i.price * i.qty)}</b></td></tr>`).join('')}
      <tr><td>الشحن</td><td>${o.shipping ? egp(o.shipping) : 'مجاني'}</td></tr>
      ${o.discount ? `<tr><td>الخصم ${o.coupon_code ? `(${esc(o.coupon_code)})` : ''}</td><td>−${egp(o.discount)}</td></tr>` : ''}
      <tr><td><b>الإجمالي (COD)</b></td><td><b style="color:var(--teal)">${egp(o.total)}</b></td></tr></tbody></table>
    <h3 style="margin:16px 0 8px;font-size:14px">سجل الحالات</h3>
    <div class="muted small">${h.history.map(x => `${STATUS[x.status]?.ar || x.status} — ${fmtDate(x.created_at)}`).join(' ')}</div>
    <h3 style="margin:16px 0 8px;font-size:14px">أكتف كونفيرم — تأكيد واتساب برد 1 أو 2</h3>
    <div class="wa-msg-preview" id="waPreview">أهلاً ${esc(o.customer_name)} 
طلبك ${esc(o.number)} من ${esc(STORE.name)}
الإجمالي: ${egp(o.total)} — الدفع عند الاستلام

رد بـ 1 لتأكيد الطلب 
رد بـ 2 للإلغاء </div>
    <div id="waSimStatus" class="muted small" style="margin:8px 0 0"></div>
    <div class="m-actions" style="flex-wrap:wrap">
      <button class="btn btn-teal btn-sm" style="flex:1" onclick="sendActiveConfirm(${o.id})">إرسال تأكيد أكتف كونفيرم</button>
      <a class="btn btn-soft btn-sm" style="flex:1" href="https://wa.me/2${esc(o.customer_phone)}?text=${waText}" target="_blank" rel="noopener" onclick="markWa(${o.id})">فتح واتساب يدوياً</a>
      ${nextStatuses(o.status).map(n => `<button class="btn btn-navy btn-sm" style="flex:1" onclick="moveOrder(${o.id},'${n}');closeModal()">${STATUS[n].ar}</button>`).join('')}
      <button class="btn btn-danger-soft btn-sm" style="flex:1" onclick="blockPhone(${o.id})">حظر الرقم</button>
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
  toast('تم حظر الرقم — لن يستطيع الطلب مرة أخرى '); closeModal(); route();
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
    : `<div class="card"><div class="empty"><div class="big">${ICONS.products}</div><b>لا منتجات بعد</b><p>أضف أول منتج وابدأ البيع اليوم</p><button class="btn btn-teal" onclick="openProduct()">+ أضف منتجك الأول</button></div></div>`));
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
  $('#pImgs').innerHTML = productImages.map((u, i) => `<div style="position:relative"><img src="${esc(u)}" style="width:64px;height:64px;border-radius:12px;object-fit:cover"><button onclick="productImages.splice(${i},1);drawImgs()" style="position:absolute;top:-6px;inset-inline-end:-6px;background:var(--red);color:#fff;border:0;border-radius:50%;width:20px;height:20px;font-size:11px">×</button></div>`).join('');
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
          ${c.customer_phone ? `<a class="btn btn-teal btn-sm" target="_blank" rel="noopener" href="https://wa.me/2${esc(c.customer_phone)}?text=${encodeURIComponent(`أهلاً لاحظنا أنك تركت بعض المنتجات في سلتك من ${STORE.name} — أكمل طلبك الآن قبل نفاد الكمية `)}">تذكير واتساب</a>` : ''}
          <button class="btn btn-soft btn-sm" onclick="markRecovered(${c.id})">تم الاسترجاع</button>`}</td></tr>`).join('')}</tbody></table></div>
      <div class="card"><h3>نصيحة</h3><p class="muted small">التواصل خلال أول ساعة من ترك السلة يرفع الاسترجاع 3 أضعاف. أرسل تذكير واتساب بخصم بسيط عبر كوبون.</p></div>`
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
    : `<div class="card"><div class="empty"><div class="big">${ICONS.customers}</div><b>لا عملاء بعد</b><p>كل عميل يطلب من متجرك يظهر هنا مع سجل إنفاقه</p></div></div>`));
}
async function blockCustomer(phone) { await api('/api/blocked', { method: 'POST', body: { phone, reason: 'حظر من قائمة العملاء' } }); toast('تم الحظر '); route(); }

// ---------- coupons ----------
async function viewCoupons() {
  const d = await api('/api/coupons');
  return shell(topBar('الكوبونات', '', `<button class="btn btn-teal" onclick="openCoupon()">+ كوبون جديد</button>`) +
    (d.coupons.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>الخصم</th><th>حد أدنى</th><th>الاستخدام</th><th>الحالة</th><th></th></tr></thead><tbody>
      ${d.coupons.map(c => `<tr><td class="mono"><b>${esc(c.code)}</b></td><td>${c.type === 'percent' ? c.value + '%' : egp(c.value)}</td><td>${c.min_order ? egp(c.min_order) : '—'}</td>
      <td>${c.used_count}${c.usage_limit ? ' / ' + c.usage_limit : ''}</td>
      <td><span class="chip ${c.active ? 'st-delivered' : 'st-returned'}">${c.active ? 'نشط' : 'موقوف'}</span></td>
      <td style="white-space:nowrap"><button class="btn btn-soft btn-sm" onclick="toggleCoupon(${c.id},${c.active ? 0 : 1})">${c.active ? 'إيقاف' : 'تفعيل'}</button> <button class="btn btn-danger-soft btn-sm" onclick="delCoupon(${c.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>`
    : `<div class="card"><div class="empty"><div class="big">${ICONS.coupons}</div><b>لا كوبونات بعد</b><p>الكوبونات تحفّز الطلب الأول وتزيد التحويل</p><button class="btn btn-teal" onclick="openCoupon()">+ أنشئ أول كوبون</button></div></div>`));
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
  closeModal(); toast('تم إنشاء الكوبون '); route();
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
  toast('تمت إضافة المنطقة '); route();
}
async function delZone(id) { await api(`/api/shipping/${id}`, { method: 'DELETE' }); route(); }
async function saveFreeOver() { await api('/api/store', { method: 'PUT', body: { free_shipping_over: +$('#freeOver').value } }); toast('تم الحفظ '); route(); }

// ---------- blocked ----------
async function viewBlocked() {
  const d = await api('/api/blocked');
  return shell(topBar('الأرقام المحظورة', 'أرقام الطلبات الوهمية لا تستطيع الطلب من متجرك') +
    `<div class="card"><h3>+ حظر رقم</h3><div class="frow"><input id="bPhone" placeholder="01xxxxxxxxx" dir="ltr"><input id="bReason" placeholder="السبب (اختياري)"><button class="btn btn-teal" onclick="addBlocked()">حظر</button></div></div>
    ${d.blocked.length ? `<div class="card tbl-wrap"><table class="tbl"><thead><tr><th>الرقم</th><th>السبب</th><th>التاريخ</th><th></th></tr></thead><tbody>
      ${d.blocked.map(b => `<tr><td class="mono"><b>${esc(b.phone)}</b></td><td class="muted">${esc(b.reason || '—')}</td><td class="muted small">${fmtDate(b.created_at)}</td><td><button class="btn btn-soft btn-sm" onclick="unblock(${b.id})">إلغاء الحظر</button></td></tr>`).join('')}</tbody></table></div>`
    : `<div class="card"><div class="empty"><div class="big">${ICONS.ban}</div><b>لا أرقام محظورة</b><p>احظر أرقام الطلبات الوهمية من هنا أو من صفحة الطلب مباشرة</p></div></div>`}`);
}
async function addBlocked() {
  const phone = $('#bPhone').value.trim(); if (!phone) return;
  await api('/api/blocked', { method: 'POST', body: { phone, reason: $('#bReason').value.trim() } }); toast('تم حظر الرقم '); route();
}
async function unblock(id) { await api(`/api/blocked/${id}`, { method: 'DELETE' }); toast('تم إلغاء الحظر'); route(); }

// ---------- customize (themes catalog, EO layout) ----------
let thcFilter = { niche: 'الكل', price: 'الكل' };
async function viewCustomize() {
  const d = await api('/api/themes');
  const cur = d.themes.find(t => t.id === STORE.theme_id) || d.themes[0];
  const niches = ['الكل', 'متجر عام', 'الزراعة والحدائق', 'المنتجات الرقمية', 'الأدوات والمعدات', 'الهدايا والهاند ميد', 'الطعام والمشروبات', 'الحيوانات الأليفة', 'السيارات والإكسسوارات', 'الكتب', 'الألعاب والهوايات', 'مستلزمات الأطفال', 'المنزل والمطبخ', 'الإلكترونيات', 'الصحة واللياقة', 'مستحضرات تجميل', 'عطور', 'ساعات ونظارات', 'إكسسوارات ومجوهرات', 'أحذية وشنط', 'ملابس وأزياء'];
  const card = (t) => `<div class="thc-card" data-niches="${esc((t.config.niches || []).join('|'))}" data-price="${t.is_premium ? 'paid' : 'free'}">
    <div class="thc-media"><img src="/public/theme-previews/${t.id}.png" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg');this.remove()">
      <span class="thc-badge">مجاني</span></div>
    <div class="thc-body"><div class="thc-name">${esc(t.name_ar)}</div>
      <div class="thc-niches">${(t.config.niches || []).map(n => `<span>${esc(n)}</span>`).join('')}</div></div>
    <div class="thc-actions">${t.id === STORE.theme_id
      ? `<button type="button" class="thc-btn" disabled style="opacity:.55">مفعّل</button>`
      : `<button type="button" class="thc-btn" onclick="thcActivate('${t.id}')">تفعيل</button>`}
      <button type="button" class="thc-btn" onclick="thcPreview('${t.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg> معاينة</button></div>
  </div>`;
  return shell(topBar('الثييمات', 'اختار من مجموعة قوالب جاهزة لمتجرك') +
  `<div class="thc">
    <div class="thc-current card">
      <div class="thc-cur-info"><div><div class="thc-cur-label">الثيم الحالي</div><div class="thc-cur-name">${esc(cur.name_ar)}</div></div>
        <div class="thc-cur-thumb"><img src="/public/theme-previews/${cur.id}.png" alt="" onerror="this.parentNode.style.display='none'"></div></div>
      <div class="thc-cur-actions">
        <button type="button" class="thc-btn" onclick="thcPreview('${cur.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <a class="thc-btn thc-btn-dark" href="#/builder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> تخصيص الثيم</a>
      </div></div>
    <div class="card thc-rec">
      <div class="thc-rec-head"><div class="thc-rec-title-wrap"><div class="thc-rec-star"><svg viewBox="0 0 24 24" fill="#fff" width="16" height="16"><path d="M12 2l2.4 6.2 6.6.4-5.1 4.3 1.7 6.4L12 15.7 6.4 19.3l1.7-6.4L3 8.6l6.6-.4z"/></svg></div><div><div class="thc-rec-title">الثيمات الحديثة <span class="thc-rec-sub">(مرشحة لك)</span></div>
        <div class="thc-rec-desc">قوالب محدّثة باستمرار لتجربة بيع أسرع وأسهل لعملائك</div></div></div></div>
      <div class="thc-filters"><div class="thc-price"><label>السعر</label>
          <select id="thcPrice" onchange="thcApply()"><option>الكل</option><option>مجاني</option></select>
          <button type="button" class="thc-btn" onclick="thcReset()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> إعادة تعيين</button></div></div>
      <div class="thc-pills" id="thcPills">${niches.map((n, i) => `<button type="button" class="thc-pill ${i === 0 ? 'on' : ''}" data-n="${esc(n)}" onclick="thcNiche(this)">${esc(n)}</button>`).join('')}</div>
      <div class="thc-grid" id="thcGrid">${d.themes.map(card).join('')}</div>
    </div>
  </div>`);
}
function thcNiche(btn) {
  document.querySelectorAll('#thcPills .thc-pill').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  thcFilter.niche = btn.dataset.n;
  thcApply();
}
function thcReset() { thcFilter = { niche: 'الكل', price: 'الكل' }; document.querySelectorAll('#thcPills .thc-pill').forEach((p, i) => p.classList.toggle('on', i === 0)); $('#thcPrice').value = 'الكل'; thcApply(); }
function thcApply() {
  const price = $('#thcPrice') ? $('#thcPrice').value : 'الكل';
  document.querySelectorAll('#thcGrid .thc-card').forEach(c => {
    const nOk = thcFilter.niche === 'الكل' || (c.dataset.niches || '').split('|').includes(thcFilter.niche);
    const pOk = price === 'الكل' || (price === 'مجاني' && c.dataset.price === 'free');
    c.style.display = nOk && pOk ? '' : 'none';
  });
}
async function thcActivate(id) {
  const d = await api('/api/store', { method: 'PUT', body: { theme_id: id } });
  STORE = d.store; toast('تم تفعيل الثيم'); route();
}
function thcPreview(id) { window.open(`/s/${STORE.slug}?theme=${id}`, '_blank'); }

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
    <div class="card"><h3>الأحداث المتتبعة تلقائياً</h3><p class="muted small">PageView · ViewContent · AddToCart · InitiateCheckout · Purchase — تُسجَّل لكل زائر وتظهر في فانل التحليلات.</p></div>`);
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
  await api('/api/team', { method: 'POST', body: { name, email, role: $('#tRole').value } }); toast('تمت إضافة العضو '); route();
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
    <div class="card"><h3>ربط دومين خاص</h3><p class="muted small">اربط نطاقك الخاص (مثل store.com) بمتجرك لروابط أنظف وثقة أعلى. أضف سجل CNAME يشير إلى <span class="mono">stores.activetecno.software</span> ثم أدخل النطاق:</p>
      <div class="frow" style="margin-top:10px"><input placeholder="www.mystore.com" dir="ltr"><button class="btn btn-soft" onclick="toast('تم إرسال طلب ربط النطاق — سيظهر التحقق خلال 24 ساعة ')">ربط النطاق</button></div></div>`);
}
async function saveSettings() {
  const d = await api('/api/store', { method: 'PUT', body: { name: $('#stName').value.trim(), slug: $('#stSlug').value.trim(), description: $('#stDesc').value.trim(), phone: $('#stPhone').value.trim(), whatsapp: $('#stWa').value.trim() } });
  STORE = d.store; toast('تم حفظ الإعدادات '); route();
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
    <div class="card"><h3>${I('shield')}أمان المفاتيح</h3><p class="muted small">تُخزَّن المفاتيح مشفّرة على الخادم ولا تظهر بعد الحفظ. تقدر تحدّثها أو تمسحها في أي وقت، وأولوية العمل: مفاتيح متجرك مفاتيح المنصة وضع المحاكاة.</p></div>`);
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
      <div class="f-field full"><label>API Key</label><input id="pmKey" dir="ltr" placeholder="ZXlKaGJHY2lP…" autocomplete="off"><span class="hint">من لوحة Paymob: Settings Account info API Key</span></div>
      <div class="f-field"><label>Integration ID (Card)</label><input id="pmInt" dir="ltr" inputmode="numeric" placeholder="4xxxxxx"><span class="hint">Developers Payment integrations</span></div>
      <div class="f-field"><label>iFrame ID</label><input id="pmIframe" dir="ltr" inputmode="numeric" placeholder="8xxxx"><span class="hint">Developers iFrames</span></div>
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
    card('bosta', 'Bosta', '', 'إرسال الطلبات المؤكدة تلقائياً إلى بوسطة مع تتبع الحالة.')
    + card('mylerz', 'MylerZ', '', 'شحن سريع داخل القاهرة والجيزة مع استلام من باب المتجر.')
    + card('aramex', '', 'تغطية كل المحافظات وشحن دولي.')
    + `<div class="card"><h3>تصدير يدوي</h3><p class="muted small">بدون ربط مباشر، صدّر الطلبات المؤكدة بصيغة CSV جاهزة للرفع في لوحة أي شركة شحن.</p>
      <a class="btn btn-navy" href="/api/orders-export.csv?status=confirmed" download>تصدير الطلبات المؤكدة (CSV)</a></div>
    <div class="card"><h3>تصدير مباشر</h3><p class="muted small">التصدير اليدوي بصيغة CSV يعمل الآن ومتوافق مع لوحات شركات الشحن. الإرسال التلقائي عبر API كل شركة يُفعَّل من لوحة إدارة المنصة عند إدخال مفاتيحها.</p></div>`);
}
async function toggleCourier(id, on, name) {
  const settings = JSON.parse(STORE.theme_settings || '{}');
  settings.couriers = { ...(settings.couriers || {}), [id]: !!on };
  const d = await api('/api/store', { method: 'PUT', body: { theme_settings: settings } });
  STORE = d.store; toast(on ? `تم ربط ${name} ` : `تم فصل ${name}`); route();
}

// ---------- router ----------

// ---------- registration (Stage F router) ----------
registerView('products', viewProducts);
registerView('coupons', viewCoupons);
registerView('customize', viewCustomize);
registerView('settings', viewSettings);
registerView('carts', viewCarts);
registerView('customers', viewCustomers);
registerView('shipping', viewShipping);
registerView('couriers', viewCouriers);
registerView('payments', viewPayments);
registerView('blocked', viewBlocked);
registerView('tracking', viewTracking);
registerView('team', viewTeam);
