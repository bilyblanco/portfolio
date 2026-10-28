
"use strict";

// ========================================
// PRODUCT FILTERING
// ========================================

// Get the filter buttons and product cards.
const filterButtons = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll(".product-card");
const categoryCards = document.querySelectorAll(".category-card");
const emptyMessage = document.getElementById("empty-message");

// Show only products that match a selected category.
function filterProducts(category) {
    let visibleProducts = 0;

    productCards.forEach((card) => {
        const matches =
            category === "all" ||
            card.dataset.category === category;

        card.hidden = !matches;

        if (matches) {
            visibleProducts++;
        }
    });

    // Highlight the currently selected filter.
    filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === category;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    emptyMessage.hidden = visibleProducts > 0;
}

// Listen for clicks on the filter buttons.
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterProducts(button.dataset.filter);
    });
});

// Category cards also filter the products.
categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
        filterProducts(card.dataset.category);
    });
});

// Set the initial filter.
filterProducts("all");


// ========================================
// SHOPPING CART
// ========================================

// An array stores the products added to the cart.
const cart = [];

// Get the HTML elements we'll update.
const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const clearCartButton = document.getElementById("clear-cart");
const addToCartButtons = document.querySelectorAll(".add-to-cart");

let previousFocus = null;

// Format numbers as dollar amounts.
function formatPrice(amount) {
    return "$" + amount.toFixed(2);
}

// Open the shopping cart panel.
function openCart() {
    previousFocus = document.activeElement;
    cartPanel.classList.add("open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartOverlay.hidden = false;
    document.body.classList.add("cart-open");
    closeCartButton.focus();
}

// Close the shopping cart panel.
function closeCart() {
    cartPanel.classList.remove("open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartOverlay.hidden = true;
    document.body.classList.remove("cart-open");

    if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
    }
}

// Draw the current cart contents on the page.
function renderCart() {
    cartItems.innerHTML = "";

    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        const message = document.createElement("p");
        message.className = "cart-empty";
        message.textContent = "Your cart is empty.";
        cartItems.appendChild(message);
    }

    cart.forEach((product) => {
        total += product.price * product.quantity;
        itemCount += product.quantity;

        const item = document.createElement("div");
        item.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(product.price) + " each";

        const actions = document.createElement("div");
        actions.className = "cart-item-actions";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute(
            "aria-label",
            "Decrease " + product.name + " quantity"
        );
        decreaseButton.addEventListener("click", () => {
            changeQuantity(product.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = product.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute(
            "aria-label",
            "Increase " + product.name + " quantity"
        );
        increaseButton.addEventListener("click", () => {
            changeQuantity(product.id, 1);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-item";
        removeButton.addEventListener("click", () => {
            removeFromCart(product.id);
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

    cartCount.textContent = itemCount;
    cartTotal.textContent = formatPrice(total);
}

// Add a product to the cart.
function addToCart(id, name, price) {
    const existingProduct = cart.find((product) => product.id === id);

    if (existingProduct) {
        existingProduct.quantity++;
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

// Change a product's quantity.
function changeQuantity(id, amount) {
    const product = cart.find((item) => item.id === id);

    if (!product) {
        return;
    }

    product.quantity += amount;

    if (product.quantity <= 0) {
        removeFromCart(id);
    } else {
        renderCart();
    }
}

// Remove a product completely.
function removeFromCart(id) {
    const index = cart.findIndex((product) => product.id === id);

    if (index !== -1) {
        cart.splice(index, 1);
    }

    renderCart();
}

// Add click events to every "Add to Cart" button.
addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        addToCart(id, name, price);
    });
});

// Cart open and close events.
cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Close the cart using the Escape key.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartPanel.classList.contains("open")) {
        closeCart();
    }

    // Keep keyboard focus inside the open cart.
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

// Clear the entire cart.
clearCartButton.addEventListener("click", () => {
    cart.length = 0;
    renderCart();
});

// Draw the empty cart when the page first loads.
renderCart();
