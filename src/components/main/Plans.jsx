
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "firebase.js";
import { auth } from "firebase.js";
import { Link } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import { getBoolArrFromInt } from "components/common/helper";

const PlanList = () => {
  const [user, loading] = useAuthState(auth);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function getPlan(planIds) {
      const allPlans = [];
      if (planIds) {
        for (const pid of planIds) {
          const planRef = await get(ref(db, `plans/${pid}`));
          const plan = planRef.val();
          const completed = getBoolArrFromInt(plan.status).filter((x) => x).length;
          allPlans.push({
            planId: pid,
            planName: plan.name,
            count: plan.count,
            completion: Math.floor(completed / plan.count * 1000) / 10 + "%",
          });
        }
        setPlans(allPlans);
      }
    };

    if (!loading && user) {
      get(ref(db, `users/${user.providerData[0].uid}`)).then((snapshot) => {
        getPlan(snapshot.val().plans);
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [user, loading]);

  return (
    <ListGroup>
      {plans.map((p) => {
        return (
          <ListGroup.Item key={p.planId} action>
            <Link
              className="nav-link"
              key={p.planId}
              to={`/${p.planId}`}
            >
              {p.planName} {p.completion}
            </Link>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default PlanList;
