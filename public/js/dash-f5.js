// dash-f5.js — Stage F5: wallet, plugins, blogs, community services, subscriptions

// ---------- wallet: top-up (شحن المحفظة) — our real activation billing ----------
registerView('top-up', async () => {
  const d = await api('/api/activation');
  const reqs = d.requests || [];
  const pending = reqs.find(r => r.status === 'pending');
  return `
  <div class="d-page">
    ${topBar('شحن المحفظة', 'فعّل نشر متجرك — 50 ج.م كل 30 يوم، بدون عمولة على المبيعات', '')}
    <div class="d-card stats-grid">
      <div class="stat"><div class="stat-ic">${I('wallet')}</div><div><b>${STORE.is_published ? 'مفعّل' : 'غير مفعّل'}</b><span>حالة النشر</span></div></div>
      <div class="stat"><div class="stat-ic">${I('check')}</div><div><b>${STORE.published_until || '—'}</b><span>صالح حتى</span></div></div>
      <div class="stat"><div class="stat-ic">${I('percent')}</div><div><b>0%</b><span>عمولة على الطلبات</span></div></div>
    </div>
    ${pending ? `<div class="d-card warn"><h3>${I('cash')} طلبك قيد المراجعة</h3><p class="muted">استلمنا طلبك (${pending.method === 'instapay' ? 'InstaPay' : 'Vodafone Cash'} — مرجع ${esc(pending.reference)}) وسيتم التفعيل خلال ساعات.</p></div>`
    : `<div class="d-card">
      <h3>${I('cash')} خطة النشر — 50 ج.م / 30 يوم</h3>
      <p class="muted" style="line-height:1.9">حوّل 50 ج.م إلى حساب اكتف اوردر ثم أدخل رقم المرجع. يراجع فريقنا الطلب ويفعّل النشر خلال ساعات.</p>
      <div class="form-grid">
        <div><label class="d-label">وسيلة التحويل</label>
        <select id="topupMethod" class="d-input"><option value="instapay">InstaPay — activetecno@instapay</option><option value="vodafone_cash">Vodafone Cash — 01011206670</option></select></div>
        <div><label class="d-label">رقم المرجع / الإيصال</label><input id="topupRef" class="d-input ltr" placeholder="مثال: 304455667788"></div>
      </div>
      <button class="btn primary" style="margin-top:14px" onclick="submitTopup()">إرسال طلب التفعيل</button>
    </div>`}
  </div>`;
});
async function submitTopup() {
  const reference = $('#topupRef').value.trim();
  if (!reference) return toast('أدخل رقم المرجع', 'err');
  const r = await api('/api/activation', { method: 'POST', body: { method: $('#topupMethod').value, reference } });
  if (r.error) return toast(r.error, 'err');
  toast('تم إرسال طلبك — سيُراجع خلال ساعات'); rerender();
}

// ---------- wallet: transactions ----------
registerView('transactions', async () => {
  const d = await api('/api/activation');
  const reqs = d.requests || [];
  const stTxt = { pending: '<span class="chip st-new">قيد المراجعة</span>', approved: '<span class="chip st-delivered">مقبول</span>', rejected: '<span class="chip st-cancelled">مرفوض</span>' };
  return `
  <div class="d-page">
    ${topBar('المعاملات', 'سجل مدفوعات تفعيل متجرك', '')}
    ${reqs.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>#</th><th>المبلغ</th><th>الوسيلة</th><th>المرجع</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>
      ${reqs.map(r => `<tr><td class="mono">${r.id}</td><td>${egp(r.amount)}</td><td>${r.method === 'instapay' ? 'InstaPay' : 'Vodafone Cash'}</td><td class="mono ltr">${esc(r.reference)}</td><td>${stTxt[r.status] || r.status}</td><td class="muted small">${fmtDate(r.created_at)}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="d-card empty"><div class="empty-ic">${I('transactions')}</div><h3>لا توجد معاملات حتى الآن</h3><p class="muted">ستظهر هنا طلبات شحن المحفظة وتفعيل النشر.</p><button class="btn primary" onclick="go('top-up')">شحن المحفظة</button></div>`}
  </div>`;
});

