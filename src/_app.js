import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//app init
const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
    })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRoute from "./routes/user.routes.js";
import reporterRoute from "./routes/reporter.routes.js";
import fileUploadRoute from "./routes/file-upload.routes.js";

//route declarations;
app.use("/api/v1/user", userRoute);
app.use("/api/v1/reporter", reporterRoute);
app.use("/api/v1/file-upload", fileUploadRoute);

export { app };
