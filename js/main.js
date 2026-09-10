/**
 * main.js - Global Button Click & Form Redirection Handler
 * Requirement: Any button clicked outside of <nav> and <footer> redirects to 404.html
 */
document.addEventListener('DOMContentLoaded', function () {
    // 0. Update public navbar for authenticated users
    try {
        const authDataStr = localStorage.getItem('stackly_auth');
        if (authDataStr) {
            const auth = JSON.parse(authDataStr);
            if (auth && auth.isLoggedIn) {
                const joinBtns = document.querySelectorAll('.join-btn, .nav-actions a[href="signin.html"], .signin-nav-right a[href="signin.html"]');
                joinBtns.forEach(function (btn) {
                    btn.href = 'dashboard.html';
                    btn.innerHTML = '<i class="fa-solid fa-gauge-high" style="margin-right: 6px;"></i> DASHBOARD';
                    btn.setAttribute('title', 'Logged in as ' + (auth.role || 'User'));
                    btn.classList.add('btn-nav-dashboard');
                });
            }
        }
    } catch (err) {
        console.error('Error reading auth state:', err);
    }

    // 1. Intercept all button, CTA, and footer icon click events
    document.addEventListener('click', function (e) {
        // Requirement: Footer social icon clicks redirect to 404.html
        const footerSocialLink = e.target.closest('.social-links a, footer .social-links a, .footer .social-links a, .social-links, footer a[aria-label="Globe"], footer a[aria-label="Share"], footer a[aria-label="YouTube"]');
        if (footerSocialLink || (e.target.closest('footer, .footer') && (e.target.matches('i, svg') || e.target.closest('.social-links a')))) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '404.html';
            return;
        }

        // Requirement: Specified CTA buttons/links redirect to 404.html
        // (read memo, READ OUR FULL STORY, VIEW ALL CASE STUDIES, VIEW SECTOR SOLUTIONS, READ ALL ARTICLES, View Bio, PDF, PRIORITY LINE)
        const ctaCandidate = e.target.closest('a, button, [class*="link"], [class*="btn"], .memo-link, .expert-bio-link, .expedited-link, .report-download-tag');
        if (ctaCandidate) {
            const isInsideNavOrDrawer = ctaCandidate.closest('nav, .navbar, .public-nav-sidebar, .dash-sidebar, .dash-topbar');
            if (!isInsideNavOrDrawer) {
                const text = (ctaCandidate.textContent || '').trim().toLowerCase();
                const href = (ctaCandidate.getAttribute('href') || '').toLowerCase();

                const matchesTargetCta =
                    text.includes('read memo') || ctaCandidate.classList.contains('memo-link') ||
                    text.includes('read our full story') || text.includes('our full story') ||
                    text.includes('view all case studies') || text.includes('all case studies') ||
                    text.includes('view sector solutions') || text.includes('sector solutions') ||
                    text.includes('read all articles') || text.includes('all articles') ||
                    text.includes('view bio') || ctaCandidate.classList.contains('expert-bio-link') ||
                    text.includes('priority line') || ctaCandidate.classList.contains('expedited-link') ||
                    text.includes('pdf') || ctaCandidate.classList.contains('report-download-tag') || href.includes('.pdf') || href.includes('#pdf') || href.includes('#methodology');

                if (matchesTargetCta) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = '404.html';
                    return;
                }
            }
        }

        // Find if target is or is inside a button, button-like anchor, or submit input
        const target = e.target.closest('button, [class*="btn"], input[type="submit"], input[type="button"]');
        if (!target) return;

        // Allow signin and signup form submits, role selectors, and inputs to work
        if (target.id === 'btn-signin-submit' || target.classList.contains('btn-signin-submit') || target.closest('#signin-form') || target.classList.contains('role-select-btn') || target.id === 'btn-signup-submit' || target.classList.contains('btn-signup-submit') || target.closest('#signup-form') || target.closest('.role-card')) {
            return;
        }

        // EXCEPT navbar and footer: Allow all navigation inside nav, header, and footer to function normally
        if (target.closest('nav') || target.closest('header') || target.closest('footer') || target.closest('.navbar') || target.closest('.footer') || target.closest('.signin-footer') || target.closest('.signup-footer') || target.closest('.public-nav-sidebar') || target.closest('.public-sidebar-backdrop') || target.closest('.nav-hamburger-btn') || target.id === 'nav-hamburger-btn' || target.id === 'public-sidebar-close') {
            return;
        }

        // Allow Back to Home navigation and Back to Top
        if (target.id === 'backToTopBtn' || target.closest('#backToTopBtn') || target.id === 'nav-back-to-home' || target.id === 'card-back-to-home' || (target.textContent && target.textContent.trim().toLowerCase().includes('back to home'))) {
            return;
        }

        // On 404 page itself, allow "RETURN TO HOMEPAGE" and "RETURN TO DASHBOARD"
        if (window.location.pathname.endsWith('404.html') || window.location.href.includes('404.html')) {
            if (target.getAttribute('href') === 'index.html' || (target.textContent && target.textContent.trim().toLowerCase().includes('homepage'))) {
                return;
            }
            if (target.id === 'btn-return-dashboard' || target.getAttribute('href') === 'dashboard.html' || (target.textContent && target.textContent.trim().toLowerCase().includes('dashboard'))) {
                return;
            }
        }

        // Allow password visibility toggle icon button on signup
        if (target.id === 'togglePassword' || target.closest('#togglePassword')) {
            return;
        }

        // On Dashboard page: Allow sidebar navigation, mobile menu toggle, and logout button to function
        if (window.location.pathname.endsWith('dashboard.html') || window.location.href.includes('dashboard.html')) {
            if (target.closest('.dashboard-sidebar') || target.closest('.dash-sidebar') || target.id === 'dashboard-menu-toggle' || target.id === 'dash-logout-btn' || target.classList.contains('dash-logout')) {
                return;
            }
        }

        // All other buttons outside nav & footer redirect to 404.html
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '404.html';
    }, true);

    // 2. Intercept form submissions outside nav, footer, and signin form
    document.addEventListener('submit', function (e) {
        const form = e.target;

        // Allow signin and signup forms to execute their validation and authentication
        if (form.id === 'signin-form' || form.closest('#signin-form') || form.id === 'signup-form' || form.closest('#signup-form')) {
            return;
        }

        if (form.closest('nav') || form.closest('footer') || form.closest('.navbar') || form.closest('.footer') || form.closest('.public-nav-sidebar')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        window.location.href = '404.html';
    }, true);

    // 3. Initialize Public Mobile Navbar Drawer (Dashboard sidebar experience)
    initPublicMobileNav();

    // 4. Initialize Animations & Interactive Micro-interactions (Public pages only - EXCLUDE dashboard.html)
    const isDashboard = window.location.pathname.endsWith('dashboard.html') || window.location.href.includes('dashboard.html');
    if (!isDashboard) {
        initCountUpAnimations();
        initScrollRevealAnimations();
        initTimelineStepAnimation();
        initChronologyTimeline();
        initScrollEnhancements();
    }
});

