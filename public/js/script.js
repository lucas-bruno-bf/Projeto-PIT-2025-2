// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVTXDzqg3OxNnLjoE30OAeiOPLsh9t6uk",
  authDomain: "cupcakes-do-lucas.firebaseapp.com",
  projectId: "cupcakes-do-lucas",
  storageBucket: "cupcakes-do-lucas.firebasestorage.app",
  messagingSenderId: "977149839397",
  appId: "1:977149839397:web:a4d8c2509cbe27b29017cc",
  measurementId: "G-QWWH9VH49S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);