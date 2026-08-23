import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ==============================
// FIREBASE
// ==============================

const firebaseConfig = {
  apiKey: "AIzaSyD-xqPWrExGfmVRJ2hYk7usgZ3rhyoNDUc",
  authDomain: "mid-vanilla.firebaseapp.com",
  projectId: "mid-vanilla",
  storageBucket: "mid-vanilla.firebasestorage.app",
  messagingSenderId: "404095487133",
  appId: "1:404095487133:web:8dd0aee98284dde92c5874",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ==============================
// GAME
// ==============================

let questions = [];
let currentQuestion = 0;


// ==============================
// START PILLOW TALK
// ==============================

async function startPillowTalk() {

  try {

    const snapshot = await getDocs(
      collection(db, "questions")
    );

    const questionBank = [];

    snapshot.forEach((doc) => {

      const data = doc.data();

      if (data.question) {
        questionBank.push(data.question);
      }

    });


    if (questionBank.length === 0) {
      alert("No questions were found in Firebase.");
      return;
    }


    // Shuffle questions
    questionBank.sort(() => Math.random() - 0.5);


    // Select up to 3 questions
    questions = questionBank.slice(
      0,
      Math.min(3, questionBank.length)
    );

    currentQuestion = 0;


    // Hide intro
    document
      .getElementById("intro")
      .classList.add("hidden");


    // Show game
    document
      .getElementById("game")
      .classList.remove("hidden");


    showQuestion();

  } catch (error) {

    console.error("Firebase error:", error);

    alert(
      "The questions could not be loaded. Please try again."
    );

  }

}


// ==============================
// SHOW QUESTION
// ==============================

function showQuestion() {

  document
    .getElementById("question")
    .textContent = questions[currentQuestion];


  document
    .getElementById("progress")
    .textContent =
      "Question " +
      (currentQuestion + 1) +
      " of " +
      questions.length;

}


// ==============================
// NEXT QUESTION
// ==============================

function nextQuestion() {

  currentQuestion++;


  if (currentQuestion >= questions.length) {

    document
      .getElementById("game")
      .classList.add("hidden");


    document
      .getElementById("finished")
      .classList.remove("hidden");

    return;

  }


  showQuestion();

}


// ==============================
// BUTTONS
// ==============================

document
  .getElementById("startButton")
  .addEventListener(
    "click",
    startPillowTalk
  );


document
  .getElementById("nextButton")
  .addEventListener(
    "click",
    nextQuestion
  );
