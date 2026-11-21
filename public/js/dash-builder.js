// ---------- H2: visual builder (EO-style live canvas editor) ----------
const B_PAGES = [['home', 'الصفحة الرئيسية'], ['product', 'صفحة المنتج'], ['checkout', 'نموذج الشراء']];
const B_ZONES = [['above_header', 'أعلى الهيدر'], ['below_header', 'أسفل الهيدر'], ['content', 'محتوى الصفحة'], ['above_footer', 'أعلى الفوتر'], ['below_footer', 'أسفل الفوتر']];
const B_TYPES = [
  ['نص', [['heading', 'عنوان رئيسي وفرعي'], ['rich_text', 'نص متقدم']]],
  ['الصور والميديا', [['slider', 'سلايدر'], ['image', 'صورة'], ['promo_banner', 'لافتة ترويجية']]],
  ['التجارة الالكترونية', [['categories', 'الفئات'], ['featured_products', 'المنتجات المميزة'], ['product_list', 'قائمة المنتجات'], ['product_grid', 'شبكة المنتجات']]],
  ['عناصر اخري', [['hero', 'قسم بسيط'], ['advanced_section', 'قسم متقدم'], ['html_code', 'كود HTML']]],
  ['أقسام جاهزة', [['faq', 'الأسئلة الشائعة'], ['features', 'مميزات المتجر'], ['reviews', 'التقييمات'], ['newsletter', 'النشرة البريدية'], ['blog', 'المدونة'], ['marquee', 'شريط متحرك']]],
];
const B_TYPE_NAMES = { hero: 'قسم بسيط', slider: 'سلايدر', categories: 'الفئات', product_grid: 'شبكة المنتجات', product_list: 'قائمة المنتجات', featured_products: 'المنتجات المميزة', promo_banner: 'لافتة ترويجية', image: 'صورة', heading: 'عنوان رئيسي وفرعي', rich_text: 'نص متقدم', html_code: 'كود HTML', faq: 'الأسئلة الشائعة', features: 'مميزات المتجر', newsletter: 'النشرة البريدية', reviews: 'التقييمات', blog: 'المدونة', advanced_section: 'قسم متقدم', marquee: 'شريط متحرك' };
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
  marquee: [['items', 'العبارات (JSON: ["نص 1", "نص 2"])', 'json'], ['speed', 'السرعة (ثواني للفة)', 'number'], ['bg', 'لون الخلفية', 'color'], ['color', 'لون النص', 'color']],
};
// variant libraries: preset section packs (independent original content)
const B_PRESETS = {
  faq: [
    ['أسئلة الشحن', 'شكل بسيط عن الشحن والتوصيل', { variant: 'simple', title: 'أسئلة الشحن والتوصيل', items: [{ q: 'كم تستغرق مدة التوصيل؟', a: 'من 2 لـ 5 أيام عمل حسب المحافظة.' }, { q: 'هل يوجد شحن لكل المحافظات؟', a: 'نعم، نوصل لجميع محافظات مصر.' }, { q: 'ما تكلفة الشحن؟', a: 'تظهر تكلفة الشحن عند إتمام الطلب حسب المحافظة.' }] }],
    ['الدفع والاسترجاع (صناديق)', 'تصميم صناديق عن الدفع والإرجاع', { variant: 'boxed', title: 'الدفع والاسترجاع', items: [{ q: 'هل الدفع عند الاستلام متاح؟', a: 'نعم، ادفع كاش أو بالمحفظة عند الاستلام.' }, { q: 'ما سياسة الاسترجاع؟', a: 'يمكنك الاسترجاع خلال 14 يوم بحالة المنتج الأصلية.' }, { q: 'متى يصلني المبلغ المسترد؟', a: 'خلال 7 أيام عمل من استلام المرتجع.' }] }],
    ['عمودين عن المنتجات', 'عمودان للأسئلة الكثيرة', { variant: 'columns', title: 'أسئلة عن المنتجات', items: [{ q: 'هل المنتجات أصلية؟', a: 'جميع منتجاتنا أصلية 100%.' }, { q: 'كيف أختار المقاس؟', a: 'راجع جدول المقاسات في صفحة المنتج.' }, { q: 'هل الألوان مطابقة للصور؟', a: 'قد يختلف اللون قليلاً حسب إضاءة الشاشة.' }, { q: 'هل يوجد ضمان؟', a: 'نعم، ضمان استبدال ضد عيوب الصناعة.' }] }],
    ['طلبات وتتبع', 'متابعة الطلب خطوة بخطوة', { variant: 'boxed', title: 'متابعة طلبك', items: [{ q: 'كيف أتابع طلبي؟', a: 'نتواصل معك هاتفياً لتأكيد الطلب وموعد التسليم.' }, { q: 'هل يمكن تعديل الطلب؟', a: 'نعم قبل خروجه للشحن، تواصل معنا فوراً.' }, { q: 'كيف ألغي الطلب؟', a: 'تواصل معنا قبل الشحن وسنلغيه بدون رسوم.' }] }],
    ['أسئلة عامة بسيطة', 'بداية سريعة بسيطة', { variant: 'simple', title: 'الأسئلة الشائعة', items: [{ q: 'كيف أطلب؟', a: 'اختر المنتج واملأ بياناتك وسنتصل بك للتأكيد.' }, { q: 'هل أحتاج حساباً؟', a: 'لا، الطلب مباشر بدون تسجيل.' }] }],
    ['جملة واحدة لكل سؤال', 'إجابات قصيرة مركزة', { variant: 'columns', title: 'أسئلة سريعة', items: [{ q: 'التوصيل؟', a: '2-5 أيام.' }, { q: 'الدفع؟', a: 'عند الاستلام.' }, { q: 'الاسترجاع؟', a: 'خلال 14 يوم.' }, { q: 'الشحن المجاني؟', a: 'حسب عروض المتجر.' }] }],
  ],
  features: [
    ['ثقة أساسية (كروت)', 'شحن ودفع وإرجاع', { variant: 'cards', title: 'ليه تشتري منا؟', items: [{ title: 'شحن سريع', text: 'توصيل لكل المحافظات في أيام قليلة' }, { title: 'دفع عند الاستلام', text: 'ادفع بعد ما تستلم وتعاين' }, { title: 'إرجاع سهل', text: 'استرجاع خلال 14 يوم بدون تعقيد' }] }],
    ['أربعة في صف', 'شبكة أربعة مميزات', { variant: 'grid4', title: 'مميزاتنا', items: [{ title: 'جودة مضمونة', text: 'خامات مختارة بعناية' }, { title: 'أسعار منافسة', text: 'أفضل قيمة مقابل السعر' }, { title: 'دعم سريع', text: 'رد خلال ساعات على واتساب' }, { title: 'تغليف آمن', text: 'تغليف يحافظ على المنتج' }] }],
    ['صف أفقي متحرك', 'شريط مميزات قابل للتمرير', { variant: 'row', title: '', items: [{ title: 'توصيل سريع', text: 'لكل المحافظات' }, { title: 'دفع آمن', text: 'عند الاستلام' }, { title: 'منتجات أصلية', text: 'جودة مضمونة' }, { title: 'إرجاع مجاني', text: 'خلال 14 يوم' }, { title: 'عروض مستمرة', text: 'خصومات أسبوعية' }] }],
    ['عمودان واسعان', 'مميزات كبيرة بعمودين', { variant: 'grid2', title: 'وعدنا ليك', items: [{ title: 'منتج يستاهل فلوسك', text: 'نختار كل قطعة بمعايير جودة صارمة قبل عرضها' }, { title: 'تجربة شراء بسيطة', text: 'اطلب في دقيقة واحدة بدون تسجيل أو تعقيد' }] }],
    ['ضمانات البائع', 'تركيز على الضمان', { variant: 'cards', title: 'ضماناتنا', items: [{ title: 'ضمان استبدال', text: 'عيوب الصناعة نستبدلها فوراً' }, { title: 'معاينة عند الاستلام', text: 'عاين طلبك قبل الدفع حسب شركة الشحن' }, { title: 'خصوصية بياناتك', text: 'بياناتك تُستخدم للتوصيل فقط' }] }],
    ['خدمة العملاء', 'دعم وتواصل', { variant: 'grid2', title: 'خدمة العملاء', items: [{ title: 'واتساب مباشر', text: 'كلمنا في أي وقت وسنرد بأسرع ما يمكن' }, { title: 'متابعة بعد البيع', text: 'نتأكد أن طلبك وصلك سليماً وأنت راضٍ' }] }],
    ['بدون عنوان', 'شريط مميزات نظيف', { variant: 'row', title: '', items: [{ title: 'شحن سريع', text: '' }, { title: 'دفع عند الاستلام', text: '' }, { title: 'إرجاع سهل', text: '' }] }],
    ['تصميم كروت كبير', 'ثلاثة كروت بارزة', { variant: 'cards', title: 'تسوق براحتك', items: [{ title: 'اختر براحتك', text: 'تصفح الكتالوج كاملاً بدون ضغط' }, { title: 'اطلب في دقيقة', text: 'نموذج واحد وطلبك في الطريق' }, { title: 'استلم وعاين', text: 'ادفع بعد الاستلام والمعاينة' }] }],
  ],
  reviews: [
    ['كروت آراء', 'تقييمات بخلفية كروت', { variant: 'cards', title: 'آراء عملائنا', limit: 6 }],
    ['قائمة مضغوطة', 'آراء مدمجة بدون كروت', { variant: 'compact', title: 'ماذا قالوا عنا', limit: 8 }],
    ['ثلاثة فقط', 'أحدث 3 تقييمات', { variant: 'cards', title: 'آخر التقييمات', limit: 3 }],
    ['بدون عنوان', 'آراء مباشرة', { variant: 'compact', title: '', limit: 5 }],
  ],
  categories: [
    ['حبوب (افتراضي)', 'أزرار دائرية', { variant: 'pills', title: '' }],
    ['شبكة كروت', 'مربعات كبيرة', { variant: 'grid', title: 'تصفح الأقسام' }],
    ['شبكة بعنوان', 'كروت مع عنوان', { variant: 'grid', title: 'تسوق حسب القسم' }],
  ],
  marquee: [
    ['شريط ثقة داكن', 'عبارات ثقة أساسية', { items: ['شحن سريع لكل المحافظات', 'الدفع عند الاستلام', 'إرجاع سهل خلال 14 يوم'], speed: 22, bg: '#141924', color: '#ffffff' }],
    ['عرض ترويجي ملون', 'خلفية مميزة لعرض', { items: ['خصم 20% لفترة محدودة', 'اطلب الآن قبل انتهاء العرض'], speed: 18, bg: '#27cd27', color: '#0b111d' }],
    ['شحن مجاني', 'إعلان الشحن المجاني', { items: ['شحن مجاني للطلبات الكبيرة', 'توصيل سريع'], speed: 25, bg: '#F3E8FF', color: '#141924' }],
    ['منتجات جديدة', 'إعلان وصولات', { items: ['وصل حديثاً: تشكيلة جديدة', 'تسوق أحدث المنتجات الآن'], speed: 20, bg: '#111111', color: '#C8F31D' }],
    ['بطيء وهادئ', 'إيقاع هادئ', { items: ['جودة تستحقها', 'خدمة عملاء على مدار الساعة'], speed: 35, bg: '#F6F8FC', color: '#141924' }],
    ['سريع عاجل', 'إيقاع سريع للعروض', { items: ['العرض ينتهي قريباً', 'اطلب الآن'], speed: 12, bg: '#E63946', color: '#ffffff' }],
  ],
  blog: [
    ['شبكة مقالات', 'أحدث 3 مقالات', { variant: 'grid', title: 'من المدونة', limit: 3 }],
    ['قائمة', 'مقالات بشكل قائمة', { variant: 'list', title: 'آخر المقالات', limit: 4 }],
    ['بدون عنوان', 'شبكة نظيفة', { variant: 'grid', title: '', limit: 3 }],
  ],
};
// theme settings drawer groups: [group, [[key, label, kind, default]]]
const B_THEME_GROUPS = [
  ['شريط الإعلانات', [
    ['hide_announcement', 'إخفاء شريط الإعلانات', 'check', false],
    ['announcement', 'نص الشريط', 'store_text', ''],
    ['announce_bg', 'لون خلفية الشريط', 'color', '#27cd27'],
    ['announce_color', 'لون نص الشريط', 'color', '#ffffff'],
  ]],
  ['ألوان القالب', [
    ['primary', 'اللون الأساسي (الأزرار والعناوين)', 'color', '#141924'],
    ['accent', 'اللون المميّز', 'color', '#27cd27'],
    ['bg', 'لون الخلفية', 'color', '#ffffff'],
    ['surface', 'لون الأسطح والكروت', 'color', '#F6F8FC'],
    ['radius', 'استدارة الحواف (بكسل)', 'number', 16],
  ]],
  ['الهيدر', [
    ['header', 'نمط الهيدر', 'select', [['', 'افتراضي'], ['split', 'مقسوم']]],
  ]],
  ['الفوتر', [
    ['footer_text', 'نص مخصص أعلى الفوتر (اختياري)', 'text', ''],
  ]],
];
let B_PAGE = 'home', B_DATA = null, B_SEL = null, B_PHONE = false, B_DRAWER = null;

