import { db } from "firebase.js";
import { ref, update } from "firebase/database";

const updatePlan = (planId, key, val) => {
  update(ref(db, `plans/${planId}`), { [key]: val });
};

export {
  updatePlan,
};
