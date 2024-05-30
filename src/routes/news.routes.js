import { Router } from "express";
import { createNews, fetchNews, getAllNews, getNewsById, getNewsByMenu, getTrendingNews, updateNews } from "../controller/news.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();

//routes to create news
router.post("/create", verifyJWT, upload.single("file"), createNews);

// routes to get all news with pagination and search;
router.post("/search", getAllNews);

// routes to get news by menus;
router.post("/menus", getNewsByMenu);

// routes to get newsby id;
router.get("/get/:id", getNewsById);

// get trending news;
router.post("/get/trending", getTrendingNews);

// get fetch news;
router.get("/get/menu/:menuId", fetchNews);

// routes to update news;
router.post("/update",verifyJWT, upload.single("file"), updateNews);

export default router;
