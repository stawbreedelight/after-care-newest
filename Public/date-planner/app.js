import { db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
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
let currentPlayer = "";
let currentDateIndex = 0;

const dateIdeas = [
  {
    id: "sunset-picnic",
    title: "Sunset Picnic",
    description: "Pack some snacks and watch the sunset together."
  },
  {
    id: "ice-cream",
    title: "Ice Cream Date",
    description: "Go out for ice cream and pick a flavour for each other."
  },
  {
    id: "movie-night",
    title: "Movie Night",
    description: "Choose a movie, grab some snacks, and get cosy together."
  },
  {
    id: "stargazing",
    title: "Stargazing",
    description: "Grab a blanket and find somewhere quiet to look at the stars."
  },
  {
    id: "cook-together",
    title: "Cook Together",
    description: "Choose a recipe neither of you has made before and cook it together."
  },
  {
    id: "bookstore",
    title: "Bookstore Date",
    description: "Visit a bookstore and choose a book for each other."
  },
  {
    id: "coffee-walk",
    title: "Coffee Walk",
    description: "Grab your favourite drinks and take a long walk together."
  },
  {
    id: "game-night",
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

function openGame(roomCode, player) {
  currentRoomCode = roomCode;
  currentPlayer = player;
  currentDateIndex = 0;

  intro.style.display = "none";
  game.style.display = "block";

  roomCodeText.textContent = `Date code: ${roomCode}`;

  yesButton.style.display = "block";
  noButton.style.display = "block";

  showDateIdea();
}

async function saveChoice(choice) {
  const idea = dateIdeas[currentDateIndex];

  const roomRef = doc(
    db,
    "datePlannerRooms",
    currentRoomCode
  );

  const fieldName =
    `${currentPlayer}Choices.${idea.id}`;

  await updateDoc(roomRef, {
    [fieldName]: choice
  });
}

async function finishPlayer() {
  const roomRef = doc(
    db,
    "datePlannerRooms",
    currentRoomCode
  );

  const finishedField =
    currentPlayer === "player1"
      ? "player1Finished"
      : "player2Finished";

  await updateDoc(roomRef, {
    [finishedField]: true
  });

  dateTitle.textContent = "You're all done 💕";
  dateDescription.textContent =
    "Your choices have been saved. We're waiting for your person to finish.";

  yesButton.style.display = "none";
  noButton.style.display = "none";
}

async function chooseDate(choice) {
  try {
    await saveChoice(choice);

    currentDateIndex++;

    if (currentDateIndex >= dateIdeas.length) {
      await finishPlayer();
      return;
    }

    showDateIdea();

  } catch (error) {
    console.error("Error saving choice:", error);

    alert(
      "Firebase error:\n" +
      error.code +
      "\n" +
      error.message
    );
  }
}

createButton.addEventListener("click", async () => {
  try {
    let roomCode;
    let roomExists = true;

    while (roomExists) {
      roomCode = generateRoomCode();

      const roomRef = doc(
        db,
        "datePlannerRooms",
        roomCode
      );

      const roomSnap =
        await getDoc(roomRef);

      roomExists =
        roomSnap.exists();
    }

    const roomRef = doc(
      db,
      "datePlannerRooms",
      roomCode
    );

    await setDoc(roomRef, {
      createdAt: serverTimestamp(),

      player1Finished: false,
      player2Finished: false,

      player1Choices: {},
      player2Choices: {}
    });

    openGame(roomCode, "player1");

  } catch (error) {
    console.error(
      "Error creating room:",
      error
    );

    alert(
      "Firebase error:\n" +
      error.code +
      "\n" +
      error.message
    );
  }
});

joinButton.addEventListener("click", async () => {
  const enteredCode =
    prompt("Enter your date code:");

  if (!enteredCode) {
    return;
  }

  const roomCode =
    enteredCode
      .trim()
      .toUpperCase();

  try {
    const roomRef = doc(
      db,
      "datePlannerRooms",
      roomCode
    );

    const roomSnap =
      await getDoc(roomRef);

    if (!roomSnap.exists()) {
      alert(
        "That date code doesn't exist."
      );

      return;
    }

    openGame(
      roomCode,
      "player2"
    );

  } catch (error) {
    console.error(
      "Error joining room:",
      error
    );

    alert(
      "Firebase error:\n" +
      error.code +
      "\n" +
      error.message
    );
  }
});

yesButton.addEventListener(
  "click",
  async () => {
    await chooseDate(true);
  }
);

noButton.addEventListener(
  "click",
  async () => {
    await chooseDate(false);
  }
);
