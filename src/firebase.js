import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASgnxDHG404QPhzxeKx8z0yB36jAW4z80",
  authDomain: "tuxtimes-new.firebaseapp.com",
  projectId: "tuxtimes-new",
  storageBucket: "tuxtimes-new.firebasestorage.app",
  messagingSenderId: "587588696105",
  appId: "1:587588696105:web:97b0d5060abf54d5ad4438",
  measurementId: "G-FGN27RLW7F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
