
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // 1. MOBILE NAVIGATION
    // ========================================

    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    function closeMenu() {
        if (!menuToggle || !navLinks) return;

        navLinks.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.textContent = "☰";
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("menu-open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });

        document.addEventListener("click", (event) => {
            if (
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) closeMenu();
        });
    }


    // ========================================
    // 2. TYPING ANIMATION
    // ========================================

    const typingText = document.getElementById("typing-text");

    const roles = [
        "Creative Web Developer",
        "Frontend Developer",
        "JavaScript Learner",
        "Web Designer"
    ];

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (typingText && !reducedMotion) {
        let roleIndex = 0;
        let characterIndex = roles[0].length;
        let deleting = true;

        function typeRole() {
            const currentRole = roles[roleIndex];

            if (deleting) {
                characterIndex--;
            } else {
                characterIndex++;
            }

            typingText.textContent =
                currentRole.slice(0, characterIndex);

            let delay = deleting ? 65 : 110;

            if (!deleting && characterIndex === currentRole.length) {
                delay = 1600;
                deleting = true;
            } else if (deleting && characterIndex === 0) {
                roleIndex = (roleIndex + 1) % roles.length;
                deleting = false;
                delay = 350;
            }

            setTimeout(typeRole, delay);
        }

        setTimeout(typeRole, 1800);
    }


    // ========================================
    // 3. PROJECT FILTERING
    // ========================================

    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(
        ".projects-container .project-card"
    );

    const projectCount = document.getElementById("project-count");

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedCategory = button.dataset.filter;

            filterButtons.forEach((item) => {
                const isActive = item === button;

                item.classList.toggle("active", isActive);
                item.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            let visibleCount = 0;

            projectCards.forEach((card) => {
                const matches =
                    selectedCategory === "all" ||
                    card.dataset.category === selectedCategory;

                card.hidden = !matches;

                if (matches) visibleCount++;
            });

            if (projectCount) {
                projectCount.textContent =
                    `Showing ${visibleCount} ` +
                    (visibleCount === 1 ? "project" : "projects");
            }
        });
    });

    filterButtons.forEach((button) => {
        button.setAttribute(
            "aria-pressed",
            String(button.classList.contains("active"))
        );
    });


    // ========================================
    // 4. BACK TO TOP BUTTON
    // ========================================

    const backToTop = document.createElement("button");

    backToTop.type = "button";
    backToTop.className = "back-to-top";
    backToTop.textContent = "↑";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.title = "Back to top";

    document.body.appendChild(backToTop);

    function updateBackToTop() {
        backToTop.classList.toggle(
            "show",
            window.scrollY > 350
        );
    }

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? "auto" : "smooth"
        });
    });

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();


    // ========================================
    // 5. SCROLL REVEAL
    // ========================================

    const revealElements = document.querySelectorAll(
        ".about-box, .skill-card, .project-card, .contact-box"
    );

    if (!reducedMotion && "IntersectionObserver" in window) {
        revealElements.forEach((element) => {
            element.classList.add("reveal");
        });

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: "0px 0px 40px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    }


    // ========================================
    // 6. ACTIVE NAVIGATION LINKS
    // ========================================

    const sectionLinks = [];

    document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
        const id = link.getAttribute("href").slice(1);

        if (!id) return;

        const section = document.getElementById(id);

        if (section) {
            sectionLinks.push({ link, section });
        }
    });

    function updateActiveNavigation() {
        const scrollPosition = window.scrollY + 160;
        let activeLink = null;

        sectionLinks.forEach(({ link, section }) => {
            if (section.offsetTop <= scrollPosition) {
                activeLink = link;
            }
        });

        sectionLinks.forEach(({ link }) => {
            const isActive = link === activeLink;

            link.classList.toggle("nav-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    if (sectionLinks.length > 0) {
        window.addEventListener(
            "scroll",
            updateActiveNavigation,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            updateActiveNavigation
        );

        updateActiveNavigation();
    }

});