/**
 * Initialize Public Mobile Navbar Drawer
 * Replicates the Dashboard Sidebar Drawer experience on mobile (< 992px)
 */
function initPublicMobileNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // 1. Ensure hamburger button exists in .nav-actions
    const navActions = navbar.querySelector('.nav-actions');
    let hamburgerBtn = document.getElementById('nav-hamburger-btn');
    if (!hamburgerBtn && navActions) {
        hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'nav-hamburger-btn';
        hamburgerBtn.id = 'nav-hamburger-btn';
        hamburgerBtn.setAttribute('aria-label', 'Open Navigation Drawer');
        hamburgerBtn.setAttribute('type', 'button');
        hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        navActions.appendChild(hamburgerBtn);
    }

    // 2. Ensure Backdrop exists
    let backdrop = document.getElementById('public-sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'public-sidebar-backdrop';
        backdrop.id = 'public-sidebar-backdrop';
        document.body.appendChild(backdrop);
    }

    // 3. Ensure Mobile Drawer exists
    let drawer = document.getElementById('public-nav-sidebar');
    if (!drawer) {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

        const navLinksData = [
            { href: 'index.html', label: 'Home', icon: 'fa-house' },
            { href: 'about.html', label: 'About Us', icon: 'fa-building' },
            { href: 'solutions.html', label: 'Solutions', icon: 'fa-lightbulb' },
            { href: 'services.html', label: 'Services', icon: 'fa-gears' },
            { href: 'teams.html', label: 'Our Team', icon: 'fa-users' },
            { href: 'insights.html', label: 'Insights', icon: 'fa-chart-line' },
            { href: 'contact.html', label: 'Contact Us', icon: 'fa-envelope' }
        ];

        let linksHtml = navLinksData.map(item => {
            const isActive = currentFile === item.href || (currentFile === '' && item.href === 'index.html');
            return `
                <li class="public-sidebar-item">
                    <a href="${item.href}" class="public-sidebar-link ${isActive ? 'active' : ''}">
                        <div class="public-sidebar-link-content">
                            <i class="fa-solid ${item.icon} link-icon"></i>
                            <span>${item.label}</span>
                        </div>
                        <i class="fa-solid fa-chevron-right arrow-icon"></i>
                    </a>
                </li>
            `;
        }).join('');

        drawer = document.createElement('aside');
        drawer.className = 'public-nav-sidebar';
        drawer.id = 'public-nav-sidebar';
        drawer.setAttribute('aria-label', 'Mobile Navigation Drawer');
        drawer.innerHTML = `
            <div class="public-sidebar-header">
                <a href="index.html" class="public-sidebar-brand" title="Stackly Home">
                    <img src="assets/logo-stackly.webp" alt="Stackly Logo">
                </a>
                <button class="public-sidebar-close" id="public-sidebar-close" aria-label="Close Navigation">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="public-sidebar-search">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search Stackly..." aria-label="Search">
            </div>
            <nav class="public-sidebar-nav">
                <ul class="public-sidebar-links">
                    ${linksHtml}
                </ul>
            </nav>
            <div class="public-sidebar-footer">
                <a href="signin.html" class="btn btn-primary join-btn public-sidebar-join-btn">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> <span>JOIN US</span>
                </a>
                <div class="public-sidebar-tagline">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>Institutional Advisory Platform</span>
                </div>
            </div>
        `;
        document.body.appendChild(drawer);
    }

    const closeBtn = document.getElementById('public-sidebar-close');

    function openDrawer() {
        drawer.classList.add('mobile-open');
        backdrop.classList.add('active');
        document.documentElement.classList.add('sidebar-locked');
        document.body.classList.add('sidebar-locked');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('mobile-open');
        backdrop.classList.remove('active');
        document.documentElement.classList.remove('sidebar-locked');
        document.body.classList.remove('sidebar-locked');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openDrawer();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeDrawer);
        backdrop.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, { passive: false });
    }

    // Close when clicking any link in drawer
    drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function () {
            closeDrawer();
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('mobile-open')) {
            closeDrawer();
        }
    });

    // Sync auth state if user is logged in
    try {
        const authDataStr = localStorage.getItem('stackly_auth');
        if (authDataStr) {
            const auth = JSON.parse(authDataStr);
            if (auth && auth.isLoggedIn) {
                const drawerJoinBtn = drawer.querySelector('.public-sidebar-join-btn');
                if (drawerJoinBtn) {
                    drawerJoinBtn.href = 'dashboard.html';
                    drawerJoinBtn.innerHTML = '<i class="fa-solid fa-gauge-high"></i> <span>DASHBOARD</span>';
                }
            }
        }
    } catch (err) {
        console.error('Error syncing drawer auth state:', err);
    }
}

