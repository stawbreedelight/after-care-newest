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


function showScreen(screen) {

  introScreen.classList.add("hidden");
  joinScreen.classList.add("hidden");
  roomScreen.classList.add("hidden");

  screen.classList.remove("hidden");

}


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


createRoomButton.addEventListener(
  "click",
  () => {

    const roomCode =
      createRoomCode();

    roomCodeDisplay.textContent =
      roomCode;

    roomStatus.textContent =
      "Waiting for your partner...";

    message.textContent = "";

    showScreen(roomScreen);

  }
);


showJoinButton.addEventListener(
  "click",
  () => {

    message.textContent = "";

    roomCodeInput.value = "";

    showScreen(joinScreen);

    roomCodeInput.focus();

  }
);


backButton.addEventListener(
  "click",
  () => {

    message.textContent = "";

    showScreen(introScreen);

  }
);


joinRoomButton.addEventListener(
  "click",
  () => {

    const roomCode =
      roomCodeInput.value
        .trim()
        .toUpperCase();

    if (roomCode.length !== 6) {

      message.textContent =
        "Please enter the 6-character room code.";

      return;

    }

    roomCodeDisplay.textContent =
      roomCode;

    roomStatus.textContent =
      "You joined the room.";

    message.textContent = "";

    showScreen(roomScreen);

  }
);
