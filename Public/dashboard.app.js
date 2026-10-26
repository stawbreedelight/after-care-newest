
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
