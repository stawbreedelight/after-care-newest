import { db, auth } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const createButton = document.getElementById("createButton");
const showJoinButton = document.getElementById("showJoinButton");
const joinButton = document.getElementById("joinButton");
const backButton = document.getElementById("backButton");

const intro = document.getElementById("intro");
const joinScreen = document.getElementById("joinScreen");
const filterScreen = document.getElementById("filterScreen");
const game = document.getElementById("game");
const waiting = document.getElementById("waiting");
const results = document.getElementById("results");

const roomCodeInput = document.getElementById("roomCodeInput");
const roomCodeText = document.getElementById("roomCodeText");
const progressText = document.getElementById("progressText");

const budgetFilter = document.getElementById("budgetFilter");
const energyFilter = document.getElementById("energyFilter");
const settingFilter = document.getElementById("settingFilter");
const startFilteredGameButton =
  document.getElementById("startFilteredGameButton");

const dateTitle = document.getElementById("dateTitle");
const dateDescription = document.getElementById("dateDescription");

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

const matchList = document.getElementById("matchList");


let currentRoomCode = "";
let currentPlayer = "";
let currentDateIndex = 0;
let roomListener = null;

let allDateIdeas = [];
let dateIdeas = [];


/* FIREBASE AUTH */

async function getSignedInUser() {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const userCredential =
    await signInAnonymously(auth);

  return userCredential.user;
}


/* LOAD ACTIVE DATE IDEAS */

async function loadAllDateIdeas() {
  const dateIdeasRef =
    collection(db, "dateIdeas");

  const dateIdeasQuery = query(
    dateIdeasRef,
    where("active", "==", true),
    orderBy("order", "asc")
  );

  const snapshot =
    await getDocs(dateIdeasQuery);

  allDateIdeas = snapshot.docs.map((docSnap) => {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  });

  if (allDateIdeas.length === 0) {
    throw new Error(
      "No active date ideas were found in Firebase."
    );
  }
}


/* FILTER DATE IDEAS */

function applyFilters(filters) {
  dateIdeas = allDateIdeas.filter((idea) => {

    const budgetMatches =
      filters.budget === "any" ||
      idea.budget === filters.budget;

    const energyMatches =
      filters.energy === "any" ||
      idea.energy === filters.energy;

    const settingMatches =
      filters.setting === "any" ||
      idea.setting === filters.setting ||
      idea.setting === "either";

    return (
      budgetMatches &&
      energyMatches &&
      settingMatches
    );
  });
}


/* SCREEN HELPERS */

function hideAllScreens() {
  intro.style.display = "none";
  joinScreen.style.display = "none";
  filterScreen.style.display = "none";
  game.style.display = "none";
  waiting.style.display = "none";
  results.style.display = "none";
}


function generateRoomCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(
        Math.random() * characters.length
      )
    );
  }

  return code;
}


function showDateIdea() {
  const idea =
    dateIdeas[currentDateIndex];

  if (!idea) {
    console.error(
      "No date idea found at index:",
      currentDateIndex
    );
    return;
  }

  dateTitle.textContent =
    idea.title;

  dateDescription.textContent =
    idea.description;

  progressText.textContent =
    `${currentDateIndex + 1} of ${dateIdeas.length}`;
}


function showFilterScreen() {
  hideAllScreens();

  budgetFilter.value = "any";
  energyFilter.value = "any";
  settingFilter.value = "any";

  filterScreen.style.display = "block";
}


/* OPEN GAME */

async function openGame(
  roomCode,
  player,
  roomFilters
) {
  currentRoomCode = roomCode;
  currentPlayer = player;
  currentDateIndex = 0;

  if (allDateIdeas.length === 0) {
    await loadAllDateIdeas();
  }

  applyFilters(roomFilters);

  if (dateIdeas.length === 0) {
    alert(
      "No dates match those filters yet. Try a broader combination."
    );

    return false;
  }

  hideAllScreens();

  game.style.display = "block";

  roomCodeText.textContent =
    `Date code: ${roomCode}`;

  yesButton.style.display = "block";
  noButton.style.display = "block";

  showDateIdea();

  startRoomListener(roomCode);

  return true;
}


/* LIVE ROOM LISTENER */

function startRoomListener(roomCode) {
  const roomRef = doc(
    db,
    "datePlannerRooms",
    roomCode
  );

  if (roomListener) {
    roomListener();
  }

  roomListener =
    onSnapshot(
      roomRef,

      (roomSnap) => {
        if (!roomSnap.exists()) {
          return;
        }

        const roomData =
          roomSnap.data();

        if (
          roomData.player1Finished === true &&
          roomData.player2Finished === true
        ) {
          showMatches(roomData);
        }
      },

      (error) => {
        console.error(
          "Room listener error:",
          error
        );
      }
    );
}


/* SAVE CHOICE */

