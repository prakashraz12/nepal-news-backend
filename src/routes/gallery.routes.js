import { Router } from "express";
import { createCoverStory, getAllCoverNews } from "../controller/cover-story.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { createGalleryNews, getAllGalleryNews, getGalleryNewsById } from "../controller/gallery.controller.js";

const router = Router();

//routes to create gallery;
router.post("/create", verifyJWT, upload.single("file"), createGalleryNews);

// routes to get all gallery data;
router.post("/getAll", getAllGalleryNews);

// routes to get news by id;
router.get("/get/:id", getGalleryNewsById)

export default router;