/**
 * Universal Count-Up Number Animator
 * Animates numbers when they scroll into the viewport
 */
/**
 * Universal Count-Up Number Animator
 * Animates numbers when user scrolls to their section/div
 * Re-triggers smoothly when scrolling back to the section
 */
function initCountUpAnimations() {
    const counterSelectors = [
        '.stat-number',
        '[data-count]',
        '.stat-value',
        '.solutions-stat-val',
        '.services-stat-val',
        '.teams-stat-val',
        '.insights-stat-val',
        '.dash-kpi-val'
    ];

    const elements = document.querySelectorAll(counterSelectors.join(', '));
    if (!elements.length) return;

    // Parse numerical data from element text or attributes
    function parseCounterData(el) {
        if (!el._originalText) {
            el._originalText = el.textContent.trim();
        }

        if (el.hasAttribute('data-count')) {
            const count = parseFloat(el.getAttribute('data-count')) || 0;
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const rawDec = el.getAttribute('data-count').split('.')[1];
            const decimals = rawDec ? rawDec.length : 0;
            return { target: count, prefix, suffix, decimals, originalText: el._originalText };
        }

        const raw = el._originalText;
        const match = raw.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
        if (!match) return null;

        const prefix = match[1];
        const numStr = match[2];
        const suffix = match[3];
        const target = parseFloat(numStr);
        const rawDec = numStr.split('.')[1];
        const decimals = rawDec ? rawDec.length : 0;

        return { target, prefix, suffix, decimals, originalText: raw };
    }

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            const data = parseCounterData(el);
            if (!data || isNaN(data.target)) return;

            if (entry.isIntersecting) {
                if (!el._isCounting && !el._hasAnimated) {
                    el._hasAnimated = true;
                    animateCounter(el, data);
                }
            } else {
                // When element scrolls out of viewport, reset so it animates each time you visit the div
                if (el._hasAnimated && !el._isCounting) {
                    el._hasAnimated = false;
                    el.textContent = `${data.prefix}0${data.suffix}`;
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
    });

    elements.forEach(el => {
        const data = parseCounterData(el);
        if (data && !isNaN(data.target)) {
            el.textContent = `${data.prefix}0${data.suffix}`;
        }
        observer.observe(el);
    });

    function animateCounter(el, data) {
        const duration = 1600;
        const startTime = performance.now();
        const startVal = 0;
        const targetVal = data.target;

        el._isCounting = true;
        el.classList.add('counting');

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = startVal + (targetVal - startVal) * easeProgress;

            let formatted;
            if (data.decimals > 0) {
                formatted = currentVal.toFixed(data.decimals);
            } else {
                formatted = Math.round(currentVal).toLocaleString();
            }

            el.textContent = `${data.prefix}${formatted}${data.suffix}`;

            if (progress < 1 && el._isCounting) {
                requestAnimationFrame(update);
            } else {
                el.textContent = `${data.prefix}${data.decimals > 0 ? targetVal.toFixed(data.decimals) : Math.round(targetVal).toLocaleString()}${data.suffix}`;
                el._isCounting = false;
                el.classList.remove('counting');
                el.classList.add('count-complete');
            }
        }

        requestAnimationFrame(update);
    }
}

