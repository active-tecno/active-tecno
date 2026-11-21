// dash-products.js — Stage F2: EO-layout products cluster (products, create, categories, reviews, feed, catalog, ab-tests)

// ---------- products list ----------
registerView('products', async () => {
  const { products } = await api('/api/products');
  const rows = products.map(p => {
    let img = ''; try { img = JSON.parse(p.images || '[]')[0] || ''; } catch (e) {}
    return `<tr>
      <td><div class="p-cell">${img ? `<img src="${esc(img)}" alt="">` : `<span class="p-noimg">${I('products')}</span>`}<div><b>${esc(p.name)}</b>${p.sku ? `<div class="muted sm">SKU: ${esc(p.sku)}</div>` : ''}</div></div></td>
      <td>${egp(p.price)}${p.compare_at_price ? `<div class="muted sm strike">${egp(p.compare_at_price)}</div>` : ''}</td>
      <td>${p.status === 'active' ? (p.stock > 0 ? `${p.stock} قطعة` : '<span class="chip st-cancelled">نفذ المخزون</span>') : '<span class="chip">مسودة</span>'}</td>
      <td>${p.status === 'active' ? '<span class="chip st-delivered">نشط</span>' : '<span class="chip">غير نشط</span>'}</td>
      <td class="acts">
        <button class="btn sm" onclick="go('products/create?id=${p.id}')">تعديل</button>
        <button class="btn sm danger" onclick="delProduct(${p.id}, '${esc(p.name).replace(/'/g, '')}')">حذف</button>
      </td></tr>`;
  }).join('');
  return `
  <div class="d-page">
    ${topBar('المنتجات', `${products.length} منتج`, `
      <div class="dd-wrap"><button class="btn" onclick="this.nextElementSibling.classList.toggle('open')">استيراد ${I('chev')}</button>
        <div class="dd-menu">
          <button onclick="importProducts('excel')">استيراد من ملف Excel (CSV)</button>
          <button onclick="importProducts('json')">استيراد من ملف JSON</button>
          <button onclick="go('product-feed')">Product Feed</button>
        </div></div>
      <button class="btn primary" onclick="go('products/create')">+ اضافة منتج</button>`)}
    ${products.length ? `
      <div class="d-card"><div class="d-search">${I('search')}<input id="pSearch" placeholder="ابحث باسم المنتج أو SKU..." oninput="filterProducts(this.value)"></div>
      <table class="d-table" id="pTable"><thead><tr><th>المنتج</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="d-card guide"><h3>${I('help')} دليل سريع</h3>
        <div class="guide-grid">
          <div><b>كيفية انشاء منتج بسيط</b><p class="muted">اضغط "اضافة منتج"، اكتب الاسم والسعر، ارفع صورة واحدة على الأقل، ثم احفظ. المنتج يظهر في متجرك فوراً.</p></div>
          <div><b>كيفية انشاء منتج متعدد الخواص</b><p class="muted">في صفحة اضافة المنتج، قسم "خواص المنتج" يتيح لك اضافة متغيرات مثل اللون أو المقاس، كل متغير بقيمه الخاصة.</p></div>
        </div></div>` : `
      <div class="d-card empty">
        <div class="empty-ic">${I('products')}</div>
        <h3>لا توجد منتجات بعد</h3>
        <p class="muted">أضف أول منتج لمتجرك يدوياً، أو استورد من ملف، أو جرّب اكتف كتالوج لمنتجات جاهزة.</p>
        <div class="row-gap"><button class="btn primary" onclick="go('products/create')">+ اضافة منتج</button><button class="btn" onclick="go('easy-catalog')">تصفح اكتف كتالوج</button></div>
      </div>`}
  </div>`;
});
function filterProducts(q) {
  q = q.trim();
  document.querySelectorAll('#pTable tbody tr').forEach(tr => { tr.style.display = tr.textContent.includes(q) ? '' : 'none'; });
}
async function delProduct(id, name) {
  if (!confirm(`حذف المنتج "${name}"؟`)) return;
  await api('/api/products/' + id, { method: 'DELETE' });
  toast('تم حذف المنتج'); rerender();
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

// ---------- product create / edit (EO layout) ----------
registerView('products/create', async () => {
  const params = new URLSearchParams((location.hash.split('?')[1] || ''));
  const id = params.get('id');
  let p = null;
  if (id) { const { products } = await api('/api/products'); p = products.find(x => x.id === +id); }
  const { categories } = await api('/api/categories');
  let imgs = []; try { imgs = JSON.parse(p?.images || '[]'); } catch (e) {}
  let vars = []; try { vars = JSON.parse(p?.variants || '[]'); } catch (e) {}
  const catOpts = categories.map(c => `<option value="${esc(c.name)}" ${p?.category === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  setTimeout(() => mountProductForm(p, imgs, vars), 0);
  return `
  <div class="d-page form-page">
    ${topBar(id ? 'تعديل منتج' : 'اضافة منتج', '', `
      <button class="btn" onclick="aiProductHelper()">${I('spark')} انشاء باستخدام ال AI</button>
      <button class="btn primary" onclick="saveProduct(${id || 'null'})">حفظ</button>`)}
    <div class="d-card"><h3>بيانات المنتج الاساسية</h3>
      <label class="d-label">اسم المنتج *</label><input id="pf-name" class="d-input" value="${esc(p?.name || '')}" placeholder="مثال: ساعة يد كلاسيك">
      <label class="d-label">وصف المنتج</label>
      <div class="rte-bar"><button type="button" onclick="rteCmd('bold')"><b>B</b></button><button type="button" onclick="rteCmd('italic')"><i>I</i></button><button type="button" onclick="rteCmd('underline')"><u>U</u></button><button type="button" onclick="rteCmd('insertUnorderedList')">• قائمة</button></div>
      <div id="pf-desc" class="d-input rte" contenteditable="true">${p?.description || ''}</div>
      <label class="d-label">الصور</label>
      <div class="img-drop" id="pf-drop">
        <input type="file" id="pf-file" accept="image/png,image/jpeg,image/webp" multiple hidden>
        <div class="img-list" id="pf-imgs"></div>
        <button type="button" class="btn" onclick="document.getElementById('pf-file').click()">${I('image')} اضافة صور (حتى 5MB للصورة)</button>
      </div>
    </div>
    <div class="d-card"><h3>التسعير</h3><div class="grid3">
      <div><label class="d-label">سعر المنتج *</label><input id="pf-price" type="number" min="0" step="0.01" class="d-input" value="${p?.price ?? ''}"></div>
      <div><label class="d-label">سعر التخفيض</label><input id="pf-compare" type="number" min="0" step="0.01" class="d-input" value="${p?.compare_at_price ?? ''}" placeholder="السعر قبل الخصم"></div>
      <div><label class="d-label">تكلفة المنتج</label><input id="pf-cost" type="number" min="0" step="0.01" class="d-input" value="${p?.cost ?? ''}"><div class="muted sm">يتم من خلالها احتساب صافي الربح</div></div>
    </div></div>
    <div class="d-card"><h3>الظهور في محركات البحث</h3><div class="grid3">
      <div><label class="d-label">رابط المنتج</label><input id="pf-slug" class="d-input ltr" value="${esc(p?.slug || '')}" placeholder="classic-watch"></div>
      <div><label class="d-label">معرف ال SKU</label><input id="pf-sku" class="d-input ltr" value="${esc(p?.sku || '')}"></div>
      <div><label class="d-label">Meta Description</label><input id="pf-meta" class="d-input" value="${esc(p?.meta_description || '')}" placeholder="وصف مختصر لمحركات البحث"></div>
    </div></div>
    <div class="d-card"><h3>خواص المنتج</h3>
      <div id="pf-vars"></div>
      <button class="btn sm" type="button" onclick="addVariantRow()">+ اضافة متغير جديد</button>
    </div>
    <div class="d-card"><h3>التحكم في الاصناف</h3><div class="grid3">
      <div><label class="d-label">الكمية المتاحة</label><input id="pf-stock" type="number" min="0" class="d-input" value="${p?.stock ?? 0}"></div>
      <div><label class="d-label">حد التنبيه للمخزون المنخفض</label><input id="pf-low" type="number" min="0" class="d-input" value="${p?.low_stock_threshold ?? 3}"></div>
      <div><label class="d-label">الحالة</label><select id="pf-status" class="d-input"><option value="active" ${p?.status !== 'draft' ? 'selected' : ''}>نشط</option><option value="draft" ${p?.status === 'draft' ? 'selected' : ''}>مسودة (مخفي من المتجر)</option></select></div>
    </div></div>
    <div class="d-card"><h3>التنظيم</h3><div class="grid3">
      <div><label class="d-label">الاقسام</label><select id="pf-cat" class="d-input"><option value="">بدون قسم</option>${catOpts}</select></div>
      <div><label class="d-label">الاولوية في الظهور</label><input id="pf-priority" type="number" class="d-input" value="${p?.priority ?? 0}"><div class="muted sm">رقم أعلى = يظهر أولاً</div></div>
      <div><label class="d-label">منتج مرتبط (Upsell)</label><select id="pf-upsell" class="d-input"><option value="">بدون</option></select></div>
    </div></div>
    <div class="form-foot"><button class="btn primary lg" onclick="saveProduct(${id || 'null'})">حفظ المنتج</button></div>
  </div>`;
});

let PF_IMGS = [], PF_VARS = [];
function mountProductForm(p, imgs, vars) {
  PF_IMGS = imgs.slice(); PF_VARS = vars.slice();
  renderPfImgs(); renderPfVars();
  // upsell options
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
  w.innerHTML = PF_IMGS.map((u, i) => `<div class="img-thumb"><img src="${esc(u)}"><button type="button" onclick="PF_IMGS.splice(${i},1);renderPfImgs()">✕</button></div>`).join('');
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
async function saveProduct(id) {
  const name = $('#pf-name').value.trim(), price = +$('#pf-price').value;
  if (!name || !(price > 0)) return toast('اسم المنتج والسعر مطلوبان', 'err');
  const body = {
    name, description: $('#pf-desc').innerHTML.trim(), price,
    compare_at_price: +$('#pf-compare').value || null, cost: +$('#pf-cost').value || 0,
    sku: $('#pf-sku').value.trim(), slug: $('#pf-slug').value.trim(), meta_description: $('#pf-meta').value.trim(),
    stock: +$('#pf-stock').value || 0, low_stock_threshold: +$('#pf-low').value || 3,
    status: $('#pf-status').value, category: $('#pf-cat').value, priority: +$('#pf-priority').value || 0,
    upsell_product_id: +$('#pf-upsell').value || null,
    images: PF_IMGS, variants: PF_VARS.filter(v => v.name.trim() && v.values.trim())
  };
  const saved = id
    ? await api('/api/products/' + id, { method: 'PUT', body })
    : await api('/api/products', { method: 'POST', body });
  toast('تم حفظ المنتج');
  const pid = saved.product?.id || id;
  if (pid && STORE?.slug) {
    openModal('تم الحفظ', `<p>تم حفظ المنتج بنجاح. يمكنك الآن فتح صفحة المنتج في متجرك ومشاركتها كصفحة هبوط.</p>
      <div class="row-gap"><a class="btn primary" href="/s/${STORE.slug}#p-${pid}" target="_blank">فتح صفحة المنتج</a>
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
