
// const { createAdapter } = require("@socket.io/redis-adapter");
// const redisClient = require("./redis");

import { Server } from "socket.io";
import {
    Server as htttpServer
} from "http";

let io: Server

export const initializeSocketIO = (server: htttpServer) => {
    // io = socketIo(server, {
    //   pingTimeout: 60000,
    // });
    io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: ['http://localhost:3000'], credentials: true
        }
    });
    try {
        // const subClient = redisClient.duplicate();
        // io.adapter(createAdapter(redisClient, subClient));
    } catch (e) {
        console.log(e);
    }

    // You can add your Socket.IO event listeners here.
    // For example:
    // io.on("connection", (socket) => {
    //   console.log("A user connected");
    // });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO is not initialized");
    }
    return io;
};

