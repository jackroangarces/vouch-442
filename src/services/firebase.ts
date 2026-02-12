// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdMqABlpVZbwNUdC7wslsK2dJ9HRhNnTc",
  authDomain: "vouch-f1ff1.firebaseapp.com",
  projectId: "vouch-f1ff1",
  storageBucket: "vouch-f1ff1.firebasestorage.app",
  messagingSenderId: "658886372623",
  appId: "1:658886372623:web:868ab2cf1bec67f380e27a",
  measurementId: "G-C3PX2W4RKH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);