// ==================== F6: settings tree (EasyOrders main-settings parity) ====================
const SETTINGS_TABS = [
  ['settings', 'إعدادات المتجر'],
  ['settings/domain', 'الدومين'],
  ['settings/policies', 'سياسات المتجر'],
  ['settings/head', 'إضافة كود للهيد'],
  ['settings/seo', 'إعدادات SEO'],
  ['payments', 'بوابات الدفع'],
  ['settings/digital', 'إعدادات تسليم المنتجات الرقمية', true],
  ['settings/notifications', 'إشعارات الطلبات'],
  ['shipping', 'إعدادات الشحن'],
  ['settings/social', 'روابط التواصل الاجتماعي'],
  ['team', 'إعدادات المديرين'],
  ['settings/api', 'Public API'],
  ['settings/sessions', 'جلسات الدخول'],
  ['settings/phone', 'رقم الهاتف'],
];
function settingsShell(active, title, sub, inner) {
  const nav = SETTINGS_TABS.map(([k, label, isNew]) =>
    `<button class="set-tab ${k === active ? 'on' : ''}" onclick="go('${k}')">${label}${isNew ? ' <span class="new-badge">جديد</span>' : ''}</button>`).join('');
  return shell(topBar(title, sub) +
    `<div class="set-wrap"><nav class="set-nav">${nav}</nav><div class="set-body">${inner}</div></div>`);
}
async function loadStoreSettings() {
  const d = await api('/api/store/settings');
  return d;
}

