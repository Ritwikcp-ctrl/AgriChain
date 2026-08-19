import { WebSocketServer, WebSocket } from "ws";

import { Server } from "http";
import jwt from "jsonwebtoken";
import { connectionManager } from "./connectionManager";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

interface JwtPayload {
  _id: string;
}

export const initializeWebSocket = (server: Server) => {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (socket: AuthenticatedWebSocket, request) => {
    console.log("Websocket client connected");

    const url = new URL(request.url || "", `http://${request.headers.host}`);

    const token = url.searchParams.get("token");

    if (!token) {
      socket.close(1008, "Authenticaion required");
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;

      socket.userId = decoded._id;

      connectionManager.addConnection(socket.userId, socket);

      console.log(`user ${socket.userId} connected through websocket`);

      socket.send(
        JSON.stringify({
          event: "CONNECTED",
          message: "WebSocket connection established",
        })
      );
    } catch (error) {
      console.log("Invalid Websocket token");

      socket.close(1008, "Invalid authentication token");
      return;
    }

    socket.on("message", (message) => {
      console.log(`Message from ${socket.userId}: `, message.toString());
    });

    socket.on("close", () => {
      if (socket.userId) {
        connectionManager.removeConnection(socket.userId);
      }
    });

    socket.on("error", (error) => {
      console.error(`Websocket error for user ${socket.userId} : `, error);
    });
  });

  return wss;
};