const B2_CSS = `
*{box-sizing:border-box}
.store{font-family:"Inter","IBM Plex Sans Arabic",ui-sans-serif,system-ui,sans-serif;background:var(--sbg);color:var(--sp);min-height:300px;-webkit-font-smoothing:antialiased}
.store.dark{color:#EDF1F7}
img{max-width:100%}
.b2-fixed{position:relative}
.b2-fixed-tag{position:absolute;top:6px;inset-inline-start:6px;z-index:80;background:#141924d9;color:#fff;font-size:11px;padding:3px 12px;border-radius:999px;pointer-events:none}
.b2-sec{position:relative;cursor:pointer;outline:2px dashed transparent;outline-offset:-2px;transition:outline-color .12s}
.b2-sec:hover{outline-color:#27cd2788}
.b2-sec.sel{outline:2px solid #27cd27}
.b2-sec.off .b2-sec-body{opacity:.35;filter:grayscale(.5)}
.b2-tag{position:absolute;top:8px;inset-inline-end:8px;z-index:80;display:none;gap:8px;align-items:center;background:#141924;color:#fff;font-size:12px;padding:4px 8px 4px 14px;border-radius:999px;box-shadow:0 6px 18px #0005}
.b2-sec:hover .b2-tag,.b2-sec.sel .b2-tag{display:flex}
.b2-tag b{font-weight:600;padding-inline-start:6px}
.b2-tag button{background:#ffffff22;border:0;color:#fff;font-size:11px;padding:3px 10px;border-radius:999px;cursor:pointer;font-family:inherit}
.b2-tag button:hover{background:#ffffff44}
.b2-zone{position:relative}
.b2-zone.dragover{outline:2px dashed #27cd27;outline-offset:-2px;background:#27cd270d}
.b2-dropzone{margin:8px;border:1.5px dashed #c3ccd9;border-radius:12px;color:#8a93a6;font-size:12px;text-align:center;padding:9px}
.b2-zone.dragover .b2-dropzone{border-color:#27cd27;color:#1e9b1e;font-weight:600}
.b2-emptysec{padding:26px;text-align:center;color:#8a93a6;font-size:13px;border:1.5px dashed #c3ccd9;border-radius:12px;margin:8px}
`;

