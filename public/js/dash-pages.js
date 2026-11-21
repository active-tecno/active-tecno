// dash-pages.js — design pages: الصفحات، نموذج الشراء، تعديل صفحة الشكر، UI Blocks، رفع ملفات التصاميم، الإشعارات

// ---------- الصفحات (simple pages) ----------
registerView('pages', async () => {
  const { pages } = await api('/api/pages');
  const yn = v => v ? `<span class="chk-yes">${I('check')}</span>` : `<span class="chk-no">✕</span>`;
  return `
  <div class="d-page">
    ${topBar('الصفحات', 'أنشئ صفحات مخصصة واعرضها في هيدر أو فوتر متجرك — ننصح بصفحات سياسة الشحن والاسترجاع والخصوصية لبناء ثقة عملائك', `<button class="btn primary" onclick="pageModal()">+ إنشاء</button>`)}
    ${pages.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>العنوان</th><th>الرابط</th><th>تظهر في الهيدر</th><th>تظهر في الفوتر</th><th>الصفحة نشطة</th><th>مشاهدة</th><th>تعديل</th></tr></thead><tbody>
      ${pages.map(p => `<tr>
        <td><b>${esc(p.title)}</b></td>
        <td class="mono ltr muted small">${esc(p.slug)}</td>
        <td>${yn(!!p.in_header)}</td><td>${yn(!!p.in_footer)}</td><td>${yn(!!p.active)}</td>
        <td><a class="btn sm" href="/s/${STORE.slug}/page/${esc(p.slug)}" target="_blank" rel="noopener" title="مشاهدة">${I('eye')}</a></td>
        <td><button class="btn sm" onclick="pageModal(${p.id})">تعديل ${I('pen')}</button>
            <button class="btn sm danger" onclick="pageDel(${p.id})" title="حذف">${I('trash')}</button></td></tr>`).join('')}
    </tbody></table>
    <div class="tbl-foot muted small">الصفوف ${pages.length} من ${pages.length}</div></div>`
    : `<div class="d-card empty"><div class="empty-ic">${I('blog')}</div><h3>لا توجد صفحات حتى الآن</h3><p class="muted">أنشئ أول صفحة — مثل سياسة الشحن أو الاستبدال والاسترجاع — واعرضها في فوتر متجرك.</p><button class="btn primary" onclick="pageModal()">+ إنشاء</button></div>`}
  </div>`;
});
async function pageModal(id) {
  const { pages } = await api('/api/pages');
  const p = id ? pages.find(x => x.id === id) : null;
  openModal(id ? 'تعديل الصفحة' : 'إنشاء صفحة', `
    <label class="d-label">عنوان الصفحة *</label><input id="pgTitle" class="d-input" value="${esc(p?.title || '')}" placeholder="مثال: سياسة الشحن">
    <label class="d-label">الرابط (slug) *</label><input id="pgSlug" class="d-input ltr" value="${esc(p?.slug || '')}" placeholder="shipping-policy">
    <label class="d-label">محتوى الصفحة (HTML مسموح)</label><textarea id="pgContent" class="d-input" rows="9" placeholder="اكتب محتوى الصفحة…">${esc(p?.content || '')}</textarea>
    <label class="tg"><input type="checkbox" id="pgHead" ${p?.in_header ? 'checked' : ''}><i></i><span>تظهر في الهيدر</span></label>
    <label class="tg"><input type="checkbox" id="pgFoot" ${!p || p.in_footer ? 'checked' : ''}><i></i><span>تظهر في الفوتر</span></label>
    <label class="tg"><input type="checkbox" id="pgActive" ${!p || p.active ? 'checked' : ''}><i></i><span>الصفحة نشطة</span></label>
    <button class="btn primary" onclick="pageSave(${id || 0})">${id ? 'حفظ التعديلات' : 'إنشاء الصفحة'}</button>`, () => {});
}
async function pageSave(id) {
  const body = {
    title: $('#pgTitle').value.trim(), slug: $('#pgSlug').value.trim(), content: $('#pgContent').value,
    in_header: $('#pgHead').checked, in_footer: $('#pgFoot').checked, active: $('#pgActive').checked,
  };
  if (!body.title || !body.slug) return toast('العنوان والرابط مطلوبان', 'err');
  const r = id ? await api('/api/pages/' + id, { method: 'PUT', body }) : await api('/api/pages', { method: 'POST', body });
  if (r.error) return toast(r.error, 'err');
  closeModal(); toast(id ? 'تم الحفظ' : 'تم إنشاء الصفحة'); rerender();
}
async function pageDel(id) { if (!confirm('حذف هذه الصفحة؟')) return; await api('/api/pages/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }

// ---------- نموذج الشراء (checkout fields) ----------
const CF_KEYS = [
  { key: 'full_name', fixed: true, hint: 'حقل أساسي — لا يمكن إيقافه' },
  { key: 'phone', fixed: true, hint: 'حقل أساسي — يصلك عليه تأكيد الطلب' },
  { key: 'governorate', fixed: false },
  { key: 'address', fixed: false },
  { key: 'notes', fixed: false },
];
const CF_DEFAULTS = {
  full_name: { label: 'الاسم بالكامل', helper: 'مثال: مريم أحمد', order: 0, enabled: true, required: true },
  phone: { label: 'رقم الموبايل', helper: '01xxxxxxxxx', order: 1, enabled: true, required: true },
  governorate: { label: 'المحافظة', helper: '', order: 2, enabled: true, required: true },
  address: { label: 'العنوان بالتفصيل', helper: 'الشارع، رقم العمارة، الدور، الشقة، علامة مميزة', order: 3, enabled: true, required: true },
  notes: { label: 'ملاحظات', helper: 'أي تفاصيل إضافية', order: 4, enabled: true, required: false },
};
registerView('checkout-fields', async () => {
  const { settings } = await api('/api/store/settings');
  let cfg = {}; try { cfg = JSON.parse(settings.checkout_fields || '{}'); } catch (_) {}
  const fields = CF_KEYS.map(k => ({ key: k.key, fixed: k.fixed, hint: k.hint || '', ...CF_DEFAULTS[k.key], ...(cfg[k.key] || {}) }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return `
  <div class="d-page">
    ${topBar('تعديل البيانات الخاصة باتمام الطلب', 'يمكنك تعديل الحقول المطلوبة من العميل لاتمام عملية الشراء — كلما قل عدد الحقول زادت المبيعات', '')}
    <p class="muted" style="max-width:760px;line-height:1.9;margin:4px 0 6px">ننصح بالاكتفاء بالاسم ورقم الهاتف والعنوان عند الاستلام، وعدم إزعاج العميل بحقول كثيرة إلا عند الحاجة.</p>
    ${fields.map(f => `
    <section class="cf-sec" data-key="${f.key}">
      <div class="muted small mono" style="text-align:end;direction:ltr">key: ${f.key}</div>
      <h3 class="cf-title">${esc(f.label)}</h3>
      <div class="cf-in">
        <div><label class="d-label">اسم الحقل الذي سيظهر للعميل</label><input class="d-input cf-label" value="${esc(f.label)}"></div>
        <div><label class="d-label">النص المساعد</label><input class="d-input cf-helper" value="${esc(f.helper)}" placeholder="نص توضيحي يظهر داخل الحقل — مثال: برجاء كتابة البيانات كاملة"></div>
        <div><label class="d-label">الترتيب</label><input class="d-input ltr cf-order" type="number" min="0" value="${f.order || 0}"></div>
      </div>
      <div class="cf-toggles">
        <label class="tg rev"><input type="checkbox" class="cf-enabled" ${f.fixed || f.enabled !== false ? 'checked' : ''} ${f.fixed ? 'disabled' : ''}><i></i><span>تفعيل</span></label>
        <label class="tg rev"><input type="checkbox" class="cf-required" ${(f.fixed || f.required !== false) ? 'checked' : ''} ${f.fixed ? 'disabled' : ''}><i></i><span>هل الحقل إلزامي يجب ملئه</span></label>
      </div>
    </section>`).join('')}
    <div class="save-float"><button class="save-pill" onclick="cfSave()">${I('check')} حفظ</button></div>
  </div>`;
});
async function cfSave() {
  const cfg = {};
  document.querySelectorAll('.cf-row').forEach(r => {
    cfg[r.dataset.key] = {
      label: r.querySelector('.cf-label').value.trim(),
      helper: r.querySelector('.cf-helper').value.trim(),
      order: +r.querySelector('.cf-order').value || 0,
      enabled: r.querySelector('.cf-enabled').checked,
      required: r.querySelector('.cf-required').checked,
    };
  });
  const r = await api('/api/store/settings', { method: 'PUT', body: { checkout_fields: cfg } });
  if (r.error) return toast(r.error, 'err');
  toast('تم حفظ نموذج الشراء');
}

// ---------- تعديل صفحة الشكر ----------
registerView('thanks-edit', async () => {
  const { settings } = await api('/api/store/settings');
  let t = {}; try { t = JSON.parse(settings.thanks || '{}'); } catch (_) {}
  return { html: `
  <div class="d-page">
    ${topBar('تعديل صفحة الشكر', 'يمكنك تعديل صفحة الشكر التي تظهر بعد اتمام الطلب', '')}
    <div class="tg-row"><label class="tg rev"><input type="checkbox" id="thOn" ${t.enabled ? 'checked' : ''}><i></i><span>تفعيل</span></label></div>
    <label class="d-label" style="margin:18px 0 8px;display:block">المحتوى</label>
    ${richEditorHTML('thanks')}
    <div class="tg-row" style="margin-top:16px"><label class="tg rev"><input type="checkbox" id="thHome" ${t.home_btn !== false ? 'checked' : ''}><i></i><span>زر العودة للرئيسية</span></label></div>
    <div class="save-float"><button class="save-pill" onclick="thSave()">${I('check')} حفظ</button></div>
  </div>`, after: () => richInit('thanks', t.html || '') };
});
async function thSave() {
  const r = await api('/api/store/settings', { method: 'PUT', body: { thanks: { enabled: $('#thOn').checked, html: richValue('thanks'), home_btn: $('#thHome').checked } } });
  if (r.error) return toast(r.error, 'err');
  toast('تم حفظ صفحة الشكر');
}

// ---------- UI Blocks ----------
registerView('ui-blocks', async () => {
  const { settings } = await api('/api/store/settings');
  let u = {}; try { u = JSON.parse(settings.ui_blocks || '{}'); } catch (_) {}
  return { html: `
  <div class="d-page">
    ${topBar('UI Blocks', 'يمكنك استخدام ال UI Blocks لتعديل شكل المتجر واضافة اجزاء مخصصة', '')}
    <div class="tg-row"><label class="tg rev"><input type="checkbox" id="uibOn" ${u.enabled ? 'checked' : ''}><i></i><span>تفعيل</span></label></div>
    <section class="uib-sec">
      <h3 class="cf-title">اعلي ال header</h3>
      <div class="tg-row"><label class="tg rev"><input type="checkbox" id="uibTopHtml" ${u.top_on ? 'checked' : ''} onchange="uibHtmlMode('uibTop', this.checked)"><i></i><span>تفعيل محرر html</span></label></div>
      <div style="margin-top:10px">${richEditorHTML('uibTop')}</div>
    </section>
    <section class="uib-sec">
      <h3 class="cf-title">اسفل ال header</h3>
      <div class="tg-row"><label class="tg rev"><input type="checkbox" id="uibBottomHtml" ${u.bottom_on ? 'checked' : ''} onchange="uibHtmlMode('uibBottom', this.checked)"><i></i><span>تفعيل محرر html</span></label></div>
      <div style="margin-top:10px">${richEditorHTML('uibBottom')}</div>
    </section>
    <div class="save-float"><button class="save-pill" onclick="uibSave()">${I('check')} حفظ</button></div>
  </div>`, after: () => {
    richInit('uibTop', u.top_html || '');
    richInit('uibBottom', u.bottom_html || '');
    if (u.top_on) rtToggleCode('uibTop', 'code');
    if (u.bottom_on) rtToggleCode('uibBottom', 'code');
  } };
});
function uibHtmlMode(id, on) { rtToggleCode(id, on ? 'code' : 'visual'); }
async function uibSave() {
  const r = await api('/api/store/settings', { method: 'PUT', body: { ui_blocks: { enabled: $('#uibOn').checked, top_on: $('#uibTopHtml').checked, top_html: richValue('uibTop'), bottom_on: $('#uibBottomHtml').checked, bottom_html: richValue('uibBottom') } } });
  if (r.error) return toast(r.error, 'err');
  toast('تم حفظ UI Blocks');
}

// ---------- رفع ملفات التصاميم ----------
registerView('upload-assets', async () => {
  const { settings } = await api('/api/store/settings');
  let assets = []; try { assets = JSON.parse(settings.design_assets || '[]'); } catch (_) {}
  return `
  <div class="d-page">
    ${topBar('رفع ملفات التصاميم', 'ارفع ملفات CSS وJavascript الخاصة بتصاميمك لتظهر على متجرك', '')}
    <div class="d-card note">
      <p class="muted">يمكنك انشاء ثيم خاص بك او حق عمل قالب خاصة بك للظهور بشكل مميز — الملفات المفعّلة تُحمّل مع صفحات متجرك تلقائياً.</p>
    </div>
    <div class="d-card">
      <input type="file" id="daFile" accept=".css,.js,text/css,text/javascript" hidden onchange="daUpload(this)">
      <button class="btn primary" onclick="document.getElementById('daFile').click()">${I('download')} رفع الملفات</button>
    </div>
    ${assets.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>الملف</th><th>النوع</th><th>مفعّل</th><th></th></tr></thead><tbody>
      ${assets.map(a => `<tr><td class="ltr mono">${esc(a.name)}</td><td><span class="chip">${a.kind.toUpperCase()}</span></td>
        <td><label class="tg"><input type="checkbox" ${a.enabled ? 'checked' : ''} onchange="daToggle('${esc(a.url)}', this.checked)"><i></i></label></td>
        <td><button class="btn sm danger" onclick="daDel('${esc(a.url)}')">${I('trash')}</button></td></tr>`).join('')}
    </tbody></table></div>` : ''}
  </div>`;
});
async function daRead() { const { settings } = await api('/api/store/settings'); try { return JSON.parse(settings.design_assets || '[]'); } catch (_) { return []; } }
async function daWrite(assets) { const r = await api('/api/store/settings', { method: 'PUT', body: { design_assets: assets } }); if (r.error) toast(r.error, 'err'); }
function daUpload(input) {
  const f = input.files[0]; if (!f) return;
  if (!/\.(css|js)$/i.test(f.name)) return toast('ارفع ملف CSS أو JS فقط', 'err');
  const rd = new FileReader();
  rd.onload = async () => {
    const mime = /\.css$/i.test(f.name) ? 'text/css' : 'text/javascript';
    const dataUrl = `data:${mime};base64,` + btoa(String.fromCharCode(...new Uint8Array(rd.result)));
    const r = await api('/api/design-assets', { method: 'POST', body: { name: f.name, dataUrl } });
    if (r.error) return toast(r.error, 'err');
    toast('تم رفع الملف'); rerender();
  };
  rd.readAsArrayBuffer(f);
}
async function daToggle(url, on) { const a = await daRead(); const it = a.find(x => x.url === url); if (it) it.enabled = on; await daWrite(a); toast(on ? 'تم التفعيل' : 'تم الإيقاف'); }
async function daDel(url) { if (!confirm('حذف هذا الملف؟')) return; await api('/api/design-assets', { method: 'DELETE', body: { url } }); toast('تم الحذف'); rerender(); }

