import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";



import authRouters from "./routes/auth.routes.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", authRouters);
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port:${process.env.PORT}`);
});