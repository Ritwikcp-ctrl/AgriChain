import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
    limit: "23kb",
  })
);

app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user-router";
import categoryRouter from "./routes/category-route";
import productsRouter from "./routes/products-route";
import toolsRouter from "./routes/tool-routes";
import rentalRouter from "./routes/rental-routes";
import orderRouter from "./routes/order-routes";
import ConversationRouter from "./routes/conversation-router";
import messageRouter from "./routes/message-router";
import broadcastRouter from "./routes/cropBroadcast-routes";
import broadcastRequestRouter from "./routes/broadcastRequest-routes";
import transactionRouter from "./routes/transaction-routes";
import confirmtransactionRouter from "./routes/transaction-routes";
import cancelTranRouter from "./routes/transaction-routes";
import transactionIdRouter from "./routes/transaction-routes";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/tools", toolsRouter);
app.use("/api/v1/rental", rentalRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/conversation", ConversationRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/broadcast", broadcastRouter);
app.use("/api/v1/crop-broadcast", broadcastRequestRouter);
app.use("/api/v1/transaction", transactionRouter);
app.use("/api/v1/confirmTran", confirmtransactionRouter);
app.use("/api/v1/cancelTrans", cancelTranRouter);
app.use("/api/v1/transactionComplete", transactionIdRouter);

export default app;
