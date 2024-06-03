import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    createStoryNews,
    getAllStoryNews,
    getStoryNewsById,
} from "../controller/storyController.js";

const router = Router();

//routes to create story news
router.post("/create", verifyJWT, upload.single("file"), createStoryNews);

router.get("/getAll", getAllStoryNews);

// routes to get storyNews by id;
router.get("/get/:id", getStoryNewsById);

// router.get("/get/:id", getCoverStoryNewsById)

export default router;
