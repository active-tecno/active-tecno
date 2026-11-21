// dash-home.js — EO-style لوحة الإحصائيات (dashboard home)
function assistantCard(d, products) {
  const tips = [];
  if (d.conversion < 3 && d.views > 50) tips.push(`معدل التحويل ${d.conversion}% أقل من المعتاد — جرّب كوبون ترحيبي أو قلّل خطوات صفحة الشراء.`);
  const low = products.filter(p => p.status === 'active' && p.stock > 0 && p.stock <= p.low_stock_threshold);
  if (low.length) tips.push(`مخزون منخفض: ${low.map(p => `«${esc(p.name)}» (${p.stock})`).join('، ')} — أعد التعبئة قبل نفاده.`);
  const out = products.filter(p => p.status === 'active' && p.stock <= 0);
  if (out.length) tips.push(`نفد من المخزون: ${out.map(p => `«${esc(p.name)}»`).join('، ')} — يظهر للعملاء كغير متاح.`);
  if (d.top[0]) tips.push(`«${esc(d.top[0].name)}» هو الأكثر مبيعاً (${d.top[0].qty} قطعة) — فعّل عليه Cross Sell لرفع متوسط الطلب.`);
  if (d.statusCounts.new > 2) tips.push(`لديك ${d.statusCounts.new} طلبات جديدة لم تُؤكد — راجعها الآن لتقليل الإلغاء.`);
  if (!tips.length) tips.push('كل شيء يسير بشكل ممتاز — شارك رابط متجرك لزيادة الزيارات.');
  return `<div class="card" style="background:linear-gradient(90deg,#141924,#232d42);color:#fff;margin-bottom:16px">
    <h3 style="color:#fff;display:flex;align-items:center;gap:8px"><span style="color:var(--green-400)">${I('spark')}</span> مساعد اكتف الذكي</h3>
    <div style="display:grid;gap:8px">${tips.map(t => `<div style="background:rgba(255,255,255,.07);border-radius:11px;padding:10px 14px;font-size:13.5px;line-height:1.8">${t}</div>`).join('')}</div></div>`;
}