registerView('builder', async () => {
  B_PAGE = new URLSearchParams((location.hash.split('?')[1] || '')).get('page') || 'home';
  B_SEL = null; B_DRAWER = null;
  setTimeout(() => bLoad(), 0);
  return `
  <div class="b2">
    <div class="b2-top">
      <button class="b2-tbtn" onclick="go('customize')" title="رجوع للوحة التحكم">${I('arrowR') || '←'} رجوع</button>
      <b class="b2-title">تعديل ${esc((B_PAGES.find(p => p[0] === B_PAGE) || [])[1] || '')}</b>
      <select id="b2Page" class="b2-sel" onchange="B_SEL=null;go('builder?page='+this.value)">${B_PAGES.map(p => `<option value="${p[0]}" ${p[0] === B_PAGE ? 'selected' : ''}>${p[1]}</option>`).join('')}</select>
      <span class="b2-saved" id="b2Saved">يتم الحفظ تلقائياً</span>
      <span class="b2-spacer"></span>
      <button class="b2-tbtn ${B_PHONE ? '' : 'on'}" id="b2DevD" onclick="bDevice(false)" title="عرض كمبيوتر">${I('monitor') || 'سطح المكتب'}</button>
      <button class="b2-tbtn ${B_PHONE ? 'on' : ''}" id="b2DevP" onclick="bDevice(true)" title="عرض موبايل">${I('phone') || 'موبايل'}</button>
      <a class="b2-tbtn" href="/s/${STORE.slug}" target="_blank">${I('eye')} معاينة</a>
      <button class="b2-tbtn primary" onclick="bThemeDrawer()">${I('customize')} إعدادات الثيم</button>
    </div>
    <div class="b2-main">
      <aside class="b2-palette">
        <h3>المكونات</h3>
        <p class="b2-pal-hint">اسحب أي مكون إلى مكانه في الصفحة</p>
        ${B_TYPES.map(([g, items]) => `<details class="b2-group" ${g === 'نص' ? 'open' : ''}><summary>${esc(g)}</summary>${items.map(([tp, nm]) => `<div class="b2-item" draggable="true" ondragstart="bDragType(event,'${tp}')"><span>${esc(nm)}</span><span class="b2-item-acts">${B_PRESETS[tp] ? `<button class="b2-add" title="قوالب جاهزة" onclick="bPresets('${tp}')">☰</button>` : ''}<button class="b2-add" title="إضافة في محتوى الصفحة" onclick="bAdd('${tp}')">+</button></span></div>`).join('')}</details>`).join('')}
      </aside>
      <div class="b2-canvas-wrap" id="b2Wrap"><div id="b2Host"></div></div>
      <aside class="b2-drawer" id="b2Drawer"><div class="b2-drawer-empty">اختر قسماً من الصفحة لتعديله<br>أو افتح إعدادات الثيم</div></aside>
    </div>
  </div>`;
});

