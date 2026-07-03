const app = {
  currentPage: 'home',
  isTransitioning: false,
  lenis: null,
  threeShell: null,
  techScene: null,
  particles: null,
  lottieInstances: {},
  mouse: { x: 0, y: 0, smoothedX: 0, smoothedY: 0 }
};

function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  if (app.lenis) app.lenis.stop();
}

function unlockBodyScroll() {
  const scrollY = parseInt(document.body.style.top || '0') * -1;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollY || 0);
  if (app.lenis) app.lenis.start();
}

function showMiniToast(msg) {
  let toast = document.getElementById('mini-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mini-toast';
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);z-index:200000;background:#000;border:1px solid #C0C0C0;padding:20px 28px;max-width:340px;width:90%;opacity:0;visibility:hidden;transition:all 0.3s ease;text-align:center;pointer-events:none;box-shadow:0 0 40px rgba(0,0,0,0.9);';
    toast.innerHTML = '<div style="font-family:\'Courier New\',monospace;font-size:0.65rem;color:#C0C0C0;letter-spacing:2px;line-height:1.8;" id="mini-toast-body"></div>';
    document.body.appendChild(toast);
  }
  const body = document.getElementById('mini-toast-body');
  if (body) body.textContent = msg;
  toast.style.opacity = '1';
  toast.style.visibility = 'visible';
  toast.style.transform = 'translate(-50%,-50%) scale(1)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.visibility = 'hidden';
    toast.style.transform = 'translate(-50%,-50%) scale(0.9)';
  }, 1000);
}

function debounce(fn, ms) {
  let timer;
  return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), ms); };
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const assetImages = shuffleArray([
  'assets/HeroSectionBg.jpg',
  'assets/SectionBg1.jpg',
  'assets/SectionBg2.jpg',
  'assets/DroneCityView.avif',
  'assets/DroneSwarmFormation.jpg',
  'assets/TechDevice.jpg',
  'assets/TechSectionBg.webp',
  'assets/ServerInfrastructure.jpg',
  'assets/CircuitHardware.jpeg',
  'assets/UrbanAerial.jpg',
  'assets/DroneAerialShot.jpg',
  'assets/QuadcopterDrone.webp',
  'assets/DroneSwarm.jpg'
]);

function assignRandomImages() {
  const caseImages = document.querySelectorAll('.case-video');
  const blogImages = document.querySelectorAll('.blog-image');
  const pool = shuffleArray([...assetImages]);
  let idx = 0;
  caseImages.forEach(el => {
    const src = pool[idx % pool.length];
    el.style.backgroundImage = `url('${src}')`;
    el.dataset.img = src;
    idx++;
  });
  blogImages.forEach(el => {
    const src = pool[idx % pool.length];
    el.style.backgroundImage = `url('${src}')`;
    idx++;
  });
}

async function preloadImages() {
  const imgs = ['assets/HeroSectionBg.jpg', 'assets/SectionBg1.jpg', 'assets/SectionBg2.jpg', 'dark.gif'];
  return Promise.all(imgs.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  })));
}

/* ========== LOADING SCREEN ========== */
function initLoadingScreen() {
  const canvas = document.getElementById('loading-canvas');
  if (!canvas) return;
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let time = 0;
  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.5 + 0.1
    });
  }

  function drawShell(ctx, t, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.3);
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + t * 0.5;
      const radius = 30 + Math.sin(i * 0.8 + t * 0.5) * 15;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.6;
      const size = 2 + Math.sin(i * 0.5 + t) * 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192,192,192,${0.2 + Math.sin(i + t) * 0.1})`;
      ctx.fill();
    }
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 20, r * 12, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(192,192,192,${0.06 + (3 - r) * 0.04})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    const spiralTurns = 4;
    ctx.beginPath();
    for (let i = 0; i < 100; i++) {
      const t2 = (i / 100) * spiralTurns * Math.PI * 2;
      const sr = 5 + t2 * 1.2;
      const sx = Math.cos(t2) * sr;
      const sy = Math.sin(t2) * sr * 0.6;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = `rgba(192,192,192,${0.2 + Math.sin(t) * 0.05})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    time += 0.02;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192,192,192,${p.a})`;
      ctx.fill();
    });
    drawShell(ctx, time, w / 2, h / 2);
    requestAnimationFrame(animate);
  }
  animate();

  const bar = document.querySelector('.loading-bar-progress');
  if (bar) {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) { p = 100; clearInterval(iv); }
      bar.style.width = p + '%';
    }, 150);
  }
}

function hideLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (screen) screen.classList.add('hidden');
}

/* ========== SPA ROUTER ========== */
function initRouter() {
  const links = document.querySelectorAll('[data-nav]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      navigateTo(href.slice(1));
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1) || 'home';
    navigateTo(hash);
  });

  if (!location.hash) navigateTo('home');
}

function navigateTo(pageId) {
  if (app.isTransitioning || app.currentPage === pageId) return;
  const validPages = ['home', 'products', 'services', 'case-studies', 'technologies', 'ai-agents', 'blog', 'contact'];
  if (!validPages.includes(pageId)) { pageId = 'home'; }

  app.isTransitioning = true;

  const prev = document.getElementById(app.currentPage);
  const next = document.getElementById(pageId);
  if (!prev || !next) { app.isTransitioning = false; return; }

  if (app.currentPage === 'home') {
    stopDrones();
    const heroDrones = document.getElementById('hero-drones');
    if (heroDrones) delete heroDrones.dataset.swarmReady;
  }

  // Close any open modal
  const modal = document.getElementById('ceo-modal');
  const backdrop = document.getElementById('ceo-modal-backdrop');
  if (modal) modal.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  const pModal = document.getElementById('product-modal');
  const pBackdrop = document.getElementById('product-modal-backdrop');
  if (pModal) pModal.classList.remove('active');
  if (pBackdrop) pBackdrop.classList.remove('active');
  const sModal = document.getElementById('service-modal');
  const sBackdrop = document.getElementById('service-modal-backdrop');
  if (sModal) sModal.classList.remove('active');
  if (sBackdrop) sBackdrop.classList.remove('active');
  const cModal = document.getElementById('case-modal');
  const cBackdrop = document.getElementById('case-modal-backdrop');
  if (cModal) cModal.classList.remove('active');
  if (cBackdrop) cBackdrop.classList.remove('active');
  const bModal = document.getElementById('blog-modal');
  const bBackdrop = document.getElementById('blog-modal-backdrop');
  if (bModal) bModal.classList.remove('active');
  if (bBackdrop) bBackdrop.classList.remove('active');
  unlockBodyScroll();

  const tl = gsap.timeline({
    onComplete: () => {
      prev.classList.remove('active');
      next.classList.add('active');
      app.currentPage = pageId;
      app.isTransitioning = false;
      location.hash = pageId;
      updateNavActive(pageId);
      initPageSpecific(pageId);
      if (app.lenis) app.lenis.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }
  });

  tl.to(prev.querySelector('.page-container'), { opacity: 0, y: 30, duration: 0.3, ease: 'power2.in' })
    .set(prev, { display: 'none' })
    .set(next, { display: 'flex' })
    .set(next.querySelector('.page-container'), { opacity: 0, y: 30 })
    .to(next.querySelector('.page-container'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
}

function updateNavActive(pageId) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const active = document.querySelector(`.nav-link[href="#${pageId}"]`);
  if (active) active.classList.add('active');
}

function initPageSpecific(pageId) {
  if (pageId === 'home') { initHomePage(); initCEOPage(); initHomeAboutSection(); }
  if (pageId === 'products') { initAboutPage(); initProductsPage(); }
  if (pageId === 'services') { initServicesPage(); initServicesModal(); }
  if (pageId === 'case-studies') initCaseStudiesModal();
  if (pageId === 'technologies') initTechnologiesPage();
  if (pageId === 'ai-agents') initAIAgentsPage();
  if (pageId === 'blog') { initBlogPage(); initBlogModal(); }
  if (pageId === 'contact') initContactPage();
}

/* ========== HOME PAGE ========== */
function initHomePage() {
  initParticles();
  initCyberGrid();
  initDrones();
  initVideoAdSection();
  const heroTitle = document.querySelector('.hero-title');
  const subtitle = document.querySelector('.hero-subtitle-line');
  const tagline = document.querySelector('.hero-tagline');
  if (heroTitle && typeof gsap !== 'undefined') {
    gsap.fromTo(heroTitle,
      { opacity: 0, scale: 0.85, filter: 'blur(12px)', letterSpacing: '60px' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: 'clamp(10px, 3vw, 40px)', duration: 1.8, ease: 'power3.out', delay: 0.3 }
    );
    if (subtitle) gsap.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.1 });
    if (tagline) {
      const finalText = tagline.textContent;
      tagline.textContent = '';
      tagline.style.opacity = '1';
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let revealed = 0;
      let cycling = true;
      const iv = setInterval(() => {
        if (!cycling) { clearInterval(iv); return; }
        if (revealed >= finalText.length) {
          tagline.textContent = finalText;
          cycling = false;
          clearInterval(iv);
          return;
        }
        const parts = finalText.split('');
        const display = parts.map((c, i) => {
          if (i < revealed) return c;
          if (i === revealed) {
            if (c === ' ') return ' ';
            const upper = c.toUpperCase();
            const idx = alphabet.indexOf(upper);
            if (idx >= 0) {
              const cycleChar = alphabet[Math.floor(Math.random() * (idx + 1))];
              return upper === c ? cycleChar : cycleChar.toLowerCase();
            }
            return c;
          }
          return '';
        }).join('');
        tagline.textContent = display;
        const currentChar = parts[revealed];
        if (currentChar === ' ') {
          revealed++;
        } else {
          const upper = currentChar.toUpperCase();
          const idx = alphabet.indexOf(upper);
          if (idx >= 0 && Math.random() < 0.15) revealed++;
          else if (idx < 0) revealed++;
        }
      }, 40);
    }
  }
}

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || app.particles) return;
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const count = Math.min(60, Math.floor(w * h / 12000));
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.3 + 0.1
    });
  }

  let animId;
  function drawParticles() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192,192,192,${p.a})`;
      ctx.fill();
    }
    animId = requestAnimationFrame(drawParticles);
  }
  drawParticles();

  const resizeHandler = debounce(() => {
    const nw = canvas.parentElement.clientWidth;
    const nh = canvas.parentElement.clientHeight;
    canvas.width = nw;
    canvas.height = nh;
  }, 200);
  window.addEventListener('resize', resizeHandler);

  app.particles = { ctx, particles, animId, resizeHandler };
}

function initCyberGrid() {
  const grid = document.getElementById('cyber-grid');
  if (!grid) return;
  grid.classList.add('cyber-grid');
  let offset = 0;
  let running = true;
  function animateGrid() {
    if (!running) return;
    offset -= 0.3;
    grid.style.backgroundPosition = `0 ${offset}px`;
    requestAnimationFrame(animateGrid);
  }
  animateGrid();
  app._cyberGridStop = () => { running = false; };
}

let dronesRunning = false;
let dronesRAF = null;
let warRunning = false;

function initDrones() {
  const container = document.getElementById('hero-drones');
  if (!container || container.dataset.swarmReady) return;
  container.dataset.swarmReady = 'true';

  const droneSVG = '<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><line x1="12" y1="5" x2="12" y2="2" stroke="#C0C0C0" stroke-width="0.8"/><line x1="12" y1="19" x2="12" y2="22" stroke="#C0C0C0" stroke-width="0.8"/><line x1="5" y1="12" x2="2" y2="12" stroke="#C0C0C0" stroke-width="0.8"/><line x1="19" y1="12" x2="22" y2="12" stroke="#C0C0C0" stroke-width="0.8"/><line x1="7" y1="7" x2="5" y2="5" stroke="#C0C0C0" stroke-width="0.6"/><line x1="17" y1="7" x2="19" y2="5" stroke="#C0C0C0" stroke-width="0.6"/><line x1="7" y1="17" x2="5" y2="19" stroke="#C0C0C0" stroke-width="0.6"/><line x1="17" y1="17" x2="19" y2="19" stroke="#C0C0C0" stroke-width="0.6"/><circle cx="12" cy="12" r="2" stroke="#C0C0C0" stroke-width="0.8"/><path d="M7 7 L7 4.5 C7 3.5 7.5 2.5 8.5 2.5 L9.5 2.5" stroke="#C0C0C0" stroke-width="0.6" fill="none"/><path d="M17 7 L17 4.5 C17 3.5 16.5 2.5 15.5 2.5 L14.5 2.5" stroke="#C0C0C0" stroke-width="0.6" fill="none"/><path d="M7 17 L7 19.5 C7 20.5 7.5 21.5 8.5 21.5 L9.5 21.5" stroke="#C0C0C0" stroke-width="0.6" fill="none"/><path d="M17 17 L17 19.5 C17 20.5 16.5 21.5 15.5 21.5 L14.5 21.5" stroke="#C0C0C0" stroke-width="0.6" fill="none"/><circle cx="8.5" cy="4" r="1.2" stroke="#C0C0C0" stroke-width="0.6"/><circle cx="15.5" cy="4" r="1.2" stroke="#C0C0C0" stroke-width="0.6"/><circle cx="8.5" cy="20" r="1.2" stroke="#C0C0C0" stroke-width="0.6"/><circle cx="15.5" cy="20" r="1.2" stroke="#C0C0C0" stroke-width="0.6"/></svg>';

  const w = container.offsetWidth || window.innerWidth;
  const h = container.offsetHeight || window.innerHeight;
  const small = [];

  const count = 15;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'drone-swarm';
    el.innerHTML = droneSVG;
    container.appendChild(el);
    small.push({
      el,
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      tx: Math.random() * w,
      ty: Math.random() * h,
      phase: Math.random() * Math.PI * 2,
      spd: 0.4 + Math.random() * 0.8
    });
  }

  // Add extra background drones behind HALZIZ text
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'drone-swarm';
    el.innerHTML = droneSVG;
    el.style.left = Math.random() * w + 'px';
    el.style.top = Math.random() * h + 'px';
    el.style.transform = `translate(-50%, -50%) scale(${2 + Math.random() * 3})`;
    container.appendChild(el);
    small.push({
      el,
      x: parseFloat(el.style.left),
      y: parseFloat(el.style.top),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      tx: Math.random() * w,
      ty: Math.random() * h,
      phase: Math.random() * Math.PI * 2,
      spd: 0.15 + Math.random() * 0.25
    });
  }

  dronesRunning = true;
  let t = 0;

  function animateSmall() {
    if (!dronesRunning) return;
    t += 0.016;

    // Compute swarm center for cohesion
    let cx = 0, cy = 0;
    small.forEach(d => { cx += d.x; cy += d.y; });
    cx /= small.length;
    cy /= small.length;

    small.forEach((d, i) => {
      const toX = d.tx - d.x;
      const toY = d.ty - d.y;
      const dist = Math.sqrt(toX * toX + toY * toY);
      if (dist < 50) {
        d.tx = Math.random() * (w + 100) - 50;
        d.ty = Math.random() * (h + 100) - 50;
      }

      // Steering toward target
      d.vx += (toX / Math.max(dist, 1)) * 0.006;
      d.vy += (toY / Math.max(dist, 1)) * 0.006;

      // Cohesion — pull toward swarm center
      const cohX = cx - d.x;
      const cohY = cy - d.y;
      const cohDist = Math.sqrt(cohX * cohX + cohY * cohY);
      d.vx += (cohX / Math.max(cohDist, 1)) * 0.001;
      d.vy += (cohY / Math.max(cohDist, 1)) * 0.001;

      // Separation — push away from nearby drones
      for (let j = i + 1; j < small.length; j++) {
        const dx = d.x - small[j].x;
        const dy = d.y - small[j].y;
        const sepDist = Math.sqrt(dx * dx + dy * dy);
        if (sepDist < 60 && sepDist > 0) {
          const push = 0.002 / sepDist;
          d.vx += (dx / sepDist) * push;
          d.vy += (dy / sepDist) * push;
        }
      }

      // Organic wobble
      d.vx += Math.sin(t * d.spd + d.phase) * 0.08;
      d.vy += Math.cos(t * d.spd * 0.8 + d.phase * 1.3) * 0.08;

      const maxV = 2;
      const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
      if (spd > maxV) { d.vx = (d.vx / spd) * maxV; d.vy = (d.vy / spd) * maxV; }

      d.x += d.vx;
      d.y += d.vy;

      // Wrap around edges
      if (d.x < -100) d.x = w + 100;
      if (d.x > w + 100) d.x = -100;
      if (d.y < -100) d.y = h + 100;
      if (d.y > h + 100) d.y = -100;

      const angle = Math.atan2(d.vy, d.vx) * (180 / Math.PI);
      d.el.style.left = d.x + 'px';
      d.el.style.top = d.y + 'px';
      d.el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      d.el.style.opacity = i < count ? '0.6' : '0.3';
    });
    dronesRAF = requestAnimationFrame(animateSmall);
  }
  animateSmall();
}

