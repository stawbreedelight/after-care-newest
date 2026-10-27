
/* ==============================
   MID VANILLA DASHBOARD
============================== */

import { auth } from "./date-planner/firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* PAGE ELEMENTS */

const dashboard =
    document.getElementById("dashboard");

const loadingMessage =
    document.getElementById("loadingMessage");

const userGreeting =
    document.getElementById("userGreeting");

const logoutButton =
    document.getElementById("logoutButton");

const dashboardMessage =
    document.getElementById("dashboardMessage");

/* PARTNER CARD ELEMENTS */

const partnerCardIcon =
    document.getElementById("partnerCardIcon");

const partnerCardTitle =
    document.getElementById("partnerCardTitle");

const partnerCardDescription =
    document.getElementById("partnerCardDescription");

const partnerCardAction =
    document.getElementById("partnerCardAction");


/* UPDATE CONNECTED PARTNER CARD */

async function updatePartnerCard(user) {

    try {
        const token = await user.getIdToken();

        const response = await fetch(
            "https://auth.midvanilla.com/partner/status",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!response.ok) {
            throw new Error("Partner status unavailable");
        }

        const data = await response.json();

        
if (data.connected) {

    // Display the Lucide heart-handshake icon

    partnerCardIcon.innerHTML = `
        <i data-lucide="heart-handshake"></i>
    `;

    // Turn the icon placeholder into an SVG

    if (window.lucide) {
        window.lucide.createIcons({
            nodes: [
                partnerCardIcon.querySelector(
                    "[data-lucide]"
                )
            ]
        });
    }

    partnerCardTitle.textContent =
        "Connected ♡";

    partnerCardDescription.textContent =
        data.partnerUsername
            ? "You & " + data.partnerUsername + " ♡"
            : "Your worlds are connected ♡";

    partnerCardAction.textContent =
        "Our Connection ♡";

        } else {

            partnerCardIcon.textContent = "♡";

            partnerCardTitle.textContent =
                "Connect Partner";

            partnerCardDescription.textContent =
                "Link your accounts and start sharing.";

            partnerCardAction.textContent =
                "Connect Your Worlds →";
        }

    } catch (error) {
        console.error(
            "Unable to load partner status:",
            error.name
        );

        // Leave the existing card unchanged
        // if connection status is unavailable.
    }
}


/* CHECK LOGIN STATUS */

onAuthStateChanged(auth, (user) => {

    if (!user || user.isAnonymous) {
        window.location.replace("login.html");
        return;
    }

    // Username is only used for the greeting.
    // Firebase authentication determines access.

    const savedUID =
        sessionStorage.getItem("midVanillaUID");

    const savedUsername =
        sessionStorage.getItem("midVanillaUsername");

    if (savedUID === user.uid && savedUsername) {
        userGreeting.textContent =
            "Welcome back, " + savedUsername + " ♡";
    } else {
        userGreeting.textContent =
            "Welcome back ♡";
    }

    dashboard.hidden = false;
    loadingMessage.hidden = true;
   
/* CHECK PARTNER CONNECTION */

updatePartnerCard(user);


}, (error) => {

    console.error(
        "Dashboard authentication check failed:",
        error.code || error.name
    );

    loadingMessage.textContent =
        "Unable to verify your login. Please refresh.";

});

/* LOG OUT */

logoutButton.addEventListener("click", async () => {

    logoutButton.disabled = true;
    dashboardMessage.textContent = "Logging out...";

    try {
        await signOut(auth);

        sessionStorage.removeItem("midVanillaUID");
        sessionStorage.removeItem("midVanillaUsername");

        window.location.replace("login.html");

    } catch (error) {

        console.error(
            "Logout failed:",
            error.code || error.name
        );

        dashboardMessage.textContent =
            "Unable to log out. Please try again.";

        logoutButton.disabled = false;
    }

});
