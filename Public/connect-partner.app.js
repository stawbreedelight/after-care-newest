
/* MID VANILLA — CONNECT PARTNER */

import { auth } from "./date-planner/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const page = document.getElementById("partnerPage");
const loading = document.getElementById("partnerLoading");
const message = document.getElementById("partnerMessage");
const generateButton = document.getElementById("generateCode");
const copyButton = document.getElementById("copyCode");
const result = document.getElementById("invitationResult");
const codeDisplay = document.getElementById("invitationCode");

let currentUser = null;
let currentCode = "";

onAuthStateChanged(auth, (user) => {
    if (!user || user.isAnonymous) {
        window.location.replace("login.html");
        return;
    }

    currentUser = user;
    page.hidden = false;
    loading.hidden = true;
}, () => {
    loading.textContent =
        "Unable to verify your login. Please refresh.";
});

generateButton.addEventListener("click", async () => {
    if (!currentUser) return;

    generateButton.disabled = true;
    message.textContent = "Generating your code...";

    try {
        const token = await currentUser.getIdToken();

        const response = await fetch(
            "https://auth.midvanilla.com/partner/invite",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to generate code."
            );
        }

        currentCode = data.code;
        codeDisplay.textContent = currentCode;
        result.hidden = false;

        message.textContent =
            "Your invitation is ready ♡";

    } catch (error) {
        message.textContent = error.message;
    } finally {
        generateButton.disabled = false;
    }
});

copyButton.addEventListener("click", async () => {
    if (!currentCode) return;

    try {
        await navigator.clipboard.writeText(currentCode);
        message.textContent = "Code copied ♡";
    } catch {
        message.textContent =
            "Please select and copy the code above.";
    }
});

document.getElementById("joinPartnerForm")
    .addEventListener("submit", (event) => {
        event.preventDefault();
    });
