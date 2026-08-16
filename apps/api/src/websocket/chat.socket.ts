import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";


export const initializeWebSocket = (server: Server) => {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (socket: WebSocket) => {
    console.log("websocket client connected");

    socket.on("message", (message) => {
      console.log("Recieved", message.toString());

      socket.send(
        JSON.stringify({
          type: "message",
          message: "Message received by server",
        })
      );
    });

    socket.on("close", () => {
      console.log("WebSocket client deisconnected");
    });

    socket.on("error",(error) =>{
       console.log("Websocket error" , error)
    })
  });

  console.log("Websocket server initialized ");
  return wss;
};
