
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "firebase.js";
import { auth } from "firebase.js";
import { Link } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import { getBoolArrFromInt } from "helpers/utils";
import Button from "react-bootstrap/Button";
import CreatePlan from "components/modals/createPlan";

const PlanList = () => {
  const [user, loading] = useAuthState(auth);
  const [plans, setPlans] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleCreatePlanModal = (created = false) => {
    setShowCreateModal(!showCreateModal);
    if (created) {
      setTimeout(()=>{
        get(ref(db, `users/${user.uid}`)).then((snapshot) => {
          getPlans(snapshot.val().plans);
        });
      }, 1000);
    }
  };

  const getPlans = async (planIds) => {
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

  useEffect(() => {
    if (!loading && user) {
      get(ref(db, `users/${user.uid}`)).then((snapshot) => {
        getPlans(snapshot.val().plans);
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [user, loading]);

  return (
    <>
      <Button variant="outline-dark" onClick={toggleCreatePlanModal}>+</Button>
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
      <CreatePlan showModal={showCreateModal} toggleModal={toggleCreatePlanModal}/>
    </>
  );
};

export default PlanList;
