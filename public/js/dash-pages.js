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
    ${topBar('تعديل البيانات الخاصة باتمام الطلب', 'قلّل الحقول المطلوبة من العميل لإتمام الشراء — كل ما قل عدد الحقول زادت المبيعات. ننصح بالاكتفاء بالاسم ورقم الهاتف والعنوان عند الحاجة فقط', '')}
    <div class="d-card">
      ${fields.map(f => `
      <div class="cf-row" data-key="${f.key}">
        <div class="cf-head"><span class="muted small mono ltr">key: ${f.key}</span><b>${esc(CF_DEFAULTS[f.key].label)}</b>${f.hint ? `<span class="chip">${f.hint}</span>` : ''}</div>
        <div class="form-grid">
          <div><label class="d-label">اسم الحقل الذي سيظهر للعميل</label><input class="d-input cf-label" value="${esc(f.label)}" ${f.fixed ? '' : ''}></div>
          <div><label class="d-label">النص المساعد</label><input class="d-input cf-helper" value="${esc(f.helper)}" placeholder="نص يظهر داخل الحقل لتوضيح المطلوب"></div>
          <div><label class="d-label">الترتيب</label><input class="d-input ltr cf-order" type="number" min="0" value="${f.order || 0}"></div>
        </div>
        <div class="cf-toggles">
          <label class="tg"><input type="checkbox" class="cf-enabled" ${f.fixed || f.enabled !== false ? 'checked' : ''} ${f.fixed ? 'disabled' : ''}><i></i><span>تفعيل</span></label>
          <label class="tg"><input type="checkbox" class="cf-required" ${(f.fixed || f.required !== false) ? 'checked' : ''} ${f.fixed ? 'disabled' : ''}><i></i><span>هل الحقل إلزامي يجب ملئه</span></label>
        </div>
      </div>`).join('')}
      <button class="btn primary" style="margin-top:16px" onclick="cfSave()">حفظ</button>
    </div>
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
  return `
  <div class="d-page">
    ${topBar('تعديل صفحة الشكر', 'عدّل صفحة الشكر التي تظهر بعد اتمام الطلب', '')}
    <div class="d-card">
      <label class="tg" style="margin-bottom:14px"><input type="checkbox" id="thOn" ${t.enabled ? 'checked' : ''}><i></i><span>تفعيل</span></label>
      <label class="d-label">المحتوى (HTML مسموح)</label>
      <textarea id="thHtml" class="d-input" rows="10" placeholder="مثال: <h2>شكراً لطلبك!</h2><p>سنتواصل معك خلال 24 ساعة لتأكيد الشحن.</p>">${esc(t.html || '')}</textarea>
      <label class="tg" style="margin-top:14px"><input type="checkbox" id="thHome" ${t.home_btn !== false ? 'checked' : ''}><i></i><span>زر العودة للرئيسية</span></label>
      <button class="btn primary" style="margin-top:16px" onclick="thSave()">حفظ</button>
    </div>
  </div>`;
});
async function thSave() {
  const r = await api('/api/store/settings', { method: 'PUT', body: { thanks: { enabled: $('#thOn').checked, html: $('#thHtml').value, home_btn: $('#thHome').checked } } });
  if (r.error) return toast(r.error, 'err');
  toast('تم حفظ صفحة الشكر');
}

// ---------- UI Blocks ----------
registerView('ui-blocks', async () => {
  const { settings } = await api('/api/store/settings');
  let u = {}; try { u = JSON.parse(settings.ui_blocks || '{}'); } catch (_) {}
  return `
  <div class="d-page">
    ${topBar('UI Blocks', 'استخدم UI Blocks لتعديل شكل المتجر وإضافة أجزاء مخصصة', '')}
    <div class="d-card">
      <label class="tg" style="margin-bottom:16px"><input type="checkbox" id="uibOn" ${u.enabled ? 'checked' : ''}><i></i><span>تفعيل</span></label>
      <div class="uib-block">
        <div class="uib-head"><b>اعلي ال header</b><label class="tg"><input type="checkbox" id="uibTopOn" ${u.top_on ? 'checked' : ''}><i></i><span>تفعيل محرر html</span></label></div>
        <textarea id="uibTop" class="d-input mono ltr" rows="7" placeholder="<div>…</div>">${esc(u.top_html || '')}</textarea>
      </div>
      <div class="uib-block" style="margin-top:18px">
        <div class="uib-head"><b>اسفل ال header</b><label class="tg"><input type="checkbox" id="uibBottomOn" ${u.bottom_on ? 'checked' : ''}><i></i><span>تفعيل محرر html</span></label></div>
        <textarea id="uibBottom" class="d-input mono ltr" rows="7" placeholder="<div>…</div>">${esc(u.bottom_html || '')}</textarea>
      </div>
      <button class="btn primary" style="margin-top:16px" onclick="uibSave()">حفظ</button>
    </div>
  </div>`;
});
async function uibSave() {
  const r = await api('/api/store/settings', { method: 'PUT', body: { ui_blocks: { enabled: $('#uibOn').checked, top_on: $('#uibTopOn').checked, top_html: $('#uibTop').value, bottom_on: $('#uibBottomOn').checked, bottom_html: $('#uibBottom').value } } });
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
registerView('notifications', async () => {
  const { notifications } = await api('/api/notifications');
  return `
  <div class="d-page">
    ${topBar('الاشعارات', 'هنا تظهر الاشعارات والتنبيهات التي تساعدك في تطوير تجارتك', '')}
    ${notifications.length ? `<div class="d-card ntf-list">
      ${notifications.map(n => `<button class="ntf-row" onclick="location.hash='${n.link}'">
        <span class="n-ic">${I(n.kind === 'order' ? 'bell' : 'cash')}</span>
        <span class="n-body"><b>${esc(n.text)}</b><span class="muted small">${fmtDate(n.date)}</span></span>
        ${n.fresh ? '<span class="chip st-new">جديد</span>' : ''}
      </button>`).join('')}
    </div>
    <div class="tbl-foot muted small">الصفوف ${notifications.length} من ${notifications.length}</div>`
    : `<div class="d-card empty"><div class="empty-ic">${I('bell')}</div><h3>لا اشعارات حتى الآن</h3><p class="muted">ستظهر هنا الطلبات الجديدة وتحديثات التفعيل.</p></div>`}
  </div>`;
});
