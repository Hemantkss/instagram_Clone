import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/mongooDB.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { app, server } from "./socket/socket.js";
import path from "path";

//load environment variables
import dotenv from "dotenv";
dotenv.config({});

const port = 3000;

const _dirname = path.resolve();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

//cors middleware
const corsOptions = {
  origin: "http://localhost:5173" ,// replace with your frontend URL
  credentials: true,
};
app.use(cors(corsOptions));

//route handlers
app.use("/api/v1/user", userRoute); //user all routes
app.use("/api/v1/post", postRoute); // post all routes
app.use("/api/v1/message", messageRoute); // chat route

app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

server.listen(port, () => {
  // DB connection
  connectDB();
  // server connection
  console.log(`Server is running on port ${port}`);
});
