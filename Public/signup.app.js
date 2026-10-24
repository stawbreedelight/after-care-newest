import { db, auth } from "./date-planner/firebase-config.js";

const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        signupMessage.textContent =
            "Your passwords don't match. Please try again.";
        return;
    }

    signupMessage.textContent =
        "Your details look good! Account creation is coming next.";
});
