import { set, ref } from "firebase/database";
import { db } from "firebase.js";

const getUserGoogleUId = (user) => user.auth.currentUser.providerData[0].uid;

const getUId = (auth) => auth.currentUser.uid;

const createUser = (user, uid) => {
  const newUser = {
    email: user.email,
    username: user.email,
  };
  set((ref(db, `users/${uid}`)), newUser);
};

export {
  getUserGoogleUId,
  getUId,
  createUser,
};
