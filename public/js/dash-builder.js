// ---------- H2: home builder (EO-style sections editor) ----------
const B_PAGES = [['home', 'الصفحة الرئيسية'], ['product', 'صفحة المنتج'], ['checkout', 'نموذج الشراء']];
const B_ZONES = [['above_header', 'أقسام ثابتة أعلى الهيدر'], ['below_header', 'أقسام ثابتة أسفل الهيدر'], ['content', 'محتوى الصفحة'], ['above_footer', 'أقسام ثابتة أعلى الفوتر'], ['below_footer', 'أقسام ثابتة أسفل الفوتر']];
const B_TYPES = [
  ['نص', [['heading', 'عنوان رئيسي وفرعي'], ['rich_text', 'نص متقدم']]],
  ['الصور والميديا', [['slider', 'سلايدر'], ['image', 'صورة'], ['promo_banner', 'لافتة ترويجية']]],
  ['التجارة الالكترونية', [['categories', 'الفئات'], ['featured_products', 'المنتجات المميزة'], ['product_list', 'قائمة المنتجات'], ['product_grid', 'شبكة المنتجات']]],
  ['عناصر اخري', [['hero', 'قسم بسيط'], ['advanced_section', 'قسم متقدم'], ['html_code', 'كود HTML']]],
  ['أقسام جاهزة', [['faq', 'الأسئلة الشائعة'], ['features', 'مميزات المتجر'], ['reviews', 'التقييمات'], ['newsletter', 'النشرة البريدية'], ['blog', 'المدونة']]],
];
const B_TYPE_NAMES = { hero: 'قسم بسيط', slider: 'سلايدر', categories: 'الفئات', product_grid: 'شبكة المنتجات', product_list: 'قائمة المنتجات', featured_products: 'المنتجات المميزة', promo_banner: 'لافتة ترويجية', image: 'صورة', heading: 'عنوان رئيسي وفرعي', rich_text: 'نص متقدم', html_code: 'كود HTML', faq: 'الأسئلة الشائعة', features: 'مميزات المتجر', newsletter: 'النشرة البريدية', reviews: 'التقييمات', blog: 'المدونة', advanced_section: 'قسم متقدم' };
const B_FIELDS = {
  hero: [['title', 'العنوان', 'text'], ['subtitle', 'الوصف', 'textarea'], ['cta_text', 'نص الزر', 'text'], ['cta_link', 'رابط الزر', 'text'], ['img', 'صورة الخلفية (رابط)', 'text']],
  slider: [['slides', 'الشرائح (JSON: [{img, title, subtitle, link}])', 'json']],
  categories: [['title', 'العنوان (اختياري)', 'text']],
  product_grid: [['title', 'العنوان (اختياري)', 'text'], ['limit', 'عدد المنتجات', 'number'], ['sort', 'الترتيب (newest / price_asc / price_desc)', 'text']],
  product_list: [['title', 'العنوان', 'text'], ['limit', 'عدد المنتجات', 'number']],
  featured_products: [['title', 'العنوان', 'text'], ['limit', 'عدد المنتجات', 'number']],
  promo_banner: [['text', 'النص', 'text'], ['bg', 'لون الخلفية', 'color'], ['color', 'لون النص', 'color'], ['link', 'الرابط', 'text']],
  image: [['img', 'رابط الصورة', 'text'], ['link', 'الرابط عند الضغط', 'text'], ['alt', 'النص البديل', 'text']],
  heading: [['title', 'العنوان الرئيسي', 'text'], ['subtitle', 'العنوان الفرعي', 'textarea']],
  rich_text: [['html', 'النص (HTML)', 'textarea']],
  html_code: [['html', 'كود HTML', 'textarea']],
  advanced_section: [['html', 'كود HTML', 'textarea']],
  faq: [['title', 'العنوان', 'text'], ['items', 'الأسئلة (JSON: [{q, a}])', 'json']],
  features: [['title', 'العنوان', 'text'], ['items', 'المميزات (JSON: [{title, text}])', 'json']],
  newsletter: [['title', 'العنوان', 'text'], ['desc', 'الوصف', 'text']],
  reviews: [['title', 'العنوان', 'text'], ['limit', 'عدد التقييمات', 'number']],
  blog: [['title', 'العنوان', 'text'], ['limit', 'عدد المقالات', 'number']],
};
let B_PAGE = 'home';

