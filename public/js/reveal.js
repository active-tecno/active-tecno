// scroll-reveal: adds .rv-in when [data-reveal] enters viewport (like easyorders' reveal system)
(() => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const scan = () => document.querySelectorAll('[data-reveal]:not(.rv-in)').forEach(el => io.observe(el));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
