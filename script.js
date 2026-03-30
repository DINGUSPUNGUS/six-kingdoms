// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // ── Transparent nav over hero / parallax entry sections ──────────────
    // Nav stays transparent while scrolling through ALL parallax windows.
    // Only switches to solid (scrolled) once the last parallax window has
    // fully cleared the top of the viewport.
    const heroSection = document.querySelector('.hero, .parallax-window');
    const navbar = document.querySelector('.navbar');
    if (heroSection && navbar) {
        navbar.classList.add('hero-nav');

        // Calculate the scroll position at which the last PW clears the nav
        const allPWs = document.querySelectorAll('.parallax-window');
        let pwBottom = 0;
        function calcPWBottom() {
            if (allPWs.length > 0) {
                const last = allPWs[allPWs.length - 1];
                pwBottom = last.offsetTop + last.offsetHeight;
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
                formStatus.textContent = 'Thank you for your message! We will get back to you soon.';
                formStatus.className = 'form-status success';
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
    let lastFocused  = null;

    function openModal(trigger) {
        lastFocused = document.activeElement;
        imgEl.src           = trigger.dataset.image || '';
        imgEl.alt           = trigger.dataset.alt   || '';
        tagEl.textContent   = trigger.dataset.tag   || '';
        titleEl.textContent = trigger.dataset.title || '';
        descEl.textContent  = trigger.dataset.description || '';
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
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
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });
}());
