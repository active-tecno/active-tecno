// dash-products.js — Stage F2 + H1: EO-parity products cluster (products, create, categories, reviews, feed, catalog, ab-tests)

// ---------- products list (EO layout) ----------
let P_DATA = [], P_SEL = new Set(), P_PAGE = 1, P_PER = 20, P_SORT_DESC = true, P_Q = '', P_QSKU = '';
registerView('products', async () => {
  const { products } = await api('/api/products');
  P_DATA = products; P_SEL = new Set(); P_PAGE = 1; P_Q = ''; P_QSKU = ''; P_SORT_DESC = true;
  setTimeout(renderPTable, 0);
  return `
  <div class="d-page">
    ${topBar('المنتجات', 'هنا تدير منتجات متجرك وتجهّزها بشكل يرفع معدل الشراء والتحويل', `
      <button class="btn" onclick="go('product-feed')">${I('feed')} Product Feed</button>
      <button class="btn" onclick="importProducts('json')">${I('download')} استيراد من ملف JSON</button>
      <button class="btn" onclick="importProducts('excel')">${I('download')} استيراد من ملف Excel</button>
`)}
    <div class="p-guides">
      <button class="btn dark" onclick="go('products/create')">${I('plus')} اضافة منتج</button>
      <span style="flex:1"></span>
      <button class="btn sm" onclick="openGuide('simple')">${I('video')} كيفية انشاء منتج بسيط</button>
      <button class="btn sm" onclick="openGuide('variants')">${I('video')} كيفية انشاء منتج متعدد الخواص</button>
    </div>
    <p class="muted" style="margin:0 0 10px;font-size:12.5px">عند انشاء أو تعديل منتج راجع الاعدادات المتقدمة — فيها خيارات ترفع مبيعاتك.</p>
    ${products.length ? `
      <div class="p-search-row">
        <div class="d-search">${I('search')}<input id="pSearch" placeholder="ابحث باسم المنتج" oninput="P_Q=this.value;P_PAGE=1;renderPTable()"></div>
        <div class="d-search">${I('search')}<input id="pSearchSku" placeholder="ابحث بال SKU" oninput="P_QSKU=this.value;P_PAGE=1;renderPTable()"></div>
      </div>
      <div class="d-card p-table-card"><table class="d-table" id="pTable"><thead><tr>
        <th class="p-check"><input type="checkbox" id="pAll" onchange="pToggleAll(this.checked)"></th>
        <th>المنتج</th><th>الحالة</th><th>المخزون</th><th>السعر</th>
        <th class="p-sort" onclick="P_SORT_DESC=!P_SORT_DESC;P_PAGE=1;renderPTable()">تاريخ الانشاء <span id="pSortArrow"></span></th>
        <th></th></tr></thead><tbody id="pTbody"></tbody></table>
        <div class="p-table-foot">
          <span>الصفوف لكل صفحة <select id="pPer" onchange="P_PER=+this.value;P_PAGE=1;renderPTable()"><option>10</option><option selected>20</option><option>50</option></select></span>
          <span id="pRange" class="muted"></span>
          <span class="p-pager"><button class="btn sm" onclick="pPage(-1)">السابق</button><button class="btn sm" onclick="pPage(1)">التالي</button></span>
        </div>
      </div>
      <div class="p-bulk" id="pBulk" hidden><b id="pBulkN"></b><button class="btn sm danger" onclick="pBulkDelete()">${I('trash')} حذف المحدد</button></div>` : `
      <div class="d-card empty">
        <div class="empty-ic">${I('products')}</div>
        <h3>لا توجد منتجات حالياً</h3>
        <p class="muted">لم تقم باضافة أي منتج بعد. ابدأ باضافة أول منتج لمتجرك يدوياً، أو استورد منتجاتك دفعة واحدة من ملف.</p>
        <div class="row-gap"><button class="btn primary" onclick="go('products/create')">${I('plus')} اضافة منتج</button><button class="btn" onclick="importProducts('excel')">${I('download')} استيراد من ملف</button></div>
      </div>`}
  </div>`;
});
function pFiltered() {
  const q = P_Q.trim(), qs = P_QSKU.trim();
  const arr = P_DATA.filter(p => (!q || (p.name || '').includes(q)) && (!qs || (p.sku || '').includes(qs)));
  arr.sort((a, b) => P_SORT_DESC ? b.id - a.id : a.id - b.id);
  return arr;
}
function renderPTable() {
  const tb = document.getElementById('pTbody'); if (!tb) return;
  const arr = pFiltered();
  const pages = Math.max(1, Math.ceil(arr.length / P_PER));
  if (P_PAGE > pages) P_PAGE = pages;
  const slice = arr.slice((P_PAGE - 1) * P_PER, P_PAGE * P_PER);
  tb.innerHTML = slice.map(p => {
    let img = ''; try { img = JSON.parse(p.images || '[]')[0] || ''; } catch (e) {}
    return `<tr>
      <td class="p-check"><input type="checkbox" ${P_SEL.has(p.id) ? 'checked' : ''} onchange="pToggle(${p.id},this.checked)"></td>
      <td><div class="p-cell">${img ? `<span class="p-thumb"><img src="${esc(img)}" alt=""><i class="p-dot ${p.status === 'active' ? 'on' : ''}"></i></span>` : `<span class="p-noimg">${I('products')}</span>`}<b>${esc(p.name)}</b></div></td>
      <td>${p.status === 'active' ? '<span class="p-status on">نشط</span>' : '<span class="p-status">مسودة</span>'}</td>
      <td>${p.stock_tracking ? (p.stock > 0 ? p.stock + ' قطعة' : '<span class="chip st-cancelled">نفذ المخزون</span>') : '<span class="muted">غير متتبع</span>'}</td>
      <td><b>${egp(p.price)}</b>${p.compare_at_price ? `<div class="muted sm strike">${egp(p.compare_at_price)}</div>` : ''}</td>
      <td class="muted">${fmtDateNum(p.created_at)}</td>
      <td class="acts">
        <button class="btn sm" onclick="go('products/create?id=${p.id}')">${I('pen')} تعديل</button>
        <button class="btn sm icon" title="استنساخ المنتج" onclick="dupProduct(${p.id})">${I('copy')}</button>
        <button class="btn sm icon" title="مشاهدة" onclick="viewProduct(${p.id})">${I('eye')}</button>
      </td></tr>`;
  }).join('') || `<tr><td colspan="7" class="muted" style="text-align:center;padding:20px">لا نتائج مطابقة للبحث</td></tr>`;
  const arrow = document.getElementById('pSortArrow'); if (arrow) arrow.textContent = P_SORT_DESC ? '↓' : '↑';
  const from = arr.length ? (P_PAGE - 1) * P_PER + 1 : 0, to = Math.min(arr.length, P_PAGE * P_PER);
  const rng = document.getElementById('pRange'); if (rng) rng.textContent = `عرض ${from}-${to} من ${arr.length} منتج`;
  const all = document.getElementById('pAll'); if (all) all.checked = slice.length > 0 && slice.every(p => P_SEL.has(p.id));
  pBulkBar();
}
function pPage(d) { P_PAGE += d; renderPTable(); }
function pToggle(id, on) {
  if (on) P_SEL.add(id); else P_SEL.delete(id);
  const all = document.getElementById('pAll');
  if (all) { const slice = pFiltered().slice((P_PAGE - 1) * P_PER, P_PAGE * P_PER); all.checked = slice.length > 0 && slice.every(p => P_SEL.has(p.id)); }
  pBulkBar();
}
function pToggleAll(on) { pFiltered().slice((P_PAGE - 1) * P_PER, P_PAGE * P_PER).forEach(p => { if (on) P_SEL.add(p.id); else P_SEL.delete(p.id); }); renderPTable(); }
function pBulkBar() { const b = document.getElementById('pBulk'); if (!b) return; b.hidden = !P_SEL.size; const n = document.getElementById('pBulkN'); if (n) n.textContent = `تم تحديد ${P_SEL.size} منتج`; }
async function pBulkDelete() {
  if (!P_SEL.size || !confirm(`حذف ${P_SEL.size} منتجاً؟ لا يمكن التراجع.`)) return;
  for (const id of P_SEL) { try { await api('/api/products/' + id, { method: 'DELETE' }); } catch (e) {} }
  toast('تم حذف المحدد'); rerender();
}
async function dupProduct(id) { await api('/api/products/' + id + '/duplicate', { method: 'POST' }); toast('تم استنساخ المنتج كمسودة'); rerender(); }
function viewProduct(id) { if (STORE && STORE.slug) window.open('/s/' + STORE.slug + '/p/' + id, '_blank'); }
function openGuide(kind) {
  const simple = `<ol class="guide-steps">
    <li>اضغط زر <b>اضافة منتج</b> أعلى الصفحة.</li>
    <li>اكتب اسم المنتج ووصفاً واضحاً يجاوب على أسئلة العميل.</li>
    <li>ارفع صورة واحدة على الأقل — الصورة الأولى هي الرئيسية التي تظهر في المتجر.</li>
    <li>حدد سعر المنتج، وسعر التخفيض لو عندك عرض.</li>
    <li>فعّل تتبع المخزون لو عايز النظام يعدّ القطع ويمنع الطلب عند النفاذ.</li>
    <li>اضغط حفظ — المنتج يظهر في متجرك فوراً بحالة نشط.</li></ol>`;
  const vars = `<ol class="guide-steps">
    <li>أنشئ المنتج بنفس خطوات المنتج البسيط.</li>
    <li>في قسم <b>خواص المنتج</b> اضغط "اضافة متغير جديد".</li>
    <li>اكتب اسم الخاصية (مثال: المقاس) والقيم مفصولة بفواصل (S, M, L, XL).</li>
    <li>أضف متغيراً ثانياً عند الحاجة (مثال: اللون) — العميل يختار قبل الطلب.</li>
    <li>احفظ المنتج وستظهر الخيارات تلقائياً في صفحة المنتج بمتجرك.</li></ol>`;
  openModal(kind === 'simple' ? 'كيفية انشاء منتج بسيط' : 'كيفية انشاء منتج متعدد الخواص', kind === 'simple' ? simple : vars, () => {});
}
function importProducts(kind) {
  const acc = kind === 'json' ? '.json' : '.csv';
  openModal('استيراد منتجات', `
    <p class="muted">${kind === 'json'
      ? 'ملف JSON بصيغة: [{"name":"...","price":100,"description":"...","stock":10,"category":"..."}]'
      : 'ملف CSV بأعمدة: name,price,description,stock,category — صف أول للعناوين اختياري.'}</p>
    <input type="file" id="impFile" accept="${acc}" class="d-input">
    <div id="impStatus"></div>
    <button class="btn primary" onclick="runImport('${kind}')">استيراد</button>`, () => {});
}
async function runImport(kind) {
  const f = $('#impFile').files[0]; if (!f) return toast('اختر ملفاً أولاً', 'err');
  const text = await f.text();
  let items = [];
  try {
    if (kind === 'json') {
      items = JSON.parse(text);
      if (!Array.isArray(items)) throw 0;
    } else {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (/^name\s*,/i.test(lines[0])) lines.shift();
      items = lines.map(l => { const [name, price, description, stock, category] = l.split(',').map(x => x?.replace(/^"|"$/g, '').trim()); return { name, price: +price, description, stock: +stock || 0, category }; });
    }
    items = items.filter(x => x.name && x.price > 0);
    if (!items.length) throw 0;
  } catch (e) { $('#impStatus').innerHTML = '<p class="err-text">تعذر قراءة الملف — تأكد من الصيغة.</p>'; return; }
  let ok = 0;
  for (const it of items) { try { await api('/api/products', { method: 'POST', body: it }); ok++; } catch (e) {} }
  $('#impStatus').innerHTML = `<p class="ok-text">تم استيراد ${ok} من ${items.length} منتجاً.</p>`;
  if (ok) setTimeout(() => { closeModal(); rerender(); }, 900);
}

