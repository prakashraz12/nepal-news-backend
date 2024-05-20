import { Router } from "express";
import { fileUpload } from "../controller/upload-file.controller.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();

//routes to upload file
router.post("/upload", upload.single("file"), fileUpload);


export default router;