function bDevice(phone) {
  B_PHONE = phone;
  document.getElementById('b2Wrap').classList.toggle('phone', phone);
  document.getElementById('b2DevD').classList.toggle('on', !phone);
  document.getElementById('b2DevP').classList.toggle('on', phone);
}

async function bLoad(keepSel) {
  B_DATA = await api('/api/builder/render?page=' + B_PAGE);
  if (!keepSel) B_SEL = null;
  bRenderCanvas();
  const sv = document.getElementById('b2Saved');
  if (sv) { sv.textContent = 'تم الحفظ'; setTimeout(() => { const s2 = document.getElementById('b2Saved'); if (s2) s2.textContent = 'يتم الحفظ تلقائياً'; }, 1500); }
}

function bRenderCanvas() {
  const host = document.getElementById('b2Host'); if (!host || !B_DATA) return;
  if (!host.shadowRoot) host.attachShadow({ mode: 'open' });
  const sh = host.shadowRoot;
  const D = B_DATA;
  const zoneHtml = z => `<div class="b2-zone" data-zone="${z}" ondragover="bZoneOver(event)" ondragleave="bZoneLeave(event)" ondrop="bZoneDrop(event,'${z}')">
    ${(D.zones[z] || []).map(s => `<div class="b2-sec ${s.enabled ? '' : 'off'} ${B_SEL === s.id ? 'sel' : ''}" draggable="true" data-id="${s.id}" ondragstart="bDragSec(event,${s.id},'${z}')" onclick="bSecClick(${s.id})">
      <div class="b2-tag"><b>${esc(s.name)}</b>
        <button onclick="event.stopPropagation();bSecEdit(${s.id})">تعديل</button>
        <button onclick="event.stopPropagation();bToggle(${s.id},${s.enabled ? 0 : 1})">${s.enabled ? 'اخفاء' : 'اظهار'}</button>
        <button onclick="event.stopPropagation();bDel(${s.id})">حذف</button>
      </div>
      <div class="b2-sec-body">${s.html || '<div class="b2-emptysec">قسم بدون محتوى — اضغط تعديل لإضافة المحتوى</div>'}</div>
    </div>`).join('')}
    <div class="b2-dropzone">اسحب مكوناً هنا (${esc((B_ZONES.find(x => x[0] === z) || [])[1] || z)})</div>
  </div>`;
  sh.innerHTML = `<link rel="stylesheet" href="/public/css/store.css"><style>${B2_CSS}</style>
  <div class="store ${D.dark ? 'dark' : ''} t-${esc(D.themeId || '')}" style="${D.vars}">
    ${zoneHtml('above_header')}
    <div class="b2-fixed"><span class="b2-fixed-tag">الهيدر — ثابت من إعدادات الثيم</span>${D.header}</div>
    ${zoneHtml('below_header')}
    ${D.fixed ? `<div class="b2-fixed"><span class="b2-fixed-tag">${esc(D.fixedLabel)}</span>${D.fixed}</div>` : ''}
    ${zoneHtml('content')}
    ${zoneHtml('above_footer')}
    <div class="b2-fixed"><span class="b2-fixed-tag">الفوتر — ثابت من إعدادات الثيم</span>${D.footer}</div>
    ${zoneHtml('below_footer')}
  </div>`;
  // block storefront link navigation + button submits inside the canvas; selection stays manual
  sh.addEventListener('click', e => {
    const inTag = e.target.closest && e.target.closest('.b2-tag');
    if (!inTag) { e.preventDefault(); }
  }, true);
}

