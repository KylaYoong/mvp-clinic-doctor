// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Authentication


// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4bjdKKk1qcMY4qW75cltCkHXTkeevtuw",
  authDomain: "mvp-clinic-qms-webapp.firebaseapp.com",
  projectId: "mvp-clinic-qms-webapp",
  storageBucket: "mvp-clinic-qms-webapp.firebasestorage.app",
  messagingSenderId: "13443185885",
  appId: "1:13443185885:web:7b9082fb8e3f5c91b96f34",
  measurementId: "G-BWE50YG4NK"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };