// import hook
import React, { useEffect, useState } from "react";

import NavbarAdmin from "../components/NavbarAdmin";

// import components here
import { Container, Row, Col } from "react-bootstrap";
import Contact from "../components/complain/Contact";

// import socket.io-client
import { io } from "socket.io-client";

// initial variable outside socket
let socket;
export default function ComplainAdmin() {
  // code here
  const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);

  const title = "Complain admin";
  document.title = "DumbMerch | " + title;

  useEffect(() => {
    socket = io("http://localhost:5000");
    // code here
    loadContacts();

    return () => {
      socket.disconnect();
    };
  }, []);

  // code here
  const loadContacts = () => {
    socket.emit("load customer contacts");
    socket.on("customer contact", (data) => {
      let dataContacts = data.filter(
        (item) => item.status !== "admin" && (item.recipientMessage.length > 0 || item.senderMessage.length > 0)
      );
      dataContacts = dataContacts.map((item) => ({
        ...item,
        message:
          item.senderMessage.length > 0
            ? item.senderMessage[item.senderMessage.length - 1].message
            : "Click to start message",
      }));
      setContacts(dataContacts);
    });
  };

  const onClickContact = (data) => {
    setContact(data);
  };
  return (
    <>
      <NavbarAdmin title={title} />
      <Container fluid style={{ height: "99.5vh" }}>
        <Row>
          <Col md={3} style={{ height: "89.5vh" }} className="px-3 border-end border-dark overflow-auto">
            <Contact dataContact={contacts} clickContact={onClickContact} contact={contact} />
          </Col>
        </Row>
      </Container>
    </>
  );
}
