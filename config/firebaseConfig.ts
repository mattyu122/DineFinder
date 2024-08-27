// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2E58AzErBB9RyBuueNnorGkx90WLfqEA",
  authDomain: "dinefinder-203c7.firebaseapp.com",
  projectId: "dinefinder-203c7",
  storageBucket: "dinefinder-203c7.appspot.com",
  messagingSenderId: "858701017838",
  appId: "1:858701017838:web:eac4ac94f28c2213c279ff",
  measurementId: "G-6XV2421051"
};

if (!getApps().length) {
  console.log("Initializing Firebase App");
  initializeApp(firebaseConfig);
} else {
  console.log("Firebase App already initialized");
}


// Initialize Firebase
// const app = initializeApp(firebaseConfig);

const app = getApps()[0]; // Get the initialized app
const db = getFirestore(app);

// const analytics = getAnalytics(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

export { app, auth, db };

