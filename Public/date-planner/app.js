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

/*
  Date ideas now come from Firebase instead
  of being stored inside app.js.
*/
let dateIdeas = [];


/* -----------------------------
   FIREBASE AUTH
----------------------------- */

async function getSignedInUser() {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const userCredential =
    await signInAnonymously(auth);

  return userCredential.user;
}


/* -----------------------------
   LOAD DATE IDEAS FROM FIREBASE
----------------------------- */

async function loadDateIdeas() {
  const dateIdeasRef =
    collection(db, "dateIdeas");

  const dateIdeasQuery = query(
    dateIdeasRef,
    where("active", "==", true),
    orderBy("order", "asc")
  );

  const snapshot =
    await getDocs(dateIdeasQuery);

  dateIdeas = snapshot.docs.map((docSnap) => {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  });

  if (dateIdeas.length === 0) {
    throw new Error(
      "No active date ideas were found in Firebase."
    );
  }

  console.log(
    `${dateIdeas.length} date ideas loaded from Firebase`
  );
}


/* -----------------------------
   SCREEN HELPERS
----------------------------- */

function hideAllScreens() {
  intro.style.display = "none";
  joinScreen.style.display = "none";
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


/* -----------------------------
   OPEN GAME
----------------------------- */

async function openGame(
  roomCode,
  player
) {
  currentRoomCode = roomCode;
  currentPlayer = player;
  currentDateIndex = 0;

  /*
    Only download the date ideas once
    during this page session.
  */
  if (dateIdeas.length === 0) {
    await loadDateIdeas();
  }

  hideAllScreens();

  game.style.display = "block";

  roomCodeText.textContent =
    `Date code: ${roomCode}`;

  yesButton.style.display = "block";
  noButton.style.display = "block";

  showDateIdea();

  startRoomListener(roomCode);
}


/* -----------------------------
   LIVE ROOM LISTENER
----------------------------- */

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


/* -----------------------------
   SAVE A CHOICE
----------------------------- */

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


/* -----------------------------
   WAITING SCREEN
----------------------------- */

function showWaitingScreen() {
  hideAllScreens();

  waiting.style.display =
    "block";
}


/* -----------------------------
   MATCH RESULTS
----------------------------- */

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


/* -----------------------------
   CHECK IF BOTH FINISHED
----------------------------- */

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


/* -----------------------------
   FINISH A PLAYER
----------------------------- */

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


/* -----------------------------
   YES / NO CHOICE
----------------------------- */

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


/* -----------------------------
   SHOW JOIN SCREEN
----------------------------- */

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


/* -----------------------------
   BACK BUTTON
----------------------------- */

backButton.addEventListener(
  "click",
  () => {
    hideAllScreens();

    intro.style.display =
      "block";
  }
);


/* -----------------------------
   CREATE A DATE
----------------------------- */

createButton.addEventListener(
  "click",
  async () => {
    try {
      const user =
        await getSignedInUser();

      /*
        Load the date ideas before
        creating the room.

        This also confirms Firebase
        can read dateIdeas correctly.
      */
      if (dateIdeas.length === 0) {
        await loadDateIdeas();
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
          {}
      });

      await openGame(
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
        (error.code || "unknown") +
        "\n" +
        error.message
      );
    }
  }
);


/* -----------------------------
   JOIN A DATE
----------------------------- */

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

      if (dateIdeas.length === 0) {
        await loadDateIdeas();
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

      /*
        Prevent Player 1 from joining
        their own room as Player 2.
      */
      if (
        roomData.player1Uid ===
        user.uid
      ) {
        alert(
          "Open this date code in your partner's browser or device."
        );

        return;
      }

      /*
        If the Player 2 position has
        already been taken by somebody
        else, don't let another person in.
      */
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

      /*
        Only claim Player 2 if this is
        the first time this user joins.
      */
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
        "player2"
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


/* -----------------------------
   ENTER KEY ON ROOM CODE
----------------------------- */

roomCodeInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      joinButton.click();
    }
  }
);


/* -----------------------------
   YES BUTTON
----------------------------- */

yesButton.addEventListener(
  "click",
  async () => {
    await chooseDate(true);
  }
);


/* -----------------------------
   NO BUTTON
----------------------------- */

noButton.addEventListener(
  "click",
  async () => {
    await chooseDate(false);
  }
);