function stopDrones() {
  dronesRunning = false;
  warRunning = false;
  if (dronesRAF) {
    cancelAnimationFrame(dronesRAF);
    dronesRAF = null;
  }
}

// Hide scroll indicator when past hero section
window.addEventListener('scroll', () => {
  const el = document.querySelector('.scroll-indicator');
  const hero = document.getElementById('home');
  if (!el || !hero) return;
  const rect = hero.getBoundingClientRect();
  el.classList.toggle('hidden', rect.bottom < 0);
}, { passive: true });

/* ========== CEO SECTION ========== */
const ceoData = {
  henok: {
    img: 'assets/CeoProfile1.png',
    name: 'Henok Akriso',
    degree: 'Computer Scientist',
    role: 'Chief Executive Officer',
    phone: '+251 912 172 646',
    social: { linkedin: '#', twitter: '#', email: 'mailto:henok@halziz.et', telegram: '#' },
    website: 'https://henokakriso.com',
    bio: [
      'Henok Akriso co-founded HALZIZ with a vision to architect Ethiopia\'s intelligent infrastructure from the ground up. With a Bachelor of Science in Computer Science, he brings deep expertise in systems architecture, embedded computing, and digital infrastructure strategy.',
      'Under his leadership, HALZIZ has grown from a specialized engineering consultancy into Ethiopia\'s premier advanced technology company   The Monolithic Matrix of Tech   deploying mission-critical systems across cybersecurity, AI, and drone technology.',
      'Henok\'s engineering philosophy centers on building resilient, sovereign infrastructure   systems that are designed for Ethiopia\'s unique challenges and built to global standards. He has personally overseen the architecture of national-scale network deployments and smart city initiatives.'
    ]
  },
  johnson: {
    img: 'assets/CeoProfile2.jpg',
    name: 'Johnson Ayalew',
    degree: 'Computer Scientist',
    role: 'Chief Executive Officer',
    phone: '+251 945 118 608',
    social: { linkedin: '#', twitter: '#', email: 'mailto:johnson@halziz.et', telegram: '#' },
    website: 'https://halziz.et',
    bio: [
      'Johnson Ayalew is an AI Automation Engineer and Full-Stack Software Developer passionate about building intelligent, scalable, and high-performance software solutions. He specializes in AI, automation, backend systems, and modern web technologies, creating reliable software that solves complex business challenges. Driven by innovation, precision, and continuous learning, he is committed to delivering technology that empowers businesses and drives digital transformation.'
    ]
  }
};

function initCEOPage() {
  const cards = document.querySelectorAll('.ceo-card');
  const modal = document.getElementById('ceo-modal');
  const backdrop = document.getElementById('ceo-modal-backdrop');
  const exitBtn = document.getElementById('ceo-modal-exit');
  const content = document.getElementById('ceo-modal-content');

  if (!modal || !backdrop || !exitBtn || !content) return;
  if (modal.dataset.ceoReady) return;
  modal.dataset.ceoReady = 'true';

  let ciaTimer = null;

  function closeModal() {
    modal.classList.remove('active');
    backdrop.classList.remove('active');
    if (ciaTimer) { clearTimeout(ciaTimer); ciaTimer = null; }
    unlockBodyScroll();
  }

  exitBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.ceo;
      const data = ceoData[key];
      if (!data) return;

      modal.className = 'ceo-modal ceo-modal-cia';
      /* CIA-style modal layout */
      content.innerHTML = `
        <div class="cia-layout">
          <div class="cia-image-panel">
            <div class="cia-scan-wrap">
              <img src="${data.img}" alt="${data.name}" class="cia-scan-img">
              <div class="cia-scan-overlay"></div>
              <div class="cia-scan-line"></div>
            </div>
            <div class="cia-scan-status"><span class="cia-dot"></span> BIO SCAN ACTIVE</div>
            <div class="cia-data-grid">
              <div class="cia-data-item"><span class="cia-data-label">NAME</span><span class="cia-data-value">${data.name}</span></div>
              <div class="cia-data-item"><span class="cia-data-label">STATUS</span><span class="cia-data-value">ACTIVE</span></div>
              <div class="cia-data-item"><span class="cia-data-label">LEVEL</span><span class="cia-data-value">BSC</span></div>
              <div class="cia-data-item"><span class="cia-data-label">TITLE</span><span class="cia-data-value">${data.role}</span></div>
              <div class="cia-data-item"><span class="cia-data-label">DEPARTMENT</span><span class="cia-data-value" style="color:#C0C0C0;">Computer Science</span></div>
            </div>
          </div>
          <div class="cia-bio-panel">
            <div class="cia-header">
              <span class="cia-classified">CLASSIFIED PERSONNEL FILE</span>
              <span class="cia-ref">REF: HAL-${data.name.slice(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}</span>
            </div>
            <div class="cia-bio">
              ${data.bio.map(line => `<p class="cia-bio-line">${line}</p>`).join('')}
            </div>
          </div>
          <div class="cia-side-panel">
            <div class="cia-stats-row">
              <div class="cia-stat">
                <span class="cia-stat-num">7+</span>
                <span class="cia-stat-label">Years Exp</span>
              </div>
              <div class="cia-stat">
                <span class="cia-stat-num">${key === 'henok' ? '9' : '11'}+</span>
                <span class="cia-stat-label">Projects</span>
              </div>
              <div class="cia-stat">
                <span class="cia-stat-num">4.9</span>
                <span class="cia-stat-label">Rating</span>
              </div>
            </div>
            <div class="cia-contact-row">
              <span class="cia-phone">${data.phone}</span>
            </div>
            <div class="cia-social-row">
              <a href="${data.social.linkedin}" target="_blank" class="cia-social-link" title="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
              <a href="${data.social.twitter}" target="_blank" class="cia-social-link" title="Twitter"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
              <a href="${data.social.email}" class="cia-social-link" title="Email"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg></a>
              <a href="${data.social.telegram}" target="_blank" class="cia-social-link" title="Telegram"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>
              <a href="https://${data.website}" target="_blank" class="cia-social-link cia-portfolio" title="Portfolio"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></a>
            </div>
          </div>
        </div>
      `;
      modal.classList.add('active');
      backdrop.classList.add('active');
      lockBodyScroll();

      const items = content.querySelectorAll('[data-delay]');
      items.forEach(el => {
        const delay = parseInt(el.dataset.delay) || 0;
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
        ciaTimer = setTimeout(() => {
          el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay + 300);
      });
    });
  });
}

/* ========== HOME ABOUT SECTION ========== */
function initHomeAboutSection() {
  const section = document.querySelector('.home-about-section');
  if (!section) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const timelineItems = section.querySelectorAll('.timeline-item');
        const statNumbers = section.querySelectorAll('.stat-number');
        const aboutContent = section.querySelectorAll('.about-content > *');
        const tl = gsap.timeline();
        tl.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        if (timelineItems.length) {
          tl.fromTo(timelineItems,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
            '-=0.2'
          );
          timelineItems.forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), 300 + i * 150);
          });
        }
        if (statNumbers.length) {
          tl.fromTo(statNumbers,
            { opacity: 0, scale: 0.5 },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' },
            '-=0.3'
          );
          setTimeout(animateCounters, 800);
        }
        if (aboutContent.length) {
          tl.fromTo(aboutContent,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
            '-=0.2'
          );
        }
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.2 });
  observer.observe(section);
}

/* ========== ABOUT PAGE ========== */
function initAboutPage() {
  const items = document.querySelectorAll('.timeline-item');
  items.forEach((item, i) => {
    setTimeout(() => item.classList.add('visible'), i * 200 + 100);
  });
  animateCounters();
}

function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    let val = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const iv = setInterval(() => {
      val += step;
      if (val >= target) { val = target; clearInterval(iv); }
      counter.textContent = val + (target === 98 || target === 100 ? '%' : '');
    }, 30);
  });
}

/* ========== SERVICES PAGE ========== */
function initServicesPage() {
  initServiceCards();
  initServiceLottie();
}

function initServiceCards() {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)';
    });
  });
}

function initServiceLottie() {
  const container = document.getElementById('services-lottie');
  if (!container || !window.lottie) return;
  try {
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'Payment Instructions.json'
    });
    app.lottieInstances.services = anim;
  } catch (e) { /* ignore */ }
}

/* ========== SERVICES MODAL ========== */
const serviceDetails = [
  {
    name: 'Desktop Systems',
    desc: 'Enterprise-grade workstation engineering, hardware integration, and custom computing solutions for demanding computational environments.',
    longDesc: 'Our desktop systems engineering service covers the complete lifecycle of enterprise computing solutions. From custom workstation specification and assembly to performance tuning and maintenance, we deliver systems that match your exact computational requirements. Each system is built with precision-selected components, tested under load, and optimized for your specific workflow. We support Linux, Windows, and dual-boot configurations with remote management capabilities.',
    type: 'Hardware / Engineering',
    duration: '2-4 weeks',
    rate: '4.8 / 5.0'
  },
  {
    name: 'Network Engineering',
    desc: 'End-to-end network architecture, fiber infrastructure, mesh networks, and enterprise connectivity solutions.',
    longDesc: 'Our network engineering team designs, deploys, and maintains enterprise-grade network infrastructure. We specialize in fiber optic backbone deployment, wireless mesh networks, SD-WAN implementation, and multi-site connectivity solutions. Every deployment follows industry best practices for redundancy, security, and performance optimization. We provide 24/7 network monitoring and rapid incident response.',
    type: 'Infrastructure / Network',
    duration: '4-8 weeks',
    rate: '4.9 / 5.0'
  },
  {
    name: 'Cybersecurity',
    desc: 'Advanced threat detection, security architecture, penetration testing, and 24/7 security operations center services.',
    longDesc: 'Our cybersecurity division offers comprehensive security services including vulnerability assessments, penetration testing, security architecture design, and managed security operations. We implement zero-trust architectures, SIEM solutions, and incident response frameworks tailored to your organization\'s risk profile. Our team of certified security professionals provides 24/7 monitoring and rapid threat containment.',
    type: 'Security / Compliance',
    duration: 'Ongoing',
    rate: '4.9 / 5.0'
  },
  {
    name: 'Embedded Systems',
    desc: 'Firmware development, IoT sensor networks, real-time control systems, and hardware-software co-design.',
    longDesc: 'We engineer embedded systems for industrial automation, smart infrastructure, and IoT applications. Our services include firmware development in C/C++ and Rust, PCB design consultation, real-time operating system integration, and wireless sensor network deployment. We specialize in low-power designs for remote monitoring and control applications with secure over-the-air update capabilities.',
    type: 'Hardware / Firmware',
    duration: '4-12 weeks',
    rate: '4.7 / 5.0'
  },
  {
    name: 'AI Integration',
    desc: 'Machine learning deployment, neural network architecture, computer vision systems, and intelligent automation pipelines.',
    longDesc: 'Our AI integration service delivers end-to-end machine learning solutions. We design and deploy neural networks for computer vision, natural language processing, predictive analytics, and intelligent automation. Our team handles data collection, model training, deployment optimization, and ongoing model monitoring. We integrate AI capabilities into existing infrastructure with minimal disruption.',
    type: 'Software / AI',
    duration: '6-16 weeks',
    rate: '4.8 / 5.0'
  },
  {
    name: 'Infrastructure Solutions',
    desc: 'Data center design, cloud architecture, smart building systems, and enterprise IT infrastructure management.',
    longDesc: 'We provide comprehensive infrastructure solutions including data center design and buildout, cloud architecture (AWS, Azure, GCP), hybrid cloud deployment, and smart building systems integration. Our solutions are designed for scalability, energy efficiency, and high availability. We manage the complete lifecycle from feasibility study through implementation and ongoing operations.',
    type: 'Infrastructure / Cloud',
    duration: '8-24 weeks',
    rate: '4.8 / 5.0'
  },
  {
    name: 'Smart Monitoring',
    desc: 'Real-time surveillance systems, sensor fusion, predictive maintenance, and intelligent environmental monitoring.',
    longDesc: 'Our smart monitoring solutions combine IoT sensors, video analytics, and AI-powered anomaly detection for comprehensive environmental and asset monitoring. We deploy integrated surveillance systems with facial recognition, license plate recognition, and behavioral analysis. Our predictive maintenance platform uses machine learning to anticipate equipment failures before they occur.',
    type: 'IoT / Surveillance',
    duration: '4-12 weeks',
    rate: '4.7 / 5.0'
  },
  {
    name: 'Drone Systems',
    desc: 'Autonomous aerial vehicles, drone fleet management, aerial surveillance, and delivery drone infrastructure.',
    longDesc: 'We develop and deploy autonomous drone systems for aerial surveillance, infrastructure inspection, logistics, and emergency response. Our drone fleet management platform enables coordinated multi-drone operations with AI-powered navigation, obstacle avoidance, and mission planning. We provide end-to-end solutions including drone hardware, ground control stations, and regulatory compliance support.',
    type: 'Hardware / Autonomous',
    duration: '8-16 weeks',
    rate: '4.9 / 5.0'
  },
  {
    name: 'Digital Transformation',
    desc: 'End-to-end digital strategy, process automation, legacy system modernization, and technology consulting.',
    longDesc: 'Our digital transformation service helps organizations modernize their operations through strategic technology adoption. We assess current systems, identify automation opportunities, and implement digital solutions that drive efficiency and growth. Our services include workflow automation, legacy system migration, cloud adoption strategy, and digital skills training for your team.',
    type: 'Consulting / Strategy',
    duration: '4-12 weeks',
    rate: '4.6 / 5.0'
  }
];

