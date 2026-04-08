// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // ── Theme Toggle System ──────────────────────────────────────────────
    // Manual toggle with localStorage + OS preference detection
    (function initTheme() {
        const html = document.documentElement;
        const storedTheme = localStorage.getItem('sk-theme');
        
        // Set initial theme: stored preference > OS preference > light (default)
        if (storedTheme) {
            html.setAttribute('data-theme', storedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.setAttribute('data-theme', 'light');
        }
        
        // Update toggle button icon
        function updateToggleIcon() {
            const currentTheme = html.getAttribute('data-theme');
            const sunIcon = document.querySelector('.theme-toggle .sun-icon');
            const moonIcon = document.querySelector('.theme-toggle .moon-icon');
            if (sunIcon && moonIcon) {
                if (currentTheme === 'dark') {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                } else {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                }
            }
        }
        
        // Handle toggle button click
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('sk-theme', newTheme);
                updateToggleIcon();
            });
            updateToggleIcon();
        }
    })();

    // ── Transparent nav over hero / parallax entry sections ──────────────
    // Nav stays transparent while scrolling through ALL parallax windows.
    // Only switches to solid (scrolled) once the last parallax window has
    // fully cleared the top of the viewport.
    const heroSection = document.querySelector('.hero, .parallax-window, .instagram-grid-section');
    const navbar = document.querySelector('.navbar');
    if (heroSection && navbar) {
        navbar.classList.add('hero-nav');

        // Desktop: track the LAST parallax window — nav stays transparent/dark-gradient
        // across all mid-page parallax sections (original desktop behaviour).
        // Mobile (≤900px): track only the FIRST parallax window — nav becomes solid
        // once the user scrolls out of the entry hero, preventing it covering content.
        const allPWs = document.querySelectorAll('.parallax-window, .instagram-grid-section');
        let pwBottom = 0;
        function calcPWBottom() {
            if (allPWs.length > 0) {
                const isMobile = window.innerWidth <= 900;
                const target = isMobile ? allPWs[0] : allPWs[allPWs.length - 1];
                pwBottom = target.offsetTop + target.offsetHeight;
            }
        }
        calcPWBottom();
        window.addEventListener('resize', calcPWBottom, { passive: true });

        function handleNavScroll() {
            const navH = navbar.offsetHeight;
            if (window.scrollY + navH >= pwBottom) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', handleNavScroll, { passive: true });
        handleNavScroll(); // run once on load
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
    
    // Update current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitButton = this.querySelector('button[type="submit"]');
        const formStatus = this.querySelector('.form-status');
        if (!formStatus) return;

        submitButton.classList.add('loading');
        submitButton.disabled = true;
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: new FormData(this),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = "Thanks \u2014 we'll be in touch within one working day.";
                formStatus.className = 'form-status success';
                this.querySelectorAll('.form-group, button[type="submit"]').forEach(function(el) { el.style.display = 'none'; });
                this.reset();
            } else {
                const data = await response.json();
                const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Something went wrong. Please try again or email us directly.';
                formStatus.textContent = msg;
                formStatus.className = 'form-status error';
            }
        } catch {
            formStatus.textContent = 'Could not send your message. Please email matthew@sixkingdoms.org directly.';
            formStatus.className = 'form-status error';
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            observer.unobserve(card);
            // Remove inline styles after transition so CSS :hover transforms work normally
            setTimeout(() => {
                card.style.opacity = '';
                card.style.transform = '';
            }, 700);
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.service-card, .project-card, .benefit-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Scroll-to-top button
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Add active state to current page in navigation
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Stats count-up animation
(function() {
    const statsNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statsNumbers.length) return;

    const countUp = (el) => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();
        const isDecimal = String(target).includes('.');

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = target * eased;
            el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsNumbers.forEach(el => io.observe(el));
})();

// Contact form pre-fill from URL parameters
(function() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type) {
        const subjectField = document.querySelector('select[name="subject"], input[name="subject"]');
        if (subjectField) subjectField.value = type;
    }
})();

