const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   Live starfield (gently follows the mouse)
   ========================================================= */
(function starfield() {
    const canvas = document.getElementById('stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars = [];
    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let running = true;

    // Three depth layers: far stars are small and move little
    const layers = [
        { size: 0.6, speed: 0.02, parallax: 6, share: 0.6 },
        { size: 1.0, speed: 0.05, parallax: 14, share: 0.3 },
        { size: 1.6, speed: 0.09, parallax: 26, share: 0.1 }
    ];
    const tints = ['255,255,255', '200,190,255', '170,235,255'];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const total = Math.min(Math.round((width * height) / 3200), 600);
        stars = [];
        layers.forEach(function (layer) {
            const count = Math.round(total * layer.share);
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: layer.size * (0.6 + Math.random() * 0.8),
                    layer: layer,
                    tint: tints[Math.floor(Math.random() * tints.length)],
                    phase: Math.random() * Math.PI * 2,
                    twinkle: 0.5 + Math.random() * 1.5
                });
            }
        });
        if (reduceMotion) draw(0);
    }

    function draw(time) {
        ctx.clearRect(0, 0, width, height);
        offsetX += (mouseX - offsetX) * 0.05;
        offsetY += (mouseY - offsetY) * 0.05;

        for (const s of stars) {
            if (!reduceMotion) {
                s.y -= s.layer.speed;
                if (s.y < -5) {
                    s.y = height + 5;
                    s.x = Math.random() * width;
                }
            }
            const x = s.x + offsetX * s.layer.parallax;
            const y = s.y + offsetY * s.layer.parallax;
            const alpha = reduceMotion ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(time * 0.001 * s.twinkle + s.phase));

            ctx.beginPath();
            ctx.arc(x, y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + s.tint + ',' + alpha + ')';
            ctx.fill();
        }
    }

    function loop(time) {
        if (!running) return;
        draw(time);
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) {
        mouseX = (e.clientX / width - 0.5) * -1;
        mouseY = (e.clientY / height - 0.5) * -1;
    });

    // Pause when the tab is hidden to save battery
    document.addEventListener('visibilitychange', function () {
        if (reduceMotion) return;
        running = !document.hidden;
        if (running) requestAnimationFrame(loop);
    });

    resize();
    if (!reduceMotion) requestAnimationFrame(loop);
})();

/* =========================================================
   Mobile menu
   ========================================================= */
const sideBar = document.querySelector('.sidebar');
const menuBtn = document.querySelector('.menu-icon');
const closeBtn = document.querySelector('.close-icon');
const backdrop = document.querySelector('.sidebar-backdrop');

function openSidebar() {
    sideBar.classList.add('open');
    backdrop.classList.add('show');
    document.body.classList.add('no-scroll');
    sideBar.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
    sideBar.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.classList.remove('no-scroll');
    sideBar.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
}

if (sideBar && menuBtn && closeBtn && backdrop) {
    menuBtn.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);
    sideBar.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeSidebar);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSidebar();
    });
}

/* =========================================================
   Header background after scrolling
   ========================================================= */
const header = document.querySelector('.site-header');
function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* =========================================================
   Highlight the current section in the nav
   ========================================================= */
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('main section[id]');

if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                navLinks.forEach(function (link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
}

/* =========================================================
   3D tilt on project previews (mouse only)
   ========================================================= */
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.project-frame').forEach(function (frame) {
        frame.addEventListener('mousemove', function (e) {
            const rect = frame.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            frame.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
            frame.style.setProperty('--rx', (y * -8).toFixed(2) + 'deg');
        });
        frame.addEventListener('mouseleave', function () {
            frame.style.setProperty('--ry', '0deg');
            frame.style.setProperty('--rx', '0deg');
        });
    });
}

/* =========================================================
   Contact form (sends without leaving the page)
   ========================================================= */
const form = document.getElementById('contact-form');

if (form) {
    const status = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        status.className = 'form-status';
        status.textContent = '';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error('Request failed');

            form.reset();
            status.classList.add('success');
            status.textContent = 'Message sent. I will reply within a day.';
        } catch (err) {
            status.classList.add('error');
            status.textContent = 'Message not sent. Check your connection and try again, or email prachikapoorpk19@gmail.com.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send message';
        }
    });
}

/* Footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
