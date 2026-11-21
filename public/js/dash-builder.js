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
  faq: (() => {
    const topics = [
      ['الشحن والتوصيل', [['كم تستغرق مدة التوصيل؟', 'من 2 لـ 5 أيام عمل حسب المحافظة.'], ['هل يوجد شحن لكل المحافظات؟', 'نعم، نوصل لجميع محافظات مصر.'], ['ما تكلفة الشحن؟', 'تظهر تكلفة الشحن عند إتمام الطلب حسب المحافظة.'], ['هل يمكن تتبع الشحنة؟', 'نوافيك بحالة الطلب أولاً بأول حتى الاستلام.']]],
      ['الدفع والاسترجاع', [['هل الدفع عند الاستلام متاح؟', 'نعم، ادفع كاش أو بالمحفظة عند الاستلام.'], ['ما سياسة الاسترجاع؟', 'يمكنك الاسترجاع خلال 14 يوم بحالة المنتج الأصلية.'], ['متى يصلني المبلغ المسترد؟', 'خلال 7 أيام عمل من استلام المرتجع.'], ['هل يوجد دفع إلكتروني؟', 'تتوفر وسائل دفع متعددة حسب المتجر.']]],
      ['المنتجات والمقاسات', [['هل المنتجات أصلية؟', 'جميع منتجاتنا أصلية 100%.'], ['كيف أختار المقاس؟', 'راجع جدول المقاسات في صفحة المنتج.'], ['هل الألوان مطابقة للصور؟', 'قد يختلف اللون قليلاً حسب إضاءة الشاشة.'], ['هل يوجد ضمان؟', 'نعم، ضمان استبدال ضد عيوب الصناعة.']]],
      ['الطلب والتتبع', [['كيف أتابع طلبي؟', 'نتواصل معك هاتفياً لتأكيد الطلب وموعد التسليم.'], ['هل يمكن تعديل الطلب؟', 'نعم قبل خروجه للشحن، تواصل معنا فوراً.'], ['كيف ألغي الطلب؟', 'تواصل معنا قبل الشحن وسنلغيه بدون رسوم.']]],
      ['الحساب والخصوصية', [['هل أحتاج حساباً للطلب؟', 'لا، الطلب مباشر بدون تسجيل.'], ['كيف تُستخدم بياناتي؟', 'بياناتك تُستخدم لتوصيل الطلب والتواصل فقط.'], ['هل معلوماتي آمنة؟', 'نعم، نلتزم بسرية بيانات عملائنا بالكامل.']]],
      ['العروض والخصومات', [['كيف أعرف عن العروض الجديدة؟', 'تابع صفحة المتجر وقسم العروض باستمرار.'], ['هل يوجد خصم على الكميات؟', 'تتوفر خصومات خاصة على الطلبات الكبيرة.'], ['هل يمكن استخدام أكثر من كوبون؟', 'يُستخدم كوبون واحد لكل طلب.']]],
      ['الضمان والجودة', [['ما مدة الضمان؟', 'ضمان استبدال ضد عيوب الصناعة حسب نوع المنتج.'], ['كيف أطلب الضمان؟', 'تواصل معنا بصورة العيب ورقم الطلب.'], ['هل الفحص متاح عند الاستلام؟', 'عاين طلبك قبل الدفع حسب شركة الشحن.']]],
    ];
    const styles = [['simple', 'بسيط'], ['boxed', 'صناديق'], ['columns', 'عمودان'], ['numbered', 'مرقّم']];
    const out = [];
    for (const [v, vl] of styles) for (const [t, items] of topics) out.push([t + ' (' + vl + ')', 'شكل ' + vl + ' عن ' + t, { variant: v, title: 'أسئلة عن ' + t, items }]);
    for (const [t, items] of topics) out.push([t + ' (مختصر)', 'إجابات قصيرة عن ' + t, { variant: 'simple', title: t, items: items.slice(0, 3).map(([q, a]) => ({ q, a: a.split('،')[0].split('.')[0] + '.' })) }]);
    return out;
  })(),
  features: (() => {
    const topics = [
      ['لماذا تختارنا', [['شحن سريع', 'توصيل لكل المحافظات في أيام قليلة'], ['دفع عند الاستلام', 'ادفع بعد ما تستلم وتعاين'], ['إرجاع سهل', 'استرجاع خلال 14 يوم بدون تعقيد']]],
      ['جودة مضمونة', [['خامات مختارة', 'نختار كل قطعة بمعايير صارمة'], ['فحص قبل الشحن', 'كل طلب يُراجع قبل التسليم'], ['منتجات أصلية', 'مصادر موثوقة فقط'], ['رضا العملاء', 'تقييمات حقيقية من مشترين']]],
      ['تجربة شراء سهلة', [['اطلب في دقيقة', 'نموذج واحد بدون تسجيل'], ['بدون حساب', 'تسوق مباشرة بدون تعقيد'], ['تأكيد فوري', 'نتصل بك لتأكيد طلبك']]],
      ['دعم متواصل', [['رد سريع', 'نجيب على استفساراتك بسرعة'], ['متابعة بعد البيع', 'نتأكد من رضاك عن طلبك'], ['قنوات متعددة', 'تواصل بالطريقة الأنسب لك']]],
      ['أسعار عادلة', [['قيمة مقابل السعر', 'جودة عالية بسعر مناسب'], ['عروض أسبوعية', 'خصومات متجددة باستمرار'], ['بدون رسوم خفية', 'السعر المعلن هو النهائي']]],
      ['شحن وتغليف', [['تغليف آمن', 'يحافظ على منتجك حتى باب البيت'], ['تغطية واسعة', 'نوصل لكل المحافظات'], ['مواعيد دقيقة', 'نلتزم بموعد التسليم']]],
      ['الضمانات', [['ضمان استبدال', 'عيوب الصناعة نستبدلها فوراً'], ['معاينة عند الاستلام', 'عاين قبل الدفع حسب شركة الشحن'], ['خصوصية بياناتك', 'بياناتك للتوصيل فقط']]],
      ['ثقة العملاء', [['آلاف الطلبات', 'عملاء يثقون بنا كل يوم'], ['تقييمات حقيقية', 'آراء موثقة من مشترين'], ['سجل معتمد', 'متجر يعمل بانتظام منذ سنوات']]],
      ['خدمة ما بعد البيع', [['استبدال مرن', 'غيّر رأيك خلال فترة الاسترجاع'], ['دعم فني', 'مساعدة في استخدام المنتج'], ['قطع وأحجام', 'نوفر البدائل عند توفرها']]],
    ];
    const styles = [['cards', 'كروت'], ['grid4', 'شبكة أربعة'], ['row', 'شريط'], ['grid2', 'عمودان واسعان'], ['strip', 'شريط مقسم']];
    const out = [];
    for (const [v, vl] of styles) for (const [t, items] of topics) out.push([t + ' (' + vl + ')', 'تصميم ' + vl + ' لموضوع ' + t, { variant: v, title: t, items: items.map(([title, text]) => ({ title, text })) }]);
    return out;
  })(),
  reviews: (() => {
    const out = [];
    const cardsSets = [[6, 'آراء عملائنا'], [3, 'آخر التقييمات'], [4, 'ماذا قالوا عنا'], [8, 'تقييمات موثقة'], [2, 'أبرز الآراء'], [5, 'تجارب المشترين']];
    const compactSets = [[8, 'ماذا قالوا عنا'], [5, ''], [10, 'كل التقييمات'], [4, 'آراء سريعة'], [6, 'من عملائنا']];
    for (const [limit, title] of cardsSets) out.push(['كروت آراء — ' + (title || 'بدون عنوان'), 'كروت تعرض ' + limit + ' تقييمات', { variant: 'cards', title, limit }]);
    for (const [limit, title] of compactSets) out.push(['قائمة مضغوطة — ' + (title || 'بدون عنوان'), 'قائمة تعرض ' + limit + ' تقييمات', { variant: 'compact', title, limit }]);
    return out;
  })(),
  categories: [
    ['حبوب (افتراضي)', 'أزرار دائرية', { variant: 'pills', title: '' }],
    ['حبوب بعنوان', 'أزرار مع عنوان', { variant: 'pills', title: 'تصفح الأقسام' }],
    ['حبوب تسوق', 'أزرار بعنوان تسويقي', { variant: 'pills', title: 'تسوق حسب القسم' }],
    ['حبوب الكل', 'أزرار مع عنوان الأقسام', { variant: 'pills', title: 'الأقسام' }],
    ['شبكة كروت', 'مربعات كبيرة', { variant: 'grid', title: 'تصفح الأقسام' }],
    ['شبكة بعنوان', 'كروت مع عنوان', { variant: 'grid', title: 'تسوق حسب القسم' }],
    ['شبكة بلا عنوان', 'كروت نظيفة', { variant: 'grid', title: '' }],
    ['شبكة أقسامنا', 'كروت بعنوان بسيط', { variant: 'grid', title: 'أقسامنا' }],
    ['كروت صور', 'بطاقات بصور مصغرة', { variant: 'cards', title: 'تصفح الأقسام' }],
    ['كروت صور بعنوان', 'بطاقات مصورة بعنوان', { variant: 'cards', title: 'تسوق حسب القسم' }],
    ['كروت صور نظيفة', 'بطاقات مصورة بلا عنوان', { variant: 'cards', title: '' }],
  ],
  marquee: [
    ['شريط ثقة داكن', 'عبارات ثقة أساسية', { items: ['شحن سريع لكل المحافظات', 'الدفع عند الاستلام', 'إرجاع سهل خلال 14 يوم'], speed: 22, bg: '#141924', color: '#ffffff' }],
    ['عرض ترويجي ملون', 'خلفية مميزة لعرض', { items: ['خصم 20% لفترة محدودة', 'اطلب الآن قبل انتهاء العرض'], speed: 18, bg: '#27cd27', color: '#0b111d' }],
    ['شحن مجاني', 'إعلان الشحن المجاني', { items: ['شحن مجاني للطلبات الكبيرة', 'توصيل سريع'], speed: 25, bg: '#F3E8FF', color: '#141924' }],
    ['منتجات جديدة', 'إعلان وصولات', { items: ['وصل حديثاً: تشكيلة جديدة', 'تسوق أحدث المنتجات الآن'], speed: 20, bg: '#111111', color: '#C8F31D' }],
    ['بطيء وهادئ', 'إيقاع هادئ', { items: ['جودة تستحقها', 'خدمة عملاء على مدار الساعة'], speed: 35, bg: '#F6F8FC', color: '#141924' }],
    ['سريع عاجل', 'إيقاع سريع للعروض', { items: ['العرض ينتهي قريباً', 'اطلب الآن'], speed: 12, bg: '#E63946', color: '#ffffff' }],
    ['أزرق ليلي', 'خلفية داكنة ناعمة', { items: ['تشكيلة الموسم وصلت', 'اكتشف الجديد أولاً'], speed: 24, bg: '#0B1B33', color: '#DCE7FF' }],
    ['بيج فاتح', 'خلفية فاتحة دافئة', { items: ['منتجات مختارة بعناية', 'توصيل لكل المحافظات'], speed: 28, bg: '#F5EFE6', color: '#3D3229' }],
    ['أخضر نعناعي', 'خلفية منعشة', { items: ['صحة وجودة في كل منتج', 'اطلب الآن'], speed: 26, bg: '#E8F8F0', color: '#0E4D3A' }],
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
  ['الهيدر', [
    ['header', 'نمط الهيدر', 'select', [['', 'افتراضي'], ['split', 'مقسوم']]],
    ['header_bg', 'لون خلفية الهيدر', 'color_opt'],
    ['header_color', 'لون نص الهيدر', 'color_opt'],
  ]],
  ['الفوتر', [
    ['footer_text', 'نص مخصص أعلى الفوتر (اختياري)', 'text', ''],
    ['footer_bg', 'لون خلفية الفوتر', 'color_opt'],
    ['footer_color', 'لون نص الفوتر', 'color_opt'],
  ]],
  ['ألوان القالب', [
    ['primary', 'اللون الأساسي (الأزرار والعناوين)', 'color', '#141924'],
    ['accent', 'اللون المميّز', 'color', '#27cd27'],
    ['bg', 'لون الخلفية', 'color', '#ffffff'],
    ['surface', 'لون الأسطح والكروت', 'color', '#F6F8FC'],
    ['radius', 'استدارة الحواف (بكسل)', 'number', 16],
    [null, 'ألوان المنتج', 'sep'],
    ['prod_name_color', 'لون اسم المنتج', 'color_opt'],
    ['price_color', 'لون السعر', 'color_opt'],
    ['sale_price_color', 'لون سعر التخفيض', 'color_opt'],
    [null, 'ألوان عامة', 'sep'],
    ['site_text_color', 'لون نص الموقع', 'color_opt'],
    [null, 'ألوان النماذج والدفع', 'sep'],
    ['input_border_color', 'لون حدود حقول الإدخال', 'color_opt'],
    ['input_bg_color', 'لون خلفية حقول الإدخال', 'color_opt'],
    ['input_text_color', 'لون نص حقول الإدخال', 'color_opt'],
    ['checkout_bg_color', 'لون خلفية نموذج إتمام الطلب', 'color_opt'],
    ['checkout_title_color', 'لون عنوان نموذج إتمام الطلب', 'color_opt'],
    [null, 'زر الشراء', 'sep'],
    ['buy_bg_color', 'لون خلفية زر الشراء', 'color_opt'],
    ['buy_text_color', 'لون نص زر الشراء', 'color_opt'],
    ['buy_border_color', 'لون حدود زر الشراء', 'color_opt'],
    [null, 'زر السلة', 'sep'],
    ['cart_bg_color', 'لون خلفية زر السلة', 'color_opt'],
    ['cart_text_color', 'لون نص زر السلة', 'color_opt'],
    ['cart_border_color', 'لون حدود زر السلة', 'color_opt'],
  ]],
  ['بيانات الثيم', [
    [null, 'المنتجات', 'sep'],
    ['hide_sale_badge', 'إخفاء شارة التخفيض على كروت المنتجات', 'check', false],
    ['sale_badge_bg_color', 'لون خلفية شارة التخفيض', 'color_opt'],
    ['sale_badge_text_color', 'لون نص شارة التخفيض', 'color_opt'],
    ['custom_badge_title', 'نص مخصص لشارة التخفيض (اختياري)', 'text', ''],
    ['card_background_product', 'لون خلفية كارت المنتج', 'color_opt'],
    ['card_background_product_color', 'لون نص كارت المنتج', 'color_opt'],
    ['cat_card_ratio', 'نسبة صورة كارت الفئة', 'select', [['', 'افتراضي'], ['1/1', '1/1'], ['3/4', '3/4'], ['4/5', '4/5']]],
    ['grid_card_ratio', 'نسبة صورة كارت شبكة المنتجات', 'select', [['', 'افتراضي'], ['1/1', '1/1'], ['3/4', '3/4'], ['4/5', '4/5']]],
    [null, 'النشرة البريدية', 'sep'],
    ['newsletter_title', 'عنوان النشرة البريدية (اتركه فارغاً للافتراضي)', 'text', ''],
    ['newsletter_desc', 'وصف النشرة البريدية', 'text', ''],
    ['newsletter_hide_mobile', 'إخفاء قسم النشرة على الموبايل فقط', 'check', false],
    [null, 'السلة', 'sep'],
    ['cart_suggest', 'إظهار منتجات مقترحة أسفل منتجات السلة', 'check', false],
    ['cart_suggest_title', 'عنوان المنتجات المقترحة في السلة', 'text', ''],
    [null, 'التخطيط', 'sep'],
    ['main_padding_top', 'الحشوة العلوية لمحتوى الصفحة (بكسل)', 'text', ''],
    ['cats_strip_bg', 'لون خلفية شريط الفئات', 'color_opt'],
    ['cats_strip_color', 'لون نص شريط الفئات', 'color_opt'],
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
      if (kind === 'color_opt') return `<label class="b2-check"><input type="checkbox" id="bt-on-${k}" ${cur ? 'checked' : ''}> ${label}</label><input id="bt-${k}" type="color" class="b2-color" value="${esc(cur || '#141924')}">`;
      if (kind === 'sep') return `<div class="b2-sep" style="font-weight:700;font-size:12px;color:#8a93a6;margin:10px 0 4px">${label}</div>`;
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
      if (kind === 'color_opt') { const on = document.getElementById('bt-on-' + k); if (on && on.checked) ts[k] = el.value; else delete ts[k]; continue; }
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
