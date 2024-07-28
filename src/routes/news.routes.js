import { Router } from "express";
import { bulkNewsUpdate, createNews, fetchNews, getAllNews, getNewsById, getNewsByMenu, getNewsBySubMenu, getTrendingNews, moreCommentedNews, provinceNews, shareCountIncreament, updateNews } from "../controller/news.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { searchController } from "../controller/newsSearch.controller.js";
import { verifyRole } from "../middleware/authorization.middlware.js";
import { isBlockedUser } from "../middleware/isBlockedUser.middleware.js";


const router = Router();

//routes to create news
router.post("/create", verifyJWT, isBlockedUser, verifyRole(["admin", "reporter"]), upload.single("file"), createNews);

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
router.post("/update", verifyJWT, upload.single("file"), updateNews);

// routes to get news by menu;
router.post("/get/submenu", getNewsBySubMenu);

// routes to get news;
router.get("/get/morecomment/:id", moreCommentedNews);

// routes to get Porvince news;
router.get("/province", provinceNews);

//routes to search news;
router.post("/all/search", searchController);

//routes to incremanet news shares count;
router.put("/inc/shares", shareCountIncreament)

router.put("/bulk", bulkNewsUpdate)
export default router;