/**
 * Scroll Reveal & Stagger Animation System
 * Cascades cards and sections into view across ALL public pages
 * (About, Solutions, Services, Teams, Insights, Contact, Auth, 404, Index)
 */
function initScrollRevealAnimations() {
    const cardSelectors = [
        // index.html
        '.solution-card', '.stat-item', '.project-card', '.industry-card', '.testimonial-card', '.insight-card',
        '.wwd-text', '.wwd-image', '.cta-content',
        // about.html
        '.hero-stats .stat', '.dark-card', '.light-card', '.diff-card', '.method-card', '.mv-card', '.phil-card',
        '.practitioner-card', '.value-card', '.tl-item', '.stewardship-text', '.stewardship-image',
        // solutions.html
        '.solutions-stat-item', '.practice-card', '.framework-card', '.matrix-cards-grid > *', '.outcome-box',
        // services.html
        '.services-stat-item', '.flagship-card', '.specialized-card', '.deployment-card', '.srv-impact-box',
        // teams.html
        '.teams-stat-item', '.expert-card', '.collab-card', '.join-pillar-item', '.teams-featured-visual',
        // insights.html
        '.insights-stat-card', '.flagship-dossier-card', '.memo-card', '.playbook-card', '.report-card',
        '.vector-card', '.chart-card', '.guide-row-card',
        // contact.html
        '.office-card', '.faq-card', '.hubs-card', '.standards-card', '.guarantee-card', '.intake-form-card',
        '.board-photo-card', '.map-canvas-card', '.map-inspector-card',
        // signin.html & signup.html
        '.signin-card', '.signup-card', '.role-card',
        // 404.html
        '.recovery-card', '.assistance-status'
    ];

    // 1. Grid containers: apply staggered entrance delays across all pages
    const gridContainers = document.querySelectorAll(`
        .solutions-grid, .stats-grid, .projects-grid, .industries-grid, .testimonial-grid, .insights-grid,
        .hero-stats, .diff-grid, .method-grid, .mv-grid, .philosophy-grid, .practitioners-grid, .values-grid, .stewardship-grid,
        .solutions-stats-row, .practice-grid, .framework-grid, .matrix-cards-grid,
        .services-stats-grid, .flagship-grid, .specialized-grid, .deployment-grid,
        .teams-stats-row, .roster-grid, .collab-grid, .join-pillars-row, .join-cta-grid,
        .insights-stats-row, .priority-grid, .playbooks-grid, .reports-grid, .vectors-grid, .intangibles-grid,
        .contact-hero-grid, .network-grid, .faq-grid, .intake-grid, .next-steps-grid,
        .role-selector-grid, .recovery-cards-grid
    `);

    gridContainers.forEach(container => {
        const cards = container.querySelectorAll(cardSelectors.join(', '));
        cards.forEach((card, index) => {
            card.classList.add('reveal-card');
            const staggerDelay = (index % 6) * 110;
            card.style.transitionDelay = `${staggerDelay}ms`;
        });
    });

    // 2. Directional reveals for 2-column sections
    const directionalPairs = [
        ['.wwd-container .wwd-text', '.wwd-container .wwd-image'],
        ['.stewardship-grid .stewardship-text', '.stewardship-grid .stewardship-image'],
        ['.contact-hero-grid > *:first-child', '.contact-hero-grid > *:last-child'],
        ['.projects-grid .project-card:first-child', '.projects-grid .project-card:last-child'],
        ['.testimonial-grid .testimonial-card:first-child', '.testimonial-grid .testimonial-card:last-child']
    ];

    directionalPairs.forEach(pair => {
        const leftEl = document.querySelector(pair[0]);
        const rightEl = document.querySelector(pair[1]);
        if (leftEl) leftEl.classList.add('reveal-card', 'reveal-left');
        if (rightEl) rightEl.classList.add('reveal-card', 'reveal-right');
    });

    // 3. Mark all other cards as reveal-card
    document.querySelectorAll(cardSelectors.join(', ')).forEach(card => {
        if (!card.classList.contains('reveal-card')) {
            card.classList.add('reveal-card');
        }
    });

    // 4. Section headers reveal across all pages
    const headers = document.querySelectorAll(`
        .section-header, .directory-header, .priority-header,
        .section-padding > .container > h2, .section-padding > .container > .subtitle,
        .stewardship-text h2, .about-hero-text h1, .solutions-hero-text h1,
        .services-hero-text h1, .teams-hero-text h1, .insights-hero-text h1,
        .contact-hero-text h1, .why-choose-us h2, .why-choose-us .subtitle,
        .our-approach h2, .our-approach .subtitle, .industries h2, .industries .subtitle,
        .testimonials h2
    `);
    headers.forEach(header => {
        header.classList.add('reveal-header');
    });

    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal-card, .reveal-header').forEach(el => el.classList.add('revealed'));
        return;
    }

    // 5. Intersection Observer that re-animates cards when entering each div
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            } else {
                // Remove revealed class when scrolled out of view so it animates each time user scrolls to that div
                entry.target.classList.remove('revealed');
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal-card, .reveal-header').forEach(el => {
        revealObserver.observe(el);
    });
}

