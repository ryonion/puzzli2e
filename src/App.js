import "./App.css";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "firebase.js";
import { signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { set, ref, get } from "firebase/database";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import "./index.css";
import Board from "./components/puzzle";
import Main from "components/main";
import "bootstrap/dist/css/bootstrap.min.css";
import PlanList from "components/main/Plans";
import Navi from "components/navi";
import { getUserGoogleUId } from "components/auth/auth";

const App = () => {
  const [user, loading] = useAuthState(auth);
  const googleProvider = new GoogleAuthProvider();

  const createUser = (user, uid) => {
    const newUser = {
      email: user.email,
      username: user.email,
    };
    set((ref(db, `users/${uid}`)), newUser);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      signInWithRedirect(auth, googleProvider);
    } else {
      const userUid = user.uid;
      get(ref(db, `users/${userUid}`)).then((snapshot) => {
        if (!snapshot.exists()) {
          createUser(user, userUid);
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [user, loading]);

  return (
    <BrowserRouter>
      <Navi />
      <Routes>
        <Route path="/" element={<PlanList />} />
        <Route path="/:id" element={<Main />} />
        <Route path="/puz" element={<Board />} />
        <Route path="/plans" element={<PlanList />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
