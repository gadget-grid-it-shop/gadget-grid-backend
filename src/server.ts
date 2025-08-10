import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { Server } from "http";
import { initializeSocketIO } from "./socket";
import Notification from "./app/modules/notification/notification.model";
import { ValidateIOAuth } from "./app/middleware/socketAuth";
import { ObjectId } from "mongodb";

let server: Server;

const main = async () => {
  try {
    console.log(config.database_url);
    await mongoose.connect(config.database_url as string);

    server = app.listen(config.port, () => {
      console.log(`IT shop server running on port ${config.port}`);
    });

    const io = initializeSocketIO(server);

    io?.use(ValidateIOAuth);

    io?.on("connection", (socket) => {
      socket.on("adminJoin", (data) => {
        console.log(`admin joined ${data.user}`);
        socket.join(`${data.user}`);
        socket.join("admins");
      });

      socket.on("notificationClicked", async (id) => {
        const user = socket.user?.userData?._id;
        console.log(user);
        try {
          const res = await Notification.findByIdAndUpdate(id, {
            opened: true,
          });
          io.to(`${String(user)}`).emit("notificationRead", res);
        } catch (err) {
          console.log(err);
        }
      });

      socket.on("markAllRead", async () => {
        const user = socket.user?.userData?._id;
        const updateAll = await Notification.updateMany(
          { userTo: user },
          { opened: true }
        );
        if (updateAll) {
          io.to(`${String(user)}`).emit("markedAllasRead");
        }
      });
    });
  } catch (err) {
    console.log("Something went wrong", err);
  }
};

main();

process.on("uncaughtException", () => {
  console.log("UncaughtException error, shutting the server...");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});

process.on("unhandledRejection", () => {
  console.log(" unhandledRejection error, shutting the server...");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});
