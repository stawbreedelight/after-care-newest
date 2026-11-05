import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getFirestore

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-xqPWrExGfmVRJ2hYk7usgZ3rhyoNDUc",
  authDomain: "mid-vanilla.firebaseapp.com",
  projectId: "mid-vanilla",
  storageBucket: "mid-vanilla.firebasestorage.app",
  messagingSenderId: "404095487133",
  appId: "1:404095487133:web:f8f0b413180a878b2c5874",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
