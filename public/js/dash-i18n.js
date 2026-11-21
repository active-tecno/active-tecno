// ==================== F6 part 2: AR/EN dashboard language toggle ====================
// Client-side translation of dashboard chrome + navigation. Deep per-view body copy stays Arabic for now.
let LANG = localStorage.getItem('dLang') || 'ar';
const I18N_DICT = {
  // sidebar groups + items
  'الرئيسية': 'Home', 'لوحة الإحصائيات': 'Dashboard',
  'الطلبات': 'Orders', 'كل الطلبات': 'All orders', 'الطلبات المفقودة': 'Missed orders',
  'الأرقام المحظورة من الطلب': 'Blocked order numbers', 'الأرقام المحظورة OTP': 'Blocked OTP numbers',
  'المنتجات': 'Products', 'الاقسام': 'Categories', 'التقييمات': 'Reviews', 'اكتف كتالوج': 'Active Catalog',
  'تصميم المتجر': 'Store design',
  'ادوات التتبع': 'Tracking tools', 'اعدادات البيكسل': 'Pixel settings',
  'ادوات التسويق': 'Marketing tools', 'الكوبونات': 'Coupons', 'اعادة الاستهداف': 'Retargeting',
  'توثيق الطلبات': 'Order verification', 'انشاء رابط احالة': 'Create referral link', 'حد ادنى للطلب': 'Minimum order',
  'محفظتك': 'Your wallet', 'شحن المحفظة': 'Top up wallet', 'المعاملات': 'Transactions',
  'التطبيقات': 'Apps',
  'المدونات': 'Blogs', 'المقالات': 'Articles', 'اقسام المدونة': 'Blog categories',
  'خدمات مجتمع اكتف': 'Active community services', 'معرض الخدمات': 'Services gallery', 'خدمات التسويق': 'Marketing services',
  'نظام التسويق بالعمولة': 'Affiliate program', 'طلب تطويرات': 'Request development', 'الأعدادات': 'Settings',
  'جديد': 'New',
  // chrome
  'مرحبا': 'Hello', 'الاشعارات': 'Notifications', 'لا اشعارات جديدة': 'No new notifications',
  'الوضع الفاتح': 'Light mode', 'الوضع الداكن': 'Dark mode', 'تحديث': 'Refresh',
  'مشاهدة المتجر': 'View store', 'معاينة المتجر': 'Preview store', 'لوحة الإدارة': 'Admin panel', 'تسجيل الخروج': 'Log out',
  'اشترك في الباقة المميزة': 'Upgrade to the premium plan', 'ونمي متجرك!': 'and grow your store!', 'اشترك الآن': 'Subscribe now',
  'أسأل مساعد اكتف': 'Ask Active assistant', 'مساعد اكتف': 'Active assistant', 'يجيب من بيانات متجرك الفعلية': 'Answers from your real store data',
  'حدث خطأ': 'Something went wrong', 'حاول تحديث الصفحة': 'Try refreshing the page',
  // settings tree
  'إعدادات المتجر': 'Store settings', 'البيانات الأساسية وحماية الطلبات': 'Basic info and order protection',
  'الدومين': 'Domain', 'اربط نطاقك الخاص بمتجرك': 'Connect your own domain',
  'سياسات المتجر': 'Store policies', 'تظهر للعملاء في صفحة السياسات بمتجرك': 'Shown to customers on your store policies page',
  'إضافة كود للهيد': 'Custom head code', 'كود مخصص يُحقن في head متجرك': 'Custom code injected into your store head',
  'إعدادات SEO': 'SEO settings', 'تحكم في ظهور متجرك في محركات البحث': 'Control how your store appears in search engines',
  'بوابات الدفع': 'Payment gateways', 'إعدادات الشحن': 'Shipping settings',
  'روابط التواصل الاجتماعي': 'Social links', 'تظهر في تذييل متجرك': 'Shown in your store footer',
  'إعدادات المديرين': 'Managers settings',
  'جلسات الدخول': 'Login sessions', 'الأجهزة المتصلة بحسابك': 'Devices connected to your account',
  'رقم الهاتف': 'Phone number', 'هاتف المتجر الظاهر للعملاء': 'Store phone shown to customers',
  'وصول برمجي لطلبات متجرك': 'Programmatic access to your store orders',
  // common buttons / labels
  'حدد أقصى عدد لعناصر الطلب الواحد — أي طلب يتجاوزه يُرفض تلقائياً برسالة للعميل. اتركه 0 لإيقاف الحماية.': 'Set a maximum number of items per order. Any order above it is rejected automatically with a message to the customer. Leave 0 to disable.',
  'حفظ': 'Save', 'حفظ الإعدادات': 'Save settings', 'حفظ السياسات': 'Save policies', 'حفظ الكود': 'Save code',
  'حفظ إعدادات SEO': 'Save SEO settings', 'حفظ الروابط': 'Save links', 'إلغاء': 'Cancel', 'حذف': 'Delete',
  'تعديل': 'Edit', 'إضافة': 'Add', 'معاينة صفحة السياسات': 'Preview policies page',
  'البيانات الأساسية': 'Basic info', 'حماية الطلبات الوهمية': 'Fake order protection',
  'ربط دومين خاص': 'Connect a custom domain', 'ربط النطاق': 'Connect domain',
  'كود الهيد': 'Head code', 'مفتاح API': 'API key', 'مثال الاستخدام': 'Usage example',
  'توليد مفتاح': 'Generate key', 'إعادة توليد': 'Regenerate', 'الجلسات النشطة': 'Active sessions',
  'إنهاء كل الجلسات الأخرى': 'End all other sessions', 'الجلسة الحالية': 'Current session',
  'اسم المتجر': 'Store name', 'رابط المتجر': 'Store URL', 'وصف المتجر': 'Store description',
  'هاتف المتجر': 'Store phone', 'رقم واتساب (بكود الدولة)': 'WhatsApp number (with country code)',
  'شروط الاستخدام': 'Terms of use', 'سياسة الخصوصية': 'Privacy policy',
  'سياسة الاستبدال والاسترجاع': 'Return & exchange policy', 'سياسة الشحن والتوصيل': 'Shipping & delivery policy',
  'عنوان الصفحة (Meta Title)': 'Page title (Meta Title)', 'وصف الصفحة (Meta Description)': 'Page description (Meta Description)',
  'الكلمات المفتاحية (افصل بينها بفاصلة)': 'Keywords (comma separated)',
  'فيسبوك': 'Facebook', 'انستجرام': 'Instagram', 'تيك توك': 'TikTok',
};
function applyI18n() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'en' ? 'ltr' : 'rtl';
  document.body.classList.toggle('en', LANG === 'en');
  if (LANG !== 'en') return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let n;
  while ((n = walker.nextNode())) {
    if (n.parentElement && n.parentElement.closest('script,style')) continue;
    const v = n.nodeValue.trim();
    if (v && I18N_DICT[v]) nodes.push(n);
  }
  for (const n of nodes) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), I18N_DICT[n.nodeValue.trim()]);
}
function setLang(l) { localStorage.setItem('dLang', l); location.reload(); }
// patch topbar with the toggle + wrap route so every render re-translates
(function () {
  const _topbarHtml = topbarHtml;
  topbarHtml = function () {
    return _topbarHtml().replace('<div class="tb-wrap">',
      `<button class="tb-btn d-lang" onclick="setLang('${LANG === 'en' ? 'ar' : 'en'}')" title="English / عربي">${LANG === 'en' ? 'عربي' : 'EN'}</button><div class="tb-wrap">`);
  };
  const _route = route;
  const wrapped = async function () { await _route(); applyI18n(); };
  window.removeEventListener('hashchange', _route);
  window.addEventListener('hashchange', wrapped);
  route = wrapped;
  const bar = document.querySelector('.d-topbar');
  if (bar) bar.outerHTML = topbarHtml();
  applyI18n();
})();