// Project filtering
const filterButtons = document.querySelectorAll('.filter-btn');
if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            document.querySelectorAll('.projects-grid .project-card').forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// ── Project Modal ──────────────────────────────────────────
(function () {
    const modal      = document.getElementById('project-modal');
    if (!modal) return;

    const imgEl      = modal.querySelector('#modal-image');
    const tagEl      = modal.querySelector('#modal-tag');
    const titleEl    = modal.querySelector('#modal-title');
    const descEl     = modal.querySelector('#modal-description');
    const closeBtn   = modal.querySelector('.modal-close');
    const prevBtn    = modal.querySelector('.modal-prev');
    const nextBtn    = modal.querySelector('.modal-next');
    const counterEl  = document.getElementById('modal-counter');
    const prevProjectBtn = modal.querySelector('.modal-prev-project');
    const nextProjectBtn = modal.querySelector('.modal-next-project');
    const projectCountEl = modal.querySelector('.modal-project-count');
    let lastFocused  = null;
    let currentGroup = [];
    let currentIdx   = 0;
    let projectGroups      = [];
    let currentProjectIdx  = 0;

    function buildProjectGroups(allTriggers) {
        projectGroups = [];
        if (!allTriggers.length) return;
        if (allTriggers[0].classList.contains('pool-gallery-item')) {
            var tagOrder = [];
            var tagMap   = {};
            allTriggers.forEach(function (t) {
                var tag = t.dataset.tag || '';
                if (!tagMap[tag]) { tagMap[tag] = []; tagOrder.push(tag); }
                tagMap[tag].push(t);
            });
            tagOrder.forEach(function (tag) { projectGroups.push(tagMap[tag]); });
        } else {
            allTriggers.forEach(function (t) { projectGroups.push([t]); });
        }
    }

    function updateProjectCount() {
        if (projectGroups.length > 1) {
            if (projectCountEl) {
                projectCountEl.textContent = 'Project ' + (currentProjectIdx + 1) + ' of ' + projectGroups.length;
                projectCountEl.style.display = '';
            }
            if (prevProjectBtn) prevProjectBtn.style.visibility = '';
            if (nextProjectBtn) nextProjectBtn.style.visibility = '';
        } else {
            if (projectCountEl) projectCountEl.style.display = 'none';
            if (prevProjectBtn) prevProjectBtn.style.visibility = 'hidden';
            if (nextProjectBtn) nextProjectBtn.style.visibility = 'hidden';
        }
    }

    function navigateProject(dir) {
        currentProjectIdx = (currentProjectIdx + dir + projectGroups.length) % projectGroups.length;
        currentGroup = projectGroups[currentProjectIdx];
        currentIdx   = 0;
        populateModal(currentGroup[0]);
        updateProjectCount();
    }

    function populateModal(trigger) {
        imgEl.src           = trigger.dataset.image || '';
        imgEl.alt           = trigger.dataset.alt   || '';
        tagEl.textContent   = trigger.dataset.tag   || '';
        titleEl.textContent = trigger.dataset.title || '';
        descEl.textContent  = trigger.dataset.description || '';
        // Update counter if present
        if (counterEl) {
            if (currentGroup.length > 1) {
                counterEl.textContent = (currentIdx + 1) + ' / ' + currentGroup.length;
                counterEl.style.display = '';
            } else {
                counterEl.style.display = 'none';
            }
        }
        // Show/hide prev-next based on group size
        if (prevBtn) prevBtn.style.visibility = currentGroup.length > 1 ? '' : 'hidden';
        if (nextBtn) nextBtn.style.visibility = currentGroup.length > 1 ? '' : 'hidden';
    }

    function openModal(trigger) {
        lastFocused = document.activeElement;
        var allVisible;

        // If this is a pool gallery item, group by project tag for in-project navigation.
        if (trigger.classList.contains('pool-gallery-item')) {
            var tag = trigger.dataset.tag || '';
            allVisible = Array.from(document.querySelectorAll('.pool-gallery-item.modal-trigger')).filter(function (t) {
                if (t.classList.contains('gallery-filter-hidden')) return false;
                if (t.classList.contains('gallery-extra') && !t.classList.contains('visible')) {
                    return t.offsetParent !== null;
                }
                return true;
            });
            currentGroup = allVisible.filter(function (t) { return t.dataset.tag === tag; });
            buildProjectGroups(allVisible);
            currentProjectIdx = projectGroups.findIndex(function (g) { return g[0].dataset.tag === tag; });
        } else {
            // Default: build navigation group from all visible modal-triggers.
            allVisible = Array.from(document.querySelectorAll('.modal-trigger')).filter(function (t) {
                if (t.classList.contains('gallery-filter-hidden')) return false;
                if (t.classList.contains('gallery-extra') && !t.classList.contains('visible')) {
                    return t.offsetParent !== null;
                }
                return true;
            });
            currentGroup = allVisible;
            buildProjectGroups(allVisible);
            currentProjectIdx = projectGroups.findIndex(function (g) { return g[0] === trigger; });
        }

        if (currentProjectIdx < 0) currentProjectIdx = 0;
        currentIdx = currentGroup.indexOf(trigger);
        populateModal(trigger);
        updateProjectCount();
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function navigate(dir) {
        currentIdx = (currentIdx + dir + currentGroup.length) % currentGroup.length;
        populateModal(currentGroup[currentIdx]);
    }

    function closeModal() {
        modal.setAttribute('hidden', '');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.modal-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function () { openModal(trigger); });
        trigger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(trigger); }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    if (prevBtn) prevBtn.addEventListener('click', function () { navigate(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { navigate(1); });
    if (prevProjectBtn) prevProjectBtn.addEventListener('click', function () { navigateProject(-1); });
    if (nextProjectBtn) nextProjectBtn.addEventListener('click', function () { navigateProject(1); });
    // Click image itself to advance
    imgEl.addEventListener('click', function () { navigate(1); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
        if (modal.hasAttribute('hidden')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft')  navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    // Swipe gesture support for mobile
    // Attach to .modal-window so swipes on the image area navigate,
    // while vertical swipes on .modal-body still scroll normally.
    var touchStartX = 0;
    var touchStartY = 0;
    var modalWin = modal.querySelector('.modal-window');
    if (modalWin) {
        modalWin.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });
        modalWin.addEventListener('touchend', function (e) {
            var dx = touchStartX - e.changedTouches[0].clientX;
            var dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
            // Only fire when it's clearly a horizontal swipe (not a vertical scroll)
            if (Math.abs(dx) > 48 && Math.abs(dx) > dy) {
                navigate(dx > 0 ? 1 : -1);
            }
        }, { passive: true });
    }
}());

// ── Gallery load-more ──────────────────────────────────────────
(function () {
    var btn = document.querySelector('.gallery-load-more');
    if (!btn) return;
    btn.addEventListener('click', function () {
        document.querySelectorAll('.gallery-extra').forEach(function (el) {
            el.classList.add('visible');
        });
        btn.remove();
    });
}());

// ── Gallery project filter tabs (desktop) ──────────────────────
(function () {
    var filterBtns = document.querySelectorAll('.gallery-filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var filter = this.dataset.galleryFilter;

            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            document.querySelectorAll('.pool-gallery-item').forEach(function (item) {
                if (filter === 'all' || item.dataset.title === filter) {
                    item.classList.remove('gallery-filter-hidden');
                } else {
                    item.classList.add('gallery-filter-hidden');
                }
            });
        });
    });
}());

