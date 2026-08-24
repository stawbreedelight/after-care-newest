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

    alert("Something went wrong creating your date.");
  }
});

joinButton.addEventListener("click", () => {
  alert("Join a Date will be added next!");
});