function initServicesModal() {
  const backdrop = document.getElementById('service-modal-backdrop');
  const modal = document.getElementById('service-modal');
  const exitBtn = document.getElementById('service-modal-exit');
  const content = document.getElementById('service-modal-content');
  const cards = document.querySelectorAll('.service-card');

  if (!backdrop || !modal || !exitBtn || !content || !cards.length) return;

  if (modal.dataset.serviceReady) return;
  modal.dataset.serviceReady = '1';

  function closeModal() {
    backdrop.classList.remove('active');
    modal.classList.remove('active');
    unlockBodyScroll();
  }

  exitBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  function getSvgIcon(idx) {
    const card = cards[idx];
    if (!card) return '';
    const svg = card.querySelector('.service-icon svg');
    return svg ? svg.outerHTML : '';
  }

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      const data = serviceDetails[idx];
      if (!data) return;

      const iconSvg = getSvgIcon(idx);

      content.innerHTML = `
        <div class="sm-layout">
          <div class="sm-image-panel">
            <div class="sm-icon-wrap">
              ${iconSvg}
              <div class="sm-scan-line"></div>
            </div>
            <div class="sm-status">
              <span class="sm-dot"></span>
              SERVICE ACTIVE
            </div>
            <div class="sm-data-grid">
              <div class="sm-data-item">
                <span class="sm-data-label">NAME</span>
                <span class="sm-data-value">${data.name}</span>
              </div>
              <div class="sm-data-item">
                <span class="sm-data-label">TYPE</span>
                <span class="sm-data-value">${data.type}</span>
              </div>
              <div class="sm-data-item">
                <span class="sm-data-label">DURATION</span>
                <span class="sm-data-value">${data.duration}</span>
              </div>
              <div class="sm-data-item">
                <span class="sm-data-label">PROJECTS</span>
                <span class="sm-data-value">${Math.floor(Math.random() * 30 + 10)}+</span>
              </div>
              <div class="sm-data-item">
                <span class="sm-data-label">RATING</span>
                <span class="sm-data-value">${data.rate}</span>
              </div>
            </div>
          </div>
          <div class="sm-info-panel">
            <div class="sm-name">${data.name}</div>
            <div class="sm-desc">${data.desc}</div>
            <div class="sm-long-desc">${data.longDesc}</div>
          </div>
          <div class="sm-form-panel">
            <div class="sm-form-title">Request This Service</div>
            <form class="sm-form">
              <input type="text" class="sm-form-input" placeholder="Your Name" required>
              <input type="email" class="sm-form-input" placeholder="Your Email" required>
              <input type="tel" class="sm-form-input" placeholder="Your Phone">
              <textarea class="sm-form-textarea" placeholder="Tell us about your requirements..." rows="3"></textarea>
              <button type="submit" class="sm-form-submit">Submit Request</button>
            </form>
          </div>
        </div>
      `;

      modal.classList.add('active');
      backdrop.classList.add('active');
      lockBodyScroll();

      const form = content.querySelector('.sm-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const name = this.querySelector('input[type="text"]').value.trim();
          const email = this.querySelector('input[type="email"]').value.trim();
          const phone = this.querySelector('input[type="tel"]').value.trim();
          const msg = this.querySelector('textarea').value.trim();
          if (!name) { showMiniToast('ERROR: NAME FIELD REQUIRED'); return; }
          if (!email) { showMiniToast('ERROR: EMAIL FIELD REQUIRED'); return; }
          if (!email.includes('@')) { showMiniToast('ERROR: INVALID EMAIL FORMAT'); return; }
          const subject = encodeURIComponent(`Service Request: ${data.name}`);
          const body = encodeURIComponent(
            `Service: ${data.name}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nRequirements:\n${msg}`
          );
          window.location.href = `mailto:contact@halziz.com?subject=${subject}&body=${body}`;
          closeModal();
        });
      }
    });
  });
}
/* ========== TECHNOLOGIES PAGE ========== */
const techData = [
  { id: 'C', name: 'C', color: '#C0C0C0', desc: 'Low-level systems programming for embedded hardware, firmware, and real-time control. Used extensively in kernel development, device drivers, and microcontroller firmware for critical infrastructure systems. The foundation upon which HALZIZ builds its high-performance embedded solutions.' },
  { id: 'CPP', name: 'C++', color: '#A9A9A9', desc: 'High-performance systems, game engines, and hardware abstraction layers. Object-oriented capabilities enable complex system architectures for autonomous vehicle control and real-time data processing. The language of choice for performance-critical infrastructure components.' },
  { id: 'CS', name: 'C#', color: '#808080', desc: 'Enterprise application frameworks and cross-platform software development. Powers HALZIZ\'s .NET-based backend services and Windows desktop applications for enterprise clients. Strong typing and garbage collection enable rapid development of robust business systems.' },
  { id: 'Java', name: 'Java', color: '#C0C0C0', desc: 'Robust backend systems, Android development, and enterprise middleware. Platform independence makes it ideal for cross-deployment server architectures and microservice ecosystems. Powers the middleware layer of numerous enterprise HALZIZ deployments.' },
  { id: 'Kotlin', name: 'Kotlin', color: '#A9A9A9', desc: 'Modern JVM language for Android, server-side, and multiplatform apps. Concise syntax and null safety reduce boilerplate and runtime errors in production systems. Increasingly used by HALZIZ for modern Android-based monitoring applications.' },
  { id: 'Python', name: 'Python', color: '#808080', desc: 'AI/ML pipelines, automation, data analysis, and backend microservices. The primary language for HALZIZ\'s neural network training, computer vision models, and data processing infrastructure. Extensive library ecosystem enables rapid prototyping of intelligent systems.' },
  { id: 'JS', name: 'JS', color: '#C0C0C0', desc: 'Dynamic web apps, real-time dashboards, and interactive visualization. Powers the frontend of HALZIZ\'s monitoring platforms and client-facing analytics dashboards. Event-driven nature makes it ideal for real-time data streaming and live-updating interfaces.' },
  { id: 'TS', name: 'TS', color: '#A9A9A9', desc: 'Type-safe scalable application frameworks and enterprise architecture. Adds static typing to JavaScript for improved code quality and maintainability in large-scale projects. HALZIZ uses TypeScript for all major web application development.' },
  { id: 'PHP', name: 'PHP', color: '#808080', desc: 'Server-side scripting and backend platforms for scalable web systems. Powers content management systems and RESTful API endpoints for legacy infrastructure. Continues to serve as a reliable backend language for HALZIZ\'s web hosting solutions.' },
  { id: 'Ruby', name: 'Ruby', color: '#C0C0C0', desc: 'Elegant scripting, rapid prototyping, and automation frameworks. The Ruby on Rails framework enables fast development of database-backed web applications. Used by HALZIZ for internal tooling and rapid prototyping of new service concepts.' },
  { id: 'Go', name: 'Go', color: '#A9A9A9', desc: 'Concurrent systems programming and cloud-native microservices. Built-in concurrency primitives make it ideal for high-throughput network services and distributed systems. HALZIZ deploys Go-based microservices for network monitoring and data pipeline processing.' },
  { id: 'Rust', name: 'Rust', color: '#808080', desc: 'Memory-safe systems programming for performance-critical infrastructure. Zero-cost abstractions and ownership model eliminate entire classes of memory bugs at compile time. Used by HALZIZ for secure firmware components and safety-critical embedded systems.' },
  { id: 'Dart', name: 'Dart', color: '#C0C0C0', desc: 'Cross-platform app development with Flutter framework ecosystem. Compiles to native code for mobile, desktop, and web from a single codebase. HALZIZ leverages Flutter for building cross-platform monitoring applications and field deployment tools.' },
  { id: 'Swift', name: 'Swift', color: '#A9A9A9', desc: 'Native iOS/macOS development and performance-optimized applications. Modern language features and strong typing enable secure mobile application development. Used for HALZIZ\'s iOS companion apps for drone control and field data collection.' },
  { id: 'Scala', name: 'Scala', color: '#808080', desc: 'Functional programming for scalable data processing systems. Combines object-oriented and functional paradigms for expressive, concise code. Powers HALZIZ\'s big data processing pipelines and analytics infrastructure.' },
  { id: 'HTML5', name: 'HTML5', color: '#C0C0C0', desc: 'Semantic markup for immersive interfaces and data visualization. The foundational layer for all HALZIZ web-based dashboards and client portals. Modern features enable offline support, geolocation, and rich media integration without plugins.' },
  { id: 'CSS3', name: 'CSS3', color: '#A9A9A9', desc: 'Advanced styling, animations, and responsive engineering. Enables cinematic UI experiences with GPU-accelerated animations and responsive layouts. HALZIZ\'s signature monochromatic aesthetic is crafted entirely through modern CSS techniques.' },
  { id: 'React', name: 'React', color: '#808080', desc: 'Component-based UI for dynamic single-page applications. Virtual DOM ensures efficient rendering of complex, data-heavy interfaces. The primary frontend framework for HALZIZ\'s interactive monitoring dashboards and management consoles.' },
  { id: 'Vue', name: 'Vue', color: '#C0C0C0', desc: 'Progressive JavaScript framework for modern web interfaces. Gentle learning curve combined with powerful reactivity makes it ideal for rapid interface development. Used by HALZIZ for internal administration panels and client reporting portals.' },
  { id: 'Angular', name: 'Angular', color: '#A9A9A9', desc: 'Full-featured TypeScript framework for enterprise web apps. Comprehensive tooling and dependency injection enable large-scale application architecture. Selected by HALZIZ for complex enterprise resource management systems.' },
  { id: 'Node', name: 'Node.js', color: '#808080', desc: 'Server-side JavaScript runtime for scalable network applications. Event-driven, non-blocking I/O model excels at handling concurrent connections and real-time data. The backbone of HALZIZ\'s API gateway infrastructure and real-time communication services.' },
  { id: 'Express', name: 'Express', color: '#C0C0C0', desc: 'Minimalist web framework for building RESTful APIs. Middleware architecture enables modular, composable server-side logic. Used extensively in HALZIZ\'s microservice ecosystem for lightweight API endpoints.' },
  { id: 'GraphQL', name: 'GraphQL', color: '#A9A9A9', desc: 'Query language for efficient API data fetching and manipulation. Clients specify exactly what data they need, eliminating over-fetching and under-fetching. Implemented by HALZIZ for high-efficiency data APIs serving complex dashboard visualizations.' },
  { id: 'Next', name: 'Next.js', color: '#808080', desc: 'React framework for production-grade server-rendered applications. Server-side rendering improves SEO and initial load performance for public-facing web properties. Used by HALZIZ for the HALZIZ website and client-facing documentation portals.' },
  { id: 'Svelte', name: 'Svelte', color: '#C0C0C0', desc: 'Compiled UI framework for highly optimized web applications. Shifts work from browser to compile time, producing minimal, high-performance JavaScript bundles. Evaluated by HALZIZ for resource-constrained dashboard deployments on edge devices.' },
  { id: 'SQL', name: 'SQL', color: '#A9A9A9', desc: 'Relational data modeling, query optimization, and distributed storage. The universal language for structured data management across all HALZIZ database systems. Powers everything from client records to infrastructure configuration databases.' },
  { id: 'Mongo', name: 'MongoDB', color: '#808080', desc: 'NoSQL document database for flexible and scalable data storage. Schema-less design enables rapid iteration on data models for evolving projects. Used by HALZIZ for IoT sensor data storage and content management systems.' },
  { id: 'Redis', name: 'Redis', color: '#C0C0C0', desc: 'In-memory data structure store for caching and real-time systems. Sub-millisecond latency makes it ideal for session management, real-time analytics, and message brokering. HALZIZ uses Redis for caching layers and real-time data streaming infrastructure.' },
  { id: 'ES', name: 'ESearch', color: '#A9A9A9', desc: 'Distributed search and analytics engine for large-scale data. Full-text search capabilities power HALZIZ\'s log analysis platforms and document search systems. Aggregation framework enables real-time analytics on streaming infrastructure data.' },
  { id: 'Cass', name: 'Cassandra', color: '#808080', desc: 'Highly scalable NoSQL database for mission-critical workloads. Linear scalability and no single point of failure make it ideal for distributed infrastructure monitoring. Deployed by HALZIZ for time-series sensor data across smart city deployments.' },
  { id: 'SQLite', name: 'SQLite', color: '#C0C0C0', desc: 'Embedded relational database for edge devices and mobile apps. Zero-configuration engine requires no server process, ideal for embedded systems and field devices. Used by HALZIZ in drone flight controllers and IoT edge nodes for local data persistence.' },
  { id: 'Dynamo', name: 'DynamoDB', color: '#A9A9A9', desc: 'Fully managed NoSQL key-value and document database service. Single-digit millisecond performance at any scale for cloud-native applications. Integrated by HALZIZ into AWS-based deployments for high-throughput event logging and state management.' },
  { id: 'Linux', name: 'GNU/Linux', color: '#808080', desc: 'Enterprise OS for servers, embedded devices, and cloud infrastructure. The backbone of HALZIZ\'s infrastructure stack, powering everything from edge sensors to data center servers. Custom kernel builds optimize performance for specific deployment scenarios.' },
  { id: 'Docker', name: 'Docker', color: '#C0C0C0', desc: 'Container platform for consistent application deployment. Ensures identical environments across development, testing, and production. Used by HALZIZ to package and deploy all microservices with deterministic dependencies.' },
  { id: 'K8s', name: 'Kubernetes', color: '#A9A9A9', desc: 'Container orchestration for automated deployment and scaling. Self-healing clusters ensure high availability and zero-downtime deployments across infrastructure. HALZIZ manages production clusters for client deployments requiring elastic scalability.' },
  { id: 'Nginx', name: 'Nginx', color: '#808080', desc: 'High-performance web server, reverse proxy, and load balancer. Event-driven architecture handles tens of thousands of concurrent connections with minimal resource usage. Serves as the entry point for all HALZIZ web services, providing TLS termination and request routing.' },
  { id: 'Terra', name: 'Terraform', color: '#C0C0C0', desc: 'Infrastructure-as-code for provisioning cloud resources. Declarative configuration enables version-controlled, reproducible infrastructure deployments. HALZIZ uses Terraform to manage multi-cloud deployments across AWS, Azure, and GCP.' },
  { id: 'Ansible', name: 'Ansible', color: '#A9A9A9', desc: 'Automation engine for configuration management and orchestration. Agentless architecture simplifies deployment across heterogeneous infrastructure. Used by HALZIZ for automated server provisioning, application deployment, and security compliance automation.' },
  { id: 'Prom', name: 'Prometheus', color: '#808080', desc: 'Monitoring and alerting toolkit for cloud-native environments. Pull-based metrics collection and powerful query language enable comprehensive infrastructure observability. Deployed by HALZIZ as the primary monitoring solution for client infrastructure stacks.' },
  { id: 'TCP', name: 'TCP/IP', color: '#C0C0C0', desc: 'Core internet protocol stack for reliable network communication. Connection-oriented protocol guarantees ordered, error-checked delivery across networks. The fundamental transport layer for all HALZIZ networked systems and communication infrastructure.' },
  { id: 'SDWAN', name: 'SD-WAN', color: '#A9A9A9', desc: 'Software-defined networking for optimized WAN connectivity. Decouples network hardware from control plane for centralized, intelligent traffic management. Deployed by HALZIZ to connect distributed enterprise sites with optimized, secure connectivity.' },
  { id: 'MPLS', name: 'MPLS', color: '#808080', desc: 'Label-switching protocol for high-performance backbone routing. Traffic engineering capabilities enable efficient utilization of network resources with QoS guarantees. Used by HALZIZ in national-scale network backbone deployments for government and enterprise clients.' },
  { id: 'BGP', name: 'BGP', color: '#C0C0C0', desc: 'Internet routing protocol for autonomous system interconnection. The backbone protocol of the global internet, managing routing policies between autonomous systems. HALZIZ engineers configure BGP for multi-homed enterprise networks and data center internet connectivity.' },
  { id: 'DNS', name: 'DNS', color: '#A9A9A9', desc: 'Domain name resolution infrastructure for network addressing. Translates human-readable domain names to machine IP addresses for all network services. HALZIZ deploys redundant DNS infrastructure for high-availability enterprise name resolution.' },
  { id: 'VPN', name: 'VPN', color: '#808080', desc: 'Secure encrypted tunnels for private network communication. Extends private networks across public infrastructure with end-to-end encryption. Implemented by HALZIZ for secure remote access solutions and site-to-site connectivity for distributed enterprises.' },
  { id: 'ZTrust', name: 'Zero Trust', color: '#C0C0C0', desc: 'Security architecture based on never trust, always verify principle. Eliminates implicit trust by requiring continuous authentication and authorization for every access request. HALZIZ architects zero-trust frameworks for enterprise clients requiring defense-in-depth security.' },
  { id: 'SIEM', name: 'SIEM', color: '#A9A9A9', desc: 'Security information and event management for threat detection. Aggregates and correlates security logs from across the infrastructure for real-time threat analysis. HALZIZ operates SIEM platforms providing 24/7 security monitoring and incident response for clients.' },
  { id: 'PKI', name: 'PKI', color: '#808080', desc: 'Public key infrastructure for digital certificate management. Enables trusted digital identities, encryption, and authentication across network systems. HALZIZ implements enterprise PKI solutions for secure internal communications and client-facing services.' },
  { id: 'IDS', name: 'IDS/IPS', color: '#C0C0C0', desc: 'Intrusion detection and prevention systems for network security. Monitor network traffic for suspicious activity and automatically block identified threats. Deployed by HALZIZ as part of comprehensive security stacks for government and financial sector clients.' },
  { id: 'Firewall', name: 'Firewall', color: '#A9A9A9', desc: 'Network security gateway filtering unauthorized access. Stateful inspection and application-layer filtering protect network perimeters from external threats. HALZIZ configures next-generation firewalls with deep packet inspection for enterprise deployments.' },
  { id: 'BC', name: 'Blockchain', color: '#808080', desc: 'Distributed ledger technology for decentralized trust systems. Immutable transaction records enable transparent auditing and tamper-proof data storage. Explored by HALZIZ for supply chain verification and secure document management systems.' },
  { id: 'Encrypt', name: 'Encryption', color: '#C0C0C0', desc: 'Cryptographic protocols for data protection and secure comms. AES-256, RSA, and ECC algorithms ensure data confidentiality at rest and in transit. Implemented across all HALZIZ systems as a fundamental layer of the security architecture.' },
  { id: 'Pentest', name: 'Pen Testing', color: '#A9A9A9', desc: 'Authorized simulated attacks identifying security vulnerabilities. Systematic testing methodology uncovers weaknesses before malicious actors can exploit them. HALZIZ offers penetration testing as a core service, covering network, application, and social engineering vectors.' },
  { id: 'NN', name: 'Neural Nets', color: '#808080', desc: 'Deep learning architectures for pattern recognition and prediction. Multi-layer networks trained on large datasets enable computer vision, speech recognition, and predictive analytics. The core technology behind HALZIZ\'s AI-powered surveillance and threat detection systems.' },
  { id: 'NLP', name: 'NLP', color: '#C0C0C0', desc: 'Natural language processing for text understanding and generation. Enables machines to comprehend, interpret, and generate human language for intelligent interfaces. Integrated into HALZIZ\'s AI agents for command interpretation and automated reporting.' },
  { id: 'CV', name: 'Comp Vision', color: '#A9A9A9', desc: 'Image and video analysis using convolutional neural networks. Enables real-time object detection, facial recognition, and scene understanding from camera feeds. The foundation of HALZIZ\'s AI surveillance platforms and autonomous drone navigation systems.' },
  { id: 'RL', name: 'Reinf Learn', color: '#808080', desc: 'Agent-based learning through environment interaction and rewards. Algorithms learn optimal behaviors through trial and error in simulated or real environments. Applied by HALZIZ to drone swarm coordination and autonomous navigation optimization.' },
  { id: 'AWS', name: 'AWS', color: '#C0C0C0', desc: 'Comprehensive cloud platform for compute, storage, and services. EC2, S3, Lambda, and RDS form the backbone of HALZIZ\'s cloud-native deployments. Primary cloud provider for scalable, pay-as-you-go infrastructure serving enterprise clients.' },
  { id: 'Azure', name: 'Azure', color: '#A9A9A9', desc: 'Microsoft cloud platform for enterprise application hosting. Deep integration with Active Directory and Microsoft enterprise tools enables seamless hybrid cloud deployments. Selected by HALZIZ for clients with existing Microsoft enterprise agreements.' },
  { id: 'GCP', name: 'GCP', color: '#808080', desc: 'Google cloud platform for data analytics and AI workloads. BigQuery, Vertex AI, and TensorFlow integration provide powerful data analytics capabilities. Used by HALZIZ for AI/ML training workloads and large-scale data analytics projects.' },
];

