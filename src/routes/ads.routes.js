import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createAds, getAdsByPosition } from "../controller/ads.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//routes to create ads
router.post("/create", verifyJWT, upload.single("file"), createAds);

//routes to get ads by position;
router.get("/get/:position", getAdsByPosition )


export default router;
