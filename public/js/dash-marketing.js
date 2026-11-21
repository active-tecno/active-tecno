// dash-marketing.js — Stage F4: marketing tools cluster

async function getMkt() { const d = await api('/api/marketing'); return d.settings || {}; }
async function putMkt(body) { await api('/api/marketing', { method: 'PUT', body }); toast('تم الحفظ'); }
const mktToggle = (id, on) => `<label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><span></span></label>`;

// ---------- Cross Sell ----------
registerView('cross-sell', async () => {
  const { items } = await api('/api/cross-sells');
  return `
  <div class="d-page">
    ${topBar('Cross Sell', 'اعرض منتجات مكملة لعملائك أثناء إتمام الطلب لزيادة قيمة السلة', `<button class="btn primary" onclick="xsModal()">+ إضافة ربط</button>`)}
    ${items.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>عند شراء</th><th>يُعرض معه</th><th>سعر المنتج المكمل</th><th></th></tr></thead><tbody>
      ${items.map(c => `<tr><td><b>${esc(c.product_name)}</b></td><td>${esc(c.related_name)}</td><td>${egp(c.related_price)}</td>
        <td class="acts"><button class="btn sm danger" onclick="xsDel(${c.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>` : `
    <div class="d-card empty"><div class="empty-ic">${I('cross')}</div><h3>لا توجد روابط Cross Sell حتى الآن</h3><p class="muted">اربط كل منتج بمنتج مكمل — يظهر كاقتراح "أضف لطلبك أيضاً" في صفحة إتمام الطلب.</p><button class="btn primary" onclick="xsModal()">+ إضافة ربط</button></div>`}
  </div>`;
});
async function xsModal() {
  const { products } = await api('/api/products');
  const opts = products.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  openModal('إضافة Cross Sell', `
    <label class="d-label">عند شراء العميل *</label><select id="xsA" class="d-input">${opts}</select>
    <label class="d-label">يظهر له كاقتراح *</label><select id="xsB" class="d-input">${opts}</select>
    <button class="btn primary" onclick="xsSave()">حفظ</button>`, () => {});
}
async function xsSave() {
  const r = await api('/api/cross-sells', { method: 'POST', body: { product_id: +$('#xsA').value, related_product_id: +$('#xsB').value } });
  if (r.error) return toast(r.error, 'err');
  closeModal(); toast('تمت الإضافة'); rerender();
}
async function xsDel(id) { if (!confirm('حذف هذا الربط؟')) return; await api('/api/cross-sells/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }

// ---------- Retargeting ----------
registerView('retargeting', async () => {
  const s = await getMkt();
  const integ = await api('/api/store/integrations');
  const waOk = integ.whatsapp && integ.whatsapp.configured;
  return `
  <div class="d-page">
    ${topBar('اعادة الاستهداف', 'استرجع عملاءك تلقائياً برسائل واتساب ذكية', '')}
    <div class="d-card">
      <div class="d-row-between"><div><h3>${I('whatsapp')} تأكيد الطلب بواتساب</h3>
      <p class="muted">رسالة واتساب تلقائية للعميل فور تسجيل طلبه، مع زري تأكيد وإلغاء يحدّثان حالة الطلب في لوحتك.</p></div>
      ${mktToggle('waOC', s.wa_order_confirm === '1')}</div>
      <div class="d-row-between" style="margin-top:14px"><div><h3>${I('carts')} استرجاع السلات المهجورة</h3>
      <p class="muted">إذا ترك العميل سلة برقم هاتفه دون إتمام الطلب، نرسل له تذكير واتساب بعد ساعة — رسالة واحدة فقط لكل سلة.</p></div>
      ${mktToggle('waCR', s.wa_cart_recovery === '1')}</div>
      <button class="btn primary" style="margin-top:16px" onclick="saveRetargeting()">حفظ الاعدادات</button>
    </div>
    <div class="d-card ${waOk ? '' : 'warn'}">
      ${waOk ? `<h3>${I('check')} واتساب الرسمي متصل</h3><p class="muted">الرسائل ستُرسل فعلياً من رقم واتساب للأعمال المربوط بالمنصة.</p>`
      : `<h3>${I('bell')} واتساب الرسمي غير متصل بعد</h3><p class="muted">الاعدادات محفوظة وستعمل فور ربط واتساب للأعمال من قبل إدارة المنصة — راجع صفحة WhatsApp API للتفاصيل. لن تُرسل أي رسائل حقيقية قبل الربط.</p>`}
    </div>
  </div>`;
});
async function saveRetargeting() {
  await putMkt({ wa_order_confirm: $('#waOC').checked ? '1' : '0', wa_cart_recovery: $('#waCR').checked ? '1' : '0' });
}

// ---------- WhatsApp API ----------
registerView('whatsapp-api', async () => {
  const integ = await api('/api/store/integrations');
  const waOk = integ.whatsapp && integ.whatsapp.configured;
  return `
  <div class="d-page">
    ${topBar('WhatsApp API', 'ربط واتساب للأعمال الرسمي من ميتا', '')}
    <div class="d-card">
      <h3>${I('whatsapp')} حالة الربط</h3>
      <p>${waOk ? '<span class="chip st-delivered">متصل</span>' : '<span class="chip">غير متصل</span>'}</p>
      <p class="muted" style="line-height:1.9">يربط فريق اكتف اوردر رقم واتساب للأعمال الرسمي (Meta Business API) لمتجرك، لتعمل معه تأكيدات الطلبات واسترجاع السلات وأزرار التأكيد والإلغاء التفاعلية.</p>
    </div>
    <div class="d-card guide">
      <h3>${I('help')} ماذا يفعل الربط؟</h3>
      <p class="muted" style="line-height:2">١. رسالة تأكيد تلقائية للعميل عند كل طلب جديد.<br>٢. أزرار "تأكيد" و"إلغاء" تُحدّث حالة الطلب لحظياً في لوحة التحكم.<br>٣. تذكير السلات المهجورة بعد ساعة من تركها.<br>٤. يمكنك أيضاً إرسال تأكيد يدوي لأي طلب من صفحة الطلبات.</p>
      <p class="muted">لطلب الربط لمتجرك تواصل معنا عبر واتساب المنصة من صفحة معرض الخدمات.</p>
    </div>
  </div>`;
});

// ---------- Top Media Buyers (توثيق الطلبات) ----------
registerView('top-mb', async () => {
  const d = await api('/api/orders');
  const real = d.orders.filter(o => !o.demo && o.status !== 'cancelled' && o.status !== 'returned');
  const link = `${location.origin}/s/${STORE.slug}/verified`;
  return `
  <div class="d-page">
    ${topBar('توثيق الطلبات', 'أثبت للعملاء أن متجرك يبيع فعلاً — صفحة عامة بعدد طلباتك الموثقة', '')}
    <div class="d-card stats-grid">
      <div class="stat"><div class="stat-ic">${I('badgecheck')}</div><div><b>${real.length}</b><span>طلب موثق</span></div></div>
      <div class="stat"><div class="stat-ic">${I('cash')}</div><div><b>${egp(real.reduce((t, o) => t + o.total, 0))}</b><span>إجمالي قيمة الطلبات</span></div></div>
    </div>
    <div class="d-card">
      <h3>${I('link')} صفحة التوثيق العامة</h3>
      <p class="muted">شارك هذا الرابط مع عملائك أو أضفه لإعلاناتك — الأرقام محسوبة لحظياً من سجلات الطلبات الفعلية ولا يمكن تعديلها يدوياً.</p>
      <div class="copy-row"><input class="d-input ltr" readonly value="${link}" id="topmbLink"><button class="btn primary" onclick="copyEl('topmbLink')">نسخ</button>
      <a class="btn" href="${link}" target="_blank" rel="noopener">معاينة</a></div>
    </div>
  </div>`;
});
function copyEl(id) { const el = document.getElementById(id); el.select(); navigator.clipboard.writeText(el.value).then(() => toast('تم النسخ')); }

// ---------- UTM Builder ----------
registerView('utm-builder', async () => {
  const { stats } = await api('/api/marketing/utm-stats');
  const { products } = await api('/api/products');
  const { funnels } = await api('/api/funnels');
  return `
  <div class="d-page">
    ${topBar('UTM Builder', 'أنشئ روابط حملات تتبع مصدر كل طلب بدقة', '')}
    <div class="d-card">
      <div class="form-grid">
        <div><label class="d-label">الصفحة المستهدفة</label>
        <select id="utmPage" class="d-input">
          <option value="">الرئيسية للمتجر</option>
          ${products.map(p => `<option value="/p/${p.id}">منتج: ${esc(p.name)}</option>`).join('')}
          ${funnels.map(f => `<option value="/f/${f.id}">Funnel: ${esc(f.name)}</option>`).join('')}
        </select></div>
        <div><label class="d-label">utm_source *</label><input id="utmSource" class="d-input ltr" placeholder="facebook"></div>
        <div><label class="d-label">utm_medium</label><input id="utmMedium" class="d-input ltr" placeholder="cpc"></div>
        <div><label class="d-label">utm_campaign</label><input id="utmCampaign" class="d-input ltr" placeholder="winter-sale"></div>
      </div>
      <button class="btn primary" style="margin-top:14px" onclick="buildUtm()">توليد الرابط</button>
      <div class="copy-row" id="utmOut" hidden><input class="d-input ltr" readonly id="utmLink"><button class="btn primary" onclick="copyEl('utmLink')">نسخ</button></div>
    </div>
    ${stats.length ? `<div class="d-card"><h3>${I('stats')} نتائج الحملات</h3>
      <table class="d-table"><thead><tr><th>المصدر</th><th>الوسيط</th><th>الحملة</th><th>طلبات</th><th>إيراد</th></tr></thead><tbody>
      ${stats.map(s => `<tr><td class="ltr">${esc(s.utm_source)}</td><td class="ltr">${esc(s.utm_medium || '—')}</td><td class="ltr">${esc(s.utm_campaign || '—')}</td><td>${s.orders}</td><td>${egp(s.revenue)}</td></tr>`).join('')}</tbody></table></div>` : ''}
  </div>`;
});
function buildUtm() {
  const src = $('#utmSource').value.trim();
  if (!src) return toast('utm_source مطلوب', 'err');
  const u = new URL(`${location.origin}/s/${STORE.slug}${$('#utmPage').value}`);
  u.searchParams.set('utm_source', src);
  if ($('#utmMedium').value.trim()) u.searchParams.set('utm_medium', $('#utmMedium').value.trim());
  if ($('#utmCampaign').value.trim()) u.searchParams.set('utm_campaign', $('#utmCampaign').value.trim());
  $('#utmLink').value = u.toString();
  $('#utmOut').hidden = false;
}

// ---------- Google Merchant ----------
registerView('google-merchant', async () => {
  const s = await getMkt();
  const feed = `${location.origin}/api/public/${STORE.slug}/feed.csv`;
  return `
  <div class="d-page">
    ${topBar('Google Merchant', 'صدّر منتجاتك إلى Google Shopping واحصل على زيارات مجانية', '')}
    <div class="d-card">
      <h3>${I('feed')} رابط الـ Product Feed</h3>
      <p class="muted">أضف هذا الرابط في Google Merchant Center كـ Scheduled Fetch — يتحدث تلقائياً مع كل تعديل على منتجاتك.</p>
      <div class="copy-row"><input class="d-input ltr" readonly value="${feed}" id="gmcFeed"><button class="btn primary" onclick="copyEl('gmcFeed')">نسخ</button></div>
    </div>
    <div class="d-card">
      <h3>${I('merchant')} بيانات المتجر لدى Google</h3>
      <label class="d-label">البريد الإلكتروني للمتجر</label><input id="gmcEmail" class="d-input ltr" value="${esc(s.gmc_email || '')}" placeholder="store@example.com">
      <label class="d-label">رقم هاتف المتجر</label><input id="gmcPhone" class="d-input ltr" value="${esc(s.gmc_phone || '')}" placeholder="01xxxxxxxxx">
      <button class="btn primary" style="margin-top:14px" onclick="saveGmc()">حفظ</button>
    </div>
  </div>`;
});
async function saveGmc() { await putMkt({ gmc_email: $('#gmcEmail').value.trim(), gmc_phone: $('#gmcPhone').value.trim() }); }

// ---------- Sales Popup ----------
registerView('sales-popup', async () => {
  const s = await getMkt();
  return `
  <div class="d-page">
    ${topBar('Sales Popup', 'إشعارات "اشترى فلان الآن" تبني الثقة وتزيد التحويل', '')}
    <div class="d-card">
      <div class="d-row-between"><div><h3>${I('popup')} تفعيل الإشعارات</h3>
      <p class="muted">تظهر للزائر كل ٢٥ ثانية: اسم أول فقط + المحافظة + المنتج، من آخر ١٠ طلبات حقيقية. لا أسماء كاملة ولا أرقام هواتف.</p></div>
      ${mktToggle('spOn', s.sales_popup === '1')}</div>
      <button class="btn primary" style="margin-top:16px" onclick="saveSalesPopup()">حفظ</button>
    </div>
    <div class="d-card guide"><h3>${I('eye')} شكل الإشعار</h3>
      <div class="sp-preview"><div class="sp-dot"></div><div><b>مريم — القاهرة</b><span>اشترت كارديجان شتوي طويل</span></div></div>
    </div>
  </div>`;
});
async function saveSalesPopup() { await putMkt({ sales_popup: $('#spOn').checked ? '1' : '0' }); }

// ---------- Referral link ----------
registerView('referral-link', async () => {
  const { links } = await api('/api/referral-links');
  return `
  <div class="d-page">
    ${topBar('انشاء رابط احالة', 'روابط مخصصة للمسوقين والمؤثرين تتبع الطلبات القادمة منهم', '')}
    <div class="d-card">
      <div class="form-grid">
        <div><label class="d-label">كود الإحالة * (إنجليزي بدون مسافات)</label><input id="refCode" class="d-input ltr" placeholder="mohamed20"></div>
        <div><label class="d-label">اسم المسوق (للتمييز الداخلي)</label><input id="refName" class="d-input" placeholder="مثال: حملة محمد — تيك توك"></div>
      </div>
      <button class="btn primary" style="margin-top:14px" onclick="refSave()">إنشاء الرابط</button>
    </div>
    ${links.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>الكود</th><th>المسوق</th><th>طلبات</th><th>الرابط</th><th></th></tr></thead><tbody>
      ${links.map(l => `<tr><td class="ltr"><b>${esc(l.code)}</b></td><td>${esc(l.name || '—')}</td><td>${l.orders}</td>
        <td><button class="btn sm" onclick="copyRef('${esc(l.code)}')">نسخ الرابط</button></td>
        <td class="acts"><button class="btn sm danger" onclick="refDel(${l.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>` : `
    <div class="d-card empty"><div class="empty-ic">${I('link')}</div><h3>لا توجد روابط إحالة حتى الآن</h3><p class="muted">أنشئ رابطاً لكل مسوق أو قناة إعلانية، وسيُحسب كل طلب يصل عبره في الجدول.</p></div>`}
  </div>`;
});
async function refSave() {
  const r = await api('/api/referral-links', { method: 'POST', body: { code: $('#refCode').value.trim(), name: $('#refName').value.trim() } });
  if (r.error) return toast(r.error, 'err');
  toast('تم إنشاء الرابط'); rerender();
}
async function refDel(id) { if (!confirm('حذف رابط الإحالة؟')) return; await api('/api/referral-links/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }
function copyRef(code) { navigator.clipboard.writeText(`${location.origin}/s/${STORE.slug}?ref=${code}`).then(() => toast('تم نسخ الرابط')); }

// ---------- Min order ----------
registerView('min-order', async () => {
  const s = await getMkt();
  return `
  <div class="d-page">
    ${topBar('حد ادنى للطلب', 'لن يتمكن العميل من إتمام طلب أقل من هذا المبلغ', '')}
    <div class="d-card">
      <label class="d-label">الحد الأدنى لقيمة الطلب (ج.م) — ٠ يعني بدون حد</label>
      <input id="minOrder" type="number" min="0" step="1" class="d-input ltr" value="${esc(s.min_order || '0')}">
      <button class="btn primary" style="margin-top:14px" onclick="saveMinOrder()">حفظ</button>
    </div>
  </div>`;
});
async function saveMinOrder() { await putMkt({ min_order: String(Math.max(0, +$('#minOrder').value || 0)) }); }

// ---------- Downsell ----------
registerView('downsell', async () => {
  const s = await getMkt();
  const { products } = await api('/api/products');
  const ds = s.downsell ? JSON.parse(s.downsell) : {};
  return `
  <div class="d-page">
    ${topBar('Downsell', 'عرض أخير بخصم خاص في صفحة "شكراً لك" بعد تأكيد الطلب', '')}
    <div class="d-card">
      <label class="d-label">المنتج المعروض</label>
      <select id="dsProduct" class="d-input"><option value="">— معطّل —</option>
        ${products.map(p => `<option value="${p.id}" ${ds.product_id === p.id ? 'selected' : ''}>${esc(p.name)} (${egp(p.price)})</option>`).join('')}</select>
      <label class="d-label">نسبة الخصم ٪</label>
      <input id="dsDisc" type="number" min="1" max="90" step="1" class="d-input ltr" value="${ds.discount_pct || 20}">
      <button class="btn primary" style="margin-top:14px" onclick="saveDownsell()">حفظ</button>
    </div>
    <div class="d-card guide"><h3>${I('help')} كيف يعمل؟</h3>
      <p class="muted" style="line-height:1.9">بعد أن يؤكد العميل طلبه يرى عرضاً خاصاً لمنتج واحد بخصمك المحدد — يضيفه بضغطة واحدة بنفس بياناته وعنوانه، والدفع عند الاستلام. إن كان المنتج في طلبه أصلاً فلن يظهر العرض.</p></div>
  </div>`;
});
async function saveDownsell() {
  const pid = +$('#dsProduct').value || 0;
  await putMkt({ downsell: pid ? JSON.stringify({ product_id: pid, discount_pct: Math.min(90, Math.max(1, +$('#dsDisc').value || 20)) }) : '' });
}
