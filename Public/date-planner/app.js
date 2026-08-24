import { db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const createButton = document.getElementById("createButton");
const joinButton = document.getElementById("joinButton");

const intro = document.getElementById("intro");
const game = document.getElementById("game");
const roomCodeText = document.getElementById("roomCodeText");

const dateTitle = document.getElementById("dateTitle");
const dateDescription = document.getElementById("dateDescription");

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

let currentRoomCode = "";
let currentDateIndex = 0;

const dateIdeas = [
  {
    title: "Sunset Picnic",
    description: "Pack some snacks and watch the sunset together."
  },
  {
    title: "Ice Cream Date",
    description: "Go out for ice cream and pick a flavour for each other."
  },
  {
    title: "Movie Night",
    description: "Choose a movie, grab some snacks, and get cosy together."
  },
  {
    title: "Stargazing",
    description: "Grab a blanket and find somewhere quiet to look at the stars."
  },
  {
    title: "Cook Together",
    description: "Choose a recipe neither of you has made before and cook it together."
  },
  {
    title: "Bookstore Date",
    description: "Visit a bookstore and choose a book for each other."
  },
  {
    title: "Coffee Walk",
    description: "Grab your favourite drinks and take a long walk together."
  },
  {
    title: "Game Night",
    description: "Pick a board game, card game, or video game and play together."
  }
];

function generateRoomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return code;
}

function showDateIdea() {
  const idea = dateIdeas[currentDateIndex];

  dateTitle.textContent = idea.title;
  dateDescription.textContent = idea.description;
}

function openGame(roomCode) {
  currentRoomCode = roomCode;
  currentDateIndex = 0;

  intro.style.display = "none";
  game.style.display = "block";

  roomCodeText.textContent = `Date code: ${roomCode}`;

  showDateIdea();
}

function nextDate() {
  currentDateIndex++;

  if (currentDateIndex >= dateIdeas.length) {
    dateTitle.textContent = "You're all done 💕";
    dateDescription.textContent =
      "You've finished choosing your date ideas.";

    yesButton.style.display = "none";
    noButton.style.display = "none";

    return;
  }

  showDateIdea();
}

createButton.addEventListener("click", async () => {
  try {
    let roomCode;
    let roomExists = true;

    while (roomExists) {
      roomCode = generateRoomCode();

      const roomRef = doc(db, "datePlannerRooms", roomCode);
      const roomSnap = await getDoc(roomRef);

      roomExists = roomSnap.exists();
    }

    const roomRef = doc(db, "datePlannerRooms", roomCode);

    await setDoc(roomRef, {
      createdAt: serverTimestamp(),
      player1Finished: false,
      player2Finished: false
    });

    openGame(roomCode);

  } catch (error) {
    console.error("Error creating room:", error);

    alert(
      "Firebase error:\n" +
      error.code +
      "\n" +
      error.message
    );
  }
});

joinButton.addEventListener("click", async () => {
  const enteredCode = prompt("Enter your date code:");

  if (!enteredCode) {
    return;
  }

  const roomCode = enteredCode.trim().toUpperCase();

  try {
    const roomRef = doc(db, "datePlannerRooms", roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      alert("That date code doesn't exist.");
      return;
    }

    openGame(roomCode);

  } catch (error) {
    console.error("Error joining room:", error);

    alert(
      "Firebase error:\n" +
      error.code +
      "\n" +
      error.message
    );
  }
});

yesButton.addEventListener("click", () => {
  nextDate();
});

noButton.addEventListener("click", () => {
  nextDate();
});
