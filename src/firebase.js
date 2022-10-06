import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

import {
  getAuth,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOvejZqOTwFwWyQhkve44cKI1w--aN2Vg",
  authDomain: "puzzli2e.firebaseapp.com",
  projectId: "puzzli2e",
  storageBucket: "puzzli2e.appspot.com",
  messagingSenderId: "410773759743",
  appId: "1:410773759743:web:3b3f600440fa3e715dceca",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

const logout = () => {
  signOut(auth);
};

export {
  db,
  auth,
  storage,
  logout,
};
