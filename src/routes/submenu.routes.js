import { Router } from "express";
import {
    createSubMenu,
    getListOfSubMenus,
    getListOfSubMenusByMainMenuId,
} from "../controller/sub-menu.controller.js";

const router = Router();

//routes to create news
router.post("/create", createSubMenu);

// routes to search submenus;
router.post("/search", getListOfSubMenus);

// routes to get list of submeu by main menu id;
router.get("/get/menu/:id", getListOfSubMenusByMainMenuId);

export default router;
