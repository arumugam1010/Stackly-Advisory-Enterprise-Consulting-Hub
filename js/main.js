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

        // Allow Back to Home navigation
        if (target.id === 'nav-back-to-home' || target.id === 'card-back-to-home' || (target.textContent && target.textContent.trim().toLowerCase().includes('back to home'))) {
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