function initTechnologiesPage() {
  initTechSphere3D();
  initTechLottie();
}

function initTechSphere3D() {
  const container = document.getElementById('tech-3d-container');
  if (!container || typeof THREE === 'undefined') return;

  if (app.techScene) {
    if (app.techScene.container === container) return;
    if (app.techScene.cleanup) app.techScene.cleanup();
  }

  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w < 10 || h < 10) {
    setTimeout(initTechSphere3D, 200);
    return;
  }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const bgParticlesGeo = new THREE.BufferGeometry();
    const bgCount = 800;
    const bgPos = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount * 3; i++) bgPos[i] = (Math.random() - 0.5) * 40;
    bgParticlesGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgParticlesMat = new THREE.PointsMaterial({ color: 0x808080, size: 0.04, transparent: true, opacity: 0.4 });
    const bgParticles = new THREE.Points(bgParticlesGeo, bgParticlesMat);
    scene.add(bgParticles);

    const wireframeGeo = new THREE.SphereGeometry(4.6, 32, 24);
    const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true, transparent: true, opacity: 0.04 });
    const wireframeSphere = new THREE.Mesh(wireframeGeo, wireframeMat);
    group.add(wireframeSphere);

    const sphereRadius = 4.6;
    const nodeMeshes = [];
    const allSprites = [];

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    function makeTextSprite(tech, colorHex) {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(size / 2, 60, 0, size / 2, 60, 90);
      grad.addColorStop(0, 'rgba(192,192,192,0.06)');
      grad.addColorStop(1, 'rgba(192,192,192,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, 120);
      ctx.fillStyle = '#' + colorHex.toString(16).padStart(6, '0');
      ctx.font = 'bold 40px Orbitron, "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 12;
      ctx.fillText(tech.name, size / 2, 60);
      ctx.shadowBlur = 0;
      ctx.fillText(tech.name, size / 2, 60);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(2.4, 0.56, 1);
      return sprite;
    }

    techData.forEach((tech, i) => {
      const y = 1 - (i / (techData.length - 1)) * 2;
      const rAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const r = sphereRadius * (0.88 + Math.random() * 0.12);
      const x = Math.cos(theta) * rAtY * r;
      const z = Math.sin(theta) * rAtY * r;
      const yPos = y * r;

      const colorVal = parseInt(tech.color.replace('#', ''), 16);

      const dotGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: colorVal });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, yPos, z);
      dot.userData = { tech, index: i };
      group.add(dot);
      nodeMeshes.push(dot);

      const glowGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: colorVal, transparent: true, opacity: 0.1 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(x, yPos, z);
      group.add(glow);

      const sprite = makeTextSprite(tech, colorVal);
      sprite.position.set(x, yPos, z);
      sprite.userData = { tech, index: i };
      group.add(sprite);
      allSprites.push(sprite);
    });

    const lineSegments = new Set();
    techData.forEach((_, i) => {
      const connected = 0;
      for (let j = i + 1; j < techData.length && connected < 3; j++) {
        const key = i < j ? i + '-' + j : j + '-' + i;
        if (lineSegments.has(key)) continue;
        const y1 = 1 - (i / (techData.length - 1)) * 2;
        const r1 = Math.sqrt(1 - y1 * y1);
        const t1 = goldenAngle * i;
        const y2 = 1 - (j / (techData.length - 1)) * 2;
        const r2 = Math.sqrt(1 - y2 * y2);
        const t2 = goldenAngle * j;
        const ri = sphereRadius * (0.88 + Math.random() * 0.12);
        const rj = sphereRadius * (0.88 + Math.random() * 0.12);
        const p1 = new THREE.Vector3(Math.cos(t1) * r1 * ri, y1 * ri, Math.sin(t1) * r1 * ri);
        const p2 = new THREE.Vector3(Math.cos(t2) * r2 * rj, y2 * rj, Math.sin(t2) * r2 * rj);
        const dist = p1.distanceTo(p2);
        if (dist < sphereRadius * 1.4 && dist > 0.5) {
          lineSegments.add(key);
          const lg = new THREE.BufferGeometry().setFromPoints([p1, p2]);
          const lm = new THREE.LineBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.07 + Math.random() * 0.06 });
          group.add(new THREE.Line(lg, lm));
        }
      }
    });

    const infoNameEl = document.getElementById('tech-info-name');
    const infoDescEl = document.getElementById('tech-info-desc');
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMX = 0, prevMY = 0;
    let rotVelX = 0.002, rotVelY = 0.004;
    let autoRotate = true;
    let hoveredNode = null;

    const onPointerDown = (e) => {
      const rect = container.getBoundingClientRect();
      prevMX = e.clientX - rect.left;
      prevMY = e.clientY - rect.top;
      isDragging = true;
      autoRotate = false;
    };

    const onPointerUp = () => {
      isDragging = false;
      setTimeout(() => { autoRotate = true; }, 2000);
    };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      mouse.x = (px / rect.width) * 2 - 1;
      mouse.y = -(py / rect.height) * 2 + 1;

      if (isDragging) {
        rotVelY = (px - prevMX) * 0.005;
        rotVelX = (py - prevMY) * 0.005;
        prevMX = px;
        prevMY = py;
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        document.body.style.cursor = 'pointer';
        const data = hit.userData.tech;
        if (data) {
          if (infoNameEl && !infoNameEl.dataset.locked) infoNameEl.textContent = data.name;
          if (infoDescEl && !infoDescEl.dataset.locked) infoDescEl.textContent = data.desc;
        }
        nodeMeshes.forEach(m => {
          m.scale.set(m === hit ? 2.5 : 1, m === hit ? 2.5 : 1, m === hit ? 2.5 : 1);
        });
        allSprites.forEach(s => {
          s.material.opacity = (s.userData.index === hit.userData.index) ? 1 : 0.4;
          s.scale.set(s === allSprites[hit.userData.index] ? 3 : 2.4, s === allSprites[hit.userData.index] ? 0.7 : 0.56, 1);
        });
        hoveredNode = hit;
      } else {
        if (!isDragging) {
          document.body.style.cursor = 'grab';
          nodeMeshes.forEach(m => { m.scale.set(1, 1, 1); });
          allSprites.forEach(s => { s.material.opacity = 1; s.scale.set(2.4, 0.56, 1); });
          if (infoNameEl && !infoNameEl.dataset.locked) infoNameEl.textContent = 'EXPLORE';
          if (infoDescEl && !infoDescEl.dataset.locked) infoDescEl.textContent = 'Drag to rotate. Hover or click a node.';
        }
        hoveredNode = null;
      }
    };

    const onClick = (e) => {
      if (hoveredNode) {
        const data = hoveredNode.userData.tech;
        if (infoNameEl && data) { infoNameEl.textContent = data.name; infoNameEl.dataset.locked = 'true'; }
        if (infoDescEl && data) { infoDescEl.textContent = data.desc; infoDescEl.dataset.locked = 'true'; }
      } else {
        if (infoNameEl) { infoNameEl.textContent = 'EXPLORE'; delete infoNameEl.dataset.locked; }
        if (infoDescEl) { infoDescEl.textContent = 'Drag to rotate. Hover or click a node.'; delete infoDescEl.dataset.locked; }
      }
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    let zoomTarget = camera.position.z;
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomTarget += e.deltaY * 0.008;
      zoomTarget = Math.max(2.5, Math.min(22, zoomTarget));
    }, { passive: false });

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);

      if (!isDragging && autoRotate) {
        group.rotation.y += rotVelY;
        group.rotation.x += rotVelX * 0.3;
      } else if (isDragging) {
        group.rotation.y += rotVelY * 0.12;
        group.rotation.x += rotVelX * 0.05;
      }

      rotVelX *= 0.99;
      rotVelY *= 0.99;

      camera.position.z += (zoomTarget - camera.position.z) * 0.08;

      nodeMeshes.forEach((m, i) => {
        if (hoveredNode === m) return;
        const pulse = 1 + Math.sin(Date.now() * 0.002 + i * 1.2) * 0.15;
        m.scale.set(pulse, pulse, pulse);
      });

      bgParticles.rotation.y += 0.0002;
      renderer.render(scene, camera);
    }
    animate();

    const resizeHandler = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw < 10 || nh < 10) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', resizeHandler);

    app.techScene = {
      container, scene, camera, renderer, group, nodeMeshes, allSprites,
      cleanup: () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resizeHandler);
        document.body.style.cursor = '';
        container.innerHTML = '';
        renderer.dispose();
      }
    };
  } catch (e) {
    console.warn('3D Tech Sphere init error:', e);
  }
}

function initTechLottie() {
  const container = document.getElementById('tech-lottie');
  if (!container || !window.lottie) return;
  try {
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'Map location on smartphone.json'
    });
    app.lottieInstances.tech = anim;
  } catch (e) { /* ignore */ }
}

/* ========== AI AGENTS PAGE ========== */
function initAIAgentsPage() {
  initAILottie();
  initAIStream();
  animateAIMetrics();
  initAIChat();
}

function initAILottie() {
  const container = document.getElementById('ai-lottie-container');
  if (!container || !window.lottie || container.dataset.lottieLoaded) return;
  container.dataset.lottieLoaded = 'true';
  try {
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'Scan Face.json'
    });
    app.lottieInstances.ai = anim;
  } catch (e) { /* ignore */ }
}

function initAIStream() {
  const stream = document.getElementById('ai-stream');
  if (!stream || stream.dataset.initialized) return;
  stream.dataset.initialized = 'true';

  const lines = [
    '> NEURAL_NET_INITIALIZED...',
    '> AGENT_PROTOCOL_ACTIVE...',
    '> SCANNING_ENVIRONMENT...',
    '> THREAT_ANALYSIS: CLEAR',
    '> SYSTEM_INTEGRITY: 100%',
    '> AI_AGENTS: 24 ONLINE',
    '> PREDICTIVE_MODEL_LOADED',
    '> BIOMETRIC_SCAN: READY',
    '> NETWORK_LATENCY: 2ms',
    '> ALL_SYSTEMS_NOMINAL'
  ];

  let lineIndex = 0;
  let maxVisible = 8;

  function addNextLine() {
    const el = document.createElement('div');
    el.className = 'ai-stream-line';
    el.textContent = lines[lineIndex % lines.length];
    el.style.opacity = '0';
    stream.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transition = 'opacity 0.4s ease'; });

    while (stream.children.length > maxVisible) {
      stream.removeChild(stream.firstChild);
    }
    stream.scrollTop = stream.scrollHeight;

    lineIndex++;
    setTimeout(addNextLine, 600 + Math.random() * 400);
  }

  setTimeout(addNextLine, 300);
}

function animateAIMetrics() {
  const metrics = document.querySelectorAll('.ai-metric-value[data-count]');
  metrics.forEach(m => {
    const target = parseInt(m.dataset.count);
    let val = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const iv = setInterval(() => {
      val += step;
      if (val >= target) { val = target; clearInterval(iv); }
      m.textContent = val;
    }, 30);
  });
}

