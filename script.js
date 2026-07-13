// ============================================
// NAV: scroll state + mobile toggle
// ============================================
const nav = document.getElementById('nav');
const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// HERO: typewriter code effect
// ============================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const codeLines = [
  { text: 'const developer = {', type: 'plain' },
  { text: '  name: ', type: 'key', tail: [{ t: "'David Kipchumba'", c: 'tok-str' }, { t: ',', c: 'tok-punc' }] },
  { text: '  role: ', type: 'key', tail: [{ t: "'Full-Stack Engineer'", c: 'tok-str' }, { t: ',', c: 'tok-punc' }] },
  { text: '  stack: ', type: 'key', tail: [{ t: "['React', 'Node', 'AWS']", c: 'tok-str' }, { t: ',', c: 'tok-punc' }] },
  { text: '  available: ', type: 'key', tail: [{ t: 'true', c: 'tok-kw' }, { t: ',', c: 'tok-punc' }] },
  { text: '  responseTime: ', type: 'key', tail: [{ t: "'< 24h'", c: 'tok-str' } ] },
  { text: '};', type: 'plain' },
  { text: '', type: 'plain' },
  { text: '// let\'s build something', type: 'comment' },
  { text: 'ship(developer);', type: 'call' },
];

const codeEl = document.getElementById('typedCode');
const cursorEl = document.getElementById('cursor');

function renderStaticCode() {
  // Fallback for reduced motion: render immediately, fully styled
  codeEl.innerHTML = codeLines.map(line => buildLineHTML(line)).join('\n');
}

function buildLineHTML(line) {
  if (line.type === 'comment') return `<span class="tok-com">${escapeHTML(line.text)}</span>`;
  if (line.type === 'call') return `<span class="tok-key">ship</span><span class="tok-punc">(</span><span class="tok-str">developer</span><span class="tok-punc">);</span>`;
  if (line.type === 'key') {
    const tail = (line.tail || []).map(seg => `<span class="${seg.c}">${escapeHTML(seg.t)}</span>`).join(' ');
    return `<span class="tok-key">${escapeHTML(line.text)}</span>${tail}`;
  }
  return escapeHTML(line.text);
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function typeCode() {
  if (reduceMotion) { renderStaticCode(); return; }

  for (const line of codeLines) {
    const lineSpan = document.createElement('div');
    codeEl.appendChild(lineSpan);
    const plainText = line.type === 'call'
      ? 'ship(developer);'
      : line.type === 'key'
        ? line.text + (line.tail || []).map(s => s.t).join(' ')
        : line.text;

    for (let i = 0; i <= plainText.length; i++) {
      lineSpan.textContent = plainText.slice(0, i);
      await sleep(plainText.length === 0 ? 0 : 14);
    }
    // swap in syntax-highlighted version once fully typed
    lineSpan.innerHTML = buildLineHTML(line);
    await sleep(90);
  }
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

typeCode();

// ============================================
// STAT COUNTERS
// ============================================
const statEls = document.querySelectorAll('.stat-num');
let countersStarted = false;

function animateCounters() {
  if (countersStarted) return;
  countersStarted = true;
  statEls.forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    let current = 0;
    const duration = 1200;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, stepTime);
  });
}

// ============================================
// SCROLL REVEAL
// ============================================
const revealTargets = document.querySelectorAll(
  '.about-grid, .services-grid, .work-grid, .git-log, .testimonial-grid, .contact-inner, .trust-strip'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));

// trigger counters when hero stats scroll into view (they're visible on load usually, so also check immediately)
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ============================================
// CONTACT FORM (front-end only — no backend wired up)
// ============================================
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !message) {
    showStatus('Please fill in your name, email, and project details.', true);
    return;
  }
  if (!emailPattern.test(email)) {
    showStatus('Please enter a valid email address.', true);
    return;
  }

 // Send data to Formspree backend
  showStatus('Sending message...', false);
  
  fetch('https://formspree.io/f/xjgnbqqe', {
    method: 'POST',
    body: new FormData(form),
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      showStatus(`Thanks, ${name}! Your message has been sent successfully.`, false);
      form.reset();
    } else {
      showStatus('Oops! There was a problem submitting your form.', true);
    }
  })
  .catch(error => {
    showStatus('Oops! There was a problem connecting to the server.', true);
  });
});

function showStatus(text, isError) {
  formStatus.textContent = text;
  formStatus.classList.toggle('error', isError);
}