// ---------- product create / edit (EO two-column layout) ----------
let PF_IMGS = [], PF_VARS = [], PF_SETTINGS = {};
registerView('products/create', async () => {
  const params = new URLSearchParams((location.hash.split('?')[1] || ''));
  const id = params.get('id');
  let p = null;
  if (id) { const { products } = await api('/api/products'); p = products.find(x => x.id === +id); }
  const { categories } = await api('/api/categories');
  let imgs = []; try { imgs = JSON.parse(p?.images || '[]'); } catch (e) {}
  let vars = []; try { vars = JSON.parse(p?.variants || '[]'); } catch (e) {}
  let stg = {}; try { stg = JSON.parse(p?.settings || '{}'); } catch (e) {}
  const catOpts = categories.map(c => `<option value="${esc(c.name)}" ${p?.category === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  setTimeout(() => mountProductForm(p, imgs, vars, stg), 0);
  return `
  <div class="d-page form-page">
    ${topBar(`<a class="p-back" href="#/products">→</a> ${id ? 'تعديل منتج' : 'اضافة منتج'}`, '', `
      <button class="btn" onclick="aiProductHelper()">${I('spark')} انشاء باستخدام ال AI</button>
      ${id ? `<button class="btn danger" onclick="delProduct(${id}, '${esc(p?.name || '').replace(/'/g, '')}')">${I('trash')} حذف</button>` : ''}`)}
    <div class="pf-grid">
      <div class="pf-main">
        <div class="d-card"><h3>بيانات المنتج الاساسية</h3>
          <label class="d-label">اسم المنتج *</label><input id="pf-name" class="d-input" value="${esc(p?.name || '')}" placeholder="مثال: ساعة يد كلاسيك">
          <label class="d-label">وصف المنتج</label>
          <div class="rte-bar"><button type="button" onclick="rteCmd('bold')"><b>B</b></button><button type="button" onclick="rteCmd('italic')"><i>I</i></button><button type="button" onclick="rteCmd('underline')"><u>U</u></button><button type="button" onclick="rteCmd('insertUnorderedList')">• قائمة</button></div>
          <div id="pf-desc" class="d-input rte" contenteditable="true">${p?.description || ''}</div>
        </div>
        <div class="d-card"><h3>الصور</h3>
          <div class="img-drop" id="pf-drop">
            <input type="file" id="pf-file" accept="image/png,image/jpeg,image/webp" multiple hidden>
            <div class="img-list" id="pf-imgs"></div>
            <button type="button" class="btn" onclick="document.getElementById('pf-file').click()">${I('image')} اسحب الصور هنا أو اضغط للاضافة</button>
            <div class="muted sm">png أو jpg أو webp — حتى 5 ميجا للصورة. الصورة الأولى هي الصورة الرئيسية.</div>
          </div>
        </div>
        <div class="d-card"><h3>التسعير</h3><div class="grid3">
          <div><label class="d-label">سعر المنتج *</label><input id="pf-price" type="number" min="0" step="0.01" class="d-input" value="${p?.price ?? ''}"></div>
          <div><label class="d-label">سعر التخفيض</label><input id="pf-compare" type="number" min="0" step="0.01" class="d-input" value="${p?.compare_at_price ?? ''}" placeholder="السعر قبل الخصم"></div>
          <div><label class="d-label">تكلفة المنتج</label><input id="pf-cost" type="number" min="0" step="0.01" class="d-input" value="${p?.cost ?? ''}"><div class="muted sm">يتم من خلالها احتساب صافي الربح</div></div>
        </div></div>
        <div class="d-card"><h3>الظهور في محركات البحث</h3><div class="grid3">
          <div><label class="d-label">رابط المنتج *</label><input id="pf-slug" class="d-input ltr" value="${esc(p?.slug || '')}" placeholder="classic-watch"></div>
          <div><label class="d-label">معرف ال SKU</label><input id="pf-sku" class="d-input ltr" value="${esc(p?.sku || '')}"></div>
          <div><label class="d-label">Meta Description</label><input id="pf-meta" class="d-input" value="${esc(p?.meta_description || '')}" placeholder="وصف مختصر لمحركات البحث"></div>
        </div></div>
        <div class="d-card"><h3>خواص المنتج</h3>
          <div id="pf-vars"></div>
          <button class="btn sm" type="button" onclick="addVariantRow()">+ اضافة متغير جديد</button>
        </div>
        <div class="d-card"><h3>التحكم في الاصناف</h3><div class="grid3">
          <div><label class="d-label">حد التنبيه للمخزون المنخفض</label><input id="pf-low" type="number" min="0" class="d-input" value="${p?.low_stock_threshold ?? 3}"></div>
          <div><label class="d-label">الحالة</label><select id="pf-status" class="d-input"><option value="active" ${p?.status !== 'draft' ? 'selected' : ''}>نشط</option><option value="draft" ${p?.status === 'draft' ? 'selected' : ''}>مسودة (مخفي من المتجر)</option></select></div>
        </div></div>
      </div>
      <div class="pf-side">
        <div class="d-card"><h3>التنظيم</h3>
          <label class="d-label">الاقسام</label><select id="pf-cat" class="d-input"><option value="">بدون قسم</option>${catOpts}</select>
          <label class="d-label">الاولوية في الظهور</label><input id="pf-priority" type="number" class="d-input" value="${p?.priority ?? 0}"><p class="muted" style="font-size:11.5px;margin:4px 0 0">الرقم الأقل يظهر أولاً: منتج أولويته 7 يظهر قبل 9.</p>
          <div class="muted sm">كلما زاد الرقم ظهر المنتج قبل غيره في الأقسام والصفحة الرئيسية.</div>
        </div>
        <div class="d-card"><h3>عمل لاندينج بيدج احترافية للمنتج</h3>
          ${id ? `
          <label class="switch-row"><button type="button" class="switch ${stg.landing_standalone ? 'on' : ''}" id="pf-land-alone" onclick="pfLandingToggle('landing_standalone',this)"></button>ظهور المنتج كصفحة هبوط منفصلة</label>
          <label class="switch-row"><button type="button" class="switch ${stg.landing_below ? 'on' : ''}" id="pf-land-below" onclick="pfLandingToggle('landing_below',this)"></button>اظهار محتوى الهبوط اسفل الصفحة العادية</label>
          <div class="muted sm">صفحة الهبوط المنفصلة تعرض المنتج بترتيب مبيعات مباشر بدون تشتيت، والمحتوى أسفل الصفحة يضيف نموذج الطلب بعد الوصف.</div>`
          : `<div class="muted sm">احفظ المنتج أولاً لتفعيل خيارات صفحة الهبوط الاحترافية.</div>`}
        </div>
        <div class="d-card"><h3>اعدادات المخزون</h3>
          <label class="d-label">كمية المخزون</label><input id="pf-stock" type="number" min="0" class="d-input" value="${p?.stock ?? 0}">
          <div class="muted sm">عند الوصول لصفر يظهر المنتج كخارج المخزون</div>
          <label class="switch-row"><button type="button" class="switch ${p?.stock_tracking ? 'on' : ''}" id="pf-track" onclick="this.classList.toggle('on')"></button>تتبع المخزون</label>
          <label class="switch-row"><button type="button" class="switch ${p?.disable_on_zero ? 'on' : ''}" id="pf-disable-zero" onclick="this.classList.toggle('on')"></button>تعطيل المنتج عند نفاذ المخزون</label>
        </div>
        <div class="d-card"><h3>اعدادات متقدمة</h3>
          <p class="muted sm">تخطي السلة، الزر الثابت، نموذج الشراء، المراجعات، العدادات والمزيد.</p>
          <button class="btn" type="button" onclick="openAdvSettings()">${I('settings')} إدارة الإعدادات</button>
        </div>
        <div class="d-card"><h3>ربط المنتج مع منصات خارجية</h3>
          <label class="d-label">منتج مرتبط (Upsell)</label><select id="pf-upsell" class="d-input"><option value="">بدون</option></select>
          <div class="muted sm">يظهر كعرض "يُشترى معه غالباً" في صفحة هذا المنتج.</div>
        </div>
        <div class="d-card"><h3>عملة مخصصة</h3>
          <input id="pf-currency" class="d-input" value="${esc(p?.currency || '')}" placeholder="اتركه فارغاً لاستخدام الجنيه">
          <div class="warn-note sm">عند تحديد عملة مخصصة فعّل تخطي السلة من الإعدادات المتقدمة حتى تظهر العملة بشكل صحيح في الطلب.</div>
        </div>
        <div class="d-card"><h3>Custom Pixel</h3>
          <textarea id="pf-pixel" class="d-input ltr" rows="3" placeholder="كود بيكسل مخصص لهذا المنتج">${esc(p?.custom_pixel || '')}</textarea>
          <div class="muted sm">يُحقن الكود في صفحة هذا المنتج فقط، وليس في باقي صفحات المتجر.</div>
        </div>
      </div>
    </div>
    <div class="save-bar"><button class="btn primary lg" onclick="saveProduct(${id || 'null'})">حفظ</button></div>
  </div>`;
});
function pfLandingToggle(key, el) {
  el.classList.toggle('on');
  const on = el.classList.contains('on');
  PF_SETTINGS[key] = on;
  if (key === 'landing_standalone' && on) { PF_SETTINGS.buy_same_page = true; PF_SETTINGS.hide_header = true; PF_SETTINGS.hide_similar = true; }
  if (key === 'landing_below' && on) { PF_SETTINGS.buy_same_page = true; PF_SETTINGS.form_before_desc = false; }
}
function mountProductForm(p, imgs, vars, stg) {
  PF_IMGS = imgs.slice(); PF_VARS = vars.slice(); PF_SETTINGS = stg || {};
  renderPfImgs(); renderPfVars();
  api('/api/products').then(({ products }) => {
    const sel = $('#pf-upsell'); if (!sel) return;
    sel.innerHTML = '<option value="">بدون</option>' + products.filter(x => x.id !== p?.id).map(x => `<option value="${x.id}" ${p?.upsell_product_id === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  });
  $('#pf-file').addEventListener('change', async e => {
    for (const f of e.target.files) {
      if (f.size > 5e6) { toast(`الصورة ${f.name} أكبر من 5 ميجا`, 'err'); continue; }
      const dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
      try { const { url } = await api('/api/upload', { method: 'POST', body: { dataUrl } }); PF_IMGS.push(url); } catch (err) {}
    }
    e.target.value = ''; renderPfImgs();
  });
}
function renderPfImgs() {
  const w = $('#pf-imgs'); if (!w) return;
  w.innerHTML = PF_IMGS.map((u, i) => `<div class="img-thumb"><img src="${esc(u)}">${i === 0 ? '<span class="img-main-badge">الصورة الرئيسية</span>' : ''}<button type="button" onclick="PF_IMGS.splice(${i},1);renderPfImgs()">✕</button></div>`).join('');
}
function addVariantRow(v) { PF_VARS.push(v || { name: '', values: '' }); renderPfVars(); }
function renderPfVars() {
  const w = $('#pf-vars'); if (!w) return;
  w.innerHTML = PF_VARS.map((v, i) => `<div class="var-row">
    <input class="d-input" placeholder="اسم الخاصية (مثال: اللون)" value="${esc(v.name)}" oninput="PF_VARS[${i}].name=this.value">
    <input class="d-input" placeholder="القيم مفصولة بفواصل (مثال: أحمر, أزرق, أسود)" value="${esc(v.values)}" oninput="PF_VARS[${i}].values=this.value">
    <button class="btn sm danger" type="button" onclick="PF_VARS.splice(${i},1);renderPfVars()">حذف</button></div>`).join('');
}
function rteCmd(c) { document.execCommand(c); $('#pf-desc').focus(); }
// ---------- advanced settings modal ----------
function advSwitch(key, label) {
  return `<label class="switch-row"><button type="button" class="switch ${PF_SETTINGS[key] ? 'on' : ''}" onclick="advToggle('${key}',this)"></button>${label}</label>`;
}
function advToggle(key, el) { el.classList.toggle('on'); PF_SETTINGS[key] = el.classList.contains('on'); }
function advNum(key, val) { PF_SETTINGS[key] = val; }
function openAdvSettings() {
  openModal('اعدادات متقدمة', `
    ${advSwitch('skip_cart', 'تخطي السلة')}
    <label class="d-label">النص المكتوب على زر شراء الآن</label>
    <input class="d-input" value="${esc(PF_SETTINGS.buy_button_text || '')}" placeholder="اضغط هنا للشراء" oninput="advNum('buy_button_text',this.value)">
    ${advSwitch('sticky_buy', 'تفعيل الزر الثابت أسفل الصفحة للشراء')}
    ${advSwitch('buy_same_page', 'شراء المنتج من نفس الصفحة')}
    ${advSwitch('reviews_enabled', 'تفعيل المراجعات؟')}
    ${advSwitch('free_shipping', 'تفعيل الشحن المجاني للمنتج')}
    <div class="sim-box">
      <b>عدّادات محاكاة (تسويقية)</b>
      <p class="muted sm">هذه الأدوات تعرض للزائر أرقاماً غير حقيقية تقوم أنت بتحديدها (مشاهدين ومخزون ووقت متبقٍ). تُفعَّل فقط عند اختيارك وتبقى مسؤوليتك أمام عملائك.</p>
      ${advSwitch('fake_visitors', 'عرض عداد زوار وهمي؟')}
      <div class="grid2">
        <div><label class="d-label">الحد الادنى</label><input type="number" min="1" class="d-input" value="${PF_SETTINGS.fake_visitors_min ?? 20}" oninput="advNum('fake_visitors_min',+this.value)"></div>
        <div><label class="d-label">الحد الأقصى</label><input type="number" min="1" class="d-input" value="${PF_SETTINGS.fake_visitors_max ?? 70}" oninput="advNum('fake_visitors_max',+this.value)"></div>
      </div>
      ${advSwitch('fake_stock', 'تفعيل خاصية المخزون الوهمي')}
      <label class="d-label">عدد قطع المخزون الوهمي</label>
      <input type="number" min="0" class="d-input" value="${PF_SETTINGS.fake_stock_count ?? 0}" oninput="advNum('fake_stock_count',+this.value)">
      ${advSwitch('fake_countdown', 'العداد الوهمي')}
      <label class="d-label">عدد الساعات</label>
      <input type="number" min="1" class="d-input" value="${PF_SETTINGS.fake_countdown_hours ?? 1}" oninput="advNum('fake_countdown_hours',+this.value)">
    </div>
    ${advSwitch('hide_header', 'اخفاء الهيدر')}
    ${advSwitch('hide_qty_counter', 'اخفاء عداد القطع')}
    ${advSwitch('hidden_product', 'منتج مخفي')}
    ${advSwitch('form_before_desc', 'جعل نموذج الشراء قبل وصف المنتج (جديد)')}
    ${advSwitch('hide_similar', 'جعل المنتجات المشابهة مخفية (جديد)')}
    <label class="d-label">السعر الذي سيتم ارساله للبيكسل</label>
    <input type="number" min="0" step="0.01" class="d-input" value="${PF_SETTINGS.pixel_price ?? ''}" placeholder="اتركه فارغاً لإرسال سعر المنتج" oninput="advNum('pixel_price',+this.value||0)">
    <button class="btn primary" onclick="closeModal();toast('تم تجهيز الإعدادات — لا تنسَ حفظ المنتج')">حفظ</button>`, () => {});
}
async function saveProduct(id) {
  const name = $('#pf-name').value.trim(), price = +$('#pf-price').value;
  if (!name || !(price > 0)) return toast('اسم المنتج والسعر مطلوبان', 'err');
  if (!PF_IMGS.length) return toast('أضف صورة واحدة على الأقل للمنتج', 'err');
  const body = {
    name, description: $('#pf-desc').innerHTML.trim(), price,
    compare_at_price: +$('#pf-compare').value || null, cost: +$('#pf-cost').value || 0,
    sku: $('#pf-sku').value.trim(), slug: $('#pf-slug').value.trim(), meta_description: $('#pf-meta').value.trim(),
    stock: +$('#pf-stock').value || 0, low_stock_threshold: +$('#pf-low').value || 3,
    stock_tracking: $('#pf-track').classList.contains('on') ? 1 : 0,
    disable_on_zero: $('#pf-disable-zero').classList.contains('on') ? 1 : 0,
    currency: $('#pf-currency').value.trim(), custom_pixel: $('#pf-pixel').value.trim(),
    status: $('#pf-status').value, category: $('#pf-cat').value, priority: +$('#pf-priority').value || 0,
    upsell_product_id: +$('#pf-upsell').value || null,
    images: PF_IMGS, variants: PF_VARS.filter(v => v.name.trim() && v.values.trim()),
    settings: PF_SETTINGS
  };
  const saved = id
    ? await api('/api/products/' + id, { method: 'PUT', body })
    : await api('/api/products', { method: 'POST', body });
  toast('تم حفظ المنتج');
  const pid = saved.product?.id || id;
  if (pid && STORE?.slug) {
    openModal('تم الحفظ', `<p>تم حفظ المنتج بنجاح. يمكنك الآن فتح صفحة المنتج في متجرك ومشاركتها كصفحة هبوط.</p>
      <div class="row-gap"><a class="btn primary" href="/s/${STORE.slug}/p/${pid}" target="_blank">فتح صفحة المنتج</a>
      <button class="btn" onclick="closeModal();go('products')">العودة للمنتجات</button></div>`, () => {});
  } else go('products');
}
// AI product helper — rule-based description draft from the product name
function aiProductHelper() {
  openModal('انشاء باستخدام ال AI', `
    <p class="muted">اكتب اسم المنتج وسأجهز لك مسودة وصف واسم محسّن — راجعها وعدّلها قبل الحفظ.</p>
    <label class="d-label">اسم المنتج أو فكرته</label><input id="aiPName" class="d-input" placeholder="مثال: ساعة يد جلد بني">
    <label class="d-label">مميزات إضافية (اختياري)</label><input id="aiPFeat" class="d-input" placeholder="مقاومة للماء، ضمان سنة">
    <div id="aiPOut"></div>
    <button class="btn primary" onclick="aiProductGen()">توليد المسودة</button>`, () => {});
}
function aiProductGen() {
  const n = $('#aiPName').value.trim(); if (!n) return toast('اكتب اسم المنتج أولاً', 'err');
  const f = $('#aiPFeat').value.trim();
  const feats = f ? f.split(/[,،]/).map(x => x.trim()).filter(Boolean) : ['خامة عالية الجودة', 'تصميم عملي أنيق'];
  const desc = `<p><b>${esc(n)}</b> — اختيار عملي يجمع بين الجودة والسعر المناسب.</p><ul>${feats.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p>اطلبه الآن ويصلك حتى باب البيت مع إمكانية الدفع عند الاستلام.</p>`;
  $('#aiPOut').innerHTML = `<div class="ai-draft">${desc}</div>
    <div class="row-gap"><button class="btn primary" onclick="applyAiProduct(${JSON.stringify(n).replace(/"/g, '&quot;')})">استخدام المسودة</button></div>`;
}
function applyAiProduct(n) {
  $('#pf-name').value = n;
  $('#pf-desc').innerHTML = $('#aiPOut .ai-draft').innerHTML;
  closeModal(); toast('تم نقل المسودة — راجعها قبل الحفظ');
}
async function delProduct(id, name) {
  if (!confirm(`حذف المنتج "${name}"؟ لا يمكن التراجع.`)) return;
  await api('/api/products/' + id, { method: 'DELETE' });
  toast('تم حذف المنتج'); go('products');
}

// ---------- categories ----------
registerView('categories', async () => {
  const { categories } = await api('/api/categories');
  return `
  <div class="d-page">
    ${topBar('الاقسام', `${categories.length} قسم`, `<button class="btn primary" onclick="catModal()">+ اضافة قسم</button>`)}
    ${categories.length ? `<div class="d-card"><table class="d-table"><thead><tr><th>القسم</th><th>الاولوية</th><th>تاريخ الاضافة</th><th></th></tr></thead><tbody>
      ${categories.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${c.priority}</td><td class="muted">${fmtDate(c.created_at)}</td>
      <td class="acts"><button class="btn sm" onclick="catModal(${c.id},'${esc(c.name).replace(/'/g, '')}',${c.priority})">تعديل</button>
      <button class="btn sm danger" onclick="delCategory(${c.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>` : `
    <div class="d-card empty"><div class="empty-ic">${I('categories')}</div><h3>لا توجد أقسام بعد</h3><p class="muted">نظّم منتجاتك في أقسام لتسهيل التصفح على عملائك.</p><button class="btn primary" onclick="catModal()">+ اضافة قسم</button></div>`}
  </div>`;
});
function catModal(id, name, priority) {
  openModal(id ? 'تعديل قسم' : 'اضافة قسم', `
    <label class="d-label">اسم القسم *</label><input id="catName" class="d-input" value="${esc(name || '')}">
    <label class="d-label">الاولوية في الظهور</label><input id="catPri" type="number" class="d-input" value="${priority ?? 0}">
    <button class="btn primary" onclick="saveCategory(${id || 'null'})">حفظ</button>`, () => {});
}
async function saveCategory(id) {
  const name = $('#catName').value.trim(); if (!name) return toast('اسم القسم مطلوب', 'err');
  const body = { name, priority: +$('#catPri').value || 0 };
  if (id) await api('/api/categories/' + id, { method: 'PUT', body });
  else await api('/api/categories', { method: 'POST', body });
  closeModal(); toast('تم حفظ القسم'); rerender();
}
async function delCategory(id) { if (!confirm('حذف هذا القسم؟')) return; await api('/api/categories/' + id, { method: 'DELETE' }); toast('تم حذف القسم'); rerender(); }

// ---------- reviews ----------
registerView('reviews', async () => {
  const { reviews } = await api('/api/reviews');
  const chip = s => s === 'published' ? '<span class="chip st-delivered">منشور</span>' : s === 'hidden' ? '<span class="chip st-cancelled">مخفي</span>' : '<span class="chip st-new">بانتظار المراجعة</span>';
  const stars = r => '★'.repeat(r) + '<span class="muted">' + '★'.repeat(5 - r) + '</span>';
  return `
  <div class="d-page">
    ${topBar('التقييمات', `${reviews.length} تقييم`)}
    ${reviews.length ? `<div class="d-card"><div class="chips-row">
        <button class="chip f active" onclick="filterReviews(this,'')">الكل</button>
        <button class="chip f" onclick="filterReviews(this,'pending')">بانتظار المراجعة</button>
        <button class="chip f" onclick="filterReviews(this,'published')">منشور</button>
        <button class="chip f" onclick="filterReviews(this,'hidden')">مخفي</button></div>
      <table class="d-table" id="rvTable"><thead><tr><th>المنتج</th><th>العميل</th><th>التقييم</th><th>النص</th><th>الحالة</th><th></th></tr></thead><tbody>
      ${reviews.map(r => `<tr data-status="${r.status}"><td>${esc(r.product_name)}</td><td>${esc(r.customer_name)}</td><td class="stars">${stars(r.rating)}</td>
        <td class="muted">${esc(r.text || '—')}</td><td>${chip(r.status)}</td>
        <td class="acts">${r.status !== 'published' ? `<button class="btn sm" onclick="setReview(${r.id},'published')">نشر</button>` : `<button class="btn sm" onclick="setReview(${r.id},'hidden')">إخفاء</button>`}
        <button class="btn sm danger" onclick="delReview(${r.id})">حذف</button></td></tr>`).join('')}</tbody></table></div>` : `
    <div class="d-card empty"><div class="empty-ic">${I('reviews')}</div><h3>لا توجد تقييمات بعد</h3><p class="muted">تقييمات عملائك على منتجاتك تظهر هنا فور وصولها.</p></div>`}
  </div>`;
});
function filterReviews(btn, st) {
  document.querySelectorAll('.chips-row .chip.f').forEach(c => c.classList.remove('active')); btn.classList.add('active');
  document.querySelectorAll('#rvTable tbody tr').forEach(tr => { tr.style.display = (!st || tr.dataset.status === st) ? '' : 'none'; });
}
async function setReview(id, status) { await api('/api/reviews/' + id, { method: 'PUT', body: { status } }); toast('تم التحديث'); rerender(); }
async function delReview(id) { if (!confirm('حذف هذا التقييم؟')) return; await api('/api/reviews/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }

// ---------- product feed ----------
registerView('product-feed', async () => {
  const url = `${location.origin}/api/public/${STORE.slug}/feed.csv`;
  return `
  <div class="d-page">
    ${topBar('Product Feed', 'رابط فيد منتجاتك لمنصات الإعلانات')}
    <div class="d-card"><h3>${I('feed')} رابط الفيد</h3>
      <p class="muted">استخدم هذا الرابط في Meta Commerce Manager أو Google Merchant Center لمزامنة منتجاتك تلقائياً مع كتالوج الإعلانات. يتحدث الرابط لحظياً مع منتجاتك النشطة.</p>
      <div class="copy-row"><input class="d-input ltr" readonly value="${url}" id="feedUrl"><button class="btn primary" onclick="copyFeed()">نسخ الرابط</button></div>
    </div>
    <div class="d-card guide"><h3>طريقة الربط</h3><div class="guide-grid">
      <div><b>Meta (فيسبوك وانستجرام)</b><p class="muted">Commerce Manager ← Data sources ← Add products ← Use bulk upload ← Scheduled feed، والصق الرابط وحدد تكرار المزامنة.</p></div>
      <div><b>Google Merchant Center</b><p class="muted">Products ← Feeds ← إضافة فيد ← Scheduled fetch، والصق الرابط. الصيغة CSV متوافقة مع مواصفات Google.</p></div>
    </div></div>
  </div>`;
});
function copyFeed() { navigator.clipboard.writeText($('#feedUrl').value).then(() => toast('تم نسخ الرابط')); }

// ---------- easy catalog ----------
registerView('easy-catalog', async () => {
  const { items } = await api('/api/easy-catalog');
  return `
  <div class="d-page">
    ${topBar('اكتف كتالوج', 'منتجات جاهزة تضيفها لمتجرك بضغطة', `<button class="btn primary" onclick="importCatalog()">استيراد المحدد (<span id="ecCount">0</span>)</button>`)}
    <p class="muted">اختر من مكتبة اكتف منتجات جاهزة بأسماء واوصاف واسعار مقترحة — تُضاف لمتجرك ويمكنك تعديلها بالكامل بعد الاستيراد.</p>
    <div class="ec-grid">
      ${items.map(x => `<label class="ec-card"><input type="checkbox" class="ec-check" value="${x.id}" onchange="ecUpdate()">
        <b>${esc(x.name)}</b><span class="chip">${esc(x.category)}</span>
        <p class="muted sm">${esc(x.description.slice(0, 90))}...</p>
        <div class="ec-price">${egp(x.price)}${x.compare_at_price ? `<span class="muted sm strike">${egp(x.compare_at_price)}</span>` : ''}</div>
      </label>`).join('')}
    </div>
  </div>`;
});
function ecUpdate() { $('#ecCount').textContent = document.querySelectorAll('.ec-check:checked').length; }
async function importCatalog() {
  const ids = [...document.querySelectorAll('.ec-check:checked')].map(c => c.value);
  if (!ids.length) return toast('اختر منتجاً واحداً على الأقل', 'err');
  const { added } = await api('/api/easy-catalog/import', { method: 'POST', body: { ids } });
  toast(`تم استيراد ${added} منتجاً إلى متجرك`); go('products');
}

// ---------- A/B tests ----------
registerView('ab-tests', async () => {
  const { tests } = await api('/api/ab-tests');
  const conv = (o, v) => v ? ((o / v) * 100).toFixed(1) + '%' : '—';
  return `
  <div class="d-page">
    ${topBar('A/B Tests', 'اختبر نسختين من صفحة منتجك واختر الأفضل', `<button class="btn primary" onclick="abModal()">+ انشاء اختبار</button>`)}
    ${tests.length ? tests.map(t => `
      <div class="d-card"><div class="ab-head"><b>${esc(t.name)}</b>${t.product_name ? `<span class="chip">${esc(t.product_name)}</span>` : ''}
        ${t.status === 'running' ? '<span class="chip st-delivered">يعمل</span>' : '<span class="chip">متوقف</span>'}
        <span class="acts">${t.status === 'running' ? `<button class="btn sm" onclick="abStatus(${t.id},'stopped')">إيقاف</button>` : `<button class="btn sm" onclick="abStatus(${t.id},'running')">تشغيل</button>`}
        <button class="btn sm danger" onclick="delAb(${t.id})">حذف</button></span></div>
        <div class="ab-cols">
          <div class="ab-col"><h4>النسخة A (الأصلية)</h4><div class="muted sm">مشاهدات: ${t.views_a} — طلبات: ${t.orders_a} — تحويل: ${conv(t.orders_a, t.views_a)}</div></div>
          <div class="ab-col"><h4>النسخة B</h4><div class="muted sm">مشاهدات: ${t.views_b} — طلبات: ${t.orders_b} — تحويل: ${conv(t.orders_b, t.views_b)}</div></div>
        </div>
      </div>`).join('') : `
    <div class="d-card empty"><div class="empty-ic">${I('ab')}</div><h3>لا يوجد اختبارات حتى الان</h3><p class="muted">أنشئ اختبار A/B لصفحة أحد منتجاتك: نصف الزوار يرون النسخة الأصلية والنصف الآخر يرون النسخة البديلة، ونقيس أيهما يحقق طلبات أكثر.</p><button class="btn primary" onclick="abModal()">+ انشاء اختبار</button></div>`}
  </div>`;
});
async function abModal() {
  const { products } = await api('/api/products');
  openModal('انشاء اختبار A/B', `
    <label class="d-label">اسم الاختبار *</label><input id="abName" class="d-input" placeholder="مثال: اختبار عنوان المنتج">
    <label class="d-label">المنتج</label><select id="abProduct" class="d-input">${products.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
    <h4>النسخة B — غيّر ما تريد اختباره فقط (اترك الحقل فارغاً لاستخدام الأصلي)</h4>
    <label class="d-label">اسم بديل</label><input id="abBName" class="d-input">
    <label class="d-label">سعر بديل</label><input id="abBPrice" type="number" min="0" step="0.01" class="d-input">
    <label class="d-label">وصف بديل</label><textarea id="abBDesc" class="d-input" rows="3"></textarea>
    <button class="btn primary" onclick="saveAb()">بدء الاختبار</button>`, () => {});
}
async function saveAb() {
  const name = $('#abName').value.trim(); if (!name) return toast('اسم الاختبار مطلوب', 'err');
  const vb = {};
  if ($('#abBName').value.trim()) vb.name = $('#abBName').value.trim();
  if (+$('#abBPrice').value > 0) vb.price = +$('#abBPrice').value;
  if ($('#abBDesc').value.trim()) vb.description = $('#abBDesc').value.trim();
  if (!Object.keys(vb).length) return toast('حدد تغييراً واحداً على الأقل للنسخة B', 'err');
  await api('/api/ab-tests', { method: 'POST', body: { name, product_id: +$('#abProduct').value, variant_a: {}, variant_b: vb } });
  closeModal(); toast('بدأ الاختبار'); rerender();
}
async function abStatus(id, status) { await api('/api/ab-tests/' + id, { method: 'PUT', body: { status } }); toast('تم التحديث'); rerender(); }
async function delAb(id) { if (!confirm('حذف هذا الاختبار؟')) return; await api('/api/ab-tests/' + id, { method: 'DELETE' }); toast('تم الحذف'); rerender(); }