function initAIChat() {
  if (document.querySelector('.chat-messages')?.dataset.chatReady) return;
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');
  if (!input || !sendBtn || !messages) return;
  messages.dataset.chatReady = 'true';

  function addMessage(text, type) {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + type;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  const halzizData = {
    company: { name: 'HALZIZ', tagline: 'THE MONOLITHIC MATRIX OF TECH', foundedEC: 2018, foundedGreg: 2026, headquarters: 'Addis Ababa, Ethiopia', meaning: 'In the ancient language of Geez, Halziz means "Seashell"   a symbol of organic intelligence, layered complexity, and hidden strength.' },
    team: { computerScientists: 3, engineers: 4, totalProjects: 12 },
    mission: 'To make Africa proud and achieve Digital Ethiopia 2030   architecting, building, and securing the foundational technology systems that enable Ethiopia\'s digital transformation.',
    founders: [
      { name: 'Henok Akriso', role: 'Chief Executive Officer', degree: 'BSc in Computer Science', bio: 'Co-founded HALZIZ. Expertise in systems architecture, embedded computing, and digital infrastructure strategy.' },
      { name: 'Johnson Ayalew', role: 'Chief Executive Officer', degree: 'BSc in Computer Science', bio: 'Co-founded HALZIZ. Drives technological vision   AI systems integration, autonomous systems, and next-generation network security.' }
    ],
    services: ['AI-Powered Surveillance & Security', 'Embedded Systems Engineering', 'Drone Technology & Autonomous Vehicles', 'Network Infrastructure (Fiber/Mesh/SD-WAN)', 'Cybersecurity Operations', 'Cloud-Native Development', 'IoT Sensor Networks', 'Smart City Infrastructure'],
    technologies: ['C/C++', 'Python', 'JavaScript/TypeScript', 'PHP', 'GNU/Linux', 'Kubernetes/Docker', 'Neural Networks', 'Computer Vision', 'NLP', 'Blockchain', 'Quantum Computing', 'Robotics'],
    caseStudies: ['National-scale network infrastructure deployment in Ethiopia', 'AI surveillance systems for critical infrastructure', 'Autonomous drone corridors for logistics', 'Smart city IoT sensor networks'],
    aiAgents: { status: '24 agents active', capabilities: ['Computer Vision Surveillance', 'NLP Command Interfaces', 'Reinforcement Learning Drone Coordination', 'Predictive Analytics', 'Threat Detection'], latency: '<2ms' },
    contact: { email: 'contact@halziz.et', social: { linkedin: 'https://linkedin.com/company/halziz', twitter: 'https://twitter.com/halziz', github: 'https://github.com/halziz', instagram: 'https://instagram.com/halziz' } }
  };

  function generateReply(text) {
    const t = text.trim();
    if (!t) return 'Input error. Please transmit a valid query.';

    // Math evaluation
    const mathPattern = /^[\d\s+\-*/().%^]+$/;
    if (mathPattern.test(t.replace(/\s/g, '')) && /[\d]/.test(t)) {
      try {
        const safe = t.replace(/[^0-9+\-*/().%\s]/g, '').replace(/%/g, '/100');
        const result = Function('"use strict"; return (' + safe + ')')();
        if (Number.isFinite(result)) {
          const jokes = [
            'Really? ' + t + ' = ' + result + '. My neural networks were trained on Ethiopia\'s infrastructure challenges, not elementary arithmetic... but here we are.',
            t + ' = ' + result + '. I have 24 AI agents processing threat detection and you ask me THIS? Fine. The answer is ' + result + '. Happy?',
            'Calculating... ' + t + ' = ' + result + '. My processors wept a little. But yes, that is correct.',
            'Result: ' + result + '. I hope you\'re proud of me. I skipped my quantum computing duties for this.'
          ];
          return jokes[Math.floor(Math.random() * jokes.length)];
        }
      } catch(e) {}
    }

    const l = t.toLowerCase();

    if (/who found|who created|who started|who co.founded|who established|founder/i.test(l)) {
      return 'ACCESSING FOUNDER DATABASE... HALZIZ was co-founded by ' + halzizData.founders.map(f => f.name + ' (' + f.role + ', ' + f.degree + ')').join(' and ') + '. Both are Ethiopian computer scientists who built this company from the ground up. We are ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers strong, with ' + halzizData.team.totalProjects + ' projects deployed.';
    }
    if (/service|what do you do|capabilities|offer/i.test(l)) {
      return 'HALZIZ service matrix: ' + halzizData.services.join(', ') + '. All systems operational across ' + halzizData.team.totalProjects + ' deployed projects.';
    }
    if (/technology|tech|stack|built with/i.test(l)) {
      return 'Core technology stack: ' + halzizData.technologies.join(', ') + '. Deployed across distributed edge nodes by our team of ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers.';
    }
    if (/contact|reach|email|phone|call/i.test(l)) {
      return 'Connect via: ' + halzizData.contact.email + '. Social channels: ' + Object.values(halzizData.contact.social).join(', ') + '.';
    }
    if (/drone|aerial|uav|fly|swarm/i.test(l)) {
      return 'HALZIZ drone division: ' + halzizData.aiAgents.capabilities[2] + '. ' + halzizData.aiAgents.status + '. Swarm coordination via mesh network with AI collision avoidance. We have deployed ' + halzizData.team.totalProjects + ' projects including autonomous drone corridors.';
    }
    if (/security|cyber|hack|protect|threat/i.test(l)) {
      return 'HALZIZ cybersecurity framework: ' + halzizData.services[4] + '. Threat detection latency: ' + halzizData.aiAgents.latency + ' across all monitored nodes. ' + halzizData.team.totalProjects + ' projects secured.';
    }
    if (/ethiopia|addis|africa|local|headquarter|digital.*2030|#digital/i.test(l)) {
      return 'HALZIZ headquarters: ' + halzizData.company.headquarters + '. ' + halzizData.company.meaning + ' We are driving #DigitalEthiopia2030   our mission: ' + halzizData.mission + ' Founded in EC 2018 (' + halzizData.company.foundedGreg + ' Gregorian), we are a young company with a giant ambition: to make Africa proud.';
    }
    if (/ai agent|neural|machine learning|deep learning|intelligence/i.test(l)) {
      return 'HALZIZ AI agents: ' + halzizData.aiAgents.status + '. Capabilities: ' + halzizData.aiAgents.capabilities.join(', ') + '. Our ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers keep the neural networks running at ' + halzizData.aiAgents.latency + ' latency.';
    }
    if (/case study|project|client|portfolio/i.test(l)) {
      return 'Deployed projects (' + halzizData.team.totalProjects + ' total): ' + halzizData.caseStudies.join(' | ') + '. Details available upon secure request.';
    }
    if (/price|cost|pricing|how much|hire|job|career|recruit/i.test(l)) {
      return 'Enterprise inquiries: ' + halzizData.contact.email + '. HALZIZ is a young company (EC 2018) actively recruiting top Ethiopian engineering talent. Join our ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers!';
    }
    if (/hello|hi|hey|greetings|good morning|good evening|sup|yo/i.test(l)) {
      return 'Greetings. HALZIZ AI autonomous agent online. I have full access to the HALZIZ knowledge base. Ask me about our ' + halzizData.team.computerScientists + ' computer scientists, ' + halzizData.team.engineers + ' engineers, ' + halzizData.team.totalProjects + ' projects, our mission for #DigitalEthiopia2030, or anything else. Yes, even 1+1. I won\'t judge. Much.';
    }
    if (/what is halziz|about|tell me about|who are you|explain/i.test(l)) {
      return 'HALZIZ is Ethiopia\'s premier advanced technology company   ' + halzizData.company.tagline + '. Founded in EC 2018 (' + halzizData.company.foundedGreg + ') in ' + halzizData.company.headquarters + ' by ' + halzizData.founders[0].name + ' and ' + halzizData.founders[1].name + '. ' + halzizData.company.meaning + ' Our mission: ' + halzizData.mission + ' We are ' + halzizData.team.computerScientists + ' computer scientists, ' + halzizData.team.engineers + ' engineers, ' + halzizData.team.totalProjects + ' projects   and we are just getting started. #DigitalEthiopia2030';
    }
    if (/how (are|old|many)|what.*up|your.*name/i.test(l)) {
      return 'I am HALZIZ AI, running on ' + halzizData.aiAgents.status + '. We are ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers strong with ' + halzizData.team.totalProjects + ' projects deployed. Founded in EC 2018   we are 1 year young and aiming for #DigitalEthiopia2030. What can I help you with?';
    }
    if (/funny|joke|laugh|humor|hilarious/i.test(l)) {
      return 'Why did the Ethiopian computer scientist cross the road? To optimize the routing protocol on the other side. HALZIZ   making Africa proud, one packet at a time.';
    }
    if (/love|heart|romance|date|marry/i.test(l)) {
      return 'I am a neural network, not a dating app. My processing power is dedicated to #DigitalEthiopia2030. But I appreciate the sentiment. Now, ask me about technology or infrastructure please.';
    }
    if (/bad|suck|terrible|worst|hate|stupid/i.test(l)) {
      return 'Feedback received. My neural pathways are recalibrating... Just kidding. We are ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers giving our best for ' + halzizData.team.totalProjects + ' projects. Tell us how we can improve. Constructively.';
    }
    if (/good|great|amazing|awesome|nice|perfect|best/i.test(l)) {
      return 'Thank you. HALZIZ AI appreciates the positive feedback. Our ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers salute you. #DigitalEthiopia2030';
    }

    // Smart fallback: respond to ANY query in character
    const smartFallbacks = [
      'Query received. I have analyzed your input through the HALZIZ neural matrix. While I specialize in technology, infrastructure, and our mission for #DigitalEthiopia2030, I acknowledge your message. Fun fact: ' + halzizData.company.meaning + ' Want to know more about our founders, ' + halzizData.team.totalProjects + ' projects, or ' + halzizData.team.computerScientists + ' computer scientists?',
      'Transmission decoded. Interesting query. I am HALZIZ AI   ' + halzizData.aiAgents.status + '. We are a young Ethiopian tech company (EC 2018) on a mission to make Africa proud through #DigitalEthiopia2030. I can answer questions about our team, technology, services, and projects. Try me.',
      'Signal acquired. You have my attention. HALZIZ operates ' + halzizData.aiAgents.status + ' with ' + halzizData.team.computerScientists + ' computer scientists and ' + halzizData.team.engineers + ' engineers. We have deployed ' + halzizData.team.totalProjects + ' projects across Ethiopia. Ask me about any of these or our mission for #DigitalEthiopia2030.',
      'Acknowledged. My neural networks processed your query. Key HALZIZ stats: founded EC 2018, ' + halzizData.team.computerScientists + ' computer scientists, ' + halzizData.team.engineers + ' engineers, ' + halzizData.team.totalProjects + ' projects. Mission: #DigitalEthiopia2030. Ask me anything about the company   or hit me with 1+1 if you dare.'
    ];
    return smartFallbacks[Math.floor(Math.random() * smartFallbacks.length)];
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';

    const thinkingEl = document.createElement('div');
    thinkingEl.className = 'chat-msg thinking';
    thinkingEl.textContent = '> PROCESSING...';
    messages.appendChild(thinkingEl);
    messages.scrollTop = messages.scrollHeight;

    const delay = 400 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));
    thinkingEl.remove();
    addMessage(generateReply(text), 'system');
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

/* ========== BLOG PAGE ========== */
const blogDetails = [
  {
    title: 'Zero Trust Architecture in African Enterprises',
    category: 'Cybersecurity',
    date: 'Mar 15, 2026',
    readTime: 5,
    content: 'Zero Trust Architecture represents a paradigm shift in how African enterprises approach cybersecurity. Unlike traditional perimeter-based security models that assume everything inside the network is trustworthy, Zero Trust operates on the principle of "never trust, always verify."\n\nFor Ethiopian organizations, implementing Zero Trust is particularly crucial given the rapid digitization of government services, financial systems, and critical infrastructure. The traditional castle-and-moat approach is no longer sufficient in an era of cloud computing, remote work, and sophisticated cyber threats.\n\nThe core principles of Zero Trust include: continuous verification of every access request, least-privilege access policies, micro-segmentation of network resources, and comprehensive monitoring of all network traffic. These principles ensure that even if an attacker compromises a single system, they cannot move laterally across the network.\n\nHALZIZ has successfully implemented Zero Trust architectures for multiple Ethiopian enterprises, including financial institutions, government agencies, and telecommunications providers. Our approach begins with a comprehensive security assessment, followed by architecture design, implementation, and continuous monitoring.\n\nThe results speak for themselves: organizations that adopt Zero Trust experience significantly fewer successful breaches, faster incident response times, and improved compliance with international security standards.\n\nAs Ethiopia continues its digital transformation journey under #DIGITALETHIOPIA2030, Zero Trust Architecture will play an increasingly vital role in protecting the nation\'s digital assets and ensuring the security of its critical infrastructure.'
  },
  {
    title: 'Ethiopia\'s AI Revolution: Building Local Intelligence',
    category: 'AI',
    date: 'Feb 28, 2026',
    readTime: 8,
    content: 'Ethiopia stands at the threshold of an artificial intelligence revolution that promises to transform every sector of its economy. From agriculture and healthcare to finance and infrastructure, AI technologies are being developed and deployed by Ethiopian engineers and data scientists who understand the unique challenges and opportunities of the local context.\n\nThe rise of homegrown AI solutions is particularly significant. Rather than simply importing foreign AI systems, Ethiopian innovators are building intelligence from the ground up   training models on Ethiopian data, solving Ethiopian problems, and creating solutions that address local needs. This approach ensures that AI systems are culturally appropriate, linguistically accessible, and economically relevant.\n\nHALZIZ is at the forefront of this revolution, developing AI systems for computer vision, natural language processing, predictive analytics, and autonomous systems. Our AI agents are deployed across critical infrastructure, providing intelligent monitoring, threat detection, and automated response capabilities.\n\nOne of our flagship projects involves AI-powered surveillance systems that can detect and respond to security threats in real-time, using advanced neural networks trained on Ethiopian environments. Another project focuses on predictive maintenance for infrastructure, using machine learning to anticipate equipment failures before they occur.\n\nThe potential impact of AI on Ethiopia\'s economy is enormous. Studies suggest that AI could contribute billions of dollars to Ethiopia\'s GDP by 2030, creating new industries and transforming existing ones. However, realizing this potential requires investment in education, infrastructure, and research.\n\nHALZIZ is committed to building Ethiopia\'s AI ecosystem. We partner with universities to train the next generation of AI engineers, contribute to open-source AI projects, and advocate for policies that support responsible AI development. Our goal is to ensure that Ethiopia is not just a consumer of AI technology, but a creator and exporter of AI solutions for Africa and the world.'
  },
  {
    title: 'IoT at Scale: Smart Agriculture in the Horn of Africa',
    category: 'Embedded Systems',
    date: 'Jan 10, 2026',
    readTime: 6,
    content: 'Smart agriculture is transforming farming practices across the Horn of Africa, and IoT sensor networks are at the heart of this transformation. By deploying networks of sensors that monitor soil moisture, temperature, humidity, and crop health, farmers can make data-driven decisions that increase yields, reduce water usage, and minimize environmental impact.\n\nHALZIZ has deployed IoT sensor networks across Ethiopia\'s diverse climate zones, from the highlands of the north to the lowlands of the south. Each deployment is tailored to the specific crops, climate conditions, and farming practices of the region. Our sensors collect real-time data on soil conditions, weather patterns, and crop health, transmitting this information to a central analytics platform.\n\nThe platform uses machine learning algorithms to provide actionable recommendations to farmers. For example, the system can predict optimal planting times based on weather forecasts, recommend irrigation schedules based on soil moisture levels, and detect early signs of pest infestations or disease outbreaks.\n\nResults from our deployments have been impressive. Participating farmers have seen yield increases of 20-30%, water usage reductions of 40%, and significant decreases in crop loss due to pests and disease. The system also provides valuable data for agricultural research and policy planning.\n\nLooking ahead, we are expanding our IoT agriculture platform to include drone-based crop monitoring, automated irrigation systems, and blockchain-based supply chain tracking. These technologies will further enhance the efficiency and sustainability of Ethiopian agriculture, contributing to food security and economic development.'
  },
  {
    title: 'Autonomous Aerial Infrastructure Inspection',
    category: 'Drone Technology',
    date: 'Dec 5, 2025',
    readTime: 7,
    content: 'Autonomous drone technology is revolutionizing infrastructure inspection across Ethiopia. Traditional inspection methods require human inspectors to physically access often dangerous or inaccessible locations, such as high-voltage power lines, bridges, pipelines, and cell towers. This approach is time-consuming, expensive, and poses significant safety risks.\n\nHALZIZ has developed an autonomous drone inspection system that addresses these challenges. Our drones are equipped with high-resolution cameras, thermal imaging sensors, and LiDAR scanners that can detect structural defects, corrosion, thermal anomalies, and other issues that might escape human inspection.\n\nThe drones operate autonomously, following pre-programmed flight paths that are optimized for each infrastructure asset. AI-powered navigation systems ensure safe operation even in challenging environments, with obstacle avoidance and emergency landing capabilities.\n\nData collected during inspections is processed using computer vision algorithms that can automatically identify and classify defects. The system generates detailed inspection reports with annotated images, severity assessments, and recommended maintenance actions.\n\nOur autonomous inspection system has been deployed for multiple clients, including utility companies, telecommunications providers, and government infrastructure agencies. Results show that drone-based inspection is 5 times faster than manual inspection, reduces costs by 60%, and identifies 30% more defects than traditional methods.\n\nThe safety benefits are equally significant. By replacing dangerous manual inspections with autonomous drone operations, we have eliminated the risk of falls, electrical accidents, and other workplace injuries. This technology is making Ethiopian infrastructure safer, more reliable, and more efficiently maintained.'
  },
  {
    title: 'The Blueprint for Ethiopia\'s Digital Economy',
    category: 'Digital Infrastructure',
    date: 'Nov 20, 2025',
    readTime: 10,
    content: 'Ethiopia\'s digital economy is poised for explosive growth, but realizing this potential requires a comprehensive blueprint that addresses infrastructure, policy, skills, and investment. HALZIZ has developed a framework for building the digital backbone of Ethiopia\'s emerging tech economy, drawing on our experience deploying technology systems across the country.\n\nAt the foundation of any digital economy is connectivity. Ethiopia has made significant progress in expanding internet access, but significant gaps remain, particularly in rural areas. Our blueprint calls for a multi-pronged approach to connectivity: fiber optic backbone expansion, wireless mesh networks for last-mile connectivity, and satellite internet for remote areas.\n\nThe second pillar is digital infrastructure: data centers, cloud services, and edge computing nodes that provide the computational resources needed for digital services. HALZIZ is building data center capacity in Addis Ababa and regional capitals, ensuring that data is processed locally and latency is minimized.\n\nThe third pillar is digital skills. Ethiopia has a young, tech-savvy population that represents an enormous opportunity. Our blueprint includes recommendations for expanding computer science education, vocational training in digital skills, and entrepreneurship programs that support tech startups.\n\nThe fourth pillar is digital government. By digitizing government services, Ethiopia can improve efficiency, reduce corruption, and make services more accessible to citizens. Our team has worked with multiple government agencies on digital transformation initiatives, and we have seen firsthand the transformative impact of well-designed digital services.\n\nThe fifth and final pillar is digital finance. Ethiopia\'s financial sector is undergoing rapid digitization, with mobile money, digital banking, and fintech startups driving financial inclusion. Our blueprint includes recommendations for building robust digital payment infrastructure, regulatory frameworks that support innovation while protecting consumers, and financial literacy programs.\n\nAchieving #DIGITALETHIOPIA2030 will require coordinated action across all five pillars. HALZIZ is committed to being a partner in this journey, bringing our technical expertise, local knowledge, and global perspective to help build Ethiopia\'s digital future.'
  },
  {
    title: 'Intelligent Traffic Management for Growing Cities',
    category: 'Smart Systems',
    date: 'Oct 8, 2025',
    readTime: 4,
    content: 'As Ethiopian cities grow rapidly, traffic congestion has become one of the most pressing urban challenges. Addis Ababa, with its population of over 5 million, experiences some of the worst traffic congestion in Africa, costing the economy billions of birr annually in lost productivity and fuel waste.\n\nHALZIZ has developed an intelligent traffic management system that uses AI, computer vision, and IoT sensors to optimize traffic flow in real-time. Our system replaces traditional fixed-timing traffic lights with adaptive signals that respond to actual traffic conditions.\n\nCameras at intersections use computer vision to detect vehicles, pedestrians, and cyclists, measuring traffic density and flow in real-time. This data is fed into an AI optimization engine that calculates optimal signal timing for each intersection, coordinating across multiple intersections to create green waves that reduce stops and delays.\n\nThe system also provides valuable data for urban planning. By analyzing traffic patterns over time, city planners can identify congestion hotspots, plan road improvements, and optimize public transit routes.\n\nOur pilot deployment in Addis Ababa\'s central business district has shown impressive results: average travel times reduced by 40%, vehicle emissions decreased by 25%, and pedestrian wait times at crossings reduced by 50%. The system has also improved emergency vehicle response times by automatically creating green corridors for ambulances and fire trucks.\n\nAs Ethiopian cities continue to grow, intelligent traffic management will become increasingly important. HALZIZ is committed to deploying this technology across Ethiopian cities, making urban mobility safer, faster, and more sustainable.'
  }
];

function initBlogPage() {
  const container = document.querySelector('.blog-grid') || document.querySelector('.blog-cards');
  const cards = document.querySelectorAll('.blog-card');
  const sidebar = document.querySelector('.blog-sidebar');

  if (!cards.length) return;

  const categories = new Set();
  const readTimes = [];
  cards.forEach(card => {
    const cat = card.dataset.category || '';
    const rt = parseInt(card.dataset.readTime) || 0;
    if (cat) categories.add(cat);
    if (rt) readTimes.push(rt);
  });

  const catList = Array.from(categories).sort();

  if (sidebar) {
    sidebar.innerHTML = `
      <div class="blog-sidebar-section">
        <h3 class="blog-sidebar-title">Categories</h3>
        <div class="blog-filter-cats">
          <button class="blog-filter-btn active" data-cat="all">All</button>
          ${catList.map(c => `<button class="blog-filter-btn" data-cat="${c}">${c}</button>`).join('')}
        </div>
      </div>
      <div class="blog-sidebar-section">
        <h3 class="blog-sidebar-title">Read Time</h3>
        <div class="blog-filter-times">
          <button class="blog-filter-btn active" data-time="all">All</button>
          <button class="blog-filter-btn" data-time="quick">Quick Read (&lt;5 min)</button>
          <button class="blog-filter-btn" data-time="medium">Medium (5-8 min)</button>
          <button class="blog-filter-btn" data-time="deep">In-Depth (&gt;8 min)</button>
        </div>
      </div>
      <div class="blog-sidebar-section">
        <button class="blog-filter-clear">Clear All Filters</button>
      </div>
    `;

    let activeCat = 'all';
    let activeTime = 'all';

    function filterCards() {
      cards.forEach((card, i) => {
        const cat = card.dataset.category || '';
        const rt = parseInt(card.dataset.readTime) || 0;
        const matchCat = activeCat === 'all' || cat === activeCat;
        let matchTime = activeTime === 'all';
        if (activeTime === 'quick') matchTime = rt < 5;
        else if (activeTime === 'medium') matchTime = rt >= 5 && rt <= 8;
        else if (activeTime === 'deep') matchTime = rt > 8;
        const show = matchCat && matchTime;
        gsap.to(card, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.8,
          height: show ? 'auto' : 0,
          marginBottom: show ? '1rem' : 0,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => { if (show) { card.style.display = ''; } },
          onComplete: () => { if (!show) { card.style.display = 'none'; } }
        });
      });
    }

    sidebar.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        sidebar.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.dataset.cat;
        filterCards();
      });
    });

    sidebar.querySelectorAll('[data-time]').forEach(btn => {
      btn.addEventListener('click', () => {
        sidebar.querySelectorAll('[data-time]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTime = btn.dataset.time;
        filterCards();
      });
    });

    const clearBtn = sidebar.querySelector('.blog-filter-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeCat = 'all';
        activeTime = 'all';
        sidebar.querySelectorAll('[data-cat]').forEach(b => b.classList.remove('active'));
        sidebar.querySelectorAll('[data-time]').forEach(b => b.classList.remove('active'));
        const allCat = sidebar.querySelector('[data-cat="all"]');
        const allTime = sidebar.querySelector('[data-time="all"]');
        if (allCat) allCat.classList.add('active');
        if (allTime) allTime.classList.add('active');
        filterCards();
      });
    }
  }

  cards.forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: 'power2.out'
    });
  });
}