// ---------- selection + drawer ----------
function bSecClick(id) {
  B_SEL = id;
  const sh = document.getElementById('b2Host').shadowRoot;
  sh.querySelectorAll('.b2-sec').forEach(el => el.classList.toggle('sel', +el.dataset.id === id));
  bSecEdit(id);
}

function bFindSec(id) {
  if (!B_DATA) return null;
  for (const z of Object.keys(B_DATA.zones)) { const s = (B_DATA.zones[z] || []).find(x => x.id === id); if (s) return { ...s, zone: z }; }
  return null;
}

function bFieldHtml(type, stg) {
  const fields = B_FIELDS[type] || [];
  if (!fields.length) return '<p class="b2-muted">هذا القسم لا يحتوي اعدادات.</p>';
  return fields.map(([k, label, kind]) => {
    const v = stg[k];
    if (kind === 'json') return `<label class="b2-label">${label}</label><textarea id="bs-${k}" class="b2-input" rows="5" dir="ltr">${esc(v ? JSON.stringify(v) : '')}</textarea>`;
    if (kind === 'textarea') return `<label class="b2-label">${label}</label><textarea id="bs-${k}" class="b2-input" rows="4">${esc(v || '')}</textarea>`;
    if (kind === 'color') return `<label class="b2-label">${label}</label><input id="bs-${k}" type="color" class="b2-color" value="${esc(v || '#27cd27')}">`;
    if (kind === 'number') return `<label class="b2-label">${label}</label><input id="bs-${k}" type="number" class="b2-input" value="${esc(String(v ?? ''))}">`;
    return `<label class="b2-label">${label}</label><input id="bs-${k}" class="b2-input" value="${esc(v || '')}">`;
  }).join('');
}

