/* ==============================
   SWEET STREAK
============================== */


/* -----------------------------
   PAGE ELEMENTS
----------------------------- */

const createScreen =
  document.getElementById("createScreen");

const acceptScreen =
  document.getElementById("acceptScreen");

const activeScreen =
  document.getElementById("activeScreen");

const confirmScreen =
  document.getElementById("confirmScreen");

const resultScreen =
  document.getElementById("resultScreen");


const challengeForm =
  document.getElementById("challengeForm");

const taskInput =
  document.getElementById("taskInput");

const playerSelect =
  document.getElementById("playerSelect");

const timeSelect =
  document.getElementById("timeSelect");

const rewardInput =
  document.getElementById("rewardInput");

const forfeitInput =
  document.getElementById("forfeitInput");


const acceptTask =
  document.getElementById("acceptTask");

const acceptPlayer =
  document.getElementById("acceptPlayer");

const acceptTime =
  document.getElementById("acceptTime");

const acceptReward =
  document.getElementById("acceptReward");

const acceptForfeit =
  document.getElementById("acceptForfeit");


const activeTask =
  document.getElementById("activeTask");

const activePlayer =
  document.getElementById("activePlayer");

const activeReward =
  document.getElementById("activeReward");

const activeForfeit =
  document.getElementById("activeForfeit");

const countdown =
  document.getElementById("countdown");


const confirmTask =
  document.getElementById("confirmTask");


const resultEmoji =
  document.getElementById("resultEmoji");

const resultTitle =
  document.getElementById("resultTitle");

const resultMessage =
  document.getElementById("resultMessage");

const resultStake =
  document.getElementById("resultStake");


const acceptButton =
  document.getElementById("acceptButton");

const editButton =
  document.getElementById("editButton");

const doneButton =
  document.getElementById("doneButton");

const confirmYesButton =
  document.getElementById("confirmYesButton");

const confirmNoButton =
  document.getElementById("confirmNoButton");

const playAgainButton =
  document.getElementById("playAgainButton");


/* -----------------------------
   GAME STATE
----------------------------- */

let challenge = null;

let timerInterval = null;


/* -----------------------------
   SCREEN CONTROL
----------------------------- */

function showScreen(screen) {

  const screens = [
    createScreen,
    acceptScreen,
    activeScreen,
    confirmScreen,
    resultScreen
  ];

  screens.forEach((item) => {
    item.classList.remove("active");
  });

  screen.classList.add("active");

}


/* -----------------------------
   FORMAT TIME
----------------------------- */

function formatTime(seconds) {

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor((seconds % 3600) / 60);

  const secs =
    seconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );

}


/* -----------------------------
   FORMAT TIME LABEL
----------------------------- */

function getTimeLabel(minutes) {

  const value =
    Number(minutes);

  if (value < 60) {
    return `${value} minutes`;
  }

  if (value === 60) {
    return "1 hour";
  }

  if (value < 1440) {

    const hours =
      value / 60;

    return `${hours} hours`;

  }

  if (value === 1440) {
    return "24 hours";
  }

  return `${value} minutes`;

}


/* -----------------------------
   SAVE CHALLENGE
----------------------------- */

function saveChallenge() {

  if (!challenge) {
    return;
  }

  localStorage.setItem(
    "sweetStreakChallenge",
    JSON.stringify(challenge)
  );

}


/* -----------------------------
   DELETE CHALLENGE
----------------------------- */

function clearChallenge() {

  localStorage.removeItem(
    "sweetStreakChallenge"
  );

  challenge = null;

}


/* -----------------------------
   CREATE CHALLENGE
----------------------------- */

challengeForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const task =
      taskInput.value.trim();

    const reward =
      rewardInput.value.trim();

    const forfeit =
      forfeitInput.value.trim();

    if (
      !task ||
      !reward ||
      !forfeit
    ) {
      return;
    }

    challenge = {

      task,

      player:
        playerSelect.value,

      timeMinutes:
        Number(timeSelect.value),

      reward,

      forfeit,

      status:
        "waiting",

      endTime:
        null

    };

    saveChallenge();

    showAcceptScreen();

  }
);


/* -----------------------------
   ACCEPT SCREEN
----------------------------- */

function showAcceptScreen() {

  acceptTask.textContent =
    challenge.task;

  acceptPlayer.textContent =
    challenge.player;

  acceptTime.textContent =
    getTimeLabel(
      challenge.timeMinutes
    );

  acceptReward.textContent =
    challenge.reward;

  acceptForfeit.textContent =
    challenge.forfeit;

  showScreen(
    acceptScreen
  );

}


/* -----------------------------
   EDIT CHALLENGE
----------------------------- */

editButton.addEventListener(
  "click",
  () => {

    if (!challenge) {
      return;
    }

    taskInput.value =
      challenge.task;

    playerSelect.value =
      challenge.player;

    timeSelect.value =
      String(
        challenge.timeMinutes
      );

    rewardInput.value =
      challenge.reward;

    forfeitInput.value =
      challenge.forfeit;

    showScreen(
      createScreen
    );

  }
);


/* -----------------------------
   ACCEPT CHALLENGE
----------------------------- */

