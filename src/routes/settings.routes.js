import { Router } from "express";
import {
    createSettings,
    getSettings,
    updatePopUpAds,
} from "../controller/settings.controller.js";
import { createLayout } from "../controller/layout.controller.js";

const router = Router();

//routes to get settings
router.get("/get", getSettings);

// routes to create layout;
router.post("/layout/create", createLayout);

//  routes to create settings;
router.post("/create", createSettings);

// routes to update popup  ads;

router.put("/update/ads", updatePopUpAds);

export default router;
