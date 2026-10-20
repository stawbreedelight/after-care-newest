
/* ==============================
   PEACH LAND - JAVASCRIPT
============================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* ==============================
   FIREBASE CONNECTION
============================== */

const firebaseConfig = {
    apiKey: "AIzaSyD-xqPWrExGfmVRJ2hYk7usgZ3rhyoNDUc",
    authDomain: "mid-vanilla.firebaseapp.com",
    projectId: "mid-vanilla",
    storageBucket: "mid-vanilla.firebasestorage.app",
    messagingSenderId: "404095487133",
    appId: "1:404095487133:web:8dd0aee98284dde92c5874"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* ==============================
   PEACH LAND FEEDBACK
============================== */

const feedbackCard =
    document.querySelector(".feedback-card");

if (feedbackCard) {

    const feedbackForm =
        feedbackCard.querySelector(".feedback-form");

    const feedbackMessage =
        feedbackCard.querySelector(".feedback-message");


    if (feedbackForm && feedbackMessage) {

        feedbackForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const level =
                    feedbackCard.dataset.level || "peach";

                const rating =
                    feedbackForm.querySelector(
                        'input[name="rating"]:checked'
                    )?.value || "";

                const moreOf = Array.from(
                    feedbackForm.querySelectorAll(
                        'input[name="moreOf"]:checked'
                    )
                ).map(input => input.value);

                const comment =
                    feedbackForm.querySelector(
                        'textarea[name="comment"]'
                    )?.value.trim() || "";


                /* CHECK RATING */

                if (!rating) {

                    feedbackMessage.textContent =
                        "Please choose how this level felt 💛";

                    return;
                }


                /* SAVE TO FIREBASE */

                try {

                    await addDoc(
                        collection(db, "feedback"),
                        {
                            level: level,
                            rating: rating,
                            moreOf: moreOf,
                            comment: comment,
                            createdAt: serverTimestamp()
                        }
                    );

                    feedbackMessage.textContent =
                        "Thank you for helping us make Mid Vanilla sweeter 🍦";

                    feedbackForm.reset();

                } catch (error) {

                    console.error(
                        "Peach Land feedback error:",
                        error
                    );

                    feedbackMessage.textContent =
                        "Oops — something went wrong. Please try again.";
                }

            }
        );

    }
}


/* ==============================
   FUTURE PEACH LAND GAMES
============================== */

// Add new Peach Land game functions here.
// This file is independent from Vanilla Land.