acceptButton.addEventListener(
  "click",
  () => {

    const duration =
      challenge.timeMinutes *
      60 *
      1000;

    challenge.status =
      "active";

    challenge.endTime =
      Date.now() +
      duration;

    saveChallenge();

    showActiveScreen();

  }
);


/* -----------------------------
   ACTIVE SCREEN
----------------------------- */

function showActiveScreen() {

  activeTask.textContent =
    challenge.task;

  activePlayer.textContent =
    challenge.player;

  activeReward.textContent =
    challenge.reward;

  activeForfeit.textContent =
    challenge.forfeit;

  showScreen(
    activeScreen
  );

  startTimer();

}


/* -----------------------------
   TIMER
----------------------------- */

function startTimer() {

  clearInterval(
    timerInterval
  );

  updateTimer();

  timerInterval =
    setInterval(
      updateTimer,
      1000
    );

}


function updateTimer() {

  if (
    !challenge ||
    !challenge.endTime
  ) {
    return;
  }

  const difference =
    challenge.endTime -
    Date.now();

  const secondsLeft =
    Math.max(
      0,
      Math.ceil(
        difference / 1000
      )
    );

  countdown.textContent =
    formatTime(
      secondsLeft
    );

  if (
    secondsLeft <= 0
  ) {

    clearInterval(
      timerInterval
    );

    challenge.status =
      "expired";

    saveChallenge();

    showExpiredResult();

  }

}


/* -----------------------------
   USER SAYS DONE
----------------------------- */

doneButton.addEventListener(
  "click",
  () => {

    clearInterval(
      timerInterval
    );

    challenge.status =
      "confirming";

    saveChallenge();

    confirmTask.textContent =
      challenge.task;

    showScreen(
      confirmScreen
    );

  }
);


/* -----------------------------
   PARTNER CONFIRMS YES
----------------------------- */

confirmYesButton.addEventListener(
  "click",
  () => {

    challenge.status =
      "completed";

    saveChallenge();

    resultEmoji.textContent =
      "💕";

    resultTitle.textContent =
      "Sweet Streak Complete!";

    resultMessage.textContent =
      "Challenge crushed. Your reward is officially unlocked.";

    resultStake.textContent =
      challenge.reward;

    showScreen(
      resultScreen
    );

  }
);


/* -----------------------------
   PARTNER CONFIRMS NO
----------------------------- */

confirmNoButton.addEventListener(
  "click",
  () => {

    challenge.status =
      "failed";

    saveChallenge();

    resultEmoji.textContent =
      "😈";

    resultTitle.textContent =
      "Streak Broken!";

    resultMessage.textContent =
      "Not quite this time. The forfeit has been unlocked.";

    resultStake.textContent =
      challenge.forfeit;

    showScreen(
      resultScreen
    );

  }
);


/* -----------------------------
   TIMER EXPIRED
----------------------------- */

function showExpiredResult() {

  resultEmoji.textContent =
    "⏰";

  resultTitle.textContent =
    "Time's Up!";

  resultMessage.textContent =
    "The clock ran out before the challenge was completed.";

  resultStake.textContent =
    challenge.forfeit;

  showScreen(
    resultScreen
  );

}


/* -----------------------------
   PLAY AGAIN
----------------------------- */

playAgainButton.addEventListener(
  "click",
  () => {

    clearInterval(
      timerInterval
    );

    clearChallenge();

    challengeForm.reset();

    showScreen(
      createScreen
    );

  }
);


/* -----------------------------
   RESTORE SAVED GAME
----------------------------- */

function restoreGame() {

  const savedChallenge =
    localStorage.getItem(
      "sweetStreakChallenge"
    );

  if (!savedChallenge) {

    showScreen(
      createScreen
    );

    return;

  }

  try {

    challenge =
      JSON.parse(
        savedChallenge
      );

  } catch (error) {

    clearChallenge();

    showScreen(
      createScreen
    );

    return;

  }


  if (
    challenge.status ===
    "waiting"
  ) {

    showAcceptScreen();

    return;

  }


  if (
    challenge.status ===
    "active"
  ) {

    if (
      challenge.endTime <=
      Date.now()
    ) {

      challenge.status =
        "expired";

      saveChallenge();

      showExpiredResult();

    } else {

      showActiveScreen();

    }

    return;

  }


  if (
    challenge.status ===
    "confirming"
  ) {

    confirmTask.textContent =
      challenge.task;

    showScreen(
      confirmScreen
    );

    return;

  }


  if (
    challenge.status ===
    "completed"
  ) {

    resultEmoji.textContent =
      "💕";

    resultTitle.textContent =
      "Sweet Streak Complete!";

    resultMessage.textContent =
      "Challenge crushed. Your reward is officially unlocked.";

    resultStake.textContent =
      challenge.reward;

    showScreen(
      resultScreen
    );

    return;

  }


  if (
    challenge.status ===
    "failed" ||
    challenge.status ===
    "expired"
  ) {

    showExpiredResult();

    return;

  }


  showScreen(
    createScreen
  );

}


/* -----------------------------
   START APP
----------------------------- */

restoreGame();
