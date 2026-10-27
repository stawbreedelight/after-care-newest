
/* ==============================
   MID VANILLA — CONNECT PARTNER
============================== */

import { auth } from "./date-planner/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const API = "https://auth.midvanilla.com";

const page = document.getElementById("partnerPage");
const loading = document.getElementById("partnerLoading");
const message = document.getElementById("partnerMessage");

const generateButton =
    document.getElementById("generateCode");

const copyButton =
    document.getElementById("copyCode");

const result =
    document.getElementById("invitationResult");

const codeDisplay =
    document.getElementById("invitationCode");

const joinForm =
    document.getElementById("joinPartnerForm");

const joinButton =
    document.getElementById("joinPartnerButton");

const codeInput =
    document.getElementById("partnerCode");

const statusCard =
    document.getElementById("connectionStatus");

const partnerName =
    document.getElementById("connectedPartnerName");

const inviteSection =
    document.getElementById("inviteSection");

const joinSection =
    document.getElementById("joinSection");

let currentUser = null;
let currentCode = "";


/* AUTHENTICATED API REQUEST */

async function partnerRequest(path, method = "GET", body) {

    if (!currentUser || currentUser.isAnonymous) {
        throw new Error("Please log in first.");
    }

    const token = await currentUser.getIdToken();

    const options = {
        method,
        headers: {
            "Authorization": "Bearer " + token
        }
    };

    if (body !== undefined) {
        options.headers["Content-Type"] =
            "application/json";

        options.body = JSON.stringify(body);
    }

    const response = await fetch(API + path, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Something went wrong."
        );
    }

    return data;
}


/* DISPLAY CONNECTION STATUS */

function showConnected(partnerUsername) {

    inviteSection.hidden = true;
    joinSection.hidden = true;
    result.hidden = true;

    currentCode = "";
    codeDisplay.textContent = "";

    statusCard.hidden = false;

    partnerName.textContent = partnerUsername
        ? "Connected with " + partnerUsername + " ♡"
        : "Your accounts are connected ♡";

    message.textContent = "";
}


/* CHECK IF ALREADY CONNECTED */

async function refreshConnection() {

    const data = await partnerRequest("/partner/status");

    if (data.connected) {
        showConnected(data.partnerUsername);
    } else {
        statusCard.hidden = true;
        inviteSection.hidden = false;
        joinSection.hidden = false;
    }
}


/* FIREBASE AUTHENTICATION */

onAuthStateChanged(auth, async (user) => {

    if (!user || user.isAnonymous) {
        window.location.replace("login.html");
        return;
    }

    currentUser = user;

    page.hidden = false;
    loading.hidden = true;

    try {
        await refreshConnection();
    } catch (error) {
        message.textContent =
            "Unable to check connection: " + error.message;
    }

}, () => {
    loading.textContent =
        "Unable to verify your login. Please refresh.";
});


/* GENERATE INVITATION CODE */

generateButton.addEventListener("click", async () => {

    if (!currentUser) return;

    generateButton.disabled = true;
    message.textContent = "Generating your code...";

    try {
        const data = await partnerRequest(
            "/partner/invite",
            "POST"
        );

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


/* COPY INVITATION CODE */

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


/* JOIN PARTNER */

joinForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const code = codeInput.value
        .trim()
        .toUpperCase();

    if (!/^[A-F0-9]{32}$/.test(code)) {
        message.textContent =
            "Please enter a valid 32-character code.";
        return;
    }

    const confirmed = window.confirm(
        "Connect your Mid Vanilla account using this invitation code?"
    );

    if (!confirmed) return;

    joinButton.disabled = true;
    joinButton.textContent = "Connecting...";
    message.textContent = "";

    try {
        const data = await partnerRequest(
            "/partner/join",
            "POST",
            { code }
        );

        if (data.connected) {
            codeInput.value = "";
            showConnected(data.partnerUsername);
        }

    } catch (error) {
        message.textContent = error.message;
    } finally {
        joinButton.disabled = false;
        joinButton.textContent = "Join Partner ♡";
    }
});
