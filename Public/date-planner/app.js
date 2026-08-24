import { db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const createButton = document.getElementById("createButton");
const showJoinButton = document.getElementById("showJoinButton");
const joinButton = document.getElementById("joinButton");
const backButton = document.getElementById("backButton");

const intro = document.getElementById("intro");
const joinScreen = document.getElementById("joinScreen");
const game = document.getElementById("game");
const waiting = document.getElementById("waiting");
const results = document.getElementById("results");

const roomCodeInput = document.getElementById("roomCodeInput");
const roomCodeText = document.getElementById("roomCodeText");
const progressText = document.getElementById("progressText");

const dateTitle = document.getElementById("dateTitle");
const dateDescription = document.getElementById("dateDescription");

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

const matchList = document.getElementById("matchList");

let currentRoomCode = "";
let currentPlayer = "";
let currentDateIndex = 0;
let roomListener = null;

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

function hideAllScreens() {
  intro.style.display = "none";
  joinScreen.style.display = "none";
  game.style.display = "none";
  waiting.style.display = "none";
  results.style.display = "none";
}

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

  progressText.textContent =
    `${currentDateIndex + 1} of ${dateIdeas.length}`;
}

function openGame(roomCode, player) {
  currentRoomCode = roomCode;
  currentPlayer = player;
  currentDateIndex = 0;

  hideAllScreens();

  game.style.display = "block";

  roomCodeText.textContent =
    `Date code: ${roomCode}`;

  yesButton.style.display = "block";
  noButton.style.display = "block";

  showDateIdea();
  startRoomListener(roomCode);
}

function startRoomListener(roomCode) {
  const roomRef = doc(
    db,
    "datePlannerRooms",
    roomCode
  );

  if (roomListener) {
    roomListener();
  }

  roomListener = onSnapshot(roomRef, (roomSnap) => {
    if (!roomSnap.exists()) {
      return;
    }

    const roomData = roomSnap.data();

    if (
      roomData.player1Finished === true &&
      roomData.player2Finished === true
    ) {
      showMatches(roomData);
    }
  });
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

function showWaitingScreen() {
  hideAllScreens();
  waiting.style.display = "block";
}

function showMatches(roomData) {
  hideAllScreens();
  results.style.display = "block";

  matchList.innerHTML = "";

  const player1Choices =
    roomData.player1Choices || {};

  const player2Choices =
    roomData.player2Choices || {};

  const matches = dateIdeas.filter((idea) => {
    return (
      player1Choices[idea.id] === true &&
      player2Choices[idea.id] === true
    );
  });

  if (matches.length === 0) {
    matchList.innerHTML = `
      <div class="match-card">
        <h2>No matches this round</h2>
        <p>Try again with some new ideas 💕</p>
      </div>
    `;

    return;
  }

  matches.forEach((idea) => {
    const matchCard =
      document.createElement("div");

    matchCard.classList.add("match-card");

    matchCard.innerHTML = `
      <h2>${idea.title}</h2>
      <p>${idea.description}</p>
    `;

    matchList.appendChild(matchCard);
  });
}

async function checkForMatches() {
  const roomRef = doc(
    db,
    "datePlannerRooms",
    currentRoomCode
  );

  const roomSnap =
    await getDoc(roomRef);

  if (!roomSnap.exists()) {
    return false;
  }

  const roomData =
    roomSnap.data();

  if (
    roomData.player1Finished === true &&
    roomData.player2Finished === true
  ) {
    showMatches(roomData);
    return true;
  }

  return false;
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

  const bothFinished =
    await checkForMatches();

  if (!bothFinished) {
    showWaitingScreen();
  }
}

async function chooseDate(choice) {
  try {
    yesButton.disabled = true;
    noButton.disabled = true;

    await saveChoice(choice);

    currentDateIndex++;

    if (currentDateIndex >= dateIdeas.length) {
      await finishPlayer();
      return;
    }

    showDateIdea();

  } catch (error) {
    console.error(
      "Error saving choice:",
      error
    );

    alert(
      "Firebase error:\n" +
      error.code +
      "\n" +
      error.message
    );

  } finally {
    yesButton.disabled = false;
    noButton.disabled = false;
  }
}

showJoinButton.addEventListener("click", () => {
  hideAllScreens();

  roomCodeInput.value = "";
  joinScreen.style.display = "block";

  roomCodeInput.focus();
});

backButton.addEventListener("click", () => {
  hideAllScreens();
  intro.style.display = "block";
});

createButton.addEventListener(
  "click",
  async () => {
    try {
      let roomCode;
      let roomExists = true;

      while (roomExists) {
        roomCode =
          generateRoomCode();

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
        createdAt:
          serverTimestamp(),

        player1Finished: false,
        player2Finished: false,

        player1Choices: {},
        player2Choices: {}
      });

      openGame(
        roomCode,
        "player1"
      );

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
  }
);

joinButton.addEventListener(
  "click",
  async () => {
    const enteredCode =
      roomCodeInput.value
        .trim()
        .toUpperCase();

    if (!enteredCode) {
      alert("Enter your date code first.");
      return;
    }

    try {
      const roomRef = doc(
        db,
        "datePlannerRooms",
        enteredCode
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
        enteredCode,
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
  }
);

roomCodeInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      joinButton.click();
    }
  }
);

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