async function saveChoice(choice) {
  const idea =
    dateIdeas[currentDateIndex];

  if (!idea) {
    throw new Error(
      "Could not find the current date idea."
    );
  }

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


/* WAITING */

function showWaitingScreen() {
  hideAllScreens();

  waiting.style.display =
    "block";
}


/* MATCHES */

function showMatches(roomData) {
  hideAllScreens();

  results.style.display =
    "block";

  matchList.innerHTML = "";

  const player1Choices =
    roomData.player1Choices || {};

  const player2Choices =
    roomData.player2Choices || {};

  const matches =
    dateIdeas.filter((idea) => {
      return (
        player1Choices[idea.id] === true &&
        player2Choices[idea.id] === true
      );
    });

  if (matches.length === 0) {
    matchList.innerHTML = `
      <div class="match-card">
        <h2>No matches this round</h2>
        <p>
          Try again with some new ideas 💕
        </p>
      </div>
    `;

    return;
  }

  matches.forEach((idea) => {
    const matchCard =
      document.createElement("div");

    matchCard.classList.add(
      "match-card"
    );

    matchCard.innerHTML = `
      <h2>${idea.title}</h2>
      <p>${idea.description}</p>
    `;

    matchList.appendChild(
      matchCard
    );
  });
}


/* CHECK IF BOTH FINISHED */

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


/* FINISH PLAYER */

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


/* YES / NO */

async function chooseDate(choice) {
  try {
    yesButton.disabled = true;
    noButton.disabled = true;

    await saveChoice(choice);

    currentDateIndex++;

    if (
      currentDateIndex >=
      dateIdeas.length
    ) {
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
      (error.code || "unknown") +
      "\n" +
      error.message
    );

  } finally {
    yesButton.disabled = false;
    noButton.disabled = false;
  }
}


/* SHOW JOIN SCREEN */

showJoinButton.addEventListener(
  "click",
  () => {
    hideAllScreens();

    roomCodeInput.value = "";

    joinScreen.style.display =
      "block";

    roomCodeInput.focus();
  }
);


/* BACK */

backButton.addEventListener(
  "click",
  () => {
    hideAllScreens();

    intro.style.display =
      "block";
  }
);


/* CREATE ROOM */

createButton.addEventListener(
  "click",
  async () => {
    try {
      const user =
        await getSignedInUser();

      if (allDateIdeas.length === 0) {
        await loadAllDateIdeas();
      }

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

        player1Uid:
          user.uid,

        player2Uid:
          null,

        player1Finished:
          false,

        player2Finished:
          false,

        player1Choices:
          {},

        player2Choices:
          {},

        filters:
          null
      });

      currentRoomCode =
        roomCode;

      currentPlayer =
        "player1";

      showFilterScreen();

    } catch (error) {
      console.error(
        "Error creating room:",
        error
      );

      alert(
        "Firebase error:\n" +
        (error.code || "unknown") +
        "\n" +
        error.message
      );
    }
  }
);


/* PLAYER 1 SAVES FILTERS */

startFilteredGameButton.addEventListener(
  "click",
  async () => {
    try {
      const filters = {
        budget:
          budgetFilter.value,

        energy:
          energyFilter.value,

        setting:
          settingFilter.value
      };

      if (allDateIdeas.length === 0) {
        await loadAllDateIdeas();
      }

      applyFilters(filters);

      if (dateIdeas.length === 0) {
        alert(
          "No dates match those filters yet. Try choosing Any for one of the options."
        );

        return;
      }

      const roomRef = doc(
        db,
        "datePlannerRooms",
        currentRoomCode
      );

      await updateDoc(roomRef, {
        filters:
          filters
      });

      await openGame(
        currentRoomCode,
        "player1",
        filters
      );

    } catch (error) {
      console.error(
        "Error saving filters:",
        error
      );

      alert(
        "Firebase error:\n" +
        (error.code || "unknown") +
        "\n" +
        error.message
      );
    }
  }
);


/* JOIN ROOM */

joinButton.addEventListener(
  "click",
  async () => {
    const enteredCode =
      roomCodeInput.value
        .trim()
        .toUpperCase();

    if (!enteredCode) {
      alert(
        "Enter your date code first."
      );

      return;
    }

    try {
      const user =
        await getSignedInUser();

      if (allDateIdeas.length === 0) {
        await loadAllDateIdeas();
      }

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

      const roomData =
        roomSnap.data();

      if (
        roomData.player1Uid ===
        user.uid
      ) {
        alert(
          "Open this date code in your partner's browser or device."
        );

        return;
      }

      if (
        roomData.player2Uid &&
        roomData.player2Uid !==
          user.uid
      ) {
        alert(
          "This date room already has two players."
        );

        return;
      }

      if (!roomData.filters) {
        alert(
          "Your partner is still choosing the date filters. Try again in a moment."
        );

        return;
      }

      if (!roomData.player2Uid) {
        await updateDoc(
          roomRef,
          {
            player2Uid:
              user.uid
          }
        );
      }

      await openGame(
        enteredCode,
        "player2",
        roomData.filters
      );

    } catch (error) {
      console.error(
        "Error joining room:",
        error
      );

      alert(
        "Firebase error:\n" +
        (error.code || "unknown") +
        "\n" +
        error.message
      );
    }
  }
);


/* ENTER KEY */

roomCodeInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      joinButton.click();
    }
  }
);


/* YES */

yesButton.addEventListener(
  "click",
  async () => {
    await chooseDate(true);
  }
);


/* NO */

noButton.addEventListener(
  "click",
  async () => {
    await chooseDate(false);
  }
);
