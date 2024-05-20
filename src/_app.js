import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//app init
const app = express();

app.use(
    cors({
        origin: "http://localhost:5173" || "*",
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
import newsRoute from "./routes/news.routes.js";
import menuRoute from "./routes/menu.routes.js";
import subMenu from "./routes/submenu.routes.js";

//route declarations;
app.use("/api/v1/user", userRoute);
app.use("/api/v1/reporter", reporterRoute);
app.use("/api/v1/file", fileUploadRoute);
app.use("/api/v1/news", newsRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/submenu", subMenu);

export { app };
