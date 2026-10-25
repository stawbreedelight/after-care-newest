
/* ==============================
   MID VANILLA LOGIN
============================== */

import { auth } from "./date-planner/firebase-config.js";

import {
    signInWithCustomToken
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const loginURL =
    "https://auth.midvanilla.com/login";

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document
        .getElementById("username")
        .value.trim();

    const password = document
        .getElementById("password")
        .value;

    const button = loginForm.querySelector(
        'button[type="submit"]'
    );

    button.disabled = true;
    button.textContent = "Logging In...";
    loginMessage.textContent = "";

    try {
        const response = await fetch(loginURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginMessage.textContent =
                data.error || "Unable to log in.";
            return;
        }

        await signInWithCustomToken(
            auth,
            data.token
        );

        loginMessage.textContent =
            "Welcome back, " +
            data.username +
            "! You are now logged in ♡";

        loginForm.reset();

    } catch (error) {
        console.error(
            "Mid Vanilla login failed:",
            error.code || error.name
        );

        loginMessage.textContent =
            "Unable to complete login. Please try again.";

    } finally {
        button.disabled = false;
        button.textContent = "Log In ♡";
    }
});