// ---------- plugins (التطبيقات) ----------
registerView('plugins', async () => {
  const installed = [
    ['pixel', 'اعدادات البيكسل', 'Meta وTikTok وSnap على صفحات متجرك', 'pixels-settings'],
    ['capi', 'Conversion API', 'إرسال أحداث الشراء من السيرفر لـ Meta', 'pixel-conversion'],
    ['ga', 'Google Analytics', 'تتبع الزيارات والتحويل عبر GA4', 'ga'],
    ['coupons', 'كوبونات التخفيضات', 'أكواد خصم بنسبة أو مبلغ ثابت', 'coupons'],
    ['feed', 'Google Merchant Feed', 'تصدير منتجاتك إلى Google Shopping', 'google-merchant'],
    ['popup', 'Sales Popup', 'إشعارات الشراء المباشرة للزوار', 'sales-popup'],
    ['cross', 'Cross Sell', 'اقتراح منتجات مكملة أثناء الدفع', 'cross-sell'],
    ['down', 'Downsell', 'عرض أخير بخصم في صفحة الشكر', 'downsell'],
    ['whatsapp', 'واتساب الرسمي من ميتا', 'تأكيدات الطلبات واسترجاع السلات', 'whatsapp-api'],
    ['link', 'روابط الإحالة', 'تتبع طلبات المسوقين والمؤثرين', 'referral-link'],
  ];
  return `
  <div class="d-page">
    ${topBar('التطبيقات', 'كل تطبيقات منصتك مثبتة وجاهزة — بدون رسوم إضافية', '')}
    <div class="pill-tabs" style="margin-bottom:14px"><button class="on">تطبيقات مثبتة (${installed.length})</button></div>
    <div class="apps-grid">
      ${installed.map(([ic, name, desc, route]) => `
      <div class="app-card" onclick="go('${route}')">
        <div class="app-ic">${I(ic)}</div>
        <b>${name}</b><span class="muted sm">${desc}</span>
        <span class="chip st-delivered">مجانًا · مثبت</span>
      </div>`).join('')}
    </div>
  </div>`;
});

// ---------- subscriptions (الباقة المميزة) ----------
registerView('subscriptions', async () => {
  const d = await api('/api/activation');
  const pending = (d.requests || []).find(r => r.status === 'pending');
  return `
  <div class="d-page">
    ${topBar('اشترك في الباقة المميزة', 'خطة واحدة بكل المميزات — بدون عمولة على المبيعات', '')}
    <div class="d-card plan-card">
      <div class="plan-price"><b>50 ج.م</b><span>/ 30 يوم</span></div>
      <ul class="plan-feats">
        <li>${I('check')} متجر إلكتروني كامل بدومين مجاني على منصتنا</li>
        <li>${I('check')} طلبات ومنتجات وFunnels غير محدودة</li>
        <li>${I('check')} كل أدوات التسويق والتتبع والبيكسلات</li>
        <li>${I('check')} 0% عمولة على مبيعاتك — كل الربح لك</li>
        <li>${I('check')} دعم فني عبر واتساب</li>
      </ul>
      ${STORE.is_published ? `<div class="d-card" style="background:var(--green-soft,#eafbee)"><b>${I('check')} اشتراكك فعّال حتى ${esc(STORE.published_until || '')}</b></div>`
      : pending ? `<div class="d-card warn"><b>طلب التفعيل قيد المراجعة — سيُفعّل خلال ساعات</b></div>`
      : `<button class="btn primary btn-lg" onclick="go('top-up')">اشترك الآن — 50 ج.م</button>`}
    </div>
  </div>`;
});

