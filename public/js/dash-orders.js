// dash-orders.js — الطلبات cluster: كل الطلبات (+ أنشاء طلب), الطلبات المفقودة, الأرقام المحظورة (طلب/OTP), NewsLetter

// كل الطلبات: reuse the legacy board/list view, add EO actions (أنشاء طلب + تصدير)
registerView('orders', async () => {
  const html = await viewOrders();
  return {
    html,
    after() {
      const act = document.querySelector('#dContent .d-actions');
      if (act && !document.getElementById('btnCreateOrder')) {
        act.insertAdjacentHTML('afterbegin', `<button class="btn btn-teal" id="btnCreateOrder" onclick="go('orders/create')">${I('plus')} أنشاء طلب</button>`);
      }
    }
  };
});

// أنشاء طلب (EO #/orders/create full page): products card + customer data (right), note + totals (left)
const EG_GOVS = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'القليوبية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح', 'شمال سيناء', 'جنوب سيناء'];
let coItems = [], coZones = [], coFreeOver = 0;
registerView('orders/create', async () => {
  const [dp, dz] = await Promise.all([api('/api/products'), api('/api/shipping')]);
  const products = (dp.products || []).filter(p => p.status === 'active');
  coItems = []; coZones = dz.zones || []; coFreeOver = STORE.free_shipping_over || 0;
  if (!products.length) return `<div class="d-page">${topBar('أنشاء طلب', 'أضف طلباً يدوياً لعميلك', '')}<div class="d-card"><div class="empty"><span class="e-ic">${I('products')}</span><h3>أضف منتجاً أولاً</h3><p>تحتاج منتجاً نشطاً واحداً على الأقل قبل إنشاء طلب يدوي</p><button class="btn primary" onclick="go('products/create')">إضافة منتج</button></div></div></div>`;
  return `<div class="d-page">
    ${topBar('أنشاء طلب', 'أضف طلباً يدوياً لعميلك', '')}
    <div class="co-grid">
      <div style="display:grid;gap:16px;align-content:start">
        <div class="d-card">
          <h3>${I('products')} المنتجات</h3>
          <div style="display:flex;gap:8px;margin-top:10px">
            <select id="coProd" class="d-input" style="flex:1">${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-name="${esc(p.name)}">${esc(p.name)} — ${egp(p.price)} (مخزون: ${p.stock})</option>`).join('')}</select>
            <button class="btn btn-soft" onclick="coAdd()">اختر المنتجات</button>
          </div>
          <div id="coItems" style="margin-top:12px;display:grid;gap:8px"></div>
        </div>
        <div class="d-card">
          <h3>${I('customers')} بيانات العميل</h3>
          <div class="form-grid" style="margin-top:10px">
            <div><label class="d-label">رقم الهاتف *</label><input id="coPhone" class="d-input ltr" placeholder="01xxxxxxxxx"></div>
            <div><label class="d-label">رقم هاتف بديل</label><input id="coPhoneAlt" class="d-input ltr" placeholder="01xxxxxxxxx"></div>
            <div><label class="d-label">اسمك بالكامل *</label><input id="coName" class="d-input"></div>
            <div><label class="d-label">المحافظة</label><select id="coGov" class="d-input" onchange="coRender()"><option value="">اختر المحافظة</option>${EG_GOVS.map(g => `<option>${g}</option>`).join('')}</select></div>
            <div style="grid-column:1/-1"><label class="d-label">العنوان بالتفصيل *</label><textarea id="coAddr" class="d-input" rows="2"></textarea></div>
          </div>
        </div>
      </div>
      <div style="display:grid;gap:16px;align-content:start">
        <div class="d-card">
          <h3>${I('pen')} اضافة ملاحظة</h3>
          <textarea id="coNotes" class="d-input" rows="4" style="margin-top:10px" placeholder="ملاحظة الطلب الخاصة بك"></textarea>
        </div>
        <div class="d-card">
          <div class="set-row"><span class="t">اجمالي المنتجات:</span><b id="coSubtotal">0 ج.م</b></div>
          <div class="set-row"><span class="t">رسوم التوصيل:</span>
            <span style="display:inline-flex;align-items:center;gap:6px"><input id="coShipping" class="d-input ltr" type="number" min="0" step="1" value="0" style="width:90px;padding:6px 10px" oninput="coRender(true)"> <span class="muted">ج.م</span></span></div>
          <div class="set-row" style="border-top:1px solid var(--line);padding-top:10px;margin-top:4px"><span class="t">الاجمالي:</span><b id="coTotal" style="color:var(--brand);font-size:17px">0 ج.م</b></div>
          <button class="btn primary" style="width:100%;margin-top:14px" onclick="submitCreateOrder()">حفظ الطلب</button>
        </div>
      </div>
    </div>
  </div>`;
});
function coDefaultShipping(subtotal) {
  const gov = $('#coGov') ? $('#coGov').value : '';
  const zone = coZones.find(z => (z.governorates || '').split(',').map(x => x.trim()).includes(gov)) || coZones[0];
  let sh = 0;
  if (zone) sh = (zone.free_over && subtotal >= zone.free_over) ? 0 : zone.price * (zone.per_item ? coItems.reduce((t, i) => t + i.qty, 0) : 1);
  if (coFreeOver && subtotal >= coFreeOver) sh = 0;
  return sh || 0;
}
function coAdd() {
  const sel = $('#coProd'); const opt = sel.selectedOptions[0];
  const id = parseInt(sel.value);
  const ex = coItems.find(i => i.product_id === id);
  if (ex) ex.qty = Math.min(ex.qty + 1, 99); else coItems.push({ product_id: id, name: opt.dataset.name, price: parseFloat(opt.dataset.price), qty: 1 });
  const sh = $('#coShipping'); if (sh) sh.value = coDefaultShipping(coItems.reduce((t, i) => t + i.price * i.qty, 0));
  coRender();
}
function coRender(manualShipping) {
  const wrap = $('#coItems'); if (!wrap) return;
  wrap.innerHTML = coItems.map((i, x) => `<div style="display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:9px;padding:8px 12px">
    <b style="flex:1">${esc(i.name)}</b>
    <button class="btn btn-soft btn-sm" onclick="coItems[${x}].qty=Math.max(1,coItems[${x}].qty-1);coSyncShip();coRender()">−</button><span>${i.qty}</span><button class="btn btn-soft btn-sm" onclick="coItems[${x}].qty=Math.min(99,coItems[${x}].qty+1);coSyncShip();coRender()">+</button>
    <b>${egp(i.price * i.qty)}</b>
    <button class="btn btn-danger btn-sm" onclick="coItems.splice(${x},1);coSyncShip();coRender()">${I('trash')}</button></div>`).join('');
  const sub = coItems.reduce((t, i) => t + i.price * i.qty, 0);
  const shEl = $('#coShipping');
  const sh = manualShipping ? (parseFloat(shEl.value) || 0) : (shEl ? (parseFloat(shEl.value) || 0) : 0);
  $('#coSubtotal').textContent = egp(sub);
  $('#coTotal').textContent = egp(Math.max(0, sub + sh));
}
function coSyncShip() {
  const sh = $('#coShipping'); if (sh) sh.value = coDefaultShipping(coItems.reduce((t, i) => t + i.price * i.qty, 0));
}
async function submitCreateOrder() {
  if (!coItems.length) return toast('اختر منتجاً واحداً على الأقل', 'err');
  const body = {
    items: coItems.map(i => ({ product_id: i.product_id, qty: i.qty })),
    name: $('#coName').value.trim(), phone: $('#coPhone').value.trim(), phone_alt: $('#coPhoneAlt').value.trim(),
    governorate: $('#coGov').value, address: $('#coAddr').value.trim(), notes: $('#coNotes').value.trim(),
    shipping: $('#coShipping').value,
  };
  const r = await api('/api/orders', { method: 'POST', body });
  if (r && r.error) return toast(r.error, 'err');
  toast(`تم انشاء الطلب ${r.number}`);
  ME.newOrders = (ME.newOrders || 0) + 1; go('orders');
}

// الطلبات المفقودة (abandoned checkouts with customer phone)
registerView('missed-orders', async () => {
  const d = await api('/api/carts');
  const carts = d.carts;
  const rows = carts.map(c => {
    const items = Array.isArray(c.items) ? c.items : JSON.parse(c.items || '[]');
    const total = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
    return { ...c, items, total };
  }).filter(c => c.items.length);
  return topBar('الطلبات المفقودة', 'عملاء بدأوا الطلب ولم يكملوه — تواصل معهم لاستعادة البيع') +
    (!rows.length
      ? `<div class="card"><div class="empty"><span class="e-ic">${I('missed')}</span><h3>لا توجد طلبات مفقودة حتى الآن</h3><p>عندما يترك عميل سلة بدون إتمام الطلب ستظهر هنا مع بياناته</p></div></div>`
      : `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الهاتف</th><th>المنتجات</th><th>القيمة</th><th>آخر نشاط</th><th>الحالة</th><th></th></tr></thead><tbody>
        ${rows.map(c => `<tr>
          <td class="mono">${esc(c.customer_phone || '—')}</td>
          <td>${c.items.map(i => `${esc(i.name)} ×${i.qty}`).join('، ')}</td>
          <td><b>${egp(c.total)}</b></td>
          <td class="muted small">${fmtDate(c.updated_at)}</td>
          <td>${c.recovered ? '<span class="chip st-delivered">تمت الاستعادة</span>' : '<span class="chip st-new">لم يكتمل</span>'}</td>
          <td style="white-space:nowrap">
            ${c.customer_phone ? `<a class="btn btn-soft btn-sm" href="https://wa.me/2${esc(c.customer_phone)}" target="_blank">${I('whatsapp')} تواصل</a>` : ''}
            ${!c.recovered ? `<button class="btn btn-soft btn-sm" onclick="api('/api/carts/${c.id}/recovered',{method:'PUT'}).then(()=>{toast('تم تعليمها كمستعادة');route()})">تمت الاستعادة</button>` : ''}
          </td></tr>`).join('')}</tbody></table></div>`);
});

// الأرقام المحظورة (order | otp)
async function viewBlockedKind(kind) {
  const d = await api('/api/blocked?kind=' + kind);
  const isOtp = kind === 'otp';
  const title = isOtp ? 'الأرقام المحظورة OTP' : 'الأرقام المحظورة من الطلب';
  const desc = isOtp ? 'هذه الأرقام لا تصلها رسائل تأكيد الهوية (OTP)' : 'أرقام الطلبات الوهمية لا تستطيع الطلب من متجرك';
  return topBar(title, desc, `<button class="btn btn-teal" onclick="openBlockedAdd('${kind}')">${I('plus')} حظر رقم</button>`) +
    (!d.blocked.length
      ? `<div class="card"><div class="empty"><span class="e-ic">${I('ban')}</span><h3>لا توجد أرقام محظورة</h3><p>${isOtp ? 'احظر الأرقام التي تسيء استخدام رسائل OTP' : 'احظر أرقام الطلبات الوهمية'}</p></div></div>`
      : `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الرقم</th><th>السبب</th><th>التاريخ</th><th></th></tr></thead><tbody>
        ${d.blocked.map(b => `<tr><td class="mono">${esc(b.phone)}</td><td>${esc(b.reason || '—')}</td><td class="muted small">${fmtDate(b.created_at)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="api('/api/blocked/${b.id}',{method:'DELETE'}).then(()=>{toast('تم رفع الحظر');route()})">${I('trash')} رفع الحظر</button></td></tr>`).join('')}</tbody></table></div>`);
}
registerView('blocked-phone-numbers', () => viewBlockedKind('order'));
registerView('blocked-phones', () => viewBlockedKind('otp'));
function openBlockedAdd(kind) {
  openModal(kind === 'otp' ? 'حظر رقم من OTP' : 'حظر رقم من الطلب', `
    <div class="f-grid">
      <div class="f-field full"><label>رقم الهاتف</label><input id="blPhone" dir="ltr" placeholder="01xxxxxxxxx"></div>
      <div class="f-field full"><label>السبب (اختياري)</label><input id="blReason" placeholder="طلبات وهمية متكررة"></div>
    </div>
    <div class="m-actions"><button class="btn btn-teal" onclick="submitBlockedAdd('${kind}')">حظر الرقم</button></div>`);
}
async function submitBlockedAdd(kind) {
  await api('/api/blocked', { method: 'POST', body: { phone: $('#blPhone').value.trim(), reason: $('#blReason').value.trim(), kind } });
  closeModal(); toast('تم حظر الرقم'); route();
}

// NewsLetter
registerView('newsletter', async () => {
  const d = await api('/api/newsletter');
  return topBar('NewsLetter', 'المشتركون في نشرتك البريدية من صفحة متجرك') +
    (!d.subscribers.length
      ? `<div class="card"><div class="empty"><span class="e-ic">${I('mail')}</span><h3>لا يوجد مشتركون حتى الآن</h3><p>نموذج الاشتراك في النشرة يظهر أسفل صفحة متجرك — شارك رابط متجرك لجمع المشتركين</p></div></div>`
      : `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>البريد الإلكتروني</th><th>تاريخ الاشتراك</th><th></th></tr></thead><tbody>
        ${d.subscribers.map(s => `<tr><td class="mono">${esc(s.email)}</td><td class="muted small">${fmtDate(s.created_at)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="api('/api/newsletter/${s.id}',{method:'DELETE'}).then(()=>{toast('تم حذف المشترك');route()})">${I('trash')}</button></td></tr>`).join('')}</tbody></table></div>`);
});