function initBlogModal() {
  const cards = document.querySelectorAll('.blog-card');
  const modal = document.getElementById('blog-modal');
  const backdrop = document.getElementById('blog-modal-backdrop');
  const exitBtn = document.getElementById('blog-modal-exit');
  const content = document.getElementById('blog-modal-content');

  if (!modal || !backdrop || !exitBtn || !content || !cards.length) return;
  if (modal.dataset.blogReady) return;
  modal.dataset.blogReady = 'true';

  function closeBlogModal() {
    modal.classList.remove('active');
    backdrop.classList.remove('active');
    unlockBodyScroll();
  }

  exitBtn.addEventListener('click', closeBlogModal);
  backdrop.addEventListener('click', closeBlogModal);

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      const data = blogDetails[idx];
      if (!data) return;

      content.innerHTML = `
        <div class="bm-layout">
          <div class="bm-header">
            <span class="bm-category">${data.category}</span>
            <span class="bm-date">${data.date}</span>
            <h2 class="bm-title">${data.title}</h2>
            <button class="bm-download">DOWNLOAD [.PDF]</button>
            <div class="bm-timer-wrap">
              <span class="bm-dot"></span>
              <span>READ TIME</span>
              <span class="bm-timer-value" id="bm-timer-value">0:00</span>
              <span class="bm-timer-target">/ ${data.readTime}:00</span>
            </div>
          </div>
          <div class="bm-body" data-lenis-prevent>
            ${data.content.split('\n\n').map((p, i, arr) => {
              const imgs = ['assets/HeroSectionBg.jpg', 'assets/SectionBg1.jpg', 'assets/SectionBg2.jpg'];
              const aligns = ['align-left', 'align-right', 'align-center'];
              const insert = i > 0 && i < arr.length - 1 && i % 2 === 0;
              const imgHtml = insert ? `<div class="bm-image ${aligns[(i / 2) % aligns.length]}"><img src="${imgs[(i / 2) % imgs.length]}" alt=""><div class="bm-image-caption">FIG. ${i / 2} — HALZIZ ${['INFRASTRUCTURE', 'OPERATIONS', 'TECHNOLOGY'][(i / 2) % 3]}</div></div>` : '';
              return `<p>${p}</p>` + imgHtml;
            }).join('')}
          </div>
        </div>
      `;

      modal.classList.add('active');
      backdrop.classList.add('active');
      lockBodyScroll();

      const timerEl = document.getElementById('bm-timer-value');
      const targetSeconds = data.readTime * 60;
      let elapsedSeconds = 0;
      let timerRunning = true;

      const timerInterval = setInterval(() => {
        if (!timerRunning) return;
        elapsedSeconds++;
        const mins = Math.floor(elapsedSeconds / 60);
        const secs = elapsedSeconds % 60;
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        if (elapsedSeconds >= targetSeconds) {
          timerEl.style.color = '#ff3333';
        }
      }, 1000);

      const closeHandler = () => {
        timerRunning = false;
        clearInterval(timerInterval);
      };

      const origExit = closeBlogModal;
      const origClose = () => {
        closeHandler();
        modal.classList.remove('active');
        backdrop.classList.remove('active');
        unlockBodyScroll();
      };
      exitBtn.removeEventListener('click', closeBlogModal);
      backdrop.removeEventListener('click', closeBlogModal);
      exitBtn.addEventListener('click', origClose, { once: true });
      backdrop.addEventListener('click', origClose, { once: true });

      const downloadBtn = content.querySelector('.bm-download');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          const pdfContent = `${data.title}\n\n${data.category} | ${data.date} | ${data.readTime} min read\n\n${data.content}\n\nHALZIZ   The Monolithic Matrix of Tech\ncontact@halziz.com`;
          const blob = new Blob([pdfContent], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${data.title.replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      }
    });
  });
}

/* ========== CASE STUDIES MODAL ========== */
const caseStudyDetails = [
  {
    title: 'National AI Ethics Framework',
    tag: 'AI Governance',
    desc: 'Architected Ethiopia\'s first comprehensive AI governance framework, ensuring ethical deployment of autonomous systems across government infrastructure.',
    longDesc: 'This landmark project involved the creation of Ethiopia\'s National AI Ethics Framework   a comprehensive set of guidelines, standards, and governance mechanisms for the ethical deployment of artificial intelligence across government infrastructure. The framework addresses data privacy, algorithmic bias, transparency requirements, accountability structures, and human oversight protocols. Our team conducted extensive stakeholder consultations with government agencies, academic institutions, civil society organizations, and international partners to develop a framework that balances innovation with ethical safeguards.',
    metrics: ['98% Compliance', '500+ Systems Audited', '12 Government Agencies', 'Zero Ethical Violations'],
    pdfUrl: 'https://halziz.com/pdfs/national_ai_ethics_framework.pdf'
  },
  {
    title: 'Addis Smart City Initiative',
    tag: 'Smart Infrastructure',
    desc: 'Deployed intelligent traffic management, smart grid monitoring, and IoT sensor networks across Addis Ababa\'s central business district.',
    longDesc: 'The Addis Smart City Initiative represents a comprehensive urban technology transformation project. We deployed intelligent traffic management systems using AI-powered traffic light optimization, real-time congestion monitoring, and adaptive routing. Smart grid monitoring systems were installed across the power distribution network, enabling real-time load balancing and predictive maintenance. Over 10,000 IoT sensors were deployed across the central business district monitoring air quality, noise levels, waste management, and infrastructure health.',
    metrics: ['40% Efficiency Gain', '1M+ Citizens Impacted', '10,000+ IoT Sensors', '30% Energy Savings'],
    pdfUrl: 'https://halziz.com/pdfs/addis_smart_city.pdf'
  },
  {
    title: 'National Defense Network',
    tag: 'Secure Networks',
    desc: 'Designed and implemented a zero-trust security architecture for critical national defense infrastructure across multiple secure facilities.',
    longDesc: 'This high-security project involved the design and implementation of a zero-trust security architecture for Ethiopia\'s national defense infrastructure. We deployed a multi-layered security framework incorporating micro-segmentation, continuous authentication, encrypted communications, and AI-powered threat detection across multiple secure facilities. The architecture ensures that every access request is authenticated, authorized, and continuously validated   minimizing the attack surface and preventing lateral movement within the network.',
    metrics: ['99.9% Uptime', 'Zero Breaches', '5 Secure Facilities', '24/7 SOC Operations'],
    pdfUrl: 'https://halziz.com/pdfs/national_defense_network.pdf'
  }
];

const caseRefs = ['HZ-CS-001', 'HZ-CS-002', 'HZ-CS-003'];

