
"use strict";

// ========================================
// BILYBLANCO PORTFOLIO INTERACTIONS
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // ====================================
    // 1. BACK TO TOP BUTTON
    // ====================================

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
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth"
        });
    });

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();


    // ====================================
    // 2. SCROLL REVEAL ANIMATIONS
    // ====================================

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const revealElements = document.querySelectorAll(
        "section, .project-card, .skill-card"
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


    // ====================================
    // 3. ACTIVE NAVIGATION LINK
    // ====================================

    const navLinks = document.querySelectorAll(
        'nav a[href^="#"]'
    );

    const sectionLinks = [];

    navLinks.forEach((link) => {
        const id = link.getAttribute("href").slice(1);

        if (!id) {
            return;
        }

        const section = document.getElementById(id);

        if (section) {
            sectionLinks.push({
                link,
                section
            });
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
            link.classList.toggle(
                "nav-active",
                link === activeLink
            );

            if (link === activeLink) {
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