// ---- main store settings ----
registerView('settings', async () => {
  const { settings: s } = await loadStoreSettings();
  let ts = {}; try { ts = JSON.parse(STORE.theme_settings || '{}'); } catch (_) {}
  const lang = localStorage.getItem('dLang') || 'ar';
  return settingsShell('settings', 'إعدادات المتجر', 'البيانات الأساسية وحماية الطلبات', `
    <div class="card"><h3>إعدادات المتجر</h3>
      <p class="muted small">يمكنك تغيير لون واسم المتجر بسهولة وربط دومينك الخاص وتغيير العملة</p>
      <div class="f-grid f-one" style="margin-top:12px">
      <div class="f-field"><label>لغة لوحة التحكم</label><select id="stLang"><option value="ar" ${lang === 'ar' ? 'selected' : ''}>العربية</option><option value="en" ${lang === 'en' ? 'selected' : ''}>English</option></select></div>
      <div class="f-field"><label>عنوان الموقع الرئيسي</label><input id="stName" value="${esc(STORE.name)}"></div>
      <div class="f-field"><label>الجزء الإعلاني من الهيدر</label><input id="stAnnounce" value="${esc(STORE.announcement || '')}" placeholder="محتوى الجزء العلوي من الهيدر"></div>
      <div class="f-field"><label>لون الموقع</label><div style="display:flex;align-items:center;gap:8px"><input id="stPrimary" dir="ltr" value="${esc(ts.primary || '#141924')}"><input type="color" value="${esc(ts.primary || '#141924')}" oninput="$('#stPrimary').value=this.value" style="width:42px;height:38px;padding:2px"></div></div>
      <div class="f-field"><label>لوجو الموقع</label><div style="display:flex;align-items:center;gap:12px">
        ${ts.logo_img ? `<img id="stLogoImg" src="${esc(ts.logo_img)}" style="width:64px;height:64px;border-radius:14px;object-fit:contain;border:1px solid var(--line);background:#fff">` : `<span class="o-avatar" id="stLogoImg" style="width:64px;height:64px;border-radius:14px;font-size:26px">${esc((STORE.logo_text || STORE.name).trim().charAt(0))}</span>`}
        <div style="display:grid;gap:8px"><label class="btn btn-soft btn-sm" style="cursor:pointer">رفع صورة<input type="file" id="stLogoFile" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none" onchange="logoFileChosen(this)"></label>
        ${ts.logo_img ? `<button class="btn btn-danger-soft btn-sm" onclick="logoImgData='';$('#stLogoImg').outerHTML='<span class=o-avatar id=stLogoImg style=\"width:64px;height:64px;border-radius:14px;font-size:26px\">${esc((STORE.logo_text || STORE.name).trim().charAt(0))}</span>'">إزالة اللوجو</button>` : ''}</div>
      </div><p class="hint">PNG أو JPG أو SVG بحد أقصى 2 ميجا — يظهر في هيدر المتجر بدلاً من حرف الاسم</p></div>
    </div><div class="m-actions"><button class="btn btn-teal" onclick="saveGeneral()">حفظ</button></div></div>
    <div class="card"><h3>البيانات الأساسية</h3><div class="f-grid f-one">
      <div class="f-field"><label>رابط المتجر</label><div style="display:flex;align-items:center;gap:6px"><span class="muted mono small">/s/</span><input id="stSlug" dir="ltr" value="${esc(STORE.slug)}"></div></div>
      <div class="f-field full"><label>وصف المتجر</label><textarea id="stDesc" rows="2">${esc(STORE.description || '')}</textarea></div>
      <div class="f-field"><label>هاتف المتجر</label><input id="stPhone" dir="ltr" value="${esc(STORE.phone || '')}"></div>
      <div class="f-field"><label>رقم واتساب (بكود الدولة)</label><input id="stWa" dir="ltr" value="${esc(STORE.whatsapp || '')}" placeholder="2010xxxxxxxx"></div>
    </div><div class="m-actions"><button class="btn btn-teal" onclick="saveSettings()">حفظ الإعدادات</button></div></div>
    <div class="card"><h3>حماية الطلبات الوهمية</h3>
      <p class="muted small">حدد أقصى عدد لعناصر الطلب الواحد — أي طلب يتجاوزه يُرفض تلقائياً برسالة للعميل. اتركه 0 لإيقاف الحماية.</p>
      <div class="frow" style="margin-top:10px"><input id="stMaxItems" type="number" min="0" dir="ltr" style="max-width:140px" value="${esc(s.max_items || '0')}"><button class="btn btn-soft" onclick="saveStoreSetting('max_items', $('#stMaxItems').value)">حفظ</button></div>
    </div>`);
});
let logoImgData;
function logoFileChosen(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  if (f.size > 2e6) return toast('الصورة أكبر من 2 ميجا', 'err');
  const r = new FileReader();
  r.onload = () => {
    logoImgData = r.result;
    const prev = $('#stLogoImg');
    if (prev) prev.outerHTML = `<img id="stLogoImg" src="${logoImgData}" style="width:64px;height:64px;border-radius:14px;object-fit:contain;border:1px solid var(--line);background:#fff">`;
    toast('تم اختيار اللوجو — اضغط حفظ لتطبيقه');
  };
  r.readAsDataURL(f);
}
async function saveGeneral() {
  const lang = $('#stLang').value;
  let ts = {}; try { ts = JSON.parse(STORE.theme_settings || '{}'); } catch (_) {}
  ts.primary = $('#stPrimary').value.trim() || '#141924';
  if (logoImgData !== undefined) { if (logoImgData) ts.logo_img = logoImgData; else delete ts.logo_img; }
  const d = await api('/api/store', { method: 'PUT', body: { name: $('#stName').value.trim(), announcement: $('#stAnnounce').value.trim(), theme_settings: ts } });
  STORE = d.store; logoImgData = undefined;
  if (lang !== (localStorage.getItem('dLang') || 'ar')) { localStorage.setItem('dLang', lang); location.reload(); return; }
  toast('تم الحفظ'); route();
}
// ---- digital product delivery ----
registerView('settings/digital', async () => {
  const { settings: s } = await loadStoreSettings();
  let dg = { enabled: false, note: '' };
  try { dg = { ...dg, ...JSON.parse(s.digital_delivery || '{}') }; } catch (_) {}
  return settingsShell('settings/digital', 'إعدادات تسليم المنتجات الرقمية', 'رسالة التسليم التي تظهر للعميل بعد شراء منتج رقمي', `
    <div class="card"><h3>تسليم المنتجات الرقمية</h3>
      <label class="notif-row"><span class="nr-txt"><b>تفعيل التسليم الرقمي</b><small class="muted">يعرض نص التسليم للعميل في صفحة تأكيد الطلب عند شراء منتج رقمي</small></span><input type="checkbox" id="dgOn" ${dg.enabled ? 'checked' : ''}></label>
      <div class="f-field full" style="margin-top:12px"><label>نص التسليم</label><textarea id="dgNote" rows="3" placeholder="مثال: يصلك رابط التحميل على واتساب خلال دقائق من تأكيد الطلب">${esc(dg.note)}</textarea></div>
      <div class="m-actions"><button class="btn btn-teal" onclick="saveDigital()">حفظ</button></div>
    </div>`);
});
async function saveDigital() {
  await api('/api/store/settings', { method: 'PUT', body: { digital_delivery: JSON.stringify({ enabled: $('#dgOn').checked, note: $('#dgNote').value.trim() }) } });
  toast('تم الحفظ');
}
async function saveStoreSetting(key, value) {
  const b = {}; b[key] = value;
  await api('/api/store/settings', { method: 'PUT', body: b });
  toast('تم الحفظ');
}

