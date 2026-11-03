
/* ==============================
   MID VANILLA CALENDAR
   LOCAL TEST VERSION
============================== */

import { auth } from "../date-planner/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* PAGE ELEMENTS */

const monthTitle =
    document.getElementById("calendarMonth");

const calendarDays =
    document.getElementById("calendarDays");

const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const selectedDateEvents =
    document.getElementById("selectedDateEvents");

const eventPanel =
    document.getElementById("calendarEventPanel");

const eventForm =
    document.getElementById("calendarEventForm");

const eventTitle =
    document.getElementById("eventTitle");

const eventTime =
    document.getElementById("eventTime");

const eventNotes =
    document.getElementById("eventNotes");

const eventColour =
    document.getElementById("eventColour");

const eventPanelTitle =
    document.getElementById("eventPanelTitle");

const calendarStatus =
    document.getElementById("calendarStatus");

/* CALENDAR STATE */

const today = new Date();

let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

let selectedDate = formatDate(today);

let events = [];
let storageKey = null;
let editingEventId = null;
let ready = false;

/* DATE HELPERS */

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function dateFromKey(key) {
    const [year, month, day] =
        key.split("-").map(Number);

    return new Date(year, month - 1, day);
}

function readableDate(key) {
    return dateFromKey(key).toLocaleDateString(
        "en-CA",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );
}

/* LOCAL EVENT STORAGE */

function loadEvents() {
    try {
        const saved = localStorage.getItem(storageKey);
        const parsed = saved ? JSON.parse(saved) : [];

        events = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Calendar load failed:", error);
        events = [];
        calendarStatus.textContent =
            "Unable to load saved events.";
    }
}

function saveEvents() {
    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify(events)
        );
        return true;
    } catch (error) {
        console.error("Calendar save failed:", error);
        calendarStatus.textContent =
            "Unable to save. Check browser storage.";
        return false;
    }
}

/* RENDER CALENDAR */

function renderCalendar() {
    if (!ready) return;

    const firstDay =
        new Date(currentYear, currentMonth, 1)
            .getDay();

    const daysInMonth =
        new Date(currentYear, currentMonth + 1, 0)
            .getDate();

    monthTitle.textContent =
        new Date(currentYear, currentMonth, 1)
            .toLocaleDateString("en-CA", {
                month: "long",
                year: "numeric"
            });

    calendarDays.replaceChildren();

    // Empty spaces before the first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        empty.setAttribute("aria-hidden", "true");
        calendarDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = formatDate(
            new Date(currentYear, currentMonth, day)
        );

        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.setAttribute(
            "aria-label",
            readableDate(dateKey)
        );

        if (dateKey === formatDate(today)) {
            button.classList.add("today");
        }

        if (dateKey === selectedDate) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        } else {
            button.setAttribute("aria-pressed", "false");
        }

        const number = document.createElement("span");
        number.className = "calendar-day-number";
        number.textContent = day;
        button.appendChild(number);

        const dayEvents = events.filter(
            event => event.date === dateKey
        );

        dayEvents.slice(0, 2).forEach(event => {
            const marker = document.createElement("span");

            const colour = ["pink", "purple", "green"]
                .includes(event.colour)
                ? event.colour
                : "pink";

            marker.className =
                `calendar-day-event ${colour}`;

            marker.textContent = "♥ " + event.title;
            button.appendChild(marker);
        });

        if (dayEvents.length > 2) {
            const more = document.createElement("span");
            more.className = "calendar-day-event";
            more.textContent =
                `+${dayEvents.length - 2} more`;
            button.appendChild(more);
        }

        button.addEventListener("click", () => {
            selectedDate = dateKey;
            eventPanel.hidden = true;
            editingEventId = null;
            renderCalendar();
        });

        calendarDays.appendChild(button);
    }

    renderSelectedDay();
}

/* SELECTED DATE EVENTS */