/**
 * Sequential Step-by-Step (1 -> 4) Timeline Animation
 * Loads steps gradually ("konjam konjama load aganum") when scrolling into view
 */
function initTimelineStepAnimation() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    let progressBar = document.getElementById('timelineProgressBar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'timeline-progress-bar';
        progressBar.id = 'timelineProgressBar';
        timeline.prepend(progressBar);
    }

    const steps = Array.from(timeline.querySelectorAll('.timeline-step'));
    if (!steps.length) return;

    let timeouts = [];
    let isPlaying = false;
    let isDone = false;

    function resetSteps() {
        timeouts.forEach(t => clearTimeout(t));
        timeouts = [];
        isPlaying = false;
        isDone = false;

        if (progressBar) {
            progressBar.style.width = '0%';
        }
        steps.forEach(step => {
            step.classList.remove('step-active', 'step-highlight');
        });
    }

    function playSequence() {
        if (isPlaying || isDone) return;
        isPlaying = true;

        // Progress line widths matching exact centers of 4 circles:
        // Column centers: 12.5%, 37.5%, 62.5%, 87.5% (Total span 75%)
        // Step 1: 0%
        // Step 2: 25% (line reaches center of col 2)
        // Step 3: 50% (line reaches center of col 3)
        // Step 4: 75% (line reaches center of col 4)
        const widths = ['0%', '25%', '50%', '75%'];
        const stepDelay = 480; // ms between each step loading gradually

        steps.forEach((step, index) => {
            const t = setTimeout(() => {
                // Activate current step
                step.classList.add('step-active', 'step-highlight');

                // Remove highlight from preceding step
                if (index > 0 && steps[index - 1]) {
                    steps[index - 1].classList.remove('step-highlight');
                }

                // Advance progress line
                if (progressBar) {
                    progressBar.style.width = widths[index];
                }

                // When last step finishes
                if (index === steps.length - 1) {
                    setTimeout(() => {
                        step.classList.remove('step-highlight');
                        isPlaying = false;
                        isDone = true;
                    }, 500);
                }
            }, index * stepDelay);

            timeouts.push(t);
        });
    }

    if (!('IntersectionObserver' in window)) {
        steps.forEach(step => step.classList.add('step-active'));
        if (progressBar) progressBar.style.width = '75%';
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                playSequence();
            } else {
                // Reset when scrolled out of view so it loads 1 to 4 step-by-step each time!
                resetSteps();
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -30px 0px'
    });

    observer.observe(timeline);
}