// ---- order notifications ----
registerView('settings/notifications', async () => {
  const { settings: s } = await loadStoreSettings();
  let n = { enabled: true, new_order: true, low_stock: true, carts: false, email_on: false, email: '' };
  try { n = { ...n, ...JSON.parse(s.notifications || '{}') }; } catch (_) {}
  const chk = (id, label, hint, on) => `<label class="notif-row"><span class="nr-txt"><b>${label}</b><small class="muted">${hint}</small></span><input type="checkbox" id="${id}" ${on ? 'checked' : ''}></label>`;
  return settingsShell('settings/notifications', 'إشعارات الطلبات', 'تحكم في التنبيهات التي تصلك عن نشاط متجرك', `
    <div class="card"><h3>إشعارات داخل لوحة التحكم</h3>
      ${chk('ntEnabled', 'تفعيل الإشعارات', 'الإيقاف يخفي كل تنبيهات الطلبات من الجرس', n.enabled)}
      ${chk('ntNew', 'طلب جديد', 'تنبيه فوري مع عدّاد على جرس الإشعارات عند وصول طلب', n.new_order)}
      ${chk('ntLow', 'تنبيه المخزون', 'إشعار عند انخفاض مخزون منتج نشط أو نفاده', n.low_stock)}
      ${chk('ntCarts', 'السلات المتروكة', 'إشعار عند وجود سلات جديدة لم تُكمل الشراء', n.carts)}
    </div>
    <div class="card"><h3>إشعار بريدي عند كل طلب جديد</h3>
      ${chk('ntEmailOn', 'تفعيل الإشعار البريدي', 'يصلك بريد بملخص كل طلب جديد فور وصوله', n.email_on)}
      <div class="f-field" style="margin-top:8px"><label>البريد الذي تصلك عليه الإشعارات</label><input id="ntEmail" dir="ltr" type="email" value="${esc(n.email)}" placeholder="you@store.com"></div>
      <p class="muted small" style="margin-top:6px">تُرسل الرسائل عبر بريد المنصة عند تفعيله، وتُسجَّل حالة كل رسالة في سجل التكاملات.</p>
    </div>
    <div class="m-actions"><button class="btn btn-teal" onclick="saveNotifSettings()">حفظ الإشعارات</button></div>`);
});
async function saveNotifSettings() {
  const n = { enabled: $('#ntEnabled').checked, new_order: $('#ntNew').checked, low_stock: $('#ntLow').checked, carts: $('#ntCarts').checked, email_on: $('#ntEmailOn').checked, email: $('#ntEmail').value.trim() };
  await api('/api/store/settings', { method: 'PUT', body: { notifications: JSON.stringify(n) } });
  window.SETTINGS = { ...(window.SETTINGS || {}), notifications: JSON.stringify(n) };
  toast('تم حفظ الإشعارات');
}

// ---- domain ----
registerView('settings/domain', async () => {
  const { settings: s } = await loadStoreSettings();
  const cur = s.custom_domain || '';
  return settingsShell('settings/domain', 'الدومين', 'اربط نطاقك الخاص بمتجرك', `
    <div class="card"><h3>ربط دومين خاص</h3>
      <p class="muted small">اربط نطاقك الخاص (مثل store.com) بمتجرك لروابط أنظف وثقة أعلى. أضف سجل CNAME يشير إلى <span class="mono" dir="ltr">stores.activetecno.software</span> ثم أدخل النطاق — يتم الربط يدوياً من فريقنا خلال 24 ساعة وستصلك رسالة تأكيد.</p>
      ${cur ? `<p class="small" style="margin:10px 0 0">النطاق الحالي: <b class="mono" dir="ltr">${esc(cur)}</b> <span class="chip st-pending">قيد الربط</span></p>` : ''}
      <div class="frow" style="margin-top:10px"><input id="stDomain" placeholder="www.mystore.com" dir="ltr" value="${esc(cur)}"><button class="btn btn-teal" onclick="saveStoreSetting('custom_domain', $('#stDomain').value.trim()); route()">ربط النطاق</button></div>
    </div>`);
});

