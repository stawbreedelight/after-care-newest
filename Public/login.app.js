
/* ==============================
   MID VANILLA LOGIN
============================== */

import { auth } from "./date-planner/firebase-config.js";

/* PAGE ELEMENTS */

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

/* LOGIN FORM */

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    loginMessage.textContent =
        "Login is not connected yet. Account authentication is coming next.";
});
