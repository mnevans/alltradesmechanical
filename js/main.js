'use strict';

const NAV_H = 104; // header height

document.getElementById('copyright-year').textContent = new Date().getFullYear();

/* ── Smooth scroll ── */
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - NAV_H, behavior: 'smooth' });
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-hidden', 'true');
    });
});

/* ── Navbar: shadow + active link ── */
const navbar    = document.getElementById('topbar');
const navLinks  = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');
const sections  = Array.from(document.querySelectorAll('section[id]'));

function updateNav() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5;
    let activeId = null;

    if (atBottom) {
        activeId = sections.at(-1)?.id ?? null;
    } else {
        for (const sec of sections) {
            if (sec.getBoundingClientRect().top <= NAV_H + 10) activeId = sec.id;
        }
    }

    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${activeId}`);
    });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ── Mobile nav toggle ── */
navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    navLinks.classList.toggle('open', !open);
    navLinks.setAttribute('aria-hidden', String(open));
});

/* ── Gallery + lightbox ── */
const thumbBtns  = Array.from(document.querySelectorAll('.gallery-thumb-btn'));
const previewImg = document.getElementById('preview');
const previewBtn = document.getElementById('previewBtn');
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
let currentIndex = 0;
let lightboxTrigger = null;

function setGalleryImage(index) {
    currentIndex = ((index % thumbBtns.length) + thumbBtns.length) % thumbBtns.length;
    const activeBtn = thumbBtns[currentIndex];
    const label = activeBtn.getAttribute('aria-label');
    const src   = activeBtn.querySelector('img').src;
    previewImg.src = src;
    previewImg.alt = label;
    if (previewBtn) previewBtn.setAttribute('aria-label', `View full size: ${label}`);
    if (lbImg) { lbImg.src = src; lbImg.alt = label; }
    thumbBtns.forEach((btn, i) => {
        const active = i === currentIndex;
        btn.classList.toggle('active-thumb', active);
        btn.setAttribute('aria-current', active ? 'true' : 'false');
    });
}

thumbBtns.forEach((btn, i) => btn.addEventListener('click', () => setGalleryImage(i)));

document.getElementById('galleryPrev')?.addEventListener('click', () => setGalleryImage(currentIndex - 1));
document.getElementById('galleryNext')?.addEventListener('click', () => setGalleryImage(currentIndex + 1));

/* ── Lightbox focus trap ── */
function getFocusable(container) {
    return Array.from(container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.hasAttribute('disabled'));
}

function trapFocus(e) {
    if (!lightbox.classList.contains('open')) return;
    const focusable = getFocusable(lightbox);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
    }
}

/* Open lightbox when preview is clicked */
previewBtn?.addEventListener('click', () => {
    if (!lightbox) return;
    lightboxTrigger = previewBtn;
    lbImg.src = previewImg.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose')?.focus();
});

/* Lightbox controls */
function closeLightbox() {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
    lightboxTrigger?.focus();
    lightboxTrigger = null;
}

lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
});

document.getElementById('lbClose')?.addEventListener('click', closeLightbox);

document.getElementById('lbPrev')?.addEventListener('click', e => {
    e.stopPropagation();
    setGalleryImage(currentIndex - 1);
});

document.getElementById('lbNext')?.addEventListener('click', e => {
    e.stopPropagation();
    setGalleryImage(currentIndex + 1);
});

document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  setGalleryImage(currentIndex - 1);
    if (e.key === 'ArrowRight') setGalleryImage(currentIndex + 1);
    trapFocus(e);
});
