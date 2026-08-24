import { db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const createButton = document.getElementById("createButton");
const joinButton = document.getElementById("joinButton");

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

    alert(`Your date code is: ${roomCode}`);

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

    alert(`Joined date room: ${roomCode}`);

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