// ── Reviews Carousel ───────────────────────────────────────────
// Shows one testimonial at a time with prev/next arrows and dot navigation.
(function () {
    var track = document.querySelector('.reviews-carousel-track');
    if (!track) return;

    var cards   = Array.from(track.querySelectorAll('.testimonial-card'));
    var dots    = Array.from(document.querySelectorAll('.reviews-dot'));
    var prevBtn = document.querySelector('.reviews-prev');
    var nextBtn = document.querySelector('.reviews-next');
    if (!cards.length) return;

    var current = 0;

    function showReview(idx) {
        cards.forEach(function (c, i) {
            c.classList.toggle('active', i === idx);
        });
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === idx);
            d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        });
        current = idx;
    }

    // Wire dots
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { showReview(i); });
    });

    // Wire arrows
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            showReview((current - 1 + cards.length) % cards.length);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            showReview((current + 1) % cards.length);
        });
    }

    // Keyboard navigation when focus is inside the carousel
    track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); showReview((current - 1 + cards.length) % cards.length); }
        if (e.key === 'ArrowRight') { e.preventDefault(); showReview((current + 1) % cards.length); }
    });

    // Auto-advance every 6 seconds
    var autoTimer = setInterval(function () {
        showReview((current + 1) % cards.length);
    }, 6000);

    // Pause on hover / focus
    var carousel = document.querySelector('.reviews-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
        carousel.addEventListener('focusin',    function () { clearInterval(autoTimer); });
    }

    // Initialise first card as active
    showReview(0);
}());

// ── Mobile Parallax Workaround ─────────────────────────────────
// background-attachment: fixed is broken on iOS WebKit (image
// doesn't scroll at all) and causes full-page repaints on Android.
// On mobile (≤900px) we inject a .pw-bg-layer child div and drive
// it with translateY via rAF, giving true parallax depth on all
// mobile browsers including iOS Safari.
(function initMobileParallax() {
    if (!window.matchMedia('(max-width: 900px)').matches) return;

    var pws = Array.from(document.querySelectorAll('.parallax-window'));
    if (!pws.length) return;

    pws.forEach(function (pw) {
        var bgImg = window.getComputedStyle(pw).backgroundImage;
        if (!bgImg || bgImg === 'none') return;
        var layer = document.createElement('div');
        layer.className = 'pw-bg-layer';
        layer.style.backgroundImage = bgImg;
        pw.style.backgroundImage = 'none';
        pw.insertBefore(layer, pw.firstChild);
    });

    var ticking = false;

    function updateLayers() {
        var vh = window.innerHeight;
        pws.forEach(function (pw) {
            var layer = pw.querySelector('.pw-bg-layer');
            if (!layer) return;
            var rect = pw.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > vh) return;
            // progress 0 = PW bottom at viewport top, 1 = PW top at viewport bottom
            var progress = (vh - rect.top) / (vh + rect.height);
            // Translate ±15% of the PW height — matches the 30% top/bottom oversize
            var offset = (progress - 0.5) * pw.offsetHeight * 0.3;
            layer.style.transform = 'translateY(' + offset.toFixed(2) + 'px)';
        });
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateLayers);
            ticking = true;
        }
    }, { passive: true });

    updateLayers(); // set initial position without waiting for scroll
}());