/**
 * Scroll Enhancements: Top Progress Indicator, Back-to-Top Button, Sticky Navbar Elevation
 */
function initScrollEnhancements() {
    let progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar && document.body) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.id = 'scrollProgressBar';
        document.body.prepend(progressBar);
    }

    let backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn && document.body) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top-btn';
        backToTopBtn.id = 'backToTopBtn';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        backToTopBtn.setAttribute('type', 'button');
        backToTopBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
        document.body.appendChild(backToTopBtn);
    }

    const navbar = document.querySelector('.navbar');

    let ticking = false;

    function handleScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // 1. Update Scroll Progress Bar
        if (progressBar) {
            progressBar.style.width = `${scrollPercent}%`;
        }

        // 2. Show/Hide Back-to-Top Button
        if (backToTopBtn) {
            if (scrollTop > 350) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        // 3. Navbar Elevation Effect on Scroll
        if (navbar) {
            if (scrollTop > 30) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    handleScroll();

    // Smooth scroll to top on click
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}



/**
 * Interactive Chronology Scroll Timeline (about.html)
 * Dynamically draws the vertical connecting line from year to year as user scrolls
 * Activates circles with glowing pulse rings and highlights milestones in real-time
 */
function initChronologyTimeline() {
    const timeline = document.getElementById('chronologyTimeline');
    const trackFill = document.getElementById('timelineTrackFill');
    const trackBg = document.getElementById('timelineTrackBg');
    if (!timeline || !trackFill) return;

    const items = Array.from(timeline.querySelectorAll('.tl-item'));
    if (items.length === 0) return;

    function updateTimelineTrack() {
        const markers = items.map(item => item.querySelector('.tl-marker')).filter(Boolean);
        if (markers.length < 2) return;

        const timelineRect = timeline.getBoundingClientRect();
        const firstMarkerRect = markers[0].getBoundingClientRect();
        const lastMarkerRect = markers[markers.length - 1].getBoundingClientRect();

        // Calculate start and end centers relative to timeline container
        const startY = (firstMarkerRect.top + firstMarkerRect.height / 2) - timelineRect.top;
        const endY = (lastMarkerRect.top + lastMarkerRect.height / 2) - timelineRect.top;
        const totalHeight = Math.max(0, endY - startY);

        // Position background guide line from center of 1st circle to center of last circle
        if (trackBg) {
            trackBg.style.top = startY + 'px';
            trackBg.style.height = totalHeight + 'px';
        }
        trackFill.style.top = startY + 'px';

        // Trigger point at 65% of viewport height (ideal reading focal point)
        const triggerY = window.innerHeight * 0.65;
        const scrollDistance = triggerY - (firstMarkerRect.top + firstMarkerRect.height / 2);

        // Calculate progress ratio (0 to 1)
        let progress = 0;
        if (totalHeight > 0) {
            progress = Math.min(Math.max(scrollDistance / totalHeight, 0), 1);
        }

        const currentHeight = progress * totalHeight;
        trackFill.style.height = currentHeight + 'px';

        // Activate each year milestone when the scroll line reaches its marker center
        markers.forEach((marker, index) => {
            const markerRect = marker.getBoundingClientRect();
            const markerCenterDist = (markerRect.top + markerRect.height / 2) - timelineRect.top;
            const item = items[index];

            if (currentHeight >= (markerCenterDist - startY - 4)) {
                item.classList.add('tl-active');
            } else {
                item.classList.remove('tl-active');
            }
        });
    }

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateTimelineTrack();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial calculations
    setTimeout(updateTimelineTrack, 100);
    setTimeout(updateTimelineTrack, 400);
    setTimeout(updateTimelineTrack, 1000);
}
