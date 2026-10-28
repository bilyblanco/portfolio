
"use strict";

// ========================================
// DOM ELEMENTS
// ========================================

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const clearSearchButton = document.getElementById("clear-search");
const luckyButton = document.getElementById("lucky-button");
const suggestions = document.getElementById("suggestions");

const quickSearchButtons = document.querySelectorAll(".quick-search");

const recentList = document.getElementById("recent-list");
const recentEmpty = document.getElementById("recent-empty");
const clearHistoryButton = document.getElementById("clear-history");


// ========================================
// SEARCH SUGGESTION TOPICS
// ========================================

const topics = [
    "Learn HTML",
    "CSS tutorials",
    "JavaScript DOM",
    "JavaScript beginner projects",
    "GitHub Pages hosting",
    "Responsive web design",
    "Frontend developer roadmap",
    "Web development projects",
    "HTML forms tutorial",
    "CSS Flexbox and Grid"
];


// ========================================
// LOAD SEARCH HISTORY
// ========================================

let searchHistory = [];

try {
    const saved = JSON.parse(
        localStorage.getItem("searchCloneHistory") || "[]"
    );

    if (Array.isArray(saved)) {
        searchHistory = saved.filter(
            (item) => typeof item === "string"
        ).slice(0, 10);
    }
} catch (error) {
    searchHistory = [];
}


// ========================================
// SAVE SEARCH HISTORY
// ========================================

function saveHistory() {
    try {
        localStorage.setItem(
            "searchCloneHistory",
            JSON.stringify(searchHistory)
        );
    } catch (error) {
        console.warn("Browser storage is unavailable.");
    }
}

function addToHistory(query) {
    // Remove duplicate searches, ignoring capitalization.
    searchHistory = searchHistory.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
    );

    // Put the newest search first.
    searchHistory.unshift(query);

    // Keep only the 10 most recent searches.
    searchHistory = searchHistory.slice(0, 10);

    saveHistory();
    renderHistory();
}


// ========================================
// PERFORM SEARCH
// ========================================


function performSearch(query, lucky = false) {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
        searchInput.focus();
        return;
    }

    addToHistory(cleanQuery);
    suggestions.hidden = true;

    const encodedQuery = encodeURIComponent(cleanQuery);

    const url = lucky
        ? `https://www.google.com/search?btnI=1&q=${encodedQuery}`
        : `https://www.google.com/search?q=${encodedQuery}`;

    window.open(url, "_blank", "noopener,noreferrer");
}


// ========================================
// SEARCH FORM EVENTS
// ========================================

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performSearch(searchInput.value);
});

luckyButton.addEventListener("click", () => {
    performSearch(searchInput.value, true);
});

clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    updateSearchUI();
    searchInput.focus();
});


// ========================================
// SUGGESTIONS
// ========================================

function renderSuggestions() {
    const query = searchInput.value.trim().toLowerCase();

    suggestions.innerHTML = "";

    if (!query) {
        suggestions.hidden = true;
        return;
    }

    const allSuggestions = [...searchHistory, ...topics];

    // Remove duplicate suggestions.
    const uniqueSuggestions = [
        ...new Map(
            allSuggestions.map((item) => [
                item.toLowerCase(),
                item
            ])
        ).values()
    ];

    const matches = uniqueSuggestions.filter(
        (item) => item.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length === 0) {
        suggestions.hidden = true;
        return;
    }

    matches.forEach((item) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "suggestion-item";
        button.textContent = "🔍 " + item;

        button.addEventListener("click", () => {
            searchInput.value = item;
            performSearch(item);
        });

        suggestions.appendChild(button);
    });

    suggestions.hidden = false;
}


// ========================================
// UPDATE SEARCH INTERFACE
// ========================================

function updateSearchUI() {
    clearSearchButton.hidden = searchInput.value.length === 0;
    renderSuggestions();
}

searchInput.addEventListener("input", updateSearchUI);

// Hide suggestions when Escape is pressed.
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        suggestions.hidden = true;
    }
});

// Hide suggestions when clicking outside the search form.
document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target)) {
        suggestions.hidden = true;
    }
});


// ========================================
// QUICK SEARCH BUTTONS
// ========================================

quickSearchButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const query = button.dataset.query;

        searchInput.value = query;
        updateSearchUI();
        performSearch(query);
    });
});


// ========================================
// DISPLAY SEARCH HISTORY
// ========================================

function renderHistory() {
    recentList.innerHTML = "";

    recentEmpty.hidden = searchHistory.length > 0;
    clearHistoryButton.disabled = searchHistory.length === 0;

    searchHistory.forEach((query) => {
        const item = document.createElement("div");
        item.className = "recent-item";

        const searchButton = document.createElement("button");
        searchButton.type = "button";
        searchButton.className = "recent-search-button";
        searchButton.textContent = "🕒 " + query;

        searchButton.addEventListener("click", () => {
            searchInput.value = query;
            updateSearchUI();
            performSearch(query);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "recent-remove";
        removeButton.textContent = "✕";
        removeButton.setAttribute(
            "aria-label",
            "Remove " + query + " from history"
        );

        removeButton.addEventListener("click", () => {
            removeFromHistory(query);
        });

        item.append(searchButton, removeButton);
        recentList.appendChild(item);
    });
}


// ========================================
// REMOVE SEARCH HISTORY
// ========================================

function removeFromHistory(query) {
    searchHistory = searchHistory.filter(
        (item) => item !== query
    );

    saveHistory();
    renderHistory();
    renderSuggestions();
}

clearHistoryButton.addEventListener("click", () => {
    searchHistory = [];

    saveHistory();
    renderHistory();
    renderSuggestions();
});


// ========================================
// INITIAL SETUP
// ========================================

renderHistory();
updateSearchUI();
