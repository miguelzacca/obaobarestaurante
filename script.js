/* ============================================================
   OBA OBA RESTAURANTE — PREMIUM SCRIPT
   Animations: GSAP, ScrollTrigger, Lenis, custom particles,
   magnetic cursor, kinetic loader, split-text, parallax
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// REGISTER GSAP PLUGINS
// ─────────────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────
// LENIS — HYPER-SMOOTH SCROLL
// ─────────────────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ─────────────────────────────────────────────────────────────
// CUSTOM CURSOR
// ─────────────────────────────────────────────────────────────
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let rafId;

  const lerp = (a, b, t) => a + (b - a) * t;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
  });

  function animateRing() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    gsap.set(cursorRing, { x: ringX, y: ringY });
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states
  const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], .highlight-card, .info-item, .img-wrapper, .swiper-slide');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ─────────────────────────────────────────────────────────────
// MAGNETIC BUTTONS
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) * 0.3;
    const dy = (e.clientY - cy) * 0.3;
    gsap.to(el, { x: dx, y: dy, duration: 0.5, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  });
});

// ─────────────────────────────────────────────────────────────
// FLOATING PARTICLES (CANVAS)
// ─────────────────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const GOLD   = [201, 168, 76];
  const TEAL   = [26, 139, 141];

  function Particle() {
    this.reset = function() {
      this.x = Math.random() * W;
      this.y = Math.random() * H + H;
      this.size = Math.random() * 1.5 + 0.3;
      this.speed = Math.random() * 0.4 + 0.1;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.color = Math.random() > 0.5 ? GOLD : TEAL;
      this.drift = (Math.random() - 0.5) * 0.3;
    };
    this.reset();
    this.y = Math.random() * H; // start scattered
  }

  for (let i = 0; i < 60; i++) particles.push(new Particle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -5) p.reset();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.join(',')}, ${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
})();

// ─────────────────────────────────────────────────────────────
// CINEMATIC LOADER
// ─────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader    = document.getElementById('loader');
  const progress  = document.getElementById('loader-progress');
  const counter   = document.getElementById('loader-counter');
  const panels    = document.querySelectorAll('.loader-panel');

  if (!loader) return;

  let pct = 0;
  const counterId = setInterval(() => {
    pct = Math.min(pct + Math.random() * 8, 100);
    if (progress) progress.style.width = pct + '%';
    if (counter)  counter.textContent  = Math.floor(pct) + '%';
    if (pct >= 100) clearInterval(counterId);
  }, 60);

  const tl = gsap.timeline();

  // Small delay to let "100%" show
  tl.to({}, { duration: 0.5 })

  // Slide each panel upward — staggered wipe
  .to(panels, {
    duration: 0.9,
    scaleY: 0,
    transformOrigin: 'top',
    stagger: 0.09,
    ease: 'power4.inOut',
  }, '+=0.2')

  .to('.loader-content', {
    opacity: 0,
    y: -40,
    duration: 0.5,
    ease: 'power2.inOut',
  }, '<0.1')

  .to(loader, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => { loader.style.display = 'none'; }
  }, '-=0.1')

  // ─── Hero entrance ────────────────────────────────────
  .fromTo('.hero-img',
    { scale: 1.18 },
    { scale: 1, duration: 2.2, ease: 'power3.out' },
  '-=0.3')

  .fromTo('.hero-badge',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
  '-=1.8')

  // Clip-path reveal for hero title lines
  .fromTo('.hero-title .line-inner',
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.12
    },
  '-=0.7')

  .fromTo('.hero-subtitle',
    { y: 25, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
  '-=0.6')

  .fromTo('.hero-actions',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
  '-=0.6')

  .fromTo('.scroll-indicator',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
  '-=0.4')

  .fromTo('.header',
    { yPercent: -120, opacity: 0 },
    { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power4.out' },
  '-=1.5');
});

// ─────────────────────────────────────────────────────────────
// HEADER SCROLL STATE
// ─────────────────────────────────────────────────────────────
ScrollTrigger.create({
  start: 'top -80',
  end: 99999,
  toggleClass: { className: 'scrolled', targets: '.header' },
});

// ─────────────────────────────────────────────────────────────
// HERO PARALLAX (layered)
// ─────────────────────────────────────────────────────────────
gsap.to('.hero-bg', {
  yPercent: 35,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

gsap.to('.hero-content', {
  yPercent: 18,
  opacity: 0,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

gsap.to('.hero-shape-1', {
  yPercent: -25,
  xPercent: 10,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 2,
  },
});

gsap.to('.hero-shape-2', {
  yPercent: 20,
  xPercent: -8,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 2,
  },
});

// ─────────────────────────────────────────────────────────────
// ABOUT SECTION — REVEAL
// ─────────────────────────────────────────────────────────────
// Section label reveal
gsap.from('.about .s-label', {
  y: 20, opacity: 0, duration: 0.7, ease: 'power2.out',
  scrollTrigger: { trigger: '.about', start: 'top 75%' },
});

// Title character-level stagger
const aboutTitle = document.querySelector('.about .section-title');
if (aboutTitle) {
  const text = aboutTitle.innerHTML;
  // We'll just do a simple reveal since we don't split into chars
  gsap.from(aboutTitle, {
    yPercent: 40, opacity: 0, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: '.about', start: 'top 72%' },
  });
}

gsap.from('.about-divider', {
  scaleX: 0, transformOrigin: 'left', duration: 1, ease: 'power3.out',
  scrollTrigger: { trigger: '.about', start: 'top 70%' },
});

gsap.from('.about .section-desc', {
  y: 25, opacity: 0, duration: 0.9, ease: 'power2.out',
  scrollTrigger: { trigger: '.about', start: 'top 68%' },
});

gsap.from('.info-item', {
  x: -40, opacity: 0, duration: 0.8, ease: 'power3.out',
  stagger: 0.15,
  scrollTrigger: { trigger: '.info-list', start: 'top 80%' },
});

// Images
gsap.from('.img-1', {
  x: 60, opacity: 0, duration: 1.3, ease: 'power4.out',
  scrollTrigger: { trigger: '.about-images', start: 'top 82%' },
});

gsap.from('.img-2', {
  x: -60, opacity: 0, duration: 1.3, ease: 'power4.out', delay: 0.2,
  scrollTrigger: { trigger: '.about-images', start: 'top 82%' },
});

gsap.from('.about-float-badge', {
  scale: 0.6, opacity: 0, duration: 1, ease: 'back.out(1.8)', delay: 0.4,
  scrollTrigger: { trigger: '.about-images', start: 'top 80%' },
});

// About images parallax (depth)
gsap.to('.img-1', {
  yPercent: -12,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});

gsap.to('.img-2', {
  yPercent: 8,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});

// ─────────────────────────────────────────────────────────────
// GASTRONOMY — HEADER REVEAL
// ─────────────────────────────────────────────────────────────
gsap.from('.carousel-3d-header > *', {
  y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
  scrollTrigger: { trigger: '.carousel-3d-section', start: 'top 78%' },
});

// ─────────────────────────────────────────────────────────────
// CUSTOM 3D DRUM CAROUSEL ENGINE  (v3 — perfect snap)
// ─────────────────────────────────────────────────────────────
(function initDrumCarousel() {
  const ring     = document.getElementById('c3d-ring');
  const stage    = document.getElementById('c3d-stage');
  const dotsWrap = document.getElementById('c3d-dots');
  const btnPrev  = document.getElementById('c3d-prev');
  const btnNext  = document.getElementById('c3d-next');

  if (!ring) return;
  const cards = Array.from(ring.querySelectorAll('.c3d-card'));
  if (!cards.length) return;

  const COUNT  = cards.length;
  const ANGLE  = 360 / COUNT;   // degrees between card slots

  // Calculate radius based on screen size
  function getRadius() {
    return window.innerWidth <= 768 ? 240 : 360;
  }

  let current = 0;          // active card index

  // ── Position cards statically on cylinder ───────────────────
  function layoutCards() {
    const radius = getRadius();
    cards.forEach((card, i) => {
      // Raw CSS transform guarantees correct translation order
      card.style.transform = `rotateY(${i * ANGLE}deg) translateZ(${radius}px)`;
    });
  }
  layoutCards();

  window.addEventListener('resize', () => layoutCards());

  // ── Build dots ──────────────────────────────────────────────
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'c3d-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  // ── Update active state ──────────────────────────────────────
  function setActive(idx) {
    idx = ((idx % COUNT) + COUNT) % COUNT;
    current = idx;
    cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    if (dotsWrap) {
      Array.from(dotsWrap.querySelectorAll('.c3d-dot'))
        .forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }
  }
  setActive(0);

  // ── Go to card (GSAP ring rotation) ─────────────────────────
  function goTo(idx) {
    // Normalize target index
    const targetIdx = ((idx % COUNT) + COUNT) % COUNT;

    const currentRot = gsap.getProperty(ring, 'rotateY') || 0;
    
    // Mathematical exact rotation for target index
    const baseTarget = -targetIdx * ANGLE;
    
    // Shortest path difference
    let diff = (baseTarget - currentRot) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    const targetDeg = currentRot + diff;

    gsap.killTweensOf(ring);
    gsap.to(ring, {
      rotateY: targetDeg,
      duration: 0.85,
      ease: 'power3.out',
      force3D: true,
      onUpdate() {
        const liveRot = gsap.getProperty(ring, 'rotateY') || 0;
        const liveIdx = Math.round(-liveRot / ANGLE);
        setActive(liveIdx);
      },
      onComplete() {
        setActive(targetIdx);
      },
    });
  }

  // ── Button nav ───────────────────────────────────────────────
  btnPrev?.addEventListener('click', () => goTo(current - 1));
  btnNext?.addEventListener('click', () => goTo(current + 1));

  // ── Keyboard nav ─────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  // ── Drag / swipe ─────────────────────────────────────────────
  let dragStartX  = null;
  let dragStartRot = 0;

  function dragStart(x) {
    dragStartX   = x;
    dragStartRot = gsap.getProperty(ring, 'rotateY') || 0;
    gsap.killTweensOf(ring);
  }

  function dragMove(x) {
    if (dragStartX === null) return;
    const dx     = x - dragStartX;
    const newRot = dragStartRot + dx * 0.28;
    
    gsap.set(ring, { rotateY: newRot, force3D: true });
    
    const liveIdx = Math.round(-newRot / ANGLE);
    setActive(liveIdx);
  }

  function dragEnd(x) {
    if (dragStartX === null) return;
    const dx = x - dragStartX;
    dragStartX = null;

    const currentRot = gsap.getProperty(ring, 'rotateY') || 0;
    
    // Calculate nearest slot
    let snapIdx = -Math.round(currentRot / ANGLE);
    
    // Directional throwing (prevent rubber-banding backward if swipe > 40px)
    if (dx > 40) snapIdx = -Math.round((currentRot + ANGLE * 0.4) / ANGLE);
    if (dx < -40) snapIdx = -Math.round((currentRot - ANGLE * 0.4) / ANGLE);

    // Let goTo handle shortest-path exact snap
    goTo(snapIdx);
  }

  // Mouse events
  stage.addEventListener('mousedown',  (e) => { e.preventDefault(); dragStart(e.clientX); });
  window.addEventListener('mousemove', (e) => dragMove(e.clientX));
  window.addEventListener('mouseup',   (e) => dragEnd(e.clientX));
  window.addEventListener('mouseleave', (e) => {
    if (dragStartX !== null) dragEnd(e.clientX);
  });

  // Touch events
  stage.addEventListener('touchstart', (e) => {
    dragStart(e.touches[0].clientX);
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (dragStartX === null) return;
    e.stopPropagation(); // prevent lenis scroll conflict
    dragMove(e.touches[0].clientX);
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    dragEnd(e.changedTouches[0].clientX);
  }, { passive: true });

  // ── Autoplay ─────────────────────────────────────────────────
  let autoTimer = null;

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (!document.hidden && dragStartX === null) goTo(current + 1);
    }, 4200);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  startAuto();
  stage.addEventListener('mouseenter', stopAuto);
  stage.addEventListener('mouseleave', startAuto);
  stage.addEventListener('touchstart',  stopAuto, { passive: true });
  stage.addEventListener('touchend',    () => setTimeout(startAuto, 2000), { passive: true });

  // ── Scroll-triggered reveal ──────────────────────────────────
  gsap.fromTo(stage,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.carousel-3d-section', start: 'top 82%' },
    }
  );

  gsap.from('.carousel-3d-nav', {
    y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.carousel-3d-section', start: 'top 76%' },
  });

  gsap.from('.carousel-drag-hint', {
    y: 10, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.3,
    scrollTrigger: { trigger: '.carousel-3d-section', start: 'top 76%' },
  });
})();

// ─────────────────────────────────────────────────────────────
// HIGHLIGHTS — REVEAL & PARALLAX
// ─────────────────────────────────────────────────────────────
gsap.from('.highlights-header > *', {
  y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out',
  scrollTrigger: { trigger: '.highlights-header', start: 'top 80%' },
});

// Cards staggered clip-path reveal
gsap.from('.highlight-card', {
  y: 80, opacity: 0, duration: 1.1, stagger: 0.13, ease: 'power4.out',
  scrollTrigger: { trigger: '.highlights-grid', start: 'top 82%' },
});

// Per-card parallax background
gsap.utils.toArray('.highlight-card').forEach(card => {
  const bg = card.querySelector('.card-bg');
  if (!bg) return;
  gsap.to(bg, {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: card,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
});

// ─────────────────────────────────────────────────────────────
// FOOTER — REVEAL & PARALLAX
// ─────────────────────────────────────────────────────────────
gsap.to('.footer-bg img', {
  yPercent: -18,
  ease: 'none',
  scrollTrigger: {
    trigger: '.footer',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});

gsap.from('.footer-cta > *', {
  y: 50, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out',
  scrollTrigger: { trigger: '.footer-cta', start: 'top 82%' },
});

gsap.from('.footer-bottom > *', {
  y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
  scrollTrigger: { trigger: '.footer-bottom', start: 'top 90%' },
});

// ─────────────────────────────────────────────────────────────
// MARQUEE PAUSE ON HOVER
// ─────────────────────────────────────────────────────────────
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

// ─────────────────────────────────────────────────────────────
// SCROLL-TRIGGERED COUNTER (float badge)
// ─────────────────────────────────────────────────────────────
const badgeNum = document.querySelector('.badge-num');
if (badgeNum) {
  ScrollTrigger.create({
    trigger: '.about-images',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      let n = 0;
      const target = 10;
      const id = setInterval(() => {
        n = Math.min(n + 1, target);
        badgeNum.textContent = n + '+';
        if (n >= target) clearInterval(id);
      }, 80);
    },
  });
}

// ─────────────────────────────────────────────────────────────
// AURORA PARALLAX (subtle depth on scroll)
// ─────────────────────────────────────────────────────────────
gsap.to('.aurora-orb:nth-child(1)', {
  yPercent: -20,
  ease: 'none',
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 3,
  },
});

gsap.to('.aurora-orb:nth-child(2)', {
  yPercent: 15,
  ease: 'none',
  scrollTrigger: {
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 4,
  },
});

// ─────────────────────────────────────────────────────────────
// TILT EFFECT on highlight cards (subtle)
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.highlight-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 6,
      rotateX: -y * 6,
      transformPerspective: 800,
      duration: 0.6,
      ease: 'power2.out',
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateY: 0, rotateX: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    });
  });
});

// ─────────────────────────────────────────────────────────────
// ABOUT IMAGE TILT
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.img-wrapper').forEach(wrap => {
  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(wrap, {
      rotateY: x * 8,
      rotateX: -y * 8,
      transformPerspective: 700,
      duration: 0.5, ease: 'power2.out',
    });
  });
  wrap.addEventListener('mouseleave', () => {
    gsap.to(wrap, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
  });
});

// ─────────────────────────────────────────────────────────────
// SMOOTH ANCHOR LINKS (lenis)
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -100, duration: 1.8 });
  });
});
