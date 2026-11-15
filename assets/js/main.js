/* Sozlamalar: aloqa ma'lumotlarini shu yerda o'zgartiring */
const CONFIG = {
  telegram: 'AXROLXUJA' // xabar shu Telegram profilga yuboriladi
};

// Navigatsiya
const nav = document.querySelector('.nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Raqamlarni sanash
const fmt = n => n >= 1000 ? n.toLocaleString('ru-RU').replace(/,/g, ' ') : String(n);
function countUp(el) {
  const target = Number(el.dataset.count);
  const dur = 1400;
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / dur);
    const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = fmt(v);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Ko'rinishga kirganda animatsiya
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    if (e.target.dataset.count) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Videolar faqat ekranda bo'lganda o'ynaydi (trafik va batareyani tejash)
const vio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); }
    else v.pause();
  });
}, { threshold: 0.1 });
document.querySelectorAll('video.loop').forEach(v => vio.observe(v));

// Xizmat tugmalari formadagi mavzuni tanlaydi
document.querySelectorAll('[data-topic]').forEach(btn => {
  btn.addEventListener('click', () => {
    const r = document.querySelector(`input[name="topic"][value="${btn.dataset.topic}"]`);
    if (r) r.checked = true;
  });
});

// Toast
const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 4200);
}

// Forma
const form = document.getElementById('leadForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(form);
  const name = (f.get('name') || '').trim();
  const phone = (f.get('phone') || '').trim();
  form.name.classList.toggle('err', !name);
  form.phone.classList.toggle('err', phone.replace(/\D/g, '').length < 9);
  if (!name || phone.replace(/\D/g, '').length < 9) {
    showToast('Iltimos, ism va telefon raqamini to‘liq kiriting.');
    return;
  }
  const lines = [
    'Assalomu alaykum, Axrolxo‘ja aka!',
    `Mavzu: ${f.get('topic')}`,
    `Ism: ${name}`,
    `Telefon: ${phone}`,
    f.get('biz') ? `Biznes sohasi: ${f.get('biz')}` : '',
    f.get('rev') ? `Oylik aylanma: ${f.get('rev')}` : '',
    f.get('msg') ? `Xabar: ${f.get('msg')}` : ''
  ].filter(Boolean).join('\n');

  let copied = false;
  try { await navigator.clipboard.writeText(lines); copied = true; } catch (_) {}
  const url = `https://t.me/${CONFIG.telegram}?text=${encodeURIComponent(lines)}`;
  window.open(url, '_blank', 'noopener');
  showToast(copied
    ? 'Xabar nusxalandi va Telegram ochildi — chatga joylashtirib yuboring.'
    : 'Telegram ochildi — xabaringizni yozib yuboring.');
  form.reset();
});

document.getElementById('yr').textContent = new Date().getFullYear();
