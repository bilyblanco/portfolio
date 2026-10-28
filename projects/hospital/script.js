
"use strict";

// ========================================
// STORAGE
// ========================================

// Demo data only. Never store real medical records
// in browser localStorage.

function loadData(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch (error) {
        return [];
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn("Browser storage is unavailable.");
    }
}

let patients = loadData("medicare-demo-patients");
let appointments = loadData("medicare-demo-appointments");

function makeId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now().toString() + "-" +
        Math.random().toString(36).slice(2);
}


// ========================================
// DOM ELEMENTS
// ========================================

const patientForm = document.getElementById("patient-form");
const patientName = document.getElementById("patient-name");
const patientAge = document.getElementById("patient-age");
const patientGender = document.getElementById("patient-gender");
const patientDepartment = document.getElementById("patient-department");
const patientSearch = document.getElementById("patient-search");
const patientTable = document.getElementById("patient-table");
const patientEmpty = document.getElementById("patient-empty");
const patientMessage = document.getElementById("patient-message");

const appointmentForm = document.getElementById("appointment-form");
const appointmentPatient = document.getElementById("appointment-patient");
const appointmentDepartment =
    document.getElementById("appointment-department");
const appointmentDate = document.getElementById("appointment-date");
const appointmentTime = document.getElementById("appointment-time");
const appointmentTable = document.getElementById("appointment-table");
const appointmentEmpty = document.getElementById("appointment-empty");
const appointmentMessage = document.getElementById("appointment-message");

const totalPatients = document.getElementById("total-patients");
const totalAppointments = document.getElementById("total-appointments");
const pendingAppointments =
    document.getElementById("pending-appointments");


// ========================================
// HELPERS
// ========================================

function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

appointmentDate.min = getToday();

function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = String(text);
    return cell;
}

function createButton(label, className, onClick) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", onClick);

    return button;
}

function showMessage(element, text, isError = false) {
    element.textContent = text;
    element.classList.toggle("error", isError);
}


// ========================================
// DASHBOARD STATISTICS
// ========================================

function updateDashboard() {
    totalPatients.textContent = patients.length;
    totalAppointments.textContent = appointments.length;

    pendingAppointments.textContent = appointments.filter(
        (appointment) => appointment.status === "Scheduled"
    ).length;
}


// ========================================
// PATIENT REGISTRATION
// ========================================

patientForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = patientName.value.trim();
    const age = Number(patientAge.value);
    const gender = patientGender.value;
    const department = patientDepartment.value;

    if (
        !name ||
        !Number.isInteger(age) ||
        age < 0 ||
        age > 120 ||
        !gender ||
        !department
    ) {
        showMessage(
            patientMessage,
            "Please enter valid patient information.",
            true
        );
        return;
    }

    patients.push({
        id: makeId(),
        name,
        age,
        gender,
        department
    });

    saveData("medicare-demo-patients", patients);

    patientForm.reset();

    showMessage(
        patientMessage,
        "Demo patient added successfully!"
    );

    renderPatients();
    updatePatientOptions();
    updateDashboard();
});


// ========================================
// DISPLAY PATIENTS
// ========================================

function renderPatients() {
    patientTable.innerHTML = "";

    const search = patientSearch.value.trim().toLowerCase();

    const filteredPatients = patients.filter((patient) => {
        return (
            patient.name.toLowerCase().includes(search) ||
            patient.department.toLowerCase().includes(search)
        );
    });

    patientEmpty.hidden = filteredPatients.length > 0;

    if (filteredPatients.length === 0) {
        patientEmpty.textContent = search
            ? "No matching patients found."
            : "No patient records yet.";
    }

    filteredPatients.forEach((patient) => {
        const row = document.createElement("tr");

        row.appendChild(createCell(patient.name));
        row.appendChild(createCell(patient.age));
        row.appendChild(createCell(patient.department));

        const actionCell = document.createElement("td");

        const deleteButton = createButton(
            "Delete",
            "action-btn",
            () => deletePatient(patient.id)
        );

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        patientTable.appendChild(row);
    });
}

patientSearch.addEventListener("input", renderPatients);


// ========================================
// DELETE PATIENT
// ========================================

