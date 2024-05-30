import { Router } from "express";
import { createCoverStory, getAllCoverNews, getCoverStoryNewsById } from "../controller/cover-story.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { getAllComments } from "../controller/comment.controller.js";

const router = Router();

//routes to create Cover story
router.post("/create", verifyJWT, upload.single("file"), createCoverStory);

// routes to get all cover story;
router.post("/getAll", getAllCoverNews);

// routes to get coverstory by news;
router.get("/get/:id", getCoverStoryNewsById)


export default router;
