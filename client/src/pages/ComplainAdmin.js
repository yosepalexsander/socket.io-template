// import hook
import React, { useState, useEffect, useContext } from "react";

import NavbarAdmin from "../components/NavbarAdmin";

import { Container, Row, Col } from "react-bootstrap";
import Contact from "../components/complain/Contact";
import Chat from "../components/complain/Chat";

// import here
import { UserContext } from "../context/userContext";

// import socket.io-client
import { io } from "socket.io-client";

// initial variable outside socket
let socket;
export default function ComplainAdmin() {
  const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  // code here
  const [messages, setMessages] = useState([]);

  const title = "Complain admin";
  document.title = "DumbMerch | " + title;

  // code here
  const [state] = useContext(UserContext);

  useEffect(() => {
    socket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
      },
      query: {
        id: state.user.id,
      },
    });

    // invoke function
    loadContacts();
    loadMessages();

    // register listener on event 'new message'
    socket.on("new message", () => {
      console.log("contact", contact);
      socket.emit("load customer contacts");
      socket.emit("load messages", contact?.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [messages]); // add message to dependency array to re-render when messages updated

  const loadContacts = () => {
    socket.emit("load customer contacts");
    socket.on("customer contacts", (data) => {
      // filter just customers which have sent a message
      let dataContacts = data.filter(
        (item) => item.status !== "admin" && (item.recipientMessage.length > 0 || item.senderMessage.length > 0)
      );

      // manipulate customers to add message property with the newest message
      dataContacts = dataContacts.map((item) => ({
        ...item,
        message:
          item.senderMessage.length > 0
            ? item.senderMessage[item.senderMessage.length - 1].message
            : "Click here to start message",
      }));
      setContacts(dataContacts);
    });
  };

  // used for active style when click contact
  const onClickContact = (data) => {
    setContact(data);
    socket.emit("load messages", data.id);
  };

  // function to register event listener on event "messages"
  const loadMessages = () => {
    socket.on("messages", (data) => {
      if (data.length !== messages.length) {
        if (data.length > 0) {
          const dataMessages = data.map((item) => ({
            idSender: item.sender.id,
            message: item.message,
          }));
          setMessages(dataMessages);
        }
        loadContacts();
      }
      // smooth scroll
      const chatMessagesElm = document.getElementById("chat-messages");
      chatMessagesElm.scroll({
        top: chatMessagesElm.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    });
  };

  // handle send massage on enter
  const onSendMessage = (e) => {
    if (e.key === "Enter") {
      const data = {
        idRecipient: contact.id,
        message: e.target.value,
      };
      socket.emit("send message", data);
      e.target.value = "";
    }
  };
  return (
    <>
      <NavbarAdmin title={title} />
      <Container fluid style={{ height: "89.5vh" }}>
        <Row>
          <Col md={3} style={{ height: "89.5vh" }} className="px-3 border-end border-dark overflow-auto">
            <Contact dataContact={contacts} clickContact={onClickContact} contact={contact} />
          </Col>
          <Col md={9} style={{ height: "89.5vh" }} className="px-o">
            <Chat contact={contact} user={state.user} messages={messages} sendMessage={onSendMessage} />
          </Col>
        </Row>
      </Container>
    </>
  );
}
