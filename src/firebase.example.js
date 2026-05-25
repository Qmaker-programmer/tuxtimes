import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// REEMPLAZA ESTOS VALORES CON LOS DE TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUÍ",
  authDomain: "TU_AUTH_DOMAIN_AQUÍ",
  projectId: "TU_PROJECT_ID_AQUÍ",
  storageBucket: "TU_STORAGE_BUCKET_AQUÍ",
  messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUÍ",
  appId: "TU_APP_ID_AQUÍ",
  measurementId: "TU_MEASUREMENT_ID_AQUÍ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();