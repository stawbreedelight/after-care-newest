import { db, auth } from "../firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* -----------------------------
   PAGE ELEMENTS
----------------------------- */

const createRoomButton =
  document.getElementById("createRoomButton");

const showJoinButton =
  document.getElementById("showJoinButton");

const joinRoomButton =
  document.getElementById("joinRoomButton");

const backButton =
  document.getElementById("backButton");

const introScreen =
  document.getElementById("introScreen");

const joinScreen =
  document.getElementById("joinScreen");

const roomScreen =
  document.getElementById("roomScreen");

const roomCodeInput =
  document.getElementById("roomCodeInput");

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");

const roomStatus =
  document.getElementById("roomStatus");

const message =
  document.getElementById("message");


/* -----------------------------
   GAME STATE
----------------------------- */

let currentRoomCode = null;

let currentPlayer = null;

let unsubscribeRoom = null;


/* -----------------------------
   SCREEN CONTROL
----------------------------- */

function showScreen(screen) {

  introScreen.classList.add("hidden");
  joinScreen.classList.add("hidden");
  roomScreen.classList.add("hidden");

  screen.classList.remove("hidden");

}


/* -----------------------------
   CREATE ROOM CODE
----------------------------- */

function createRoomCode() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {

    const randomIndex =
      Math.floor(
        Math.random() * characters.length
      );

    code += characters[randomIndex];

  }

  return code;

}


/* -----------------------------
   FIREBASE SIGN IN
----------------------------- */

async function signPlayerIn() {

  try {

    if (!auth.currentUser) {

      await signInAnonymously(auth);

    }

    return auth.currentUser;

  } catch (error) {

    console.error(
      "Anonymous sign-in failed:",
      error
    );

    message.textContent =
      "Could not connect to the game. Please refresh and try again.";

    return null;

  }

}


/* -----------------------------
   FIND UNUSED ROOM CODE
----------------------------- */

async function generateAvailableRoomCode() {

  let attempts = 0;

  while (attempts < 10) {

    const code =
      createRoomCode();

    const roomRef =
      doc(
        db,
        "meetMeHereRooms",
        code
      );

    const roomSnapshot =
      await getDoc(roomRef);

    if (!roomSnapshot.exists()) {

      return code;

    }

    attempts++;

  }

  throw new Error(
    "Could not generate an available room code."
  );

}


/* -----------------------------
   CREATE ROOM
----------------------------- */

async function createRoom() {

  message.textContent =
    "Creating your room...";

  const user =
    await signPlayerIn();

  if (!user) {
    return;
  }

  try {

    const roomCode =
      await generateAvailableRoomCode();

    const roomRef =
      doc(
        db,
        "meetMeHereRooms",
        roomCode
      );

    await setDoc(
      roomRef,
      {

        roomCode: roomCode,

        status: "waiting",

        createdAt:
          serverTimestamp(),

        player1: {

          uid: user.uid,

          connected: true,

          submitted: false,

          moods: []

        },

        player2: null

      }
    );

    currentRoomCode =
      roomCode;

    currentPlayer =
      "player1";

    roomCodeDisplay.textContent =
      roomCode;

    roomStatus.textContent =
      "Waiting for your partner...";

    message.textContent = "";

    showScreen(
      roomScreen
    );

    listenToRoom(
      roomCode
    );

  } catch (error) {

    console.error(
      "Create room error:",
      error
    );

    message.textContent =
      "Something went wrong creating the room.";

  }

}


/* -----------------------------
   JOIN ROOM
----------------------------- */

async function joinRoom() {

  const roomCode =
    roomCodeInput.value
      .trim()
      .toUpperCase();

  if (roomCode.length !== 6) {

    message.textContent =
      "Please enter the 6-character room code.";

    return;

  }

  message.textContent =
    "Joining room...";

  const user =
    await signPlayerIn();

  if (!user) {
    return;
  }

  try {

    const roomRef =
      doc(
        db,
        "meetMeHereRooms",
        roomCode
      );

    const roomSnapshot =
      await getDoc(
        roomRef
      );

    if (!roomSnapshot.exists()) {

      message.textContent =
        "That room could not be found.";

      return;

    }

    const roomData =
      roomSnapshot.data();

    if (
      roomData.player2 &&
      roomData.player2.uid !== user.uid
    ) {

      message.textContent =
        "That room already has two players.";

      return;

    }

    await updateDoc(
      roomRef,
      {

        player2: {

          uid: user.uid,

          connected: true,

          submitted: false,

          moods: []

        },

        status: "connected"

      }
    );

    currentRoomCode =
      roomCode;

    currentPlayer =
      "player2";

    roomCodeDisplay.textContent =
      roomCode;

    roomStatus.textContent =
      "You joined the room.";

    message.textContent = "";

    showScreen(
      roomScreen
    );

    listenToRoom(
      roomCode
    );

  } catch (error) {

    console.error(
      "Join room error:",
      error
    );

    message.textContent =
      "Something went wrong joining the room.";

  }

}


/* -----------------------------
   LISTEN TO ROOM
----------------------------- */

function listenToRoom(roomCode) {

  if (unsubscribeRoom) {

    unsubscribeRoom();

  }

  const roomRef =
    doc(
      db,
      "meetMeHereRooms",
      roomCode
    );

  unsubscribeRoom =
    onSnapshot(
      roomRef,
      (snapshot) => {

        if (!snapshot.exists()) {

          roomStatus.textContent =
            "This room no longer exists.";

          return;

        }

        const roomData =
          snapshot.data();

        if (
          roomData.player1 &&
          roomData.player2
        ) {

          roomStatus.textContent =
            "Your partner is here 💕";

        } else {

          roomStatus.textContent =
            "Waiting for your partner...";

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
   BUTTON EVENTS
----------------------------- */

createRoomButton.addEventListener(
  "click",
  createRoom
);


showJoinButton.addEventListener(
  "click",
  () => {

    message.textContent = "";

    roomCodeInput.value = "";

    showScreen(
      joinScreen
    );

    roomCodeInput.focus();

  }
);


backButton.addEventListener(
  "click",
  () => {

    message.textContent = "";

    showScreen(
      introScreen
    );

  }
);


joinRoomButton.addEventListener(
  "click",
  joinRoom
);


/* -----------------------------
   ROOM CODE INPUT
----------------------------- */

roomCodeInput.addEventListener(
  "input",
  () => {

    roomCodeInput.value =
      roomCodeInput.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ""
        );

  }
);