function renderSelectedDay() {
    selectedDateTitle.textContent =
        readableDate(selectedDate) + " ♡";

    selectedDateEvents.replaceChildren();

    const dayEvents = events
        .filter(event => event.date === selectedDate)
        .sort((a, b) =>
            (a.time || "").localeCompare(b.time || "")
        );

    if (dayEvents.length === 0) {
        const message = document.createElement("p");
        message.textContent =
            "Nothing planned yet. Let's make a memory ♡";
        selectedDateEvents.appendChild(message);
        return;
    }

    dayEvents.forEach(event => {
        const item = document.createElement("div");
        item.className = "calendar-event-item";

        const details = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = "♡ " + event.title;
        details.appendChild(title);

        if (event.time) {
            const time = document.createElement("p");
            time.textContent = "Time: " + event.time;
            details.appendChild(time);
        }

        if (event.notes) {
            const notes = document.createElement("p");
            notes.textContent = event.notes;
            details.appendChild(notes);
        }

        const actions = document.createElement("div");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editingEventId = event.id;

            eventTitle.value = event.title;
            eventTime.value = event.time || "";
            eventNotes.value = event.notes || "";
            eventColour.value = event.colour || "pink";

            eventPanelTitle.textContent =
                "Edit Our Plan ♡";

            eventPanel.hidden = false;
            eventPanel.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            "Delete " + event.title
        );

        deleteButton.addEventListener("click", () => {
            if (!confirm("Delete this plan?")) return;

            const previous = events;
            events = events.filter(e => e.id !== event.id);

            if (!saveEvents()) {
                events = previous;
                return;
            }

            eventPanel.hidden = true;
            editingEventId = null;
            calendarStatus.textContent = "Plan deleted ♡";
            renderCalendar();
        });

        actions.append(editButton, deleteButton);
        item.append(details, actions);

        selectedDateEvents.appendChild(item);
    });
}

/* OPEN ADD EVENT FORM */

document.getElementById("addCalendarEvent")
    .addEventListener("click", () => {
        if (!ready) return;

        editingEventId = null;
        eventForm.reset();

        eventPanelTitle.textContent =
            "Plan Something Sweet ♡";

        eventPanel.hidden = false;
        calendarStatus.textContent = "";

        eventPanel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    });

/* CANCEL */

document.getElementById("cancelCalendarEvent")
    .addEventListener("click", () => {
        eventPanel.hidden = true;
        editingEventId = null;
        eventForm.reset();
    });

/* SAVE EVENT */

eventForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!ready) return;

    const title = eventTitle.value.trim();

    if (!title) return;

    const previous = [...events];

    if (editingEventId) {
        const existing = events.find(
            e => e.id === editingEventId
        );

        if (!existing) return;

        existing.title = title;
        existing.time = eventTime.value;
        existing.notes = eventNotes.value.trim();
        existing.colour = eventColour.value;

    } else {
        events.push({
            id: crypto.randomUUID(),
            date: selectedDate,
            title: title,
            time: eventTime.value,
            notes: eventNotes.value.trim(),
            colour: eventColour.value
        });
    }

    if (!saveEvents()) {
        events = previous;
        loadEvents();
        return;
    }

    eventPanel.hidden = true;
    editingEventId = null;
    eventForm.reset();

    calendarStatus.textContent =
        "Your plan has been saved ♡";

    renderCalendar();
});

/* PREVIOUS MONTH */

document.getElementById("prevMonth")
    .addEventListener("click", () => {
        const date = new Date(
            currentYear,
            currentMonth - 1,
            1
        );

        currentYear = date.getFullYear();
        currentMonth = date.getMonth();
        selectedDate = formatDate(date);

        eventPanel.hidden = true;
        editingEventId = null;
        renderCalendar();
    });

/* NEXT MONTH */

document.getElementById("nextMonth")
    .addEventListener("click", () => {
        const date = new Date(
            currentYear,
            currentMonth + 1,
            1
        );

        currentYear = date.getFullYear();
        currentMonth = date.getMonth();
        selectedDate = formatDate(date);

        eventPanel.hidden = true;
        editingEventId = null;
        renderCalendar();
    });

/* USE EXISTING FIREBASE LOGIN */

onAuthStateChanged(auth, user => {
    if (!user || user.isAnonymous) {
        ready = false;
        events = [];
        storageKey = null;
        calendarDays.replaceChildren();
        selectedDateEvents.replaceChildren();
        eventPanel.hidden = true;
        return;
    }

    // Browser-local test storage, separated by user UID.
    storageKey = `midVanillaCalendar_${user.uid}`;

    ready = true;
    loadEvents();
    renderCalendar();

}, error => {
    console.error("Calendar auth error:", error);
    ready = false;
    calendarStatus.textContent =
        "Unable to verify calendar access.";
});