function bSecEdit(id) {
  const s = bFindSec(id); if (!s) return;
  B_SEL = id; B_DRAWER = 'section';
  let stg = {};
  try {
    const row = (window._B_SECS_RAW || {})[id];
    stg = row ? JSON.parse(row.settings || '{}') : {};
  } catch (e) {}
  const dr = document.getElementById('b2Drawer');
  dr.innerHTML = `
    <div class="b2-drawer-h"><b>تعديل: ${esc(s.name)}</b><button class="b2-x" onclick="bCloseDrawer()">✕</button></div>
    ${bFieldHtml(s.type, stg)}
    <button class="b2-save" onclick="bSaveSec(${id}, '${s.type}')">حفظ التعديلات</button>`;
  // fetch raw settings (canvas data has no settings payload)
  api('/api/sections?page=' + B_PAGE).then(r => {
    const raw = (r.sections || []).find(x => x.id === id);
    if (!raw || B_SEL !== id) return;
    let st2 = {}; try { st2 = JSON.parse(raw.settings || '{}'); } catch (e) {}
    const cur = B_FIELDS[s.type] || [];
    for (const [k, , kind] of cur) {
      const el = document.getElementById('bs-' + k); if (!el) continue;
      const v = st2[k];
      if (kind === 'json') el.value = v ? JSON.stringify(v) : '';
      else if (kind !== 'color' || v) el.value = v ?? el.value;
    }
  });
}

async function bSaveSec(id, type) {
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
  bLoad(true);
}

