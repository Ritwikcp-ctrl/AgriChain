import dotenv from "dotenv";
import app from "./app";
import connectDB from "./db";
import path from "path";
import http from "http";
import { initializeWebSocket } from "./websocket/chat.socket";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const server = http.createServer(app);
initializeWebSocket(server)
connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err: Error) => {
    console.log("MongoDB connection failed", err);
  });