// ---- policies ----
registerView('settings/policies', async () => {
  const { settings: s } = await loadStoreSettings();
  let pol = {}; try { pol = JSON.parse(s.policies || '{}'); } catch (_) {}
  const f = (k, label) => `<div class="f-field full"><label>${label}</label><textarea id="pol_${k}" rows="5">${esc(pol[k] || '')}</textarea></div>`;
  return settingsShell('settings/policies', 'سياسات المتجر', 'تظهر للعملاء في صفحة السياسات بمتجرك', `
    <div class="card"><div class="f-grid">
      ${f('terms', 'شروط الاستخدام')}${f('privacy', 'سياسة الخصوصية')}
      ${f('returns', 'سياسة الاستبدال والاسترجاع')}${f('shipping', 'سياسة الشحن والتوصيل')}
    </div><div class="m-actions">
      <a class="btn btn-soft" href="/s/${esc(STORE.slug)}/policies" target="_blank">معاينة صفحة السياسات</a>
      <button class="btn btn-teal" onclick="savePolicies()">حفظ السياسات</button></div></div>`);
});
async function savePolicies() {
  const pol = { terms: $('#pol_terms').value, privacy: $('#pol_privacy').value, returns: $('#pol_returns').value, shipping: $('#pol_shipping').value };
  await api('/api/store/settings', { method: 'PUT', body: { policies: JSON.stringify(pol) } });
  toast('تم حفظ السياسات');
}

// ---- head code ----
registerView('settings/head', async () => {
  const { settings: s } = await loadStoreSettings();
  return settingsShell('settings/head', 'إضافة كود للهيد', 'كود مخصص يُحقن في head متجرك', `
    <div class="card"><h3>كود الهيد</h3>
      <p class="muted small">أي كود هنا يُضاف داخل وسم head في كل صفحات متجرك — مفيد لأكواد التحقق من محركات البحث أو أدوات التحليلات. لا يُحقن في النسخ التجريبية.</p>
      <div class="f-field full" style="margin-top:10px"><textarea id="stHead" rows="8" dir="ltr" class="mono" placeholder='<meta name="google-site-verification" content="...">'>${esc(s.head_code || '')}</textarea></div>
      <div class="m-actions"><button class="btn btn-teal" onclick="saveStoreSetting('head_code', $('#stHead').value)">حفظ الكود</button></div></div>`);
});

// ---- SEO ----
registerView('settings/seo', async () => {
  const { settings: s } = await loadStoreSettings();
  let seo = {}; try { seo = JSON.parse(s.seo || '{}'); } catch (_) {}
  return settingsShell('settings/seo', 'إعدادات SEO', 'تحكم في ظهور متجرك في محركات البحث', `
    <div class="card"><div class="f-grid">
      <div class="f-field full"><label>عنوان الصفحة (Meta Title)</label><input id="seoTitle" value="${esc(seo.title || '')}" placeholder="${esc(STORE.name)}"></div>
      <div class="f-field full"><label>وصف الصفحة (Meta Description)</label><textarea id="seoDesc" rows="3">${esc(seo.desc || '')}</textarea></div>
      <div class="f-field full"><label>الكلمات المفتاحية (افصل بينها بفاصلة)</label><input id="seoKeys" value="${esc(seo.keywords || '')}"></div>
    </div><div class="m-actions"><button class="btn btn-teal" onclick="saveSeo()">حفظ إعدادات SEO</button></div></div>`);
});
async function saveSeo() {
  const seo = { title: $('#seoTitle').value.trim(), desc: $('#seoDesc').value.trim(), keywords: $('#seoKeys').value.trim() };
  await api('/api/store/settings', { method: 'PUT', body: { seo: JSON.stringify(seo) } });
  toast('تم حفظ إعدادات SEO');
}

