import { Router } from "express";
import { dashboard } from "../controller/dashboard.ccontroller.js";


const router = Router();

// routes to get dashoard;
router.get("/get", dashboard)


export default router;
