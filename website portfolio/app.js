// Tells the CSS that JavaScript is running (so reveal animations are safe to use)
document.documentElement.classList.add('js');

/* ---------- Mobile sidebar ---------- */
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

    // Close the menu after tapping a link
    sideBar.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeSidebar);
    });

    // Close with the Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSidebar();
    });
}

/* ---------- Header background on scroll ---------- */
const header = document.querySelector('.site-header');
function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Reveal sections when they scroll into view ---------- */
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
} else {
    revealItems.forEach(function (el) { el.classList.add('visible'); });
}

/* ---------- Highlight the current section in the nav ---------- */
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

/* ---------- Contact form (sends without leaving the page) ---------- */
const form = document.getElementById('contact-form');

if (form) {
    const status = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        submitBtn.disabled = true;
        status.className = 'form-status';
        status.textContent = 'Sending...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (response.ok) {
                form.reset();
                status.classList.add('success');
                status.textContent = 'Thank you! Your message has been sent. I will get back to you soon.';
            } else {
                throw new Error('Request failed');
            }
        } catch (err) {
            status.classList.add('error');
            status.textContent = 'Sorry, something went wrong. Please email me at prachikapoorpk19@gmail.com.';
        } finally {
            submitBtn.disabled = false;
        }
    });
}

/* ---------- Footer year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