function bCloseDrawer() {
  B_DRAWER = null; B_SEL = null;
  document.getElementById('b2Drawer').innerHTML = '<div class="b2-drawer-empty">اختر قسماً من الصفحة لتعديله<br>أو افتح إعدادات الثيم</div>';
  const sh = document.getElementById('b2Host').shadowRoot;
  if (sh) sh.querySelectorAll('.b2-sec.sel').forEach(el => el.classList.remove('sel'));
}

// ---------- theme settings drawer ----------
function bThemeDrawer() {
  B_DRAWER = 'theme'; B_SEL = null;
  const eff = (B_DATA && B_DATA.theme) || {};
  const dr = document.getElementById('b2Drawer');
  dr.innerHTML = `
    <div class="b2-drawer-h"><b>إعدادات الثيم</b><button class="b2-x" onclick="bCloseDrawer()">✕</button></div>
    ${B_THEME_GROUPS.map(([g, fields]) => `<details class="b2-tgroup" open><summary>${esc(g)}</summary>${fields.map(([k, label, kind, def]) => {
      const cur = k in eff ? eff[k] : def;
      if (kind === 'check') return `<label class="b2-check"><input type="checkbox" id="bt-${k}" ${cur ? 'checked' : ''}> ${label}</label>`;
      if (kind === 'store_text') return `<label class="b2-label">${label}</label><input id="bt-${k}" class="b2-input" value="${esc((B_DATA && B_DATA.announcement) || '')}">`;
      if (kind === 'select') return `<label class="b2-label">${label}</label><select id="bt-${k}" class="b2-input">${def.map(([v, l]) => `<option value="${v}" ${String(cur || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
      if (kind === 'color') return `<label class="b2-label">${label}</label><input id="bt-${k}" type="color" class="b2-color" value="${esc(cur || def)}">`;
      if (kind === 'number') return `<label class="b2-label">${label}</label><input id="bt-${k}" type="number" class="b2-input" value="${esc(String(cur ?? def))}">`;
      return `<label class="b2-label">${label}</label><input id="bt-${k}" class="b2-input" value="${esc(cur || '')}">`;
    }).join('')}</details>`).join('')}
    ${(B_DATA && B_DATA.theme_schema && B_DATA.theme_schema.length) ? `<details class="b2-tgroup" open><summary>بيانات الثيم</summary>${B_DATA.theme_schema.map(f => {
      const cur = (B_DATA.theme && f.key in B_DATA.theme) ? B_DATA.theme[f.key] : '';
      if (f.kind === 'check') return `<label class="b2-check"><input type="checkbox" id="bt-s_${esc(f.key)}" ${cur ? 'checked' : ''}> ${esc(f.label)}</label>`;
      if (f.kind === 'color') return `<label class="b2-label">${esc(f.label)}</label><input id="bt-s_${esc(f.key)}" type="color" class="b2-color" value="${esc(cur || '#141924')}">`;
      if (f.kind === 'number') return `<label class="b2-label">${esc(f.label)}</label><input id="bt-s_${esc(f.key)}" type="number" class="b2-input" value="${esc(String(cur ?? ''))}">`;
      return `<label class="b2-label">${esc(f.label)}</label><input id="bt-s_${esc(f.key)}" class="b2-input" value="${esc(cur || '')}">`;
    }).join('')}</details>` : ''}
    <button class="b2-save" onclick="bSaveTheme()">حفظ إعدادات الثيم</button>`;
}

async function bSaveTheme() {
  let ts = {}; try { ts = typeof STORE.theme_settings === 'string' ? JSON.parse(STORE.theme_settings || '{}') : JSON.parse(JSON.stringify(STORE.theme_settings || {})); } catch (e) { ts = {}; }
  let announcement = STORE.announcement || '';
  for (const [, fields] of B_THEME_GROUPS) {
    for (const [k, , kind] of fields) {
      const el = document.getElementById('bt-' + k); if (!el) continue;
      if (kind === 'store_text') { announcement = el.value; continue; }
      if (kind === 'check') { if (el.checked) ts[k] = true; else delete ts[k]; continue; }
      if (kind === 'number') { ts[k] = +el.value; continue; }
      if (el.value) ts[k] = el.value; else delete ts[k];
    }
  }
  if (B_DATA && B_DATA.theme_schema) for (const f of B_DATA.theme_schema) {
    const el = document.getElementById('bt-s_' + f.key); if (!el) continue;
    if (f.kind === 'check') { if (el.checked) ts[f.key] = true; else delete ts[f.key]; }
    else if (f.kind === 'number') { if (el.value !== '') ts[f.key] = +el.value; else delete ts[f.key]; }
    else { if (el.value) ts[f.key] = el.value; else delete ts[f.key]; }
  }
  const r = await api('/api/store', { method: 'PUT', body: { theme_settings: ts, announcement } });
  if (r && r.store) { STORE.theme_settings = r.store.theme_settings; STORE.announcement = r.store.announcement; }
  bLoad(true);
}

// ---------- palette + drag & drop ----------
async function bAdd(type) {
  await api('/api/sections', { method: 'POST', body: { page: B_PAGE, zone: 'content', type, settings: {} } });
  bLoad();
}
function bDragType(e, type) { e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'type', type })); e.dataTransfer.effectAllowed = 'copy'; }
function bDragSec(e, id, zone) { e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'sec', id, zone })); e.dataTransfer.effectAllowed = 'move'; }
function bZoneOver(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); e.dataTransfer.dropEffect = 'move'; }
function bZoneLeave(e) { e.currentTarget.classList.remove('dragover'); }

