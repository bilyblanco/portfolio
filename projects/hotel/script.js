
"use strict";

// ========================================
// ROOM DATA
// ========================================

// Each room has a name, price per night,
// category, and maximum number of guests.
const rooms = {
    classic: {
        name: "Classic Room",
        price: 80,
        maxGuests: 2
    },
    deluxe: {
        name: "Deluxe Room",
        price: 140,
        maxGuests: 2
    },
    executive: {
        name: "Executive Suite",
        price: 250,
        maxGuests: 4
    },
    garden: {
        name: "Garden Room",
        price: 95,
        maxGuests: 2
    },
    ocean: {
        name: "Ocean View Room",
        price: 175,
        maxGuests: 2
    },
    presidential: {
        name: "Presidential Suite",
        price: 400,
        maxGuests: 4
    }
};


// ========================================
// ROOM FILTERING
// ========================================

const filterButtons = document.querySelectorAll(".filter-btn");
const roomCards = document.querySelectorAll(".room-card");

function filterRooms(category) {
    roomCards.forEach((card) => {
        card.hidden =
            category !== "all" &&
            card.dataset.category !== category;
    });

    filterButtons.forEach((button) => {
        const active = button.dataset.filter === category;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterRooms(button.dataset.filter);
    });
});

filterRooms("all");


// ========================================
// BOOKING FORM ELEMENTS
// ========================================

const bookingForm = document.getElementById("booking-form");
const guestName = document.getElementById("guest-name");
const guestEmail = document.getElementById("guest-email");
const roomType = document.getElementById("room-type");
const guestCount = document.getElementById("guests");
const checkIn = document.getElementById("check-in");
const checkOut = document.getElementById("check-out");

const summaryRoom = document.getElementById("summary-room");
const summaryNights = document.getElementById("summary-nights");
const summaryGuests = document.getElementById("summary-guests");
const summaryTotal = document.getElementById("summary-total");
const bookingMessage = document.getElementById("booking-message");


// ========================================
// DATE HELPERS
// ========================================

// Convert a date string into a UTC timestamp.
// This avoids daylight-saving calculation errors.
function dateToUTC(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
}

// Return today's date in local YYYY-MM-DD format.
function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Don't allow past check-in dates.
checkIn.min = getToday();
checkOut.min = getToday();


// ========================================
// BOOKING CALCULATIONS
// ========================================

function calculateBooking() {
    const selectedRoom = rooms[roomType.value];
    const guests = Number(guestCount.value);

    summaryRoom.textContent = selectedRoom
        ? selectedRoom.name
        : "Not selected";

    summaryGuests.textContent = guests;

    let nights = 0;

    if (checkIn.value && checkOut.value) {
        const difference =
            dateToUTC(checkOut.value) - dateToUTC(checkIn.value);

        nights = Math.round(difference / 86400000);
    }

    const validDates =
        checkIn.value &&
        checkOut.value &&
        checkIn.value >= getToday() &&
        nights > 0;

    summaryNights.textContent = validDates ? nights : 0;

    const total = selectedRoom && validDates
        ? selectedRoom.price * nights
        : 0;

    summaryTotal.textContent = "$" + total.toFixed(2);

    return {
        selectedRoom,
        guests,
        nights,
        total,
        validDates
    };
}


// ========================================
// LIVE FORM UPDATES
// ========================================

// Update the summary whenever a booking field changes.
[roomType, guestCount, checkIn, checkOut].forEach((field) => {
    field.addEventListener("change", () => {
        bookingMessage.textContent = "";
        bookingMessage.className = "booking-message";
        calculateBooking();
    });
});

// Check-out must be after check-in.
checkIn.addEventListener("change", () => {
    if (checkIn.value) {
        const nextDay = new Date(
            dateToUTC(checkIn.value) + 86400000
        ).toISOString().slice(0, 10);

        checkOut.min = nextDay;

        if (checkOut.value && checkOut.value <= checkIn.value) {
            checkOut.value = "";
        }
    }
});


// ========================================
// BOOK NOW BUTTONS
// ========================================

// Clicking a room's button automatically selects it
// in the booking form and scrolls to that section.
const bookButtons = document.querySelectorAll(".book-room");

bookButtons.forEach((button) => {
    button.addEventListener("click", () => {
        roomType.value = button.dataset.room;

        calculateBooking();

        document.getElementById("booking").scrollIntoView({
            behavior: "smooth"
        });

        roomType.focus({ preventScroll: true });
    });
});


// ========================================
// FORM VALIDATION AND DEMO CONFIRMATION
// ========================================

bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const booking = calculateBooking();

    bookingMessage.className = "booking-message";

    if (!booking.validDates) {
        bookingMessage.textContent =
            "Please choose valid check-in and check-out dates.";
        bookingMessage.classList.add("error");
        return;
    }

    if (booking.guests > booking.selectedRoom.maxGuests) {
        bookingMessage.textContent =
            `This room allows a maximum of ${booking.selectedRoom.maxGuests} guests.`;
        bookingMessage.classList.add("error");
        return;
    }

    bookingMessage.textContent =
        `Thanks, ${guestName.value.trim()}! Your demo booking for ` +
        `${booking.selectedRoom.name} (${booking.nights} night(s)) ` +
        `has been calculated. Total: $${booking.total.toFixed(2)}. ` +
        `No actual reservation was made.`;

    bookingMessage.classList.add("success");
});

// Display the initial summary.
calculateBooking();
