import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { initializeSocketIO } from "./socket";

let server: Server

const main = async () => {
  try {
    await mongoose.connect(config.database_url as string);

    server = app.listen(config.port, () => {
      console.log(`IT shop server running on port ${config.port}`);
    });

    const io = initializeSocketIO(server)

    io.on('connection', (socket) => {
      console.log('socket connected')

      socket.on('product', (payload) => {
        io.emit('product', payload)
      })
    })

  } catch (err) {
    console.log("Something went wrong", err);
  }
};

main();


process.on('uncaughtException', () => {
  console.log('UncaughtException error, shutting the server...')
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
})

process.on('unhandledRejection', () => {
  console.log(' unhandledRejection error, shutting the server...')
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
})
