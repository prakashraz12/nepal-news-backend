import { Router } from "express";
import { createNews, getAllNews } from "../controller/news.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();

//routes to create news
router.post("/create", verifyJWT, upload.single("file"), createNews);

// routes to get all news with pagination and search;
router.post("/search", getAllNews);

export default router;