function deletePatient(id) {
    const patient = patients.find((item) => item.id === id);

    if (!patient) {
        return;
    }

    const confirmed = confirm(
        `Delete ${patient.name} and their demo appointments?`
    );

    if (!confirmed) {
        return;
    }

    patients = patients.filter((item) => item.id !== id);

    appointments = appointments.filter(
        (appointment) => appointment.patientId !== id
    );

    saveData("medicare-demo-patients", patients);
    saveData("medicare-demo-appointments", appointments);

    renderPatients();
    renderAppointments();
    updatePatientOptions();
    updateDashboard();
}


// ========================================
// PATIENT DROPDOWN
// ========================================

function updatePatientOptions() {
    const previousValue = appointmentPatient.value;

    appointmentPatient.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select patient";

    appointmentPatient.appendChild(placeholder);

    patients.forEach((patient) => {
        const option = document.createElement("option");
        option.value = patient.id;
        option.textContent = patient.name;

        appointmentPatient.appendChild(option);
    });

    if (patients.some((patient) => patient.id === previousValue)) {
        appointmentPatient.value = previousValue;
    }
}


// ========================================
// SCHEDULE APPOINTMENT
// ========================================

appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const patientId = appointmentPatient.value;
    const department = appointmentDepartment.value;
    const date = appointmentDate.value;
    const time = appointmentTime.value;

    const patientExists = patients.some(
        (patient) => patient.id === patientId
    );

    const selectedDateTime = new Date(`${date}T${time}`);

    if (
        !patientExists ||
        !department ||
        !date ||
        !time ||
        Number.isNaN(selectedDateTime.getTime()) ||
        selectedDateTime <= new Date()
    ) {
        showMessage(
            appointmentMessage,
            "Select a patient and a future appointment date and time.",
            true
        );
        return;
    }

    appointments.push({
        id: makeId(),
        patientId,
        department,
        date,
        time,
        status: "Scheduled"
    });

    saveData("medicare-demo-appointments", appointments);

    appointmentForm.reset();
    appointmentDate.min = getToday();

    showMessage(
        appointmentMessage,
        "Demo appointment scheduled successfully!"
    );

    renderAppointments();
    updateDashboard();
});


// ========================================
// DISPLAY APPOINTMENTS
// ========================================

function renderAppointments() {
    appointmentTable.innerHTML = "";

    appointmentEmpty.hidden = appointments.length > 0;

    const sortedAppointments = [...appointments].sort(
        (a, b) =>
            `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    );

    sortedAppointments.forEach((appointment) => {
        const patient = patients.find(
            (item) => item.id === appointment.patientId
        );

        const row = document.createElement("tr");

        row.appendChild(
            createCell(patient ? patient.name : "Unknown patient")
        );

        row.appendChild(
            createCell(`${appointment.date} ${appointment.time}`)
        );

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.textContent = appointment.status;
        badge.className = "status-badge status-" +
            appointment.status.toLowerCase();

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        const actions = document.createElement("div");

        actions.className = "appointment-actions";

        if (appointment.status === "Scheduled") {
            const completeButton = createButton(
                "Complete",
                "action-btn complete-btn",
                () => changeAppointmentStatus(
                    appointment.id,
                    "Completed"
                )
            );

            const cancelButton = createButton(
                "Cancel",
                "action-btn",
                () => changeAppointmentStatus(
                    appointment.id,
                    "Cancelled"
                )
            );

            actions.append(completeButton, cancelButton);
        }

        const deleteButton = createButton(
            "Delete",
            "action-btn",
            () => deleteAppointment(appointment.id)
        );

        actions.appendChild(deleteButton);
        actionCell.appendChild(actions);
        row.appendChild(actionCell);

        appointmentTable.appendChild(row);
    });
}


// ========================================
// APPOINTMENT ACTIONS
// ========================================

function changeAppointmentStatus(id, newStatus) {
    const appointment = appointments.find(
        (item) => item.id === id
    );

    if (!appointment) {
        return;
    }

    appointment.status = newStatus;

    saveData("medicare-demo-appointments", appointments);

    renderAppointments();
    updateDashboard();
}

function deleteAppointment(id) {
    appointments = appointments.filter(
        (appointment) => appointment.id !== id
    );

    saveData("medicare-demo-appointments", appointments);

    renderAppointments();
    updateDashboard();
}


// ========================================
// INITIAL PAGE SETUP
// ========================================

renderPatients();
updatePatientOptions();
renderAppointments();
updateDashboard();