// ---------- الإشعارات ----------
let NTF = { items: [], page: 1, per: 25 };
registerView('notifications', async () => {
  const [{ notifications }, { settings }] = await Promise.all([api('/api/notifications'), api('/api/store/settings')]);
  let readIds = []; try { readIds = JSON.parse(settings.notifications_read || '[]'); } catch (_) {}
  NTF.items = notifications.map(n => ({ ...n, unread: n.fresh && !readIds.includes(n.id) }));
  NTF.page = 1;
  return { html: `
  <div class="d-page">
    ${topBar('الاشعارات', 'هنا تظهر الاشعارات والتنبيهات التي تساعدك في تطوير تجارتك', '')}
    <div class="ntf-wrap" id="ntfWrap"></div>
  </div>`, after: () => ntfRender() };
});
function ntfRender() {
  const wrap = document.getElementById('ntfWrap'); if (!wrap) return;
  const total = NTF.items.length;
  if (!total) {
    wrap.innerHTML = `<div class="d-card empty"><div class="empty-ic">${I('bell')}</div><h3>لا اشعارات حتى الآن</h3><p class="muted">ستظهر هنا الطلبات الجديدة وتحديثات التفعيل.</p></div>`;
    return;
  }
  const pages = Math.max(1, Math.ceil(total / NTF.per));
  if (NTF.page > pages) NTF.page = pages;
  const from = (NTF.page - 1) * NTF.per, to = Math.min(total, from + NTF.per);
  wrap.innerHTML = `<div class="d-card ntf-list">
    ${NTF.items.slice(from, to).map((n, k) => `
    <div class="ntf-row2">
      <span class="n-ic">${I('bell')}${n.unread ? '<i class="n-dot"></i>' : ''}</span>
      <div class="n-body">
        <b class="n-text clamp">${esc(n.text)}</b>
        <div class="n-meta">
          <button class="n-exp" onclick="ntfExpand(this)">اظهار الكل</button>
          ${n.unread ? '<span class="chip st-delivered">جديد</span>' : ''}
          <span class="muted small ltr">${fmtDateNum(n.date)}</span>
        </div>
      </div>
      <button class="btn sm n-view" onclick="ntfView(${from + k})">${I('eye')} مشاهدة</button>
    </div>`).join('')}
  </div>
  <div class="tbl-foot muted small">
    <span>الصفوف لكل صفحة: <select class="d-input" style="display:inline-block;width:auto;height:28px;padding:0 6px" onchange="NTF.per=+this.value;NTF.page=1;ntfRender()">${[10, 25, 50].map(v => `<option ${v === NTF.per ? 'selected' : ''}>${v}</option>`).join('')}</select></span>
    <span class="ntf-pg">
      <button class="btn sm" ${NTF.page <= 1 ? 'disabled' : ''} onclick="NTF.page--;ntfRender()">‹</button>
      <button class="btn sm" ${NTF.page >= pages ? 'disabled' : ''} onclick="NTF.page++;ntfRender()">›</button>
    </span>
    <span class="ltr">${from + 1}-${to} من ${total}</span>
  </div>`;
}
function ntfExpand(btn) { const t = btn.closest('.n-body').querySelector('.n-text'); t.classList.remove('clamp'); btn.remove(); }
async function ntfView(i) {
  const n = NTF.items[i]; if (!n) return;
  openModal('الاشعار', `<p style="line-height:2">${esc(n.text)}</p><p class="muted small ltr" style="margin-top:6px">${fmtDateNum(n.date)}</p>
    <button class="btn primary" style="margin-top:12px" onclick="closeModal();location.hash='${n.link}'">فتح الصفحة المرتبطة</button>`, () => {});
  if (n.unread) { n.unread = false; ntfMarkRead(n.id); ntfRender(); }
}
async function ntfMarkRead(id) {
  const { settings } = await api('/api/store/settings');
  let ids = []; try { ids = JSON.parse(settings.notifications_read || '[]'); } catch (_) {}
  if (!ids.includes(id)) ids.push(id);
  await api('/api/store/settings', { method: 'PUT', body: { notifications_read: ids.slice(-200) } });
}
