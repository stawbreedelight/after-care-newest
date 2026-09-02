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


/* -----------------------------
   PAGE ELEMENTS
----------------------------- */

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

const rankingScreen =
  document.getElementById("rankingScreen");

const finalResult =
  document.getElementById("finalResult");

const rankingList =
  document.getElementById("rankingList");

const submitRankingButton =
  document.getElementById("submitRankingButton");

const winningDate =
  document.getElementById("winningDate");

const roomCodeInput =
  document.getElementById("roomCodeInput");

const roomCodeText =
  document.getElementById("roomCodeText");

const progressText =
  document.getElementById("progressText");

const budgetFilter =
  document.getElementById("budgetFilter");

const energyFilter =
  document.getElementById("energyFilter");

const settingFilter =
  document.getElementById("settingFilter");

const startFilteredGameButton =
  document.getElementById("startFilteredGameButton");

const dateTitle =
  document.getElementById("dateTitle");

const dateDescription =
  document.getElementById("dateDescription");

const yesButton =
  document.getElementById("yesButton");

const noButton =
  document.getElementById("noButton");

const matchList =
  document.getElementById("matchList");


/* -----------------------------
   GAME STATE
----------------------------- */

let currentRoomCode = "";
let currentPlayer = "";
let currentDateIndex = 0;

let roomListener = null;

let allDateIdeas = [];
let dateIdeas = [];

let mutualMatches = [];
let rankingOrder = [];


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
   LOAD DATE IDEAS