// ---- social links ----
registerView('settings/social', async () => {
  const { settings: s } = await loadStoreSettings();
  let so = {}; try { so = JSON.parse(s.social || '{}'); } catch (_) {}
  const f = (k, label, ph) => `<div class="f-field"><label>${label}</label><input id="so_${k}" dir="ltr" value="${esc(so[k] || '')}" placeholder="${ph}"></div>`;
  return settingsShell('settings/social', 'روابط التواصل الاجتماعي', 'تظهر في تذييل متجرك', `
    <div class="card"><div class="f-grid">
      ${f('facebook', 'فيسبوك', 'https://facebook.com/...')}
      ${f('instagram', 'انستجرام', 'https://instagram.com/...')}
      ${f('tiktok', 'تيك توك', 'https://tiktok.com/@...')}
    </div><p class="muted small">رابط واتساب يُضاف تلقائياً من رقم الواتساب في إعدادات المتجر.</p>
    <div class="m-actions"><button class="btn btn-teal" onclick="saveSocial()">حفظ الروابط</button></div></div>`);
});
async function saveSocial() {
  const so = { facebook: $('#so_facebook').value.trim(), instagram: $('#so_instagram').value.trim(), tiktok: $('#so_tiktok').value.trim() };
  await api('/api/store/settings', { method: 'PUT', body: { social: JSON.stringify(so) } });
  toast('تم حفظ الروابط');
}

// ---- public API ----
registerView('settings/api', async () => {
  const { api_key, settings: ss } = await loadStoreSettings();
  const { deliveries } = await api('/api/settings/webhook-deliveries');
  const delRows = deliveries.map(x => `<tr><td class="mono small" dir="ltr">#${x.order_id || '-'}</td><td class="mono small" dir="ltr">${esc(x.status_code || '-')}</td><td>${x.ok ? '<span class="chip st-delivered">نجح</span>' : '<span class="chip st-cancelled">فشل</span>'}</td><td class="muted small">${esc((x.created_at || '').replace('T', ' ').slice(0, 16))}</td></tr>`).join('');
  return settingsShell('settings/api', 'Public API', 'وصول برمجي لطلبات متجرك', `
    <div class="card"><h3>ويب هوك الطلبات (صادر)</h3>
      <p class="muted small">عند ضبط رابط، يمكنك إعادة إرسال أي طلب كنص JSON موقّع إلى نظامك الخارجي من صفحة الطلبات. الروابط الداخلية (localhost/شبكات خاصة) مرفوضة، والإرسال https فقط.</p>
      <div class="f-grid" style="margin-top:10px">
        <div class="f-field"><label>رابط الويب هوك (https)</label><input id="whUrl" dir="ltr" placeholder="https://example.com/hooks/orders" value="${esc(ss.webhook_url || '')}"></div>
        <div class="f-field"><label>سر التوقيع (اختياري)</label><input id="whSecret" dir="ltr" placeholder="يُرسل التوقيع في ترويسة X-Webhook-Signature" value="${esc(ss.webhook_secret || '')}"></div>
      </div>
      <div class="m-actions"><button class="btn btn-teal" onclick="saveWebhookSettings()">حفظ</button></div>
    </div>
    ${deliveries.length ? `<div class="card"><h3>آخر عمليات التسليم</h3><div class="tbl-wrap" style="border:0;box-shadow:none"><table class="tbl"><thead><tr><th>الطلب</th><th>الاستجابة</th><th>النتيجة</th><th>الوقت</th></tr></thead><tbody>${delRows}</tbody></table></div></div>` : ''}`
    + `

    <div class="card"><h3>مفتاح API</h3>
      ${api_key
        ? `<p class="muted small">مفتاحك الحالي — احتفظ به سراً، وأعد توليده إذا تسرب:</p>
           <div class="frow" style="margin-top:10px"><input class="mono" dir="ltr" readonly value="${esc(api_key)}" onclick="this.select()">
           <button class="btn btn-danger-soft" onclick="regenApiKey()">إعادة توليد</button></div>`
        : `<p class="muted small">لا يوجد مفتاح بعد. ولّد مفتاحاً لقراءة طلبات متجرك برمجياً.</p>
           <div class="m-actions"><button class="btn btn-teal" onclick="regenApiKey()">توليد مفتاح</button></div>`}
    </div>
    ${api_key ? `<div class="card"><h3>مثال الاستخدام</h3>
      <pre class="mono small" dir="ltr" style="background:var(--soft);padding:12px;border-radius:10px;overflow:auto">GET /api/v1/${esc(STORE.slug)}/orders?key=${esc(api_key)}</pre>
      <p class="muted small">يرجع آخر 100 طلب بصيغة JSON: الرقم، العميل، المحافظة، الإجمالي، الحالة، التاريخ.</p></div>` : ''}`);
});
async function saveWebhookSettings() {
  await api('/api/store/settings', { method: 'PUT', body: { webhook_url: $('#whUrl').value.trim(), webhook_secret: $('#whSecret').value.trim() } });
  toast('تم حفظ إعدادات الويب هوك');
}
async function regenApiKey() {
  if (!confirm('توليد مفتاح جديد؟ أي تكامل يعمل بالمفتاح القديم سيتوقف.')) return;
  await api('/api/store/api-key', { method: 'POST' });
  toast('تم توليد مفتاح جديد'); route();
}