// ---------- blogs ----------
registerView('blogs', async () => {
  const { posts } = await api('/api/blog-posts');
  const stTxt = { draft: '<span class="chip">مسودة</span>', published: '<span class="chip st-delivered">منشور</span>' };
  return `
  <div class="d-page">
    ${topBar('المقالات', 'انشر مقالات في مدونة متجرك لتحسين SEO وجذب زيارات', `<button class="btn primary" onclick="blogModal()">+ إضافة مقال جديد</button>`)}
    ${posts.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>العنوان</th><th>القسم</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead><tbody>
      ${posts.map(p => `<tr><td><b>${esc(p.title)}</b></td><td>${esc(p.category_name || '—')}</td><td>${stTxt[p.status]}</td><td class="muted small">${fmtDate(p.created_at)}</td>
        <td class="acts">
          ${p.status === 'draft' ? `<button class="btn sm" onclick="blogPublish(${p.id})">نشر</button>` : `<a class="btn sm" href="/s/${STORE.slug}/blog/${esc(p.slug)}" target="_blank" rel="noopener">معاينة</a>`}
          <button class="btn sm" onclick="blogModal(${p.id})">تعديل</button>
          <button class="btn sm danger" onclick="blogDel(${p.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>`
    : `<div class="d-card empty"><div class="empty-ic">${I('blog')}</div><h3>لا يوجد مقالات حتى الآن</h3><p class="muted">اكتب أول مقال لك — تظهر المدونة على رابط <span class="ltr mono">/s/${STORE.slug}/blog</span></p><button class="btn primary" onclick="blogModal()">+ إضافة مقال جديد</button></div>`}
  </div>`;
});
async function blogModal(id) {
  const { cats } = await api('/api/blog-categories');
  const post = id ? (await api('/api/blog-posts')).posts.find(p => p.id === id) : null;
  openModal(id ? 'تعديل المقال' : 'مقال جديد', `
    <label class="d-label">عنوان المقال *</label><input id="bpTitle" class="d-input" value="${esc(post?.title || '')}">
    <label class="d-label">القسم</label><select id="bpCat" class="d-input"><option value="">— بدون قسم —</option>
      ${cats.map(c => `<option value="${c.id}" ${post?.category_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
    <label class="d-label">نص المقال (HTML مسموح)</label><textarea id="bpBody" class="d-input" rows="8">${esc(post?.body || '')}</textarea>
    <label class="switch-row"><input type="checkbox" id="bpPub" ${post?.status === 'published' ? 'checked' : ''}><span>نشر مباشرة في المدونة</span></label>
    <button class="btn primary" onclick="blogSave(${id || 0})">${id ? 'حفظ التعديلات' : 'إضافة المقال'}</button>`, () => {});
}
async function blogSave(id) {
  const body = { title: $('#bpTitle').value.trim(), category_id: +$('#bpCat').value || null, body: $('#bpBody').value, status: $('#bpPub').checked ? 'published' : 'draft' };
  if (!body.title) return toast('عنوان المقال مطلوب', 'err');
  const r = id ? await api('/api/blog-posts/' + id, { method: 'PUT', body }) : await api('/api/blog-posts', { method: 'POST', body });
  if (r.error) return toast(r.error, 'err');
  closeModal(); toast(id ? 'تم الحفظ' : 'تمت إضافة المقال'); rerender();
}
async function blogPublish(id) { await api('/api/blog-posts/' + id, { method: 'PUT', body: { status: 'published' } }); toast('تم النشر'); rerender(); }
async function blogDel(id) { if (!confirm('حذف هذا المقال؟')) return; await api('/api/blog-posts/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }

// ---------- blog categories ----------
registerView('blog-categories', async () => {
  const { cats } = await api('/api/blog-categories');
  return `
  <div class="d-page">
    ${topBar('اقسام المدونة', 'نظّم مقالاتك في أقسام', '')}
    <div class="d-card"><div class="copy-row">
      <input id="bcName" class="d-input" placeholder="اسم القسم الجديد — مثال: نصائح التسوق">
      <button class="btn primary" onclick="bcSave()">+ إضافة</button></div></div>
    ${cats.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>القسم</th><th>مقالات</th><th></th></tr></thead><tbody>
      ${cats.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${c.posts}</td>
        <td class="acts"><button class="btn sm danger" onclick="bcDel(${c.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>` : ''}
  </div>`;
});
async function bcSave() {
  const name = $('#bcName').value.trim(); if (!name) return toast('اسم القسم مطلوب', 'err');
  const r = await api('/api/blog-categories', { method: 'POST', body: { name } });
  if (r.error) return toast(r.error, 'err');
  toast('تمت الإضافة'); rerender();
}
async function bcDel(id) { if (!confirm('حذف هذا القسم؟ ستبقى مقالاته بدون قسم.')) return; await api('/api/blog-categories/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }

// ---------- community services (معرض الخدمات + خدمات التسويق) ----------
function servicesView(kind) {
  const design = [
    ['store', 'تصميم متجر احترافي', 'نصمم واجهة متجرك بالكامل بهويتك البصرية'],
    ['image', 'تصوير منتجات', 'صور احترافية لمنتجاتك تجهز للنشر'],
    ['pen', 'كتابة أوصاف ومحتوى', 'أوصاف منتجات وصفحات مقنعة بالعربية'],
  ];
  const marketing = [
    ['marketing', 'إدارة حملات إعلانية', 'إدارة إعلانات فيسبوك وتيك توك وتحسين ROAS'],
    ['video', 'فيديوهات إعلانية', 'مونتاج فيديوهات قصيرة للإعلانات والريلز'],
    ['stats', 'تحليل أداء شهري', 'تقرير مبيعات وتوصيات نمو مخصصة لمتجرك'],
  ];
  const items = kind === 'marketing' ? marketing : design;
  return `
  <div class="d-page">
    ${topBar(kind === 'marketing' ? 'خدمات التسويق' : 'معرض الخدمات', 'خدمات فريق اكتف لمتجرك — اطلب الخدمة ويتواصل معك الفريق', '')}
    <div class="apps-grid">
      ${items.map(([ic, name, desc]) => `
      <div class="app-card"><div class="app-ic">${I(ic)}</div><b>${name}</b><span class="muted sm">${desc}</span>
        <button class="btn sm primary" onclick="reqService('${esc(name)}')">اطلب الخدمة</button></div>`).join('')}
    </div>
  </div>`;
}
registerView('services', async () => servicesView('design'));
registerView('marketing-services', async () => servicesView('marketing'));
async function reqService(name) {
  openModal('طلب خدمة: ' + name, `
    <label class="d-label">تفاصيل إضافية (اختياري)</label><textarea id="srvDetails" class="d-input" rows="4" placeholder="اكتب ما تحتاجه بالتحديد…"></textarea>
    <button class="btn primary" onclick="srvSave('${esc(name)}')">إرسال الطلب</button>`, () => {});
}
async function srvSave(name) {
  await api('/api/dev-requests', { method: 'POST', body: { title: 'خدمة: ' + name, details: $('#srvDetails').value.trim() } });
  closeModal(); toast('تم إرسال طلبك — سيتواصل معك فريق اكتف');
}

// ---------- platform referral (نظام التسويق بالعمولة) ----------
registerView('referral', async () => {
  const d = await api('/api/referrals');
  const link = `${location.origin}/register?ref=${d.code}`;
  const wSt = { pending: '<span class="chip st-new">قيد المراجعة</span>', paid: '<span class="chip st-delivered">تم الدفع</span>', rejected: '<span class="chip st-cancelled">مرفوض</span>' };
  return `
  <div class="d-page">
    ${topBar('نظام التسويق بالعمولة', 'برنامج الإحالة الخاص بالمنصة', '')}
    <div class="d-card">
      <div class="d-note"><span class="n-ic">${I('eye')}</span><div><b>البرنامج غير مفعّل بعد</b><p class="muted" style="margin:2px 0 0">سيتم تفعيل برنامج الإحالة بشروط العمولة والسحب التي يعتمدها صاحب المنصة. أي عمولات مسجلة أدناه محفوظة ولن تتأثر.</p></div></div>
    </div>
    <div class="d-card ref-earn">
      <span class="ref-ic">${I('wallet')}</span>
      <div><span class="muted small">عمولاتك المسجلة</span><b class="ref-amt">${egp(d.balance)}</b></div>
      <div style="margin-inline-start:auto;text-align:start"><span class="muted small">تم سحبه</span><b class="ref-amt">${egp(d.paid)}</b></div>
      <div style="text-align:start"><span class="muted small">تسجيلات عبر رابطك</span><b class="ref-amt">${d.referrals.length}</b></div>
    </div>
    <div class="d-card">
      <label class="d-label">رابط الإحالة الخاص بك</label>
      <input class="d-input ltr" readonly value="${link}" onclick="this.select()">
      <p class="muted small" style="margin-top:8px">التسجيلات عبر الرابط تُحفظ وتظهر أدناه؛ لا تُحتسب أي عمولة حالياً لحين تفعيل البرنامج.</p>
    </div>
    ${d.referrals.length ? `<div class="d-card"><h3>التسجيلات عبر رابطك</h3>
      <table class="d-table"><thead><tr><th>التاجر</th><th>العمولة</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>
      ${d.referrals.map(r => `<tr><td><b>${esc(r.referred_name)}</b></td><td>${egp(r.commission)}</td><td>${r.status === 'pending' ? '<span class="chip">مسجّلة</span>' : r.status === 'credited' ? '<span class="chip st-delivered">مضافة لرصيدك</span>' : '<span class="chip st-shipped">مدفوعة</span>'}</td><td class="muted small ltr">${fmtDateNum(r.created_at)}</td></tr>`).join('')}</tbody></table></div>` : ''}
    ${d.withdrawals.length ? `<div class="d-card"><h3>طلبات السحب السابقة</h3>
      <table class="d-table"><thead><tr><th>المبلغ</th><th>الوسيلة</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>
      ${d.withdrawals.map(w => `<tr><td>${egp(w.amount)}</td><td>${w.method === 'instapay' ? 'InstaPay' : 'Vodafone Cash'}</td><td>${wSt[w.status] || w.status}</td><td class="muted small ltr">${fmtDateNum(w.created_at)}</td></tr>`).join('')}</tbody></table></div>` : ''}
  </div>`;
});

// ---------- dev requests (طلب تطويرات) ----------
registerView('dev-requests', async () => {
  const { requests } = await api('/api/dev-requests');
  const stTxt = { new: '<span class="chip st-new">جديد</span>', reviewing: '<span class="chip st-shipped">قيد المراجعة</span>', planned: '<span class="chip">مخطط</span>', done: '<span class="chip st-delivered">تم التنفيذ</span>' };
  return `
  <div class="d-page">
    ${topBar('طلب تطويرات', 'اقترح ميزة أو اطلب تطويراً مخصصاً لمتجرك', `<button class="btn primary" onclick="devModal()">+ طلب جديد</button>`)}
    ${requests.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>الطلب</th><th>التفاصيل</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>
      ${requests.map(r => `<tr><td><b>${esc(r.title)}</b></td><td class="muted">${esc((r.details || '').slice(0, 80))}</td><td>${stTxt[r.status] || r.status}</td><td class="muted small">${fmtDate(r.created_at)}</td></tr>`).join('')}</tbody></table></div>`
    : `<div class="d-card empty"><div class="empty-ic">${I('code')}</div><h3>لا توجد طلبات حتى الآن</h3><p class="muted">أخبرنا بما تحتاجه — ميزة جديدة، تكامل، أو تعديل مخصص.</p><button class="btn primary" onclick="devModal()">+ طلب جديد</button></div>`}
  </div>`;
});
function devModal() {
  openModal('طلب تطوير جديد', `
    <label class="d-label">عنوان الطلب *</label><input id="devTitle" class="d-input" placeholder="مثال: ربط متجري مع شركة شحن معينة">
    <label class="d-label">التفاصيل</label><textarea id="devDetails" class="d-input" rows="5" placeholder="اشرح ما تحتاجه ولماذا…"></textarea>
    <button class="btn primary" onclick="devSave()">إرسال الطلب</button>`, () => {});
}
async function devSave() {
  const title = $('#devTitle').value.trim(); if (!title) return toast('عنوان الطلب مطلوب', 'err');
  await api('/api/dev-requests', { method: 'POST', body: { title, details: $('#devDetails').value.trim() } });
  closeModal(); toast('تم إرسال طلبك'); rerender();
}
