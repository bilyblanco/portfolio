
"use strict";

(() => {
    const STORAGE_KEY = "portfolio-theme";
    const root = document.documentElement;
    const systemTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function getPreferredTheme() {
        const saved = getSavedTheme();

        if (saved === "light" || saved === "dark") {
            return saved;
        }

        return systemTheme.matches ? "dark" : "light";
    }

    function updateButtons() {
        const isDark = root.dataset.theme === "dark";

        document.querySelectorAll(".shared-theme-toggle")
            .forEach((button) => {
                button.textContent = isDark ? "☀️" : "🌙";
                button.setAttribute(
                    "aria-label",
                    isDark
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                );
                button.title = isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode";
            });
    }

    function applyTheme(theme) {
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
        updateButtons();
    }

    // Apply the theme as soon as this script loads.
    applyTheme(getPreferredTheme());

    function initializeThemeButtons() {
        document.querySelectorAll(".shared-theme-toggle")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    const nextTheme =
                        root.dataset.theme === "dark"
                            ? "light"
                            : "dark";

                    applyTheme(nextTheme);

                    try {
                        localStorage.setItem(
                            STORAGE_KEY,
                            nextTheme
                        );
                    } catch {
                        // Theme still works for this page.
                    }
                });
            });

        updateButtons();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeThemeButtons
        );
    } else {
        initializeThemeButtons();
    }

    // Follow device settings unless a manual choice exists.
    systemTheme.addEventListener("change", () => {
        if (!getSavedTheme()) {
            applyTheme(getPreferredTheme());
        }
    });

    // Sync theme changes between open tabs.
    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY) {
            applyTheme(getPreferredTheme());
        }
    });
})();
