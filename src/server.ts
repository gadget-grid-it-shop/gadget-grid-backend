import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";

let server: Server

server = app.listen(config.port, () => {
  console.log(`IT shop server running on port ${config.port}`);
});

export const io = new SocketServer(server, {
  cors: {
    origin: ['http://localhost:3000'], credentials: true
  }
})

const main = async () => {
  try {
    await mongoose.connect(config.database_url as string);


    io.on('connection', (socket) => {
      console.log('socket connected')

      socket.on('product', (payload) => {
        socket.join('sdfdsfsdfsdfsdfsdfsdfsdfsd')
      })

      socket.on('adminJoin', (payload) => {
        socket.join(payload.adminJoinId)
        console.log(payload)
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