// ---- sessions ----
registerView('settings/sessions', async () => {
  const { sessions } = await api('/api/settings/sessions');
  const rows = sessions.map(x => `<div class="integ-row"><div class="integ-ic">${I('shield')}</div>
    <div style="flex:1"><h3>جلسة <span class="mono small" dir="ltr">${esc(x.hint)}…</span> ${x.current ? '<span class="chip st-live">الجلسة الحالية</span>' : ''}</h3>
    <p class="muted small">بدأت: ${esc((x.created_at || '').replace('T', ' ').slice(0, 16))} · تنتهي: ${esc((x.expires_at || '').slice(0, 10))}</p></div></div>`).join('');
  return settingsShell('settings/sessions', 'جلسات الدخول', 'الأجهزة المتصلة بحسابك', `
    <div class="card"><h3>تغيير كلمة المرور</h3>
      <div class="f-field"><label>كلمة المرور الحالية</label><input id="pwCur" type="password" dir="ltr" autocomplete="current-password"></div>
      <div class="f-field"><label>كلمة المرور الجديدة (8 أحرف على الأقل)</label><input id="pwNext" type="password" dir="ltr" autocomplete="new-password"></div>
      <div class="f-field"><label>تأكيد كلمة المرور الجديدة</label><input id="pwNext2" type="password" dir="ltr" autocomplete="new-password"></div>
      <div class="m-actions"><button class="btn btn-primary" onclick="changePassword()">تغيير كلمة المرور</button></div>
      <p class="muted small">بعد التغيير تُنهى كل الجلسات الأخرى تلقائياً.</p></div>
    <div class="card"><h3>الجلسات النشطة</h3>${rows || '<p class="muted small">لا توجد جلسات.</p>'}</div>
    <div class="m-actions"><button class="btn btn-danger-soft" onclick="revokeOtherSessions()">إنهاء كل الجلسات الأخرى</button></div>`);
});
async function changePassword() {
  const cur = document.getElementById('pwCur').value, n1 = document.getElementById('pwNext').value, n2 = document.getElementById('pwNext2').value;
  if (n1.length < 8) return toast('كلمة المرور الجديدة 8 أحرف على الأقل', 'err');
  if (n1 !== n2) return toast('تأكيد كلمة المرور غير مطابق', 'err');
  const r = await api('/api/auth/change-password', { method: 'POST', body: { current: cur, next: n1 } });
  if (r.error) return toast(r.error, 'err');
  toast('تم تغيير كلمة المرور'); route();
}
async function revokeOtherSessions() {
  await api('/api/settings/sessions/revoke-others', { method: 'POST' });
  toast('تم إنهاء الجلسات الأخرى'); route();
}

// ---- phone ----
registerView('settings/phone', async () => {
  return settingsShell('settings/phone', 'رقم الهاتف', 'هاتف المتجر الظاهر للعملاء', `
    <div class="card"><div class="f-grid">
      <div class="f-field"><label>رقم هاتف المتجر</label><input id="phStore" dir="ltr" value="${esc(STORE.phone || '')}"></div>
    </div><div class="m-actions"><button class="btn btn-teal" onclick="saveStoreSetting('phone', $('#phStore').value.trim()); toast('تم حفظ رقم الهاتف')">حفظ</button></div></div>`);
});
