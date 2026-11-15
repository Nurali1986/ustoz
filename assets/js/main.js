/* Sozlamalar: aloqa ma'lumotlarini shu yerda o'zgartiring */
const CONFIG = {
  // Google Apps Script veb-ilova havolasi (.../exec). Bo'sh bo'lsa, forma Telegram orqali ishlaydi.
  sheetUrl: 'https://script.google.com/macros/s/AKfycbxsxJWuwxpLhK-Y_W2y9_cSaj9BfiPnkhq2Mk44-ecTe0Oq8bCznKmKyY--lGMR-KSTng/exec',
  telegram: 'AXROLXUJA' // zaxira: Telegram profil
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
const submitBtn = form.querySelector('button[type="submit"]');

function telegramFallback(lines) {
  let copied = false;
  return (navigator.clipboard ? navigator.clipboard.writeText(lines).then(() => { copied = true; }) : Promise.resolve())
    .catch(() => {})
    .then(() => {
      window.open(`https://t.me/${CONFIG.telegram}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener');
      showToast(copied
        ? 'Xabar nusxalandi va Telegram ochildi — chatga joylashtirib yuboring.'
        : 'Telegram ochildi — xabaringizni yozib yuboring.');
    });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(form);
  const name = (f.get('name') || '').trim();
  const phone = (f.get('phone') || '').trim();
  const phoneOk = phone.replace(/\D/g, '').length >= 9;
  form.name.classList.toggle('err', !name);
  form.phone.classList.toggle('err', !phoneOk);
  if (!name || !phoneOk) {
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

  if (!CONFIG.sheetUrl) { await telegramFallback(lines); form.reset(); return; }

  submitBtn.disabled = true;
  const label = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Yuborilmoqda...';
  try {
    // Apps Script CORS javobini bermaydi, shuning uchun "no-cors" bilan yuboriladi
    await fetch(CONFIG.sheetUrl, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(f) });
    showToast('Rahmat! Murojaatingiz qabul qilindi. Tez orada bog‘lanamiz.');
    form.reset();
  } catch (_) {
    showToast('Internet bilan muammo. Telegram orqali yuboramiz.');
    await telegramFallback(lines);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = label;
  }
});

document.getElementById('yr').textContent = new Date().getFullYear();
