// import hook
import React, { useState, useEffect, useContext } from "react";

import Navbar from "../components/Navbar";

import { Container, Row, Col } from "react-bootstrap";
import Contact from "../components/complain/Contact";
import Chat from "../components/complain/Chat";

// import here
import { UserContext } from "../context/userContext";

// import socket.io-client
import { io } from "socket.io-client";

// initial variable outside socket
let socket;
export default function Complain() {
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

    loadContact();

    // listen error sent from server
    socket.on("connect_error", (err) => {
      console.error(err.message); // not authorized
    });
    // code here
    loadMessages();

    // code here
    socket.on("new message", () => {
      console.log("contact", contact);
      socket.emit("load messages", contact?.id);
    });
    return () => {
      socket.disconnect();
    };
  }, [messages]); // add message to dependency array to re-render when messages updated

  const loadContact = () => {
    // emit event load admin contact
    socket.emit("load admin contact");
    // listen event to get admin contact
    socket.on("admin contact", (data) => {
      // manipulate data to add message property with the newest message
      const dataContact = {
        ...data,
        message: messages.length > 0 ? messages[messages.length - 1].message : "Click here to start message",
      };
      console.log(dataContact);
      setContacts([dataContact]);
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

          loadContact();
        }
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

  // function to register event listener on event "messages"
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
      <Navbar title={title} />
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
