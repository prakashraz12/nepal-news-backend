import { Router } from "express";
import { createMenu, getListOfMenus } from "../controller/menu.controller.js";

const router = Router();

//routes to create menu
router.post("/create", createMenu);

// routes to getmenus;
router.post("/search", getListOfMenus);

export default router;
