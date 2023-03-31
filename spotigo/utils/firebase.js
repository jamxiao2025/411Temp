// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuNV0m86kwKEiIDNZ4uKam9iSPrgi1TfE",
  authDomain: "spotigo-3c898.firebaseapp.com",
  projectId: "spotigo-3c898",
  storageBucket: "spotigo-3c898.appspot.com",
  messagingSenderId: "968129260540",
  appId: "1:968129260540:web:c243a3d38dc315a1e96079",
  measurementId: "G-K54XMX537R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
