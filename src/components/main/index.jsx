import { useEffect, useState } from "react";
import Puzzle from "./puzzle";
import CheckIn from "./checkIn";
import { useParams } from "react-router-dom";
import { db, auth } from "firebase.js";
import { getUserGoogleUId } from "components/auth/auth";
import { get, ref } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";

const Main = () => {
  const { id } = useParams();
  const [user, loading] = useAuthState(auth);
  const [hasPermission, setHasPermission] = useState(false);

  // check if plan belongs to user, if not -> show message.

  useEffect(() => {
    if (!loading && user) {
      const userId = getUserGoogleUId(user);
      get(ref(db, `users/${userId}/plans`)).then((li) => {
        if (li.val()?.includes(id)) {
          setHasPermission(true);
        }
      });
    }
  }, [user, loading]);

  return (
    <>
      {
        hasPermission
        ? (
          <>
            <CheckIn days={25} planId={id} />
            <Puzzle planId={id} />
          </>

        )
        : "404"
      }
    </>
  );
};

export default Main;
