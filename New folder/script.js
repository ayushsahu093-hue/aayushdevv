document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isDesktopViewport = window.matchMedia('(min-width: 769px)').matches;
    const allowParallax = isFinePointer && isDesktopViewport && !prefersReducedMotion;

    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.loading = img.classList.contains('hero-avatar') || img.closest('.nav-logo') ? 'eager' : 'lazy';
        }
        if (!img.hasAttribute('decoding')) {
            img.decoding = 'async';
        }
    });

    // 1. Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('revealed'));
    } else {
        revealElements.forEach(el => observer.observe(el));
    }

    // 2. 3D Tilt Effect for ID Card
    const idCardWrapper = document.querySelector('.id-card-wrapper');
    const idCard = document.querySelector('.id-card');

    if (idCardWrapper && idCard && isFinePointer && !prefersReducedMotion) {
        let tiltFrame = null;
        let pointerX = 0;
        let pointerY = 0;

        const updateTilt = () => {
            const rect = idCardWrapper.getBoundingClientRect();
            const x = pointerX - rect.left;
            const y = pointerY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = Math.max(-12, Math.min(12, ((y - centerY) / centerY) * -12));
            const rotateY = Math.max(-12, Math.min(12, ((x - centerX) / centerX) * 12));

            idCard.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(18px) scale3d(1.025, 1.025, 1.025)`;
            tiltFrame = null;
        };

        idCardWrapper.addEventListener('pointerenter', () => {
            idCardWrapper.classList.add('is-tilting');
        });

        idCardWrapper.addEventListener('pointermove', (e) => {
            pointerX = e.clientX;
            pointerY = e.clientY;

            if (!tiltFrame) {
                tiltFrame = requestAnimationFrame(updateTilt);
            }
        }, { passive: true });

        idCardWrapper.addEventListener('pointerleave', () => {
            if (tiltFrame) {
                cancelAnimationFrame(tiltFrame);
                tiltFrame = null;
            }

            idCardWrapper.classList.remove('is-tilting');
            idCard.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0) scale3d(1, 1, 1)';
        });
    }



    // 3. Premium Parallax + Scroll UI, batched for smooth rendering
    const giantText = document.querySelector('.giant-text');
    const heroAvatar = document.querySelector('.hero-avatar');
    const glassCard = document.querySelector('.glass-card');
    const greenSection = document.querySelector('.green-section-wrapper');
    const mainContainer = document.querySelector('.main-container');
    const projects = document.querySelectorAll('.projects-section');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const progressBar = document.getElementById('progressBar');
    let scrollTicking = false;

    const runScrollEffects = () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;

        if (allowParallax && scrollY < viewportHeight * 1.5) {
            if (giantText) giantText.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.4}px))`;
            if (heroAvatar) heroAvatar.style.transform = `translateX(-50%) translateY(${scrollY * 0.15}px)`;
            if (glassCard) glassCard.style.transform = `translateY(-${scrollY * 0.1}px)`;
            if (greenSection) greenSection.style.transform = `translateY(${scrollY * 0.05}px)`;

            if (mainContainer) {
                const opacity = 1 - (scrollY / (viewportHeight * 0.8));
                mainContainer.style.opacity = Math.max(0, opacity);
            }
        } else if (!allowParallax) {
            if (giantText) giantText.style.transform = '';
            if (heroAvatar) heroAvatar.style.transform = '';
            if (glassCard) glassCard.style.transform = '';
            if (greenSection) greenSection.style.transform = '';
            if (mainContainer) mainContainer.style.opacity = '';
        }

        if (allowParallax) {
            projects.forEach(project => {
                const rect = project.getBoundingClientRect();
                const isInView = rect.top < viewportHeight && rect.bottom > 0;

                if (isInView) {
                    const scrolledPercentage = (viewportHeight - rect.top) / (viewportHeight + rect.height);
                    const mockup = project.querySelector('.browser-mockup');
                    const info = project.querySelector('.project-info');
                    
                    if (mockup) {
                        const moveAmount = (scrolledPercentage - 0.5) * 60;
                        mockup.style.transform = `translateY(${moveAmount}px) perspective(1000px) rotateX(${moveAmount * 0.1}deg)`;
                    }

                    if (info) {
                        const moveAmount = (scrolledPercentage - 0.5) * -30;
                        info.style.transform = `translateY(${moveAmount}px)`;
                    }
                }
            });
        }

        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollY > 500);
        }

        if (progressBar) {
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (scrollY / height) * 100 : 0;
            progressBar.style.width = `${scrolled}%`;
        }

        scrollTicking = false;
    };

    const onScroll = () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(runScrollEffects);
            scrollTicking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    runScrollEffects();

    // 3. Smooth Scrolling for Navbar Links
    document.querySelectorAll('.nav-links a, .nav-logo').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.classList.contains('open-contact-modal')) {
                return;
            }

            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetEl = document.getElementById(href.substring(1));
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // 4. Page Transition Logic (Cinematic Curtain)
    const curtain = document.querySelector('.page-transition-curtain');
    const transitionLinks = document.querySelectorAll('.transition-link, .nav-logo[href], .nav-links a[href], .footer-links a[href], .back-link, .back-home-btn');
    
    // Force scroll to top on Refresh & handle subpage redirect
    if (window.performance.getEntriesByType('navigation')[0].type === 'reload') {
        // Prevent browser from restoring scroll position
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // If on subpage, go home. If on home, go to top.
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        } else {
            window.scrollTo(0, 0);
        }
    }

    if (curtain) {
        transitionLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetUrl = this.getAttribute('href');
                const isModalLink = this.classList.contains('open-contact-modal');
                const isPlaceholder = !targetUrl || targetUrl === '#';
                const opensNewTab = this.target === '_blank';
                const isDownload = this.hasAttribute('download');
                const isExternal = targetUrl && /^(https?:|mailto:|tel:)/i.test(targetUrl);

                if (isModalLink || isPlaceholder || opensNewTab || isDownload || isExternal) {
                    return;
                }
                
                // Case A: Page or cross-page section link
                if (targetUrl && !targetUrl.startsWith('#')) {
                    e.preventDefault();
                    curtain.classList.add('show');
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 800);
                } 
                // Case B: Internal Anchor Link
                else if (targetUrl && targetUrl.startsWith('#') && targetUrl !== '#') {
                    e.preventDefault();
                    curtain.classList.add('show');
                    
                    setTimeout(() => {
                        const targetId = targetUrl.substring(1);
                        const targetEl = document.getElementById(targetId);
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'auto' }); // auto because curtain covers it
                        }
                        
                        // Drop curtain after scroll
                        setTimeout(() => {
                            curtain.classList.remove('show');
                        }, 400);
                    }, 800);
                }
            });
        });
    }

    // Handle gate link clicks (legacy support)
    const gateLink = document.querySelector('.gate-link');
    if (gateLink && curtain) {
        gateLink.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('href');
            curtain.classList.add('show');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 800);
        });
    }
    // 5. Scroll to Top Functionality
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    // 6. Magnetic Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const aura = document.querySelector('.cursor-aura');
    let mouseX = 0;
    let mouseY = 0;
    let auraX = 0;
    let auraY = 0;

    if (cursor && aura && isFinePointer && !prefersReducedMotion) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instant movement for the dot
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        }, { passive: true });

        // Smooth movement for the aura (Lerp)
        function animateCursor() {
            const easing = 0.15;
            auraX += (mouseX - auraX) * easing;
            auraY += (mouseY - auraY) * easing;
            
            aura.style.left = `${auraX}px`;
            aura.style.top = `${auraY}px`;
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover detection for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .social-link-card, .blog-card, .glass-button');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // 8. Form Submission (Live with Formspree)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.submit-btn');
            const btnText = btn.querySelector('.btn-text');
            const originalText = btnText.textContent;

            // Change button to "Sending..." state
            btn.disabled = true;
            btnText.textContent = "SENDING...";

            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success state
                    btn.classList.add('success');
                    btnText.textContent = "✓ MESSAGE SENT";
                    contactForm.reset();
                } else {
                    // Error state
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert("Oops! There was a problem submitting your form.");
                    }
                    btnText.textContent = originalText;
                }
            } catch (error) {
                alert("Oops! There was a problem submitting your form.");
                btnText.textContent = originalText;
            } finally {
                btn.disabled = false;
                // Reset success state after 4 seconds
                setTimeout(() => {
                    btn.classList.remove('success');
                    btnText.textContent = originalText;
                }, 4000);
            }
        });
    }
});