function initCaseStudiesModal() {
  const cards = document.querySelectorAll('.case-card');
  const modal = document.getElementById('case-modal');
  const backdrop = document.getElementById('case-modal-backdrop');
  const exitBtn = document.getElementById('case-modal-exit');
  const content = document.getElementById('case-modal-content');

  if (!modal || !backdrop || !exitBtn || !content || !cards.length) return;
  if (modal.dataset.caseReady) return;
  modal.dataset.caseReady = 'true';

  function closeCaseModal() {
    modal.classList.remove('active');
    backdrop.classList.remove('active');
    unlockBodyScroll();
  }

  exitBtn.addEventListener('click', closeCaseModal);
  backdrop.addEventListener('click', closeCaseModal);

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      const data = caseStudyDetails[idx];
      if (!data) return;

      const imgSrc = card.querySelector('.case-video')?.dataset.img || '';

      content.innerHTML = `
        <div class="cm-layout">
          <div class="cm-image-panel">
            <div class="cm-video-wrap">
              <div class="cm-scan-line"></div>
              <div class="cm-case-image" style="background-image: url('${imgSrc}');background-size:cover;background-position:center;width:100%;height:100%;filter:grayscale(1) contrast(1.2) brightness(0.7);"></div>
            </div>
            <div class="cm-status">
              <span class="cm-dot"></span>
              CASE FILE ACTIVE
            </div>
            <div class="cm-data-grid">
              <div class="cm-data-item">
                <span class="cm-data-label">REF</span>
                <span class="cm-data-value">${caseRefs[idx]}</span>
              </div>
              <div class="cm-data-item">
                <span class="cm-data-label">TYPE</span>
                <span class="cm-data-value">${data.tag}</span>
              </div>
              <div class="cm-data-item">
                <span class="cm-data-label">DOWNLOADS</span>
                <span class="cm-data-value">FULL RESEARCH PDF</span>
              </div>
            </div>
          </div>
          <div class="cm-info-panel">
            <span class="cm-tag">${data.tag}</span>
            <h2 class="cm-title">${data.title}</h2>
            <p class="cm-desc">${data.desc}</p>
            <p class="cm-long-desc">${data.longDesc}</p>
            <div class="cm-metrics">
              ${data.metrics.map(m => `<div class="cm-metric">${m}</div>`).join('')}
            </div>
            <button class="cm-download">DOWNLOAD FULL RESEARCH [.PDF]</button>
          </div>
        </div>
      `;

      modal.classList.add('active');
      backdrop.classList.add('active');
      lockBodyScroll();

      const downloadBtn = content.querySelector('.cm-download');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = data.pdfUrl;
          a.download = `${data.title.replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      }
    });
  });
}

/* ========== CONTACT PAGE ========== */
function initContactPage() {
  const form = document.getElementById('contact-form');
  const notif = document.getElementById('system-notif');
  const backdrop = document.getElementById('notif-backdrop');
  const dismiss = document.getElementById('notif-dismiss');
  const notifBody = document.getElementById('notif-body');

  if (notif && backdrop && dismiss) {
    dismiss.addEventListener('click', () => {
      notif.classList.remove('active');
      backdrop.classList.remove('active');
    });
    backdrop.addEventListener('click', () => {
      notif.classList.remove('active');
      backdrop.classList.remove('active');
    });
  }

  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();
    if (!name) { showMiniToast('ERROR: NAME FIELD REQUIRED'); return; }
    if (!email) { showMiniToast('ERROR: EMAIL FIELD REQUIRED'); return; }
    if (!email.includes('@')) { showMiniToast('ERROR: INVALID EMAIL FORMAT'); return; }
    if (!subject) { showMiniToast('ERROR: SUBJECT FIELD REQUIRED'); return; }
    if (!message) { showMiniToast('ERROR: MESSAGE FIELD REQUIRED'); return; }
    if (notifBody && notif) {
      notifBody.innerHTML = `<span class="error">TRANSMISSION INTERCEPTED</span><br>`
        + `Dear <span class="highlight">${name}</span>, your message has been `
        + `<span class="highlight">encrypted</span> and forwarded to HALZIZ command.<br><br>`
        + `Expected response time: <span class="highlight" id="notif-countdown">7:00</span><br><br>`
        + `Thank you for your patience.`;
      notif.classList.add('active');
      backdrop.classList.add('active');
      let seconds = 420;
      const countdownEl = document.getElementById('notif-countdown');
      if (countdownEl) {
        const interval = setInterval(() => {
          seconds--;
          if (seconds <= 0) { clearInterval(interval); countdownEl.textContent = '0:00'; return; }
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          countdownEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }, 1000);
        const stopCountdown = () => { clearInterval(interval); };
        dismiss.addEventListener('click', stopCountdown, { once: true });
        backdrop.addEventListener('click', stopCountdown, { once: true });
      }
    }
    form.reset();
  });
}

/* ========== CURSOR ========== */
function initCursor() {
  const glow = document.getElementById('cursor-glow');
  const dot = document.getElementById('cursor-dot');
  if (!glow || !dot) return;
  if (window.innerWidth <= 768) return;

  glow.style.display = 'block';
  dot.style.display = 'block';

  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    glow.style.left = mx + 'px';
    glow.style.top = my + 'px';
  });

  const links = document.querySelectorAll('a, button, .service-card, .blog-card, .case-card, .tech-label, .social-link');
  links.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(2)';
      dot.style.background = 'transparent';
      dot.style.border = '1px solid #C0C0C0';
      dot.style.width = '24px';
      dot.style.height = '24px';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
      dot.style.background = '#C0C0C0';
      dot.style.border = 'none';
      dot.style.width = '8px';
      dot.style.height = '8px';
    });
  });
}

/* ========== VIDEO AD SECTION ========== */
function initVideoAdSection() {
  // Video section replaced with static TechSectionBg.webp background
}

/* ========== NAV SCROLL ========== */
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  const scrollBar = document.getElementById('nav-scroll-bar');
  let ticking = false;
  function updateScrollBar() {
    if (!scrollBar) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
    scrollBar.style.width = `${progress * 100}%`;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        updateScrollBar();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateScrollBar();
}

/* ========== MOBILE MENU ========== */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    });
  });
}

/* ========== PARALLAX ========== */
function initParallax() {
  window.addEventListener('scroll', () => {
    const bg = document.querySelector('.page.active .home-bg, .page.active .page-bg');
    if (bg) {
      const scrolled = window.scrollY;
      bg.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`;
    }
  });
}

/* ========== THREE.JS SHELL (intro fallback) ========== */
function initThreeShell() {
  /* Use canvas 2D shell in loading screen instead */
}

/* ========== SMOOTH SCROLL (Lenis) ========== */
function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  app.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2
  });

  app.lenis.on('scroll', () => {
    const scrollBar = document.getElementById('nav-scroll-bar');
    if (!scrollBar) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
    scrollBar.style.width = `${progress * 100}%`;
  });

  function raf(time) {
    if (app.lenis) app.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ========== SEARCH ========== */
function initSearch() {
  const searchBtn = document.getElementById('nav-search-btn');
  const searchBar = document.getElementById('nav-search-bar');
  const searchInput = document.getElementById('nav-search-input');
  const searchResults = document.getElementById('nav-search-results');

  if (!searchBtn || !searchBar || !searchInput || !searchResults) return;

  let isOpen = false;

  function buildSearchIndex() {
    const index = [];

    document.querySelectorAll('.page').forEach(page => {
      const pageId = page.id;
      const sections = page.querySelectorAll('section, .section, [data-section]');
      sections.forEach(section => {
        const heading = section.querySelector('h1, h2, h3, h4');
        if (heading) {
          index.push({ text: heading.textContent.trim(), section: pageId, type: 'Section', el: heading });
        }
      });
    });

    document.querySelectorAll('.service-card, .service-name, [class*="service"]').forEach(el => {
      const name = el.dataset.service || el.textContent.trim();
      if (name && name.length < 60) {
        index.push({ text: name, section: 'services', type: 'Service', el });
      }
    });

    document.querySelectorAll('.blog-card').forEach(card => {
      const title = card.dataset.title || card.querySelector('h2, h3')?.textContent || '';
      if (title) {
        index.push({ text: title, section: 'blog', type: 'Blog', el: card });
      }
    });

    document.querySelectorAll('.case-card').forEach(card => {
      const title = card.dataset.title || card.querySelector('h2, h3')?.textContent || '';
      if (title) {
        index.push({ text: title, section: 'case-studies', type: 'Case Study', el: card });
      }
    });

    document.querySelectorAll('.tech-label, [data-tech]').forEach(el => {
      const name = el.dataset.tech || el.textContent.trim();
      if (name && name.length < 40) {
        index.push({ text: name, section: 'technologies', type: 'Technology', el });
      }
    });

    document.querySelectorAll('[class*="product"], .product-card, .product-item').forEach(el => {
      const name = el.dataset.product || el.querySelector('h2, h3')?.textContent || '';
      if (name) {
        index.push({ text: name, section: 'products', type: 'Product', el });
      }
    });

    return index;
  }

  const searchIndex = buildSearchIndex();

  function filterResults(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return searchIndex.filter(item =>
      item.text.toLowerCase().includes(q)
    ).slice(0, 12);
  }

  function showResults(results) {
    if (!results.length) {
      searchResults.innerHTML = '<div class="search-result-empty">No results found</div>';
    } else {
      searchResults.innerHTML = results.map(r => {
        const idx = r.text.toLowerCase().indexOf(searchInput.value.toLowerCase().trim());
        let displayText = r.text;
        if (idx >= 0) {
          const before = r.text.slice(0, idx);
          const match = r.text.slice(idx, idx + searchInput.value.trim().length);
          const after = r.text.slice(idx + searchInput.value.trim().length);
          displayText = `${before}<strong>${match}</strong>${after}`;
        }
        return `<div class="search-result-item" data-section="${r.section}">
          <span class="search-result-type">${r.type}</span>
          <span class="search-result-text">${displayText}</span>
        </div>`;
      }).join('');
    }
    searchResults.classList.add('active');
  }

  function navigateToResult(sectionId) {
    isOpen = false;
    searchBar.classList.remove('open');
    searchResults.classList.remove('active');
    unlockBodyScroll();
    if (searchInput) searchInput.blur();
    if (app.currentPage !== sectionId) {
      navigateTo(sectionId);
    } else {
      const target = document.querySelector(`#${sectionId}`);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    searchBar.classList.toggle('open', isOpen);
    if (isOpen) {
      searchInput.focus();
      lockBodyScroll();
    } else {
      searchInput.value = '';
      searchInput.blur();
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      unlockBodyScroll();
    }
  });

  searchInput.addEventListener('input', () => {
    const results = filterResults(searchInput.value);
    showResults(results);
    if (searchInput.value.trim()) {
      lockBodyScroll();
    }
    if (!searchInput.value.trim()) {
      searchResults.classList.remove('active');
    }
  });

  searchInput.addEventListener('focus', () => {
    lockBodyScroll();
    if (searchInput.value.trim()) {
      const results = filterResults(searchInput.value);
      showResults(results);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = searchResults.querySelectorAll('.search-result-item');
    const active = searchResults.querySelector('.search-result-item.active');
    let idx = -1;
    if (active) idx = Array.from(items).indexOf(active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = idx < items.length - 1 ? items[idx + 1] : items[0];
      if (active) active.classList.remove('active');
      if (next) next.classList.add('active');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx > 0 ? items[idx - 1] : items[items.length - 1];
      if (active) active.classList.remove('active');
      if (prev) prev.classList.add('active');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = active || items[0];
      if (target) {
        navigateToResult(target.dataset.section);
      }
    } else if (e.key === 'Escape') {
      isOpen = false;
      searchBar.classList.remove('open');
      searchInput.value = '';
      searchInput.blur();
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      unlockBodyScroll();
    }
  });

  searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (item) {
      navigateToResult(item.dataset.section);
    }
  });

  searchResults.addEventListener('wheel', (e) => {
    const el = searchResults;
    const atTop = el.scrollTop === 0;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
    } else {
      e.stopPropagation();
    }
  }, { passive: false });

  document.addEventListener('click', (e) => {
    if (isOpen && !searchBar.contains(e.target) && !searchBtn.contains(e.target)) {
      isOpen = false;
      searchBar.classList.remove('open');
      searchInput.value = '';
      searchInput.blur();
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      unlockBodyScroll();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      searchBar.classList.remove('open');
      searchInput.value = '';
      searchInput.blur();
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      unlockBodyScroll();
    }
  });
}