async function viewHome() {
  const d = await api('/api/analytics?days=30');
  const prods = await api('/api/products');
  const hasProducts = prods.products.length > 0;
  const guideDismissed = localStorage.getItem('at_setup_dismissed') === '1';
  const ts = JSON.parse(STORE.theme_settings || '{}');
  const ss = await api('/api/store/settings').catch(() => ({ settings: {} }));
  const cats = await api('/api/categories').catch(() => ({ categories: [] }));
  const checklist = [
    { done: !!ts.logo_img, label: 'إضافة لوجو للمتجر', sub: 'اعدادات متجرك الخاصه', go: 'settings', ic: 'image', bg: '#F0FDF4', fg: '#16a34a' },
    { done: !!STORE.name, label: 'اضافة عنوان المتجر', sub: 'اعدادات متجرك الخاصه', go: 'settings', ic: 'pen', bg: '#EFF6FF', fg: '#2563eb' },
    { done: Object.keys(ts).length > 0, label: 'إضافة لون مخصص', sub: 'اعدادات متجرك الخاصه', go: 'customize', ic: 'customize', bg: '#F5F3FF', fg: '#7c3aed' },
    { done: !!(ss.settings && ss.settings.seo), label: 'إضافة بيانات SEO', sub: 'اعدادات متجرك الخاصه', go: 'settings/seo', ic: 'search', bg: '#FFF7ED', fg: '#c2410c' },
    { done: !!(ss.settings && ss.settings.custom_domain), label: 'إضافة دومين مخصص', sub: 'اعدادات متجرك الخاصه', go: 'settings/domain', ic: 'link', bg: '#F0F9FF', fg: '#0369a1' },
    { done: hasProducts, label: 'إضافة منتجات', sub: 'اعدادات متجرك الخاصه', go: 'products', ic: 'products', bg: '#ECFDF5', fg: '#059669' },
    { done: cats.categories.length > 0, label: 'إضافة اقسام', sub: 'اعدادات متجرك الخاصه', go: 'categories', ic: 'categories', bg: '#FEF2F2', fg: '#dc2626' },
    { done: Object.keys(ts).length > 0, label: 'تعديل الشاشة الرئيسية', sub: 'اعدادات متجر', go: 'builder', ic: 'store', bg: '#FFFBEB', fg: '#d97706' },
    { done: !!STORE.phone, label: 'أكمل بيانات متجرك (هاتف، وصف)', sub: 'اعدادات متجرك الخاصه', go: 'settings', ic: 'settings', bg: '#F1F5F9', fg: '#475569' },
    { done: !!STORE.is_published, label: 'فعّل النشر واستقبل الطلبات', sub: 'النشر والتفعيل', go: null, ic: 'spark', bg: '#ECFDF5', fg: '#16a34a' },
  ];
  const doneCount = checklist.filter(c => c.done).length;
  const allDone = doneCount === checklist.length;
  const funnelMax = Math.max(d.funnel.page_view, 1);
  const funnelSteps = [['page_view', 'زيارة المتجر'], ['product_view', 'مشاهدة منتج'], ['add_to_cart', 'إضافة للسلة'], ['begin_checkout', 'بدء الشراء'], ['purchase', 'طلب مكتمل']];
  const html = topBar('لوحة الإحصائيات', `أهلاً ${esc(ME.user.name)}`) +
    activationBanner() +
    (allDone || guideDismissed ? '' : `<div class="card" style="margin-bottom:16px">
      <div class="setup-head"><div><h3 style="margin:0">دليل اعداد المتجر</h3><p class="muted small" style="margin:4px 0 0">اتبع هذه الخطوات البسيطة لاعداد متجرك وبدء البيع</p></div>
      <button class="ord-filter-x" onclick="localStorage.setItem('at_setup_dismissed','1');route()" title="إخفاء">×</button></div>
      <div class="setup-meta"><span class="pct">${Math.round(100 * doneCount / checklist.length)}%</span><div class="setup-progress" style="flex:1"><i style="width:${Math.round(100 * doneCount / checklist.length)}%"></i></div><span class="muted small">${doneCount} من ${checklist.length} خطوات</span></div>
      <div class="setup-grid">${checklist.map(c => `<div class="setup-card">
        ${c.done ? `<span class="sc-done">${I('check')}</span>` : ''}
        <span class="sc-ic" style="background:${c.bg};color:${c.fg}">${I(c.ic) || ''}</span>
        <span class="sc-title">${c.label}</span><span class="sc-sub">${c.sub}</span>
        <span class="sc-foot">${!c.done ? `<button class="sc-more" onclick="${c.go ? `go('${c.go}')` : 'openActivation()'}">المزيد ‹</button>` : '<span></span>'}</span>
      </div>`).join('')}</div></div>`) +
    `<div class="grid4" style="margin-bottom:16px">
      <div class="stat"><span class="s-ic" style="background:var(--green-soft);color:var(--green-600)">${I('payments')}</span><div><div class="s-num">${egp(d.revenue)}</div><div class="s-lbl">الإيرادات (30 يوم)</div></div></div>
      <div class="stat"><span class="s-ic" style="background:#EFF6FF;color:var(--blue)">${I('orders')}</span><div><div class="s-num">${d.orders}</div><div class="s-lbl">الطلبات</div></div></div>
      <div class="stat"><span class="s-ic" style="background:#F5F3FF;color:var(--purple)">${I('eye')}</span><div><div class="s-num">${d.views}</div><div class="s-lbl">زيارات المتجر</div></div></div>
      <div class="stat"><span class="s-ic" style="background:#FFFBEB;color:var(--amber)">${I('stats')}</span><div><div class="s-num">${d.conversion}%</div><div class="s-lbl">معدل التحويل</div></div></div>
    </div>
    ${assistantCard(d, prods.products)}
    <div class="grid-2">
      <div class="card chart-card"><h3>الإيرادات اليومية <span class="hint muted small">آخر 30 يوم</span></h3><canvas id="revChart"></canvas></div>
      <div class="card"><h3>فانل المبيعات</h3><div class="funnel">
        ${funnelSteps.map(([k, l]) => `<div class="f-step"><span>${l}</span><div class="f-bar" style="width:${Math.max(6, 100 * d.funnel[k] / funnelMax)}%">${d.funnel[k]}</div><span class="pct">${d.funnel.page_view ? Math.round(100 * d.funnel[k] / d.funnel.page_view) : 0}%</span></div>`).join('')}
      </div></div>
    </div>
    <div class="grid-2" style="margin-top:16px">
      <div class="card"><h3>الأكثر مبيعاً</h3>${d.top.length ? `<div class="tbl-wrap" style="border:0;box-shadow:none"><table class="tbl"><tbody>${d.top.map(t => `<tr><td>${esc(t.name)}</td><td>${t.qty} قطعة</td><td><b>${egp(t.revenue)}</b></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty"><span class="e-ic">${I('products')}</span><b>لا مبيعات بعد</b><p>أضف منتجات وشارك رابط متجرك</p></div>`}</div>
      <div class="card"><h3>حالة الطلبات</h3><div class="tbl-wrap" style="border:0;box-shadow:none"><table class="tbl"><tbody>${Object.keys(STATUS).map(s => `<tr><td>${stChip(s)}</td><td><b>${d.statusCounts[s] || 0}</b></td></tr>`).join('')}</tbody></table></div></div>
    </div>`;
  return { html, after: () => drawChart(d.daily) };
}
registerView('overview', viewHome);
