import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    clickedCountOnAds,
    createAds,
    deleteAds,
    getAdsByPosition,
    getAllAds,
    updateAds,
} from "../controller/ads.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//routes to create ads
router.post("/create", verifyJWT, upload.single("file"), createAds);

//routes to get ads by position;
router.get("/get/:position", getAdsByPosition);

//routes to click on ads;
router.get("/click/:id", clickedCountOnAds);

// routes to update ads;
router.put("/update", verifyJWT, upload.single("file"), updateAds);

//routes to delete ads;
router.get("/delete/:id", deleteAds);

// routes to get all ads
router.get("/getAllAds", getAllAds);

export default router;
