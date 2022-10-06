import { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import handleUpload from "helpers/fireUpload";
import { ref, push, get, set } from "firebase/database";
import { initializePieces } from "components/main/Piece";
import { db } from "firebase.js";
import { useRecoilState } from "recoil";
import { userState } from "atoms";

const CreatePlan = ({
  showModal,
  toggleModal,
}) => {
  const [planName, setPlanName] = useState(null);
  const [, setPercentage] = useState(0);
  const inputRef = useRef(null);
  const [user] = useRecoilState(userState);


  const addPlan = (planName, fileName) => {
    const newRef = push(ref(db, "plans/"), {
      name: planName,
      count: 24,
      status: 0,
      userId: user.uid,
      fileName,
    });
    return newRef.key;
  };

  const addPlanToUser = (planId) => {
    get(ref(db, `users/${user.uid}/plans`)).then((snapshot) => {
      const updated = snapshot.val();
      updated.push(planId);
      set(ref(db, `users/${user.uid}/plans`), updated);
    });
  };

  const createPlan = () => {
    const file = inputRef.current.files[0];
    const planId = addPlan(planName, file.name);
    handleUpload(file, setPercentage, user.uid, planId);
    addPlanToUser(planId);
    initializePieces(planId, 5, 5);
    toggleModal(true);
  };

  return (
    <Modal show={showModal} onHide={toggleModal}>
      <Modal.Header closeButton>
        <Modal.Title>New Plan</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Plan Name</Form.Label>
          <Form.Control
            type="text"
            onChange={(e) => {
              setPlanName(e.target.value);
            }}
            placeholder="Enter plan name" required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Image</Form.Label>
          <Form.Control type="file" ref={inputRef} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={toggleModal}>Close</Button>
        <Button variant="primary" onClick={createPlan}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePlan;