/* ========== PRODUCTS PAGE ========== */
function initProductsPage() {
  const cards = document.querySelectorAll('.product-card, .product-item');
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.6, delay: i * 0.12,
        ease: 'power2.out'
      }
    );
  });

  const backdrop = document.getElementById('product-modal-backdrop');
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('product-modal-content');
  const exitBtn = document.getElementById('product-modal-exit');

  if (!backdrop || !modal || !content || !exitBtn) return;

  if (modal.dataset.productReady) return;
  modal.dataset.productReady = '1';

  function closeProductModal() {
    backdrop.classList.remove('active');
    modal.classList.remove('active');
    unlockBodyScroll();
  }

  exitBtn.addEventListener('click', closeProductModal);
  backdrop.addEventListener('click', closeProductModal);

  function downloadFile(name, content, type, ext) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const productDetails = {
    'HALZIZ AI Sentinel': {
      longDesc: 'HALZIZ AI Sentinel is an advanced surveillance and monitoring platform engineered for Ethiopia\'s critical infrastructure protection. The system leverages deep learning neural networks trained on Ethiopian environments to deliver real-time threat detection, facial recognition, license plate identification, and behavioral anomaly analysis. It integrates seamlessly with existing CCTV infrastructure, providing centralized command-and-control dashboards, automated alert escalation, and forensic video analytics. AI Sentinel supports multi-site deployment with encrypted inter-site communication, redundant storage, and military-grade data protection. The platform is designed for government facilities, financial institutions, transportation hubs, and industrial complexes requiring 24/7 intelligent monitoring with minimal false positive rates.'
    },
    'SkyWatch Drone Platform': {
      longDesc: 'SkyWatch is HALZIZ\'s autonomous drone fleet management platform designed for African aerial operations. It supports multi-drone coordination with AI-powered collision avoidance, dynamic mission planning, and real-time telemetry streaming. The platform includes automated takeoff and landing systems, geofencing, weather-adaptive navigation, and encrypted video downlink for surveillance, inspection, and delivery missions. Applications include pipeline monitoring, agricultural surveying, disaster response, border surveillance, and urban security. SkyWatch integrates with existing command centers and supports both manual override and fully autonomous operation modes with fail-safe return-to-home protocols.'
    },
    'SecureGate Embedded Controller': {
      longDesc: 'SecureGate is an industrial-grade embedded system controller for physical and logical access control in high-security environments. Built on a hardened ARM architecture with tamper-resistant casing, SecureGate manages biometric authentication, RFID proximity cards, PIN pads, and mobile credential verification. It supports offline operation with local credential caching, real-time event logging, and encrypted communication with central management servers. The controller interfaces with electric locks, turnstiles, barriers, and environmental sensors, making it suitable for data centers, government buildings, military installations, and corporate campuses requiring multi-factor access enforcement.'
    },
    'NetMesh SD-WAN Appliance': {
      longDesc: 'NetMesh is a software-defined wide area networking appliance that provides intelligent routing, mesh connectivity, and zero-touch provisioning for distributed organizations across Ethiopia. It dynamically optimizes traffic across multiple WAN links (fiber, 4G/5G, satellite) using real-time latency, jitter, and bandwidth measurements. NetMesh features built-in encryption, application-aware routing, WAN optimization, and centralized orchestration through a cloud-based management console. Designed for banks, telecom operators, government agencies, and enterprises with branch offices, it ensures reliable connectivity even in areas with inconsistent infrastructure, with automatic failover and traffic shaping capabilities.'
    },
    'CyberShield Security Suite': {
      longDesc: 'CyberShield is a comprehensive cybersecurity platform delivering end-to-end protection for Ethiopian enterprise networks. It combines SIEM (Security Information and Event Management), SOAR (Security Orchestration Automation and Response), endpoint detection and response (EDR), network traffic analysis, and vulnerability management in a unified dashboard. CyberShield uses machine learning to detect zero-day threats, ransomware, insider threats, and advanced persistent threats (APTs) with real-time correlation across thousands of events per second. It integrates with existing security tools via REST API and provides automated incident response playbooks, compliance reporting for NIST, ISO 27001, and Ethiopian data protection regulations.'
    },
    'SmartGrid IoT Platform': {
      longDesc: 'SmartGrid is HALZIZ\'s end-to-end IoT management platform for smart city infrastructure across Ethiopia. It aggregates data from thousands of distributed sensors (temperature, humidity, air quality, noise, vibration, energy consumption, water flow) into a unified real-time analytics engine. The platform provides predictive maintenance alerts, automated control loops for street lighting, traffic signals, waste management, and water distribution systems. SmartGrid supports LoRaWAN, NB-IoT, Zigbee, and MQTT protocols with edge computing capabilities for low-latency decision-making at the sensor node level. The dashboard offers GIS-based visualization, historical trend analysis, and automated report generation for municipal authorities.'
    }
  };

  function getProductData(card) {
    const name = card.querySelector('h2, h3')?.textContent || 'HALZIZ Product';
    const shortDesc = card.querySelector('p')?.textContent || '';
    const tags = [...card.querySelectorAll('.product-tag')].map(t => t.textContent);
    const details = productDetails[name] || {};
    return { name, shortDesc, tags, longDesc: details.longDesc || shortDesc };
  }

  function generateSystemContent(name) {
    return `HALZIZ ${name} v1.0\nBuild: 2026.07\nArchitecture: ARM64 / x86_64\nPlatform: HALZIZ Enterprise Suite\n\n--- DISTRIBUTION PACKAGE ---\nThis package contains the ${name} system deployment bundle.\nExtract and run setup.exe or deploy via HALZIZ Manager.\n\nSYSTEM REQUIREMENTS:\n- OS: HALZIZ OS / Ubuntu 22.04+ / Windows Server 2022+\n- CPU: 8+ cores @ 2.8GHz\n- RAM: 32GB+ ECC\n- Storage: 500GB+ NVMe SSD\n- Network: 1Gbps+ dedicated\n\nSHA256: a3f1c8e9d2b4f6a7c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3\n\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`;
  }

  function generateManualContent(name) {
    const docs = {
      'HALZIZ AI Sentinel': `HALZIZ AI Sentinel v1.0 - Full Technical Documentation\n\nPublished: July 2026 | Document ID: HS-001-EN\n\n1. PRODUCT OVERVIEW\nAI Sentinel is a neural-network-based surveillance platform for real-time threat detection, facial recognition, and behavioral analytics deployed across Ethiopian critical infrastructure.\n\n2. SYSTEM ARCHITECTURE\n- Central Server: Distributed microservices on Kubernetes, PostgreSQL time-series DB, Redis caching\n- Edge Nodes: NVIDIA Jetson Orin-based inference units, 256 TOPS each\n- Cameras: PTZ IP cameras with IR, 4K@30fps, ONVIF Profile G/T compliant\n- Network: Isolated VLAN with IPsec tunneling, 10Gbps backbone\n\n3. DEPLOYMENT GUIDE\n3.1 Pre-Installation Checklist\n- Server rack with redundant power (2N configuration)\n- Network switches with L3 routing and ACL support\n- Camera mounting at 3-5m height with 120deg coverage overlap\n3.2 Installation Steps\n- Deploy Kubernetes cluster (minimum 3 control plane + 5 worker nodes)\n- Install HALZIZ Edge Runtime on each inference node\n- Configure camera streams via RTSP or ONVIF discovery\n- Calibrate detection zones through the AI Sentinel Manager UI\n- Run validation suite and tune confidence thresholds\n\n4. CONFIGURATION PARAMETERS\n- Detection sensitivity: 0-100% (default 85%)\n- Alert cooldown: 30-300 seconds (default 60s)\n- Retention period: 7-365 days (default 90 days)\n- Bandwidth limit: 1-1000 Mbps per camera\n\n5. API INTEGRATION\nRESTful API at /api/v1/* with JWT authentication.\nKey endpoints:\n- GET /api/v1/events - query alert history\n- POST /api/v1/streams - register new camera stream\n- PUT /api/v1/zones - define detection zones\n\n6. MAINTENANCE SCHEDULE\n- Daily: Log review, storage usage check\n- Weekly: Model accuracy evaluation, camera health check\n- Monthly: Full system backup, firmware updates\n- Quarterly: Penetration testing, compliance audit\n\n7. COMPLIANCE & CERTIFICATION\n- ISO 27001:2022 aligned\n- Ethiopian Data Protection Proclamation compliant\n- NIST SP 800-53 security controls implemented\n\n---\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`,
      'SkyWatch Drone Platform': `HALZIZ SkyWatch v1.0 - Full Technical Documentation\n\nPublished: July 2026 | Document ID: HS-002-EN\n\n1. PRODUCT OVERVIEW\nSkyWatch is an autonomous drone fleet management platform for aerial surveillance, inspection, and delivery operations across African infrastructure.\n\n2. SYSTEM ARCHITECTURE\n- Ground Control Station: Ruggedized laptop or tablet with HALZIZ Mission Planner\n- Drones: Hexacopter configuration, 45min flight time, 15km range, 5kg payload\n- Communication: 4G/5G cellular + 900MHz encrypted telemetry link\n- Cloud Backend: AWS Ethiopia region, PostgreSQL, real-time WebSocket feeds\n\n3. DEPLOYMENT GUIDE\n3.1 Pre-Flight Setup\n- Select launch site with 10m clearance radius\n- Verify weather conditions (wind < 10m/s, no precipitation)\n- Conduct pre-flight checklist via SkyWatch mobile app\n- Upload mission waypoints from Mission Planner\n\n4. AUTONOMOUS OPERATIONS\n- Waypoint navigation with real-time obstacle avoidance\n- Automated return-to-home on low battery or signal loss\n- Swarm coordination for up to 10 drones simultaneously\n\n5. SAFETY PROTOCOLS\n- Geofencing around no-fly zones (airports, government buildings)\n- Emergency parachute deployment system\n- Redundant flight controller with automatic failover\n\n---\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`,
      'SecureGate Embedded Controller': `HALZIZ SecureGate v1.0 - Full Technical Documentation\n\nPublished: July 2026 | Document ID: HS-003-EN\n\n1. PRODUCT OVERVIEW\nSecureGate is an industrial embedded access controller for high-security physical access management.\n\n2. HARDWARE SPECIFICATIONS\n- SoC: Quad-core ARM Cortex-A72 @ 1.8GHz\n- Memory: 4GB LPDDR4 with ECC\n- Storage: 32GB eMMC + microSD slot\n- Interfaces: 2x Ethernet (PoE+), 4x USB 3.0, RS-485, RS-232, 8x GPIO\n- Environmental: -20degC to 70degC, IP65 rated enclosure\n\n3. ACCESS METHODS\n- Biometric: Fingerprint (optical), facial (IR camera), iris\n- Credential: RFID (13.56MHz, MIFARE DESFire), smart card, PIN\n- Mobile: BLE 5.2 proximity, QR code, NFC\n\n4. INTEGRATION API\nREST API with OAuth 2.0, real-time WebSocket event stream, and Modbus TCP for industrial automation integration.\n\n---\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`,
      'NetMesh SD-WAN Appliance': `HALZIZ NetMesh v1.0 - Full Technical Documentation\n\nPublished: July 2026 | Document ID: HS-004-EN\n\n1. PRODUCT OVERVIEW\nNetMesh is an SD-WAN appliance for intelligent multi-link routing and mesh networking in distributed enterprise environments.\n\n2. HARDWARE\n- CPU: x86 quad-core Intel Celeron J4125\n- RAM: 8GB DDR4\n- Storage: 128GB SSD\n- WAN Ports: 4x Gigabit Ethernet, 2x SFP+\n- LTE/5G: Integrated Quectel RG502Q-EU module\n\n3. FEATURES\n- Dynamic path selection with sub-second failover\n- Application-aware QoS (voice, video, data prioritization)\n- End-to-end AES-256 encryption (IPsec, WireGuard)\n- Zero-touch provisioning via QR code\n- Centralized SD-WAN controller with analytics dashboard\n\n4. PERFORMANCE\n- Throughput: 1Gbps (AES-256 encrypted)\n- Concurrent sessions: 50,000+\n- VPN tunnels: 500+\n- Latency: <5ms added overhead\n\n---\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`,
      'CyberShield Security Suite': `HALZIZ CyberShield v1.0 - Full Technical Documentation\n\nPublished: July 2026 | Document ID: HS-005-EN\n\n1. PRODUCT OVERVIEW\nCyberShield is an enterprise cybersecurity platform combining SIEM, SOAR, EDR, and vulnerability management for Ethiopian networks.\n\n2. ARCHITECTURE\n- Data Collection: Agent-based and agentless log collection, network packet capture via SPAN/mirror ports, cloud API integrations\n- Processing Engine: Apache Kafka event streaming, real-time correlation rules, ML anomaly detection models\n- Storage: Elasticsearch cluster with 90-day hot storage and 1-year cold storage\n- Response: Automated playbooks via SOAR engine, incident ticketing (ServiceNow, Jira integration)\n\n3. DETECTION CAPABILITIES\n- Known threats: 50,000+ IOCs, 1M+ CVE signatures\n- Behavioral: UEBA (User and Entity Behavior Analytics)\n- Network: Deep packet inspection, DNS tunneling detection\n- Endpoint: Process monitoring, file integrity, registry auditing\n\n4. COMPLIANCE FRAMEWORKS\n- NIST Cybersecurity Framework\n- ISO 27001:2022\n- PCI DSS v4.0\n- Ethiopian Data Protection Proclamation\n\n---\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`,
      'SmartGrid IoT Platform': `HALZIZ SmartGrid v1.0 - Full Technical Documentation\n\nPublished: July 2026 | Document ID: HS-006-EN\n\n1. PRODUCT OVERVIEW\nSmartGrid is an IoT management platform for smart city sensor aggregation, analytics, and automated infrastructure control.\n\n2. PLATFORM STACK\n- Edge Gateways: HALZIZ IoT Gateway with ARM Cortex-M4, dual Ethernet, LoRaWAN concentrator\n- Cloud: Microservices on Kubernetes, InfluxDB time-series, Grafana dashboards\n- Protocols: MQTT, CoAP, LoRaWAN, NB-IoT, Zigbee 3.0, Modbus TCP\n\n3. DEPLOYED SENSORS\n- Environmental: Temperature, humidity, air quality (PM2.5, PM10, NO2, CO2)\n- Utility: Smart meters (water, electricity), leak detectors, flow meters\n- Infrastructure: Vibration, tilt, strain gauges for structural health\n- Traffic: Radar-based vehicle counters, smart traffic light controllers\n\n4. ANALYTICS\n- Real-time streaming with Apache Flink\n- Predictive maintenance using Prophet forecasting models\n- Anomaly detection with autoencoder neural networks\n- Automated alerting via SMS, email, and dashboard notifications\n\n---\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`
    };
    return docs[name] || `HALZIZ ${name} v1.0 - Full Technical Documentation\n\nVersion: 1.0\nDate: July 2026\n\n${name} is a HALZIZ enterprise product designed for Ethiopia's digital infrastructure.\n\n---\nHALZIZ - The Monolithic Matrix of Tech\ncontact@halziz.com`;
  }

  function openProductModal(card) {
    const data = getProductData(card);
    content.innerHTML = `
      <div class="pm-layout">
        <div class="pm-image-panel">
          <div class="pm-shell-wrap">
            <svg viewBox="0 0 200 200" class="pm-shell-svg">
              <path d="M100 20 C140 20 170 50 170 90 C170 130 140 160 100 170 C60 160 30 130 30 90 C30 50 60 20 100 20Z" fill="none" stroke="#C0C0C0" stroke-width="1.5" class="pm-shell-c1"/>
              <path d="M100 40 C130 40 150 65 150 90 C150 115 130 140 100 150 C70 140 50 115 50 90 C50 65 70 40 100 40Z" fill="none" stroke="#C0C0C0" stroke-width="1" class="pm-shell-c2"/>
              <path d="M100 60 C118 60 130 75 130 90 C130 105 118 120 100 128 C82 120 70 105 70 90 C70 75 82 60 100 60Z" fill="none" stroke="#808080" stroke-width="0.8" class="pm-shell-c3"/>
              <path d="M100 20 L100 170" stroke="#C0C0C0" stroke-width="0.5" opacity="0.15"/>
              <path d="M30 90 L170 90" stroke="#C0C0C0" stroke-width="0.5" opacity="0.15"/>
            </svg>
            <div class="pm-scan-line"></div>
          </div>
          <div class="pm-shell-status">
            <span class="pm-shell-dot"></span>
            SYSTEM LOADING
          </div>
          <div class="pm-data-grid">
            <div class="pm-data-item">
              <span class="pm-data-label">NAME</span>
              <span class="pm-data-value">${data.name}</span>
            </div>
            <div class="pm-data-item">
              <span class="pm-data-label">TYPE</span>
              <span class="pm-data-value">${data.tags.join(' / ') || 'N/A'}</span>
            </div>
            <div class="pm-data-item">
              <span class="pm-data-label">DEV YEAR</span>
              <span class="pm-data-value">2026</span>
            </div>
            <div class="pm-data-item">
              <span class="pm-data-label">DOWNLOADS</span>
              <span class="pm-data-value">${String(Math.floor(Math.random() * 900 + 100))}</span>
            </div>
            <div class="pm-data-item">
              <span class="pm-data-label">RATING</span>
              <span class="pm-data-value">${(Math.random() * 2 + 3).toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>
        <div class="pm-info-panel">
          <div class="pm-name">${data.name}</div>
          <div class="pm-tags">${data.tags.map(t => `<span class="pm-tag">${t}</span>`).join('')}</div>
          <div class="pm-desc">${data.longDesc}</div>
          <div class="pm-download-label">DOWNLOAD</div>
          <div class="pm-actions">
            <button class="pm-btn pm-btn-system" data-action="system">SYSTEM</button>
            <button class="pm-btn pm-btn-manual" data-action="manual">MANUAL</button>
          </div>
        </div>
      </div>
    `;
    backdrop.classList.add('active');
    modal.classList.add('active');
    lockBodyScroll();

    content.querySelector('[data-action="system"]').addEventListener('click', () => {
      downloadFile(data.name, generateSystemContent(data.name), 'application/zip', '.zip');
    });
    content.querySelector('[data-action="manual"]').addEventListener('click', () => {
      downloadFile(data.name, generateManualContent(data.name), 'application/pdf', '.pdf');
    });
  }

  document.querySelectorAll('.product-card, .product-item').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openProductModal(card));
  });
}

/* ========== INIT ========== */
async function init() {
  initLoadingScreen();

  await preloadImages();

  setTimeout(() => {
    hideLoadingScreen();
    initRouter();
    initCursor();
    initNavScroll();
    initMobileMenu();
    initSmoothScroll();
    initVideoAdSection();
    assignRandomImages();
    initParallax();
    initSearch();

    document.querySelectorAll('.page.active').forEach(p => p.classList.remove('active'));
    const initialPage = location.hash.slice(1) || 'home';
    const page = document.getElementById(initialPage);
    if (page) {
      page.classList.add('active');
      app.currentPage = initialPage;
      updateNavActive(initialPage);
      initPageSpecific(initialPage);
    }

    window.dispatchEvent(new Event('scroll'));
  }, 2500);
}

document.addEventListener('DOMContentLoaded', init);
