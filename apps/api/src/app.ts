import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit : "23kb"
}));

app.use(express.urlencoded({
    extended : true,limit : "23kb"
}));

app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user-router";
import categoryRouter from "./routes/category-route";
import productsRouter from "./routes/products-route";
import toolsRouter from "./routes/tool-routes";
import rentalRouter from "./routes/rental-routes";


app.use("api/v1/users", userRouter);
app.use("api/v1/category",categoryRouter);
app.use("api/v1/products",productsRouter);
app.use("api/v1/tools",toolsRouter);
app.use("api/v1/rental",rentalRouter)

export default app;