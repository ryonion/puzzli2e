import {
  atom,
} from "recoil";

const userState = atom({
  key: "user",
  default: {
    uid: null,
    userEmail: null,
    userFullName: null,
  },
});

export {
  userState,
};
