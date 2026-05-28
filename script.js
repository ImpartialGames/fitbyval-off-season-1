// ===== SCROLL PROGRESS =====
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = scrolled + '%';
      ticking = false;
    });
    ticking = true;
  }
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== PARALLAX HERO =====
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  if (heroBg && window.scrollY < window.innerHeight) {
    heroBg.style.transform = `translateY(${window.scrollY * 0.38}px)`;
  }
});

// ===== UNIFIED REVEAL OBSERVER =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-clip, .reveal-clip-r, .reveal-clip-up'
).forEach(el => revealObserver.observe(el));

// ===== SPLIT-WORD ANIMATION =====
document.querySelectorAll('.split-title').forEach(title => {
  const rawHTML = title.innerHTML;
  const lines = rawHTML.split(/<br\s*\/?>/i);
  let delay = 0;
  title.innerHTML = lines.map(line => {
    const stripped = line.replace(/<[^>]+>/g, '').trim();
    if (!stripped) return '<br>';
    return line.split(' ').filter(Boolean).map(word => {
      const d = delay;
      delay += 0.07;
      return `<span class="word-wrap"><span class="word" style="transition-delay:${d}s">${word}</span></span>`;
    }).join(' ');
  }).join('<br>');
});

const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.word').forEach(w => w.classList.add('active'));
      titleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.split-title').forEach(el => titleObserver.observe(el));

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.hero-cta, .final-btn, .cta-btn, .coach-btn, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
    btn.style.transform = `translate(${x}px, ${y}px)`;
    btn.style.transition = 'transform 0.08s linear';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });
});

// ===== TEXT SCRAMBLE for hero eyebrow =====
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·';
    this.update = this.update.bind(this);
  }
  setText(text) {
    const len = text.length;
    const p = new Promise(res => this.resolve = res);
    this.queue = Array.from({ length: len }, (_, i) => ({
      to: text[i],
      start: Math.floor(Math.random() * 6),
      end: Math.floor(Math.random() * 8) + 6 + Math.floor(Math.random() * i * 0.5)
    }));
    this.frame = 0;
    cancelAnimationFrame(this.frameReq);
    this.update();
    return p;
  }
  update() {
    let out = '', done = 0;
    this.queue.forEach(({ to, start, end }) => {
      if (this.frame >= end) { out += to; done++; }
      else if (this.frame >= start) out += this.chars[Math.floor(Math.random() * this.chars.length)];
      else out += to === ' ' ? ' ' : '·';
    });
    this.el.textContent = out;
    if (done === this.queue.length) this.resolve();
    else { this.frameReq = requestAnimationFrame(this.update); this.frame++; }
  }
}

const eyebrow = document.querySelector('.hero-eyebrow');
if (eyebrow) {
  const orig = eyebrow.textContent;
  setTimeout(() => new TextScramble(eyebrow).setText(orig), 900);
}

// ===== PHASE CARD TILT =====
document.querySelectorAll('.phase-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    card.style.transition = 'transform 0.1s linear';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
  });
});

// ===== TICKER =====
const ticker = document.querySelector('.stats-ticker-inner');
if (ticker) ticker.innerHTML += ticker.innerHTML;

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', function() {
    const item = this.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== CONFIANCE CAROUSEL =====
(function() {
  const carousel = document.querySelector('.confiance-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.confiance-track');
  const slides = Array.from(carousel.querySelectorAll('.confiance-slide'));
  const prevBtn = carousel.querySelector('.confiance-prev');
  const nextBtn = carousel.querySelector('.confiance-next');
  const dotsContainer = carousel.querySelector('.confiance-dots');

  let current = 0;
  let autoTimer = null;

  function getSlidesPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 820) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, slides.length - getSlidesPerView());
  }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const max = getMaxIndex();
    for (let i = 0; i <= max; i++) {
      const d = document.createElement('button');
      d.className = 'confiance-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(d);
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.confiance-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    const max = getMaxIndex();
    current = Math.max(0, Math.min(index, max));
    const slideWidth = slides[0].getBoundingClientRect().width + 20; // gap=20
    track.style.transform = `translateX(-${current * slideWidth}px)`;
    updateDots();
  }

  function next() { goTo(current < getMaxIndex() ? current + 1 : 0); }
  function prev() { goTo(current > 0 ? current - 1 : getMaxIndex()); }

  prevBtn.addEventListener('click', () => { clearInterval(autoTimer); prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { clearInterval(autoTimer); next(); startAuto(); });

  function startAuto() {
    autoTimer = setInterval(next, 4000);
  }
  startAuto();

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { clearInterval(autoTimer); diff > 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener('resize', () => { buildDots(); goTo(current); });

  buildDots();
  goTo(0);
})();

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== HERO PARTICLES =====
(function() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('span');
    p.className = 'hero-particle';
    p.style.cssText = `left:${Math.random()*100}%;top:${10+Math.random()*80}%;animation-delay:${Math.random()*7}s;animation-duration:${6+Math.random()*8}s;width:${Math.random()>.65?2:1}px;height:${Math.random()>.65?2:1}px;opacity:${.06+Math.random()*.2}`;
    hero.appendChild(p);
  }
})();
