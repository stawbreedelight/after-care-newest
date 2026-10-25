
/* ==============================
   MID VANILLA
   CREATE ACCOUNT
============================== */

const signupForm =
    document.getElementById("signupForm");

const signupMessage =
    document.getElementById("signupMessage");

const registerURL =
    "https://auth.midvanilla.com/register";

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username = document
        .getElementById("username")
        .value.trim();

    const password = document
        .getElementById("password")
        .value;

    const confirmPassword = document
        .getElementById("confirmPassword")
        .value;

    const button =
        signupForm.querySelector('button[type="submit"]');

    /* CHECK PASSWORDS */

    if (password !== confirmPassword) {
        signupMessage.textContent =
            "Your passwords don't match. Please try again.";
        return;
    }

    /* CHECK USERNAME */

    if (!/^[a-zA-Z0-9._-]{3,24}$/.test(username)) {
        signupMessage.textContent =
            "Username must be 3–24 characters. Use letters, numbers, dots, underscores or hyphens.";
        return;
    }

    /* SEND REGISTRATION */

    button.disabled = true;
    button.textContent = "Creating Account...";
    signupMessage.textContent = "";

    try {

        const response = await fetch(registerURL, {
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
            signupMessage.textContent =
                data.error || "Could not create account.";
            return;
        }

        signupMessage.textContent =
            "Account created successfully! Login will be available soon.";

        signupForm.reset();

    } catch (error) {

        console.error("Registration request failed");

        signupMessage.textContent =
            "Unable to connect. Please try again.";

    } finally {

        button.disabled = false;
        button.textContent = "Create My Account ♡";

    }

});
