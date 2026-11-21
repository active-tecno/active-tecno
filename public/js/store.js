// store.js — storefront: cart (localStorage), analytics tracking, checkout
const SLUG = window.STORE_SLUG;
const CART_KEY = `at_cart_${SLUG}`;
const SID_KEY = `at_sid_${SLUG}`;

const egp = n => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function sid() {
  let s = localStorage.getItem(SID_KEY);
  if (!s) { s = 's' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(SID_KEY, s); }
  return s;
}
function track(type, productId) {
  try {
    navigator.sendBeacon(`/api/public/${SLUG}/track`, new Blob([JSON.stringify({ type, session_id: sid(), product_id: productId || null })], { type: 'application/json' }));
  } catch { fetch(`/api/public/${SLUG}/track`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, session_id: sid(), product_id: productId || null }) }).catch(() => {}); }
}
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCartUI();
  // sync for abandoned-cart tracking
  fetch(`/api/public/${SLUG}/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sid(), items: items.map(i => ({ product_id: i.id, name: i.name, price: i.price, qty: i.qty })) }) }).catch(() => {});
}
function addToCart(id, name, price, image, qty = 1) {
  const cart = getCart();
  const ex = cart.find(i => i.id === id);
  if (ex) ex.qty = Math.min(ex.qty + qty, 20); else cart.push({ id, name, price, image, qty });
  setCart(cart);
  track('add_to_cart', id);
  toast('تمت الإضافة إلى السلة');
  toggleCart(true);
}
function buyNow(id, name, price, image, qty = 1) {
  const cart = getCart();
  if (!cart.find(i => i.id === id)) { cart.push({ id, name, price, image, qty }); setCart(cart); }
  location.href = `/s/${SLUG}/checkout`;
}
function changeQty(id, d) {
  const cart = getCart();
  const it = cart.find(i => i.id === id);
  if (!it) return;
  it.qty += d;
  if (it.qty <= 0) cart.splice(cart.indexOf(it), 1);
  if (it.qty > 20) it.qty = 20;
  setCart(cart);
}
function toggleCart(open) {
  const d = document.getElementById('cartDrawer'), o = document.getElementById('cartOverlay');
  if (!d) return;
  d.classList.toggle('open', open); o.classList.toggle('open', open);
}
function renderCartUI() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const cc = document.getElementById('cartCount');
  if (cc) cc.textContent = count;
  const wrap = document.getElementById('cartItems');
  if (wrap) {
    wrap.innerHTML = cart.length ? cart.map(i => `<div class="cart-item">
      <img src="${escH(i.image)}" alt="">
      <div class="ci-info"><b>${escH(i.name)}</b><span>${egp(i.price)} × ${i.qty}</span></div>
      <div class="ci-qty"><button onclick="changeQty(${i.id},1)">+</button><span>${i.qty}</span><button onclick="changeQty(${i.id},-1)">−</button></div>
    </div>`).join('') : `<div class="cart-empty">سلتك فارغة<br>أضف منتجات وابدأ التسوق</div>`;
  }
  const tot = document.getElementById('cartTotal');
  if (tot) tot.textContent = egp(cart.reduce((s, i) => s + i.price * i.qty, 0));
}
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
}
function pdQty(d) {
  const el = document.getElementById('pdQty');
  el.textContent = Math.max(1, Math.min(20, parseInt(el.textContent) + d));
}
// category filter
document.addEventListener('click', e => {
  const b = e.target.closest('.s-cat'); if (!b) return;
  document.querySelectorAll('.s-cat').forEach(x => x.classList.toggle('on', x === b));
  const cat = b.dataset.cat;
  document.querySelectorAll('.p-card').forEach(c => {
    c.style.display = (cat === 'الكل' || c.querySelector('h3').dataset.cat === cat || c.dataset.cat === cat) ? '' : 'none';
  });
});

// ---------- checkout ----------
let coState = { coupon: null, discount: 0, zones: [], freeOver: 0, onlinePay: false };
async function loadPayMethods() {
  try {
    const d = await (await fetch(`/api/public/${SLUG}/store`)).json();
    coState.onlinePay = !!(d.payments && d.payments.online);
    const pm = document.getElementById('pmOnline');
    if (!pm) return;
    if (!coState.onlinePay) {
      pm.classList.add('disabled');
      pm.querySelector('input').disabled = true;
      document.getElementById('pmOnlineHint').textContent = 'غير مفعّلة لهذا المتجر — الدفع عند الاستلام متاح';
    }
  } catch { }
}
async function renderCheckout() {
  const cart = getCart();
  const grid = document.getElementById('coGrid'), empty = document.getElementById('coEmpty');
  if (!grid) return;
  if (!cart.length) { grid.hidden = true; empty.hidden = false; return; }
  const r = await fetch(`/api/public/${SLUG}/store`);
  const d = await r.json();
  coState.zones = d.zones || [];
  coState.freeOver = d.store.free_shipping_over || 0;
  drawSummary();
  document.querySelector('[name=governorate]').addEventListener('change', drawSummary);
}
function shippingFor(subtotal, gov) {
  let ship = 0;
  const zone = coState.zones.find(z => (z.governorates || '').split(',').map(x => x.trim()).includes(gov)) || coState.zones[0];
  if (zone) ship = (zone.free_over && subtotal >= zone.free_over) ? 0 : zone.price;
  if (coState.freeOver && subtotal >= coState.freeOver) ship = 0;
  return ship;
}
function drawSummary() {
  const cart = getCart();
  const gov = document.querySelector('[name=governorate]')?.value;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = shippingFor(subtotal, gov);
  const total = Math.max(0, subtotal + shipping - coState.discount);
  document.getElementById('coSummary').innerHTML = `<h3>ملخص الطلب</h3>
    ${cart.map(i => `<div class="co-line"><img src="${escH(i.image)}"><div class="cl-info"><b>${escH(i.name)}</b><span>الكمية: ${i.qty}</span></div><b>${egp(i.price * i.qty)}</b></div>`).join('')}
    <div class="co-tot"><span>المجموع الفرعي</span><span>${egp(subtotal)}</span></div>
    <div class="co-tot"><span>الشحن</span>${shipping ? `<span>${egp(shipping)}</span>` : `<span class="free">مجاني</span>`}</div>
    ${coState.discount ? `<div class="co-tot"><span>الخصم (${escH(coState.coupon)})</span><span>−${egp(coState.discount)}</span></div>` : ''}
    <div class="co-tot grand"><span>الإجمالي عند الاستلام</span><span>${egp(total)}</span></div>`;
}
async function applyCoupon() {
  const code = document.querySelector('[name=coupon]').value.trim();
  const err = document.getElementById('coErr');
  if (!code) return;
  const subtotal = getCart().reduce((s, i) => s + i.price * i.qty, 0);
  const r = await fetch(`/api/public/${SLUG}/validate-coupon`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) });
  const d = await r.json();
  if (!r.ok) { err.textContent = d.error; coState.coupon = null; coState.discount = 0; }
  else { err.textContent = ''; coState.coupon = d.code; coState.discount = d.discount; toast(`تم تطبيق كود ${d.code} 🎟️`); }
  drawSummary();
}
document.addEventListener('submit', async e => {
  if (e.target.id !== 'coForm') return;
  e.preventDefault();
  const btn = document.getElementById('coSubmit');
  btn.disabled = true; btn.textContent = 'جاري تأكيد الطلب…';
  const f = new FormData(e.target);
  const body = Object.fromEntries(f.entries());
  body.coupon = coState.coupon || null;
  body.session_id = sid();
  body.items = getCart().map(i => ({ product_id: i.id, name: i.name, qty: i.qty }));
  // save phone for abandoned-cart recovery if order fails
  fetch(`/api/public/${SLUG}/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sid(), customer_phone: body.phone, items: body.items.map(i => ({ product_id: i.product_id, name: i.name, price: 0, qty: i.qty })) }) }).catch(() => {});
  if (body.payment_method === 'online' && coState.onlinePay) {
    btn.textContent = '💳 جاري تحويلك لصفحة الدفع الآمنة…';
    await new Promise(r => setTimeout(r, 1400));
    btn.textContent = '💳 تم الدفع — جاري تأكيد طلبك…';
    await new Promise(r => setTimeout(r, 700));
  }
  const r = await fetch(`/api/public/${SLUG}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) {
    document.getElementById('coErr').textContent = d.error || 'حدث خطأ، حاول مرة أخرى';
    btn.disabled = false; btn.textContent = 'تأكيد الطلب — دفع عند الاستلام';
    return;
  }
  localStorage.removeItem(CART_KEY);
  location.href = `/s/${SLUG}/order/${d.number}`;
});

renderCartUI();
