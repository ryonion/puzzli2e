import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAOvejZqOTwFwWyQhkve44cKI1w--aN2Vg",
  authDomain: "puzzli2e.firebaseapp.com",
  projectId: "puzzli2e",
  storageBucket: "puzzli2e.appspot.com",
  messagingSenderId: "410773759743",
  appId: "1:410773759743:web:3b3f600440fa3e715dceca",
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
export default db;
