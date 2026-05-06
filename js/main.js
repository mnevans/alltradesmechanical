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
        // close mobile nav if open
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

/* ── Navbar: shadow + active link ── */
const navbar  = document.getElementById('topbar');
const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');
const sections = Array.from(document.querySelectorAll('section[id]'));

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
});

/* ── Gallery + lightbox ── */
const thumbs     = Array.from(document.querySelectorAll('.gallery-thumb'));
const previewImg = document.getElementById('preview');
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
let currentIndex = 0;

function setGalleryImage(index) {
    currentIndex = ((index % thumbs.length) + thumbs.length) % thumbs.length;
    const src = thumbs[currentIndex].src;
    previewImg.src = src;
    if (lbImg) lbImg.src = src;
    thumbs.forEach((t, i) => t.classList.toggle('active-thumb', i === currentIndex));
}

thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => setGalleryImage(i)));

document.getElementById('galleryPrev')?.addEventListener('click', () => setGalleryImage(currentIndex - 1));
document.getElementById('galleryNext')?.addEventListener('click', () => setGalleryImage(currentIndex + 1));

/* Open lightbox when the preview is clicked */
document.querySelector('.preview')?.addEventListener('click', () => {
    if (!lightbox) return;
    lbImg.src = previewImg.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
});

/* Lightbox controls */
function closeLightbox() {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
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
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  setGalleryImage(currentIndex - 1);
    if (e.key === 'ArrowRight') setGalleryImage(currentIndex + 1);
});
