
"use strict";

// ========================================
// FOOD SEARCH AND FILTERING
// ========================================

const searchInput = document.getElementById("food-search");
const filterButtons = document.querySelectorAll(".filter-btn");
const foodCards = document.querySelectorAll(".food-card");
const emptyMessage = document.getElementById("empty-message");

// Store the currently selected category.
let activeCategory = "all";

// Apply both the category filter and search text.
function filterFood() {
    const searchText = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    foodCards.forEach((card) => {
        const category = card.dataset.category;
        const foodName = card.querySelector("h3").textContent.toLowerCase();

        const matchesCategory =
            activeCategory === "all" ||
            category === activeCategory;

        const matchesSearch = foodName.includes(searchText);

        const shouldShow = matchesCategory && matchesSearch;

        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleCount++;
        }
    });

    emptyMessage.hidden = visibleCount > 0;
}

// Filter when someone types into the search bar.
searchInput.addEventListener("input", filterFood);

// Filter when someone clicks a category button.
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.filter;

        filterButtons.forEach((item) => {
            const active = item === button;

            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        filterFood();
    });
});

// Show all food initially.
filterFood();


// ========================================
// ORDER CART
// ========================================

const cart = [];

const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const clearCartButton = document.getElementById("clear-cart");
const addButtons = document.querySelectorAll(".add-to-cart");

let previousFocus = null;

// Format prices consistently.
function formatPrice(amount) {
    return "$" + amount.toFixed(2);
}

// Open the order panel.
function openCart() {
    previousFocus = document.activeElement;

    cartPanel.classList.add("open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartOverlay.hidden = false;
    document.body.classList.add("cart-open");

    closeCartButton.focus();
}

// Close the order panel.
function closeCart() {
    cartPanel.classList.remove("open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartOverlay.hidden = true;
    document.body.classList.remove("cart-open");

    if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
    }
}

// Update the order display.
function renderCart() {
    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        const message = document.createElement("p");
        message.className = "cart-empty";
        message.textContent = "Your order is empty.";
        cartItems.appendChild(message);
    }

    cart.forEach((food) => {
        total += food.price * food.quantity;
        count += food.quantity;

        const item = document.createElement("div");
        item.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = food.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(food.price) + " each";

        const actions = document.createElement("div");
        actions.className = "cart-item-actions";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute(
            "aria-label",
            "Decrease " + food.name + " quantity"
        );
        decreaseButton.addEventListener("click", () => {
            changeQuantity(food.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = food.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute(
            "aria-label",
            "Increase " + food.name + " quantity"
        );
        increaseButton.addEventListener("click", () => {
            changeQuantity(food.id, 1);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-item";
        removeButton.addEventListener("click", () => {
            removeFromCart(food.id);
        });

        actions.append(
            decreaseButton,
            quantity,
            increaseButton,
            removeButton
        );

        item.append(name, price, actions);
        cartItems.appendChild(item);
    });

    cartCount.textContent = count;
    cartTotal.textContent = formatPrice(total);
}

// Add a food item to the order.
function addToCart(id, name, price) {
    const existingFood = cart.find((food) => food.id === id);

    if (existingFood) {
        existingFood.quantity++;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    renderCart();
    openCart();
}

// Increase or decrease a food item's quantity.
function changeQuantity(id, amount) {
    const food = cart.find((item) => item.id === id);

    if (!food) {
        return;
    }

    food.quantity += amount;

    if (food.quantity <= 0) {
        removeFromCart(id);
    } else {
        renderCart();
    }
}

// Remove a food item from the order.
function removeFromCart(id) {
    const index = cart.findIndex((food) => food.id === id);

    if (index !== -1) {
        cart.splice(index, 1);
    }

    renderCart();
}

// Add event listeners to every food button.
addButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        addToCart(id, name, price);
    });
});

// Open and close the order panel.
cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Close the panel when Escape is pressed.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartPanel.classList.contains("open")) {
        closeCart();
    }

    // Keep keyboard focus inside the open order panel.
    if (event.key === "Tab" && cartPanel.classList.contains("open")) {
        const focusable = Array.from(
            cartPanel.querySelectorAll("button:not([disabled])")
        );

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

// Clear all items from the order.
clearCartButton.addEventListener("click", () => {
    cart.length = 0;
    renderCart();
});

// Draw the initial empty order.
renderCart();