----------------------------- */

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

  allDateIdeas =
    snapshot.docs.map((docSnap) => {
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


/* -----------------------------
   FILTER DATE IDEAS
----------------------------- */

function applyFilters(filters) {
  dateIdeas =
    allDateIdeas.filter((idea) => {

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


/* -----------------------------
   SCREEN HELPERS
----------------------------- */

function hideAllScreens() {
  intro.style.display = "none";
  joinScreen.style.display = "none";
  filterScreen.style.display = "none";
  game.style.display = "none";
  waiting.style.display = "none";
  results.style.display = "none";
  rankingScreen.style.display = "none";
  finalResult.style.display = "none";
}


/* -----------------------------
   ROOM CODE
----------------------------- */

function generateRoomCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(
        Math.random() *
        characters.length
      )
    );
  }

  return code;
}


/* -----------------------------
   SHOW DATE
----------------------------- */

function showDateIdea() {
  const idea =
    dateIdeas[currentDateIndex];

  if (!idea) {
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
   FILTER SCREEN
----------------------------- */

function showFilterScreen() {
  hideAllScreens();

  budgetFilter.value = "any";
  energyFilter.value = "any";
  settingFilter.value = "any";

  filterScreen.style.display =
    "block";
}


/* -----------------------------
   OPEN GAME
----------------------------- */

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


/* -----------------------------
   FIND MUTUAL MATCHES
----------------------------- */

function getMutualMatches(roomData) {
  const player1Choices =
    roomData.player1Choices || {};

  const player2Choices =
    roomData.player2Choices || {};

  return dateIdeas.filter((idea) => {
    return (
      player1Choices[idea.id] === true &&
      player2Choices[idea.id] === true
    );
  });
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

        /*
          Both ranking rounds finished:
          show the final date.
        */
        if (
          roomData.rankingFinished1 === true &&
          roomData.rankingFinished2 === true
        ) {
          showFinalResult(roomData);
          return;
        }

        /*
          Both people finished the first
          Yes/No round.
        */
        if (
          roomData.player1Finished === true &&
          roomData.player2Finished === true
        ) {
          const myRankingFinished =
            currentPlayer === "player1"
              ? roomData.rankingFinished1
              : roomData.rankingFinished2;

          /*
            Don't kick someone out of the
            ranking screen while they are ranking.
          */
          if (
            !myRankingFinished &&
            rankingScreen.style.display === "none"
          ) {
            showMatches(roomData);
          }
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
   SAVE YES / NO
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
   SHOW MATCHES
----------------------------- */

function showMatches(roomData) {
  hideAllScreens();

  results.style.display =
    "block";

  matchList.innerHTML = "";

  mutualMatches =
    getMutualMatches(roomData);

  if (mutualMatches.length === 0) {
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

  mutualMatches.forEach((idea) => {
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

  const rankButton =
    document.createElement("button");

  rankButton.textContent =
    "Rank These Dates 💕";

  rankButton.addEventListener(
    "click",
    () => {
      startRanking();
    }
  );

  matchList.appendChild(
    rankButton
  );
}


/* -----------------------------
   START RANKING
----------------------------- */

function startRanking() {
  rankingOrder =
    [...mutualMatches];

  hideAllScreens();

  rankingScreen.style.display =
    "block";

  submitRankingButton.style.display =
    "block";

  renderRankingList();
}


/* -----------------------------
   DRAW RANKING LIST
----------------------------- */

function renderRankingList() {
  rankingList.innerHTML = "";

  rankingOrder.forEach(
    (idea, index) => {

      const row =
        document.createElement("div");

      row.classList.add(
        "ranking-card"
      );

      row.innerHTML = `
        <div class="ranking-number">
          ${index + 1}
        </div>

        <div class="ranking-info">
          <h2>${idea.title}</h2>
          <p>${idea.description}</p>
        </div>

        <div class="ranking-controls">
          <button
            class="move-up"
            ${index === 0 ? "disabled" : ""}
          >
            ↑
          </button>

          <button
            class="move-down"
            ${
              index === rankingOrder.length - 1
                ? "disabled"
                : ""
            }
          >
            ↓
          </button>
        </div>
      `;

      const upButton =
        row.querySelector(".move-up");

      const downButton =
        row.querySelector(".move-down");

      upButton.addEventListener(
        "click",
        () => {
          moveRanking(index, -1);
        }
      );

      downButton.addEventListener(
        "click",
        () => {
          moveRanking(index, 1);
        }
      );

      rankingList.appendChild(row);
    }
  );
}


/* -----------------------------
   MOVE RANKING
----------------------------- */

function moveRanking(index, direction) {
  const newIndex =
    index + direction;

  if (
    newIndex < 0 ||
    newIndex >= rankingOrder.length
  ) {
    return;
  }

  const temp =
    rankingOrder[index];

  rankingOrder[index] =
    rankingOrder[newIndex];

  rankingOrder[newIndex] =
    temp;

  renderRankingList();
}


/* -----------------------------
   SUBMIT RANKING
----------------------------- */

submitRankingButton.addEventListener(
  "click",
  async () => {
    try {
      submitRankingButton.disabled =
        true;

      const rankings = {};

      rankingOrder.forEach(
        (idea, index) => {
          rankings[idea.id] =
            index + 1;
        }
      );

      const roomRef = doc(
        db,
        "datePlannerRooms",
        currentRoomCode
      );

      const rankingField =
        currentPlayer === "player1"
          ? "player1Rankings"
          : "player2Rankings";

      const finishedField =
        currentPlayer === "player1"
          ? "rankingFinished1"
          : "rankingFinished2";

      await updateDoc(roomRef, {
        [rankingField]:
          rankings,

        [finishedField]:
          true
      });

      rankingList.innerHTML = `
        <div class="match-card">
          <h2>Ranking saved 💕</h2>
          <p>
            Waiting for your person to finish ranking their favourites.
          </p>
        </div>
      `;

      submitRankingButton.style.display =
        "none";

    } catch (error) {
      console.error(
        "Error saving ranking:",
        error
      );

      alert(
        "Firebase error:\n" +
        (error.code || "unknown") +
        "\n" +
        error.message
      );

    } finally {
      submitRankingButton.disabled =
        false;
    }
  }
);


/* -----------------------------
   FINAL WINNER
----------------------------- */

function showFinalResult(roomData) {
  hideAllScreens();

  finalResult.style.display =
    "block";

  const matches =
    getMutualMatches(roomData);

  const player1Rankings =
    roomData.player1Rankings || {};

  const player2Rankings =
    roomData.player2Rankings || {};

  const scoredDates =
    matches
      .map((idea) => {

        const rank1 =
          player1Rankings[idea.id];

        const rank2 =
          player2Rankings[idea.id];

        if (
          typeof rank1 !== "number" ||
          typeof rank2 !== "number"
        ) {
          return null;
        }

        return {
          ...idea,
          score:
            rank1 + rank2
        };
      })
      .filter(Boolean);

  if (scoredDates.length === 0) {
    winningDate.innerHTML = `
      <p>
        We couldn't calculate a winner.
      </p>
    `;

    return;
  }

  const bestScore =
    Math.min(
      ...scoredDates.map(
        (idea) => idea.score
      )
    );

  const winners =
    scoredDates.filter(
      (idea) =>
        idea.score === bestScore
    );

  /*
    One clear winner.
  */
  if (winners.length === 1) {
    const winner =
      winners[0];

    winningDate.innerHTML = `
      <div class="match-card">
        <h2>${winner.title}</h2>
        <p>
          ${winner.description}
        </p>
      </div>
    `;

    return;
  }

  /*
    Tie at the top.
  */
  winningDate.innerHTML = `
    <p>
      You have a tie! These were your
      shared favourites:
    </p>
  `;

  winners.forEach((winner) => {
    const card =
      document.createElement("div");

    card.classList.add(
      "match-card"
    );

    card.innerHTML = `
      <h2>${winner.title}</h2>
      <p>${winner.description}</p>
    `;

    winningDate.appendChild(card);
  });
}


/* -----------------------------
   CHECK BOTH FINISHED
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
   FINISH YES / NO ROUND
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
   JOIN SCREEN
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


backButton.addEventListener(
  "click",
  () => {
    hideAllScreens();

    intro.style.display =
      "block";
  }
);


/* -----------------------------
   CREATE ROOM
----------------------------- */

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

        player1Rankings:
          {},

        player2Rankings:
          {},

        rankingFinished1:
          false,

        rankingFinished2:
          false,

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


/* -----------------------------
   SAVE FILTERS
----------------------------- */

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


/* -----------------------------
   JOIN ROOM
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


/* -----------------------------
   ENTER ROOM CODE
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
   YES / NO BUTTONS
----------------------------- */

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