function bDropIndex(zoneEl, clientY) {
  const secs = [...zoneEl.querySelectorAll('.b2-sec')];
  for (let i = 0; i < secs.length; i++) {
    const r = secs[i].getBoundingClientRect();
    if (clientY < r.top + r.height / 2) return i;
  }
  return secs.length;
}

async function bZoneDrop(e, zone) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  let d; try { d = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (err) { return; }
  if (!d || !d.kind) return;
  const idx = bDropIndex(e.currentTarget, e.clientY);
  const idsOf = z => (B_DATA.zones[z] || []).map(s => s.id);
  if (d.kind === 'type') {
    const r = await api('/api/sections', { method: 'POST', body: { page: B_PAGE, zone, type: d.type, settings: {} } });
    const newId = r && r.section && r.section.id;
    if (newId) {
      const ids = idsOf(zone).filter(x => x !== newId);
      ids.splice(idx, 0, newId);
      await api('/api/sections/reorder', { method: 'POST', body: { page: B_PAGE, zone, ids } });
    }
  } else if (d.kind === 'sec') {
    const src = d.zone;
    let tgt = idsOf(zone).filter(x => x !== d.id);
    tgt.splice(idx, 0, d.id);
    await api('/api/sections/reorder', { method: 'POST', body: { page: B_PAGE, zone, ids: tgt } });
    if (src !== zone) {
      await api('/api/sections/reorder', { method: 'POST', body: { page: B_PAGE, zone: src, ids: idsOf(src).filter(x => x !== d.id) } });
    }
  }
  bLoad(true);
}

async function bToggle(id, on) { await api(`/api/sections/${id}`, { method: 'PUT', body: { enabled: !!on } }); bLoad(true); }
async function bDel(id) { if (!confirm('حذف هذا القسم؟')) return; await api(`/api/sections/${id}`, { method: 'DELETE' }); if (B_SEL === id) bCloseDrawer(); bLoad(); }


// ---------- variant library preset chooser ----------
function bPresets(type) {
  B_DRAWER = 'presets';
  const presets = B_PRESETS[type] || [];
  const dr = document.getElementById('b2Drawer');
  dr.innerHTML = `
    <div class="b2-drawer-h"><b>قوالب: ${esc(B_TYPE_NAMES[type] || type)}</b><button class="b2-x" onclick="bCloseDrawer()">✕</button></div>
    <p class="b2-muted" style="margin-bottom:10px">اختر قالباً جاهزاً لإضافته — يمكنك تعديله بعد الإضافة</p>
    ${presets.map((p, i) => `<button class="b2-preset" onclick="bUsePreset('${type}', ${i})"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></button>`).join('')}`;
}

async function bUsePreset(type, idx) {
  const p = (B_PRESETS[type] || [])[idx]; if (!p) return;
  await api('/api/sections', { method: 'POST', body: { page: B_PAGE, zone: 'content', type, settings: p[2] } });
  bCloseDrawer();
  bLoad();
}
