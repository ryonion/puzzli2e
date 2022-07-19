import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import { logout } from "firebase.js";
import { auth } from "firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import "./nav.css";

const Navi = () => {
  const [user, loading] = useAuthState(auth);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (!loading && user) {
      setUserName(user.email);
    }
  }, [user, loading]);

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">Puzzli2e</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link className="nav-link" to={"/plans"}>Plans</Link>
            <Nav.Link onClick={logout}><span className="email">({userName})</span> Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navi;
