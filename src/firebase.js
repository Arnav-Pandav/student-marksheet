import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDd9oBYMn6Q2ugF820vIpe08ElemtxFxjs", // 👈 replace this with the real one from Firebase console
  authDomain: "student-marksheet-1e045.firebaseapp.com",
  projectId: "student-marksheet-1e045",
  storageBucket: "student-marksheet-1e045.appspot.com",
  messagingSenderId: "260198058111",
  appId: "1:260198058111:web:4ca6661595b10f384cb8a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch(() => {});
