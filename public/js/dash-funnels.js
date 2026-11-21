// dash-funnels.js — Stage F3: Funnels + tracking cluster (pixels, conversion API, GA)

// ---------- funnels ----------
registerView('funnels', async () => {
  const { funnels } = await api('/api/funnels');
  const conv = f => f.views ? ((f.orders / f.views) * 100).toFixed(1) + '%' : '—';
  return `
  <div class="d-page">
    ${topBar('Product Funnels', 'يمكنك من هنا انشاء Product Funnels لزيادة مبيعاتك', `<button class="btn primary" onclick="funnelModal()">+ إنشاء</button>`)}
    ${funnels.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>الـ Funnel</th><th>المنتج</th><th>مشاهدات</th><th>طلبات</th><th>تحويل</th><th>الحالة</th><th></th></tr></thead><tbody>
      ${funnels.map(f => `<tr><td><b>${esc(f.name)}</b></td><td class="muted">${esc(f.product_name || '—')}</td>
        <td>${f.views}</td><td>${f.orders}</td><td>${conv(f)}</td>
        <td>${f.status === 'active' ? '<span class="chip st-delivered">نشط</span>' : '<span class="chip">متوقف</span>'}</td>
        <td class="acts">
          <button class="btn sm" onclick="copyFunnel(${f.id})">نسخ الرابط</button>
          ${f.status === 'active' ? `<button class="btn sm" onclick="funnelStatus(${f.id},'paused')">إيقاف</button>` : `<button class="btn sm" onclick="funnelStatus(${f.id},'active')">تشغيل</button>`}
          <button class="btn sm danger" onclick="delFunnel(${f.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>
      <div class="d-card guide"><h3>${I('help')} كيف يعمل الـ Funnel؟</h3>
        <p class="muted" style="line-height:1.9">كل Funnel ينشئ صفحة هبوط مركّزة لمنتج واحد: بدون قائمة تنقل ولا تشتيت — المنتج، وصفه، ونموذج الطلب فقط. شارك رابط الصفحة في إعلاناتك، وستظهر المشاهدات والطلبات ونسبة التحويل في الجدول أعلاه.</p></div>` : `
    <div class="d-card empty"><div class="empty-ic">${I('funnel')}</div><h3>لا يوجد Funnels حتى الان</h3><p class="muted">هل ترغب في اضافة واحد؟ أنشئ صفحة هبوط مركّزة لأحد منتجاتك وشاركها في إعلاناتك.</p><button class="btn primary" onclick="funnelModal()">+ إنشاء</button></div>`}
  </div>`;
});
async function funnelModal() {
  const { products } = await api('/api/products');
  openModal('إنشاء Funnel', `
    <label class="d-label">اسم الـ Funnel *</label><input id="fnName" class="d-input" placeholder="مثال: حملة الساعة — فيسبوك">
    <label class="d-label">المنتج *</label><select id="fnProduct" class="d-input">${products.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
    <button class="btn primary" onclick="saveFunnel()">إنشاء</button>`, () => {});
}
async function saveFunnel() {
  const name = $('#fnName').value.trim(); if (!name) return toast('اسم الـ Funnel مطلوب', 'err');
  await api('/api/funnels', { method: 'POST', body: { name, product_id: +$('#fnProduct').value } });
  closeModal(); toast('تم إنشاء الـ Funnel'); rerender();
}
async function funnelStatus(id, status) { await api('/api/funnels/' + id, { method: 'PUT', body: { status } }); toast('تم التحديث'); rerender(); }
async function delFunnel(id) { if (!confirm('حذف هذا الـ Funnel؟')) return; await api('/api/funnels/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }
function copyFunnel(id) {
  const url = `${location.origin}/s/${STORE.slug}/f/${id}`;
  navigator.clipboard.writeText(url).then(() => toast('تم نسخ رابط الـ Funnel'));
}

// ---------- tracking: shared helpers ----------
async function getPixels() {
  const s = await api('/api/store');
  const ts = s.store?.theme_settings ? JSON.parse(s.store.theme_settings) : {};
  return { store: s.store, ts, px: ts.pixels || {} };
}
async function savePixels(ts) {
  await api('/api/store', { method: 'PUT', body: { theme_settings: ts } });
  toast('تم الحفظ');
}
const pxField = (id, label, hint, val, ph) => `
  <div class="px-field"><label class="d-label">${label}</label>
  <input id="${id}" class="d-input ltr" value="${esc(val || '')}" placeholder="${ph || ''}">
  ${hint ? `<div class="muted sm">${hint}</div>` : ''}</div>`;

// ---------- pixels settings ----------
registerView('pixels-settings', async () => {
  const { ts, px } = await getPixels();
  setTimeout(() => { $('#pxSave').onclick = async () => {
    ts.pixels = { ...ts.pixels, meta: $('#pxMeta').value.trim(), tiktok: $('#pxTiktok').value.trim(), snap: $('#pxSnap').value.trim() };
    await savePixels(ts);
  }; }, 0);
  return `
  <div class="d-page">
    ${topBar('اعدادات البيكسل', 'اربط بيكسلات منصات الإعلانات بمتجرك')}
    <div class="d-card">
      <p class="muted" style="line-height:1.9;margin-bottom:6px">نرسل كل الأحداث تلقائياً (مشاهدة الصفحة، اضافة للسلة، اتمام الطلب) — فلا تستخدم Event Builder ولا تربط البيكسل بصفحة الشكر حتى لا تتكرر البيانات.</p>
      ${pxField('pxMeta', 'Meta (Facebook) Pixel ID', 'من Events Manager ← Data Sources', px.meta, '1234567890123456')}
      ${pxField('pxTiktok', 'TikTok Pixel ID', 'من TikTok Ads Manager ← Events', px.tiktok, 'C4A5B6C7D8E9F0')}
      ${pxField('pxSnap', 'Snapchat Pixel ID', 'من Snap Ads Manager ← Pixels', px.snap, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')}
      <button class="btn primary" id="pxSave">حفظ</button>
    </div>
  </div>`;
});

// ---------- conversion API ----------
registerView('pixel-conversion', async () => {
  const { ts, px } = await getPixels();
  setTimeout(() => { $('#capiSave').onclick = async () => {
    ts.pixels = { ...ts.pixels, capi: $('#pxCapi').value.trim(), capi_test: $('#pxCapiTest').value.trim() };
    await savePixels(ts);
  }; }, 0);
  return `
  <div class="d-page">
    ${topBar('Conversion API', 'ارسل أحداث التحويل من السيرفر مباشرة إلى Meta')}
    <div class="d-card">
      <p class="muted" style="line-height:1.9;margin-bottom:6px">الـ Conversion API يرسل أحداث الطلبات من سيرفرنا إلى Meta مباشرة (Server-to-Server)، فيصل الحدث حتى مع حجب المتصفحات للبيكسل. يتطلب ضبط Meta Pixel أولاً في صفحة اعدادات البيكسل.</p>
      ${pxField('pxCapi', 'Meta Access Token', 'من Events Manager ← Settings ← Conversions API ← Generate access token', px.capi, 'EAAB...')}
      ${pxField('pxCapiTest', 'Test Event Code (اختياري)', 'للتجربة فقط من تبويب Test Events — اتركه فارغاً في التشغيل الفعلي', px.capi_test, 'TEST12345')}
      <button class="btn primary" id="capiSave">حفظ</button>
      ${px.capi ? `<div class="ok-text" style="margin-top:12px">الـ Conversion API مفعّل — أحداث الطلبات تُرسل تلقائياً عند كل طلب جديد.</div>` : ''}
    </div>
  </div>`;
});

// ---------- google analytics ----------
registerView('ga', async () => {
  const { ts, px } = await getPixels();
  setTimeout(() => { $('#gaSave').onclick = async () => {
    ts.pixels = { ...ts.pixels, ga: $('#pxGa').value.trim() };
    await savePixels(ts);
  }; }, 0);
  return `
  <div class="d-page">
    ${topBar('Google Analytics', 'تتبع زوار متجرك ومبيعاتك في Google Analytics 4')}
    <div class="d-card">
      ${pxField('pxGa', 'GA4 Measurement ID', 'من Google Analytics ← Admin ← Data Streams ← اختر الـ stream الخاص بمتجرك', px.ga, 'G-XXXXXXXXXX')}
      <button class="btn primary" id="gaSave">حفظ</button>
      ${px.ga ? `<div class="ok-text" style="margin-top:12px">Google Analytics مفعّل — مشاهدات الصفحات والطلبات تُرسل تلقائياً.</div>` : ''}
    </div>
  </div>`;
});
