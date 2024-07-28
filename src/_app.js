import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import admin from "firebase-admin"
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://news-next-bsc38jks7-prakashraz12s-projects.vercel.app",
    "https://news-next-js-three.vercel.app",
    "https://news-super-admin.vercel.app/"
];
//app init
const app = express();

app.use(
    cors({
        origin: function (origin, callback) {

            if (!origin || allowedOrigins.includes(origin)) {

                callback(null, true);
            } else {

                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: "GET,POST,PUT,DELETE",
        credentials: true,

    })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static("public"));
app.use(cookieParser());
admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
        universe_domain: process.env.UNIVERSE_DOMAIN,
    }),
  });
//routes import
import userRoute from "./routes/user.routes.js";
import reporterRoute from "./routes/reporter.routes.js";
import fileUploadRoute from "./routes/file-upload.routes.js";
import newsRoute from "./routes/news.routes.js";
import menuRoute from "./routes/menu.routes.js";
import subMenu from "./routes/submenu.routes.js";
import settingsRoute from "./routes/settings.routes.js";
import commentRoute from "./routes/comment.routes.js";
import coverstoryRoute from "./routes/cover-story.routes.js";
import galleryRoute from "./routes/gallery.routes.js";
import adminRoute from "./routes/dashboard.routes.js";
import storyRoutes from "./routes/story.routes.js";
import adsRoutes from "./routes/ads.routes.js";

//route declarations;
app.use("/api/v1/user", userRoute);
app.use("/api/v1/reporter", reporterRoute);
app.use("/api/v1/file", fileUploadRoute);
app.use("/api/v1/news", newsRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/submenu", subMenu);
app.use("/api/v1/settings", settingsRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/coverstory", coverstoryRoute);
app.use("/api/v1/gallery", galleryRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/story", storyRoutes);
app.use("/api/v1/ads", adsRoutes);

export { app };
