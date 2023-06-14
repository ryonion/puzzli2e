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
import styled from "@emotion/styled";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProgressBar from "react-bootstrap/ProgressBar";

const PlanListGroup = styled(ListGroup)`
  margin-top: 10px;
  border-radius: 0;
`;

const PlanList = () => {
  const [user, loading] = useAuthState(auth);
  const [plans, setPlans] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleCreatePlanModal = (created = false) => {
    setShowCreateModal(!showCreateModal);
    if (created) {
      setTimeout(() => {
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
        const completed = getBoolArrFromInt(plan.status).filter(
          (x) => x,
        ).length;
        allPlans.push({
          planId: pid,
          planName: plan.name,
          count: plan.count,
          completion: Math.floor((completed / plan.count) * 1000) / 10,
        });
      }
      setPlans(allPlans);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      get(ref(db, `users/${user.uid}`))
        .then((snapshot) => {
          getPlans(snapshot.val().plans);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [user, loading]);

  return (
    <>
      <Button variant="outline-dark" onClick={toggleCreatePlanModal}>
        +
      </Button>
      <PlanListGroup>
        {plans.map((p) => {
          return (
            <ListGroup.Item key={p.planId} action>
              <Link className="nav-link" key={p.planId} to={`/${p.planId}`}>
                <Container fluid>
                  <Row>
                    <Col xs={3} md={2}>{p.planName}</Col>
                    <Col xs={9} md={10}><ProgressBar style={{ height: "100%" }} now={p.completion} label={`${p.completion}%`} /></Col>
                  </Row>
                </Container>
              </Link>
            </ListGroup.Item>
          );
        })}
      </PlanListGroup>
      <CreatePlan
        showModal={showCreateModal}
        toggleModal={toggleCreatePlanModal}
      />
    </>
  );
};

export default PlanList;
