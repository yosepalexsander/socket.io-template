// import models here
const { user, chat } = require("../../models");

const socketIo = (io) => {
  io.on("connection", (socket) => {
    console.log("client connect: ", socket.id);

    // event admin contact
    socket.on("load admin contact", async () => {
      try {
        const adminContact = await user.findOne({
          where: {
            status: "admin",
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });

        // emit event to send admin data on event "admin contact"
        socket.emit("admin contact", adminContact);
      } catch (error) {
        console.log(error);
      }
    });

    // event customer contacts
    socket.on("load customer contacts", async () => {
      try {
        const customerContact = await user.findAll({
          include: [
            {
              model: chat,
              as: "recipientMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
            {
              model: chat,
              as: "senderMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });
        // customerContact = JSON.parse(JSON.stringify(customerContact))
        // customerContact = customerContact.map(item => ({
        //   ...item,
        //   profile: {

        //   }
        // }))
        // emit event to send admin data on event "admin contact"
        socket.emit("customer contact", customerContact);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("client disconnect");
    });
  });
};

module.exports = socketIo;
