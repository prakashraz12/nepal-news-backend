import { Router } from "express";
import { getSettings } from "../controller/settings.controller.js";
import { createLayout } from "../controller/layout.controller.js";


const router = Router();

//routes to get settings
router.get("/get", getSettings);

// routes to create layout;
router.post("/layout/create", createLayout)

export default router;