registerView('builder', async () => {
  B_PAGE = new URLSearchParams((location.hash.split('?')[1] || '')).get('page') || 'home';
  setTimeout(() => bLoad(), 0);
  return `
  <div class="d-page">
    ${topBar('بناء ' + (B_PAGES.find(p => p[0] === B_PAGE) || [])[1], 'اسحب المكونات من الشريط الجانبي أو أعد ترتيب الأقسام', `
      <select id="bPage" class="d-input" style="width:auto" onchange="go('builder?page=' + this.value)">${B_PAGES.map(p => `<option value="${p[0]}" ${p[0] === B_PAGE ? 'selected' : ''}>${p[1]}</option>`).join('')}</select>
      <a class="btn" href="/s/${STORE.slug}" target="_blank">${I('eye')} معاينة</a>
      <button class="btn" onclick="go('customize')">${I('customize')} إعدادات الثيم</button>`)}
    <div class="b-wrap">
      <div class="b-canvas" id="bCanvas"></div>
      <div class="b-palette">
        <h3>المكونات</h3>
        ${B_TYPES.map(([g, items]) => `<details class="b-group" ${g === 'نص' ? 'open' : ''}><summary>${esc(g)}</summary>${items.map(([tp, nm]) => `<div class="b-item"><span>${esc(nm)}</span><button class="btn sm" onclick="bAdd('${tp}')">اضافة</button></div>`).join('')}</details>`).join('')}
      </div>
    </div>
  </div>`;
});

async function bLoad() {
  const { sections } = await api('/api/sections?page=' + B_PAGE);
  const el = $('#bCanvas'); if (!el) return;
  el.innerHTML = B_ZONES.map(([zone, label]) => {
    const rows = sections.filter(s => s.zone === zone);
    return `<div class="b-zone">
      <div class="b-zone-h"><b>${label}</b></div>
      ${rows.length ? rows.map(s => `
        <div class="b-sec ${s.enabled ? '' : 'off'}">
          <span class="b-sec-name">${esc(B_TYPE_NAMES[s.type] || s.type)}</span>
          <span class="b-sec-acts">
            <button class="btn sm" title="تحريك لأعلى" onclick="bMove(${s.id},'up')">↑</button>
            <button class="btn sm" title="تحريك لأسفل" onclick="bMove(${s.id},'down')">↓</button>
            <button class="btn sm" onclick="bEdit(${s.id})">${I('pen')} تعديل</button>
            <button class="btn sm" onclick="bToggle(${s.id}, ${s.enabled ? 0 : 1})">${s.enabled ? 'اخفاء' : 'اظهار'}</button>
            <button class="btn sm danger" onclick="bDel(${s.id})">${I('trash')}</button>
          </span>
        </div>`).join('') : '<p class="muted b-empty">اسحب المكونات من الشريط الجانبي للبدء</p>'}
    </div>`;
  }).join('');
  window._B_SECS = sections;
}

async function bAdd(type) {
  const zone = 'content';
  await api('/api/sections', { method: 'POST', body: { page: B_PAGE, zone, type, settings: {} } });
  bLoad();
}
async function bMove(id, dir) { await api(`/api/sections/${id}/move`, { method: 'POST', body: { dir } }); bLoad(); }
async function bToggle(id, on) { await api(`/api/sections/${id}`, { method: 'PUT', body: { enabled: !!on } }); bLoad(); }
async function bDel(id) { if (!confirm('حذف هذا القسم؟')) return; await api(`/api/sections/${id}`, { method: 'DELETE' }); bLoad(); }

function bEdit(id) {
  const s = (window._B_SECS || []).find(x => x.id === id); if (!s) return;
  let stg = {}; try { stg = JSON.parse(s.settings || '{}'); } catch (e) {}
  const fields = B_FIELDS[s.type] || [];
  openModal(`تعديل: ${B_TYPE_NAMES[s.type] || s.type}`, `
    ${fields.length ? fields.map(([k, label, kind]) => {
      const v = stg[k];
      if (kind === 'json') return `<label class="d-label">${label}</label><textarea id="bs-${k}" class="d-input" rows="5" dir="ltr">${esc(v ? JSON.stringify(v) : '')}</textarea>`;
      if (kind === 'textarea') return `<label class="d-label">${label}</label><textarea id="bs-${k}" class="d-input" rows="4">${esc(v || '')}</textarea>`;
      if (kind === 'color') return `<label class="d-label">${label}</label><input id="bs-${k}" type="color" class="d-input" value="${esc(v || '#27cd27')}">`;
      if (kind === 'number') return `<label class="d-label">${label}</label><input id="bs-${k}" type="number" class="d-input" value="${esc(String(v ?? ''))}">`;
      return `<label class="d-label">${label}</label><input id="bs-${k}" class="d-input" value="${esc(v || '')}">`;
    }).join('') : '<p class="muted">هذا القسم لا يحتوي اعدادات.</p>'}
    <div class="row-gap" style="margin-top:12px"><button class="btn primary" onclick="bSave(${id}, '${s.type}')">حفظ</button></div>`);
}

async function bSave(id, type) {
  const fields = B_FIELDS[type] || [];
  const stg = {};
  for (const [k, , kind] of fields) {
    const el = document.getElementById('bs-' + k); if (!el) continue;
    if (kind === 'json') { try { stg[k] = el.value.trim() ? JSON.parse(el.value) : undefined; } catch (e) { return alert('صيغة JSON غير صحيحة في ' + k); } }
    else if (kind === 'number') stg[k] = el.value === '' ? undefined : +el.value;
    else stg[k] = el.value;
  }
  Object.keys(stg).forEach(k => stg[k] === undefined && delete stg[k]);
  await api(`/api/sections/${id}`, { method: 'PUT', body: { settings: stg } });
  closeModal(); bLoad();
}
