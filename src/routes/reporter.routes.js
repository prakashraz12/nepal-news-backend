import { Router } from "express";
import {
    createNewReporter,
    getAllReporterStoryNews,
    getReporter,
    getReporterById,
    getReporterCoverStoryNews,
    getReporters,
    loginReporter,
    meReporterUpdate,
    reporterForgetPassword,
    searchReporterGalleryNews,
    searchReporterNews,
    updateReporter,
} from "../controller/reporter.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/authorization.middlware.js";

import { upload } from "../middleware/multer.middleware.js";
import { isBlockedUser } from "../middleware/isBlockedUser.middleware.js";

const router = Router();

//routes to create reporter
router.post("/create", verifyJWT, createNewReporter);

//login reporter
router.post("/login", loginReporter);

router.post("/get/All", verifyJWT, getReporters);

// routes to get reporter by id;
router.get("/get/:id", getReporterById);

//routes to update reporter;
router.put(
    "/update",
    verifyJWT,
    verifyRole(["admin", "reporter"]),
    updateReporter
);

//routes to get reporter profile;
router.get("/me", verifyJWT, verifyRole(["admin", "reporter"]), getReporter);

//routes to get reporter news;
router.post(
    "/news/search",
    verifyJWT,
    isBlockedUser,
    verifyRole("reporter"),
    searchReporterNews
);

//routes to get gallery news;
router.post(
    "/gallery/search",
    verifyJWT,
    isBlockedUser,
    verifyRole("reporter"),
    searchReporterGalleryNews
);

// routes  to cover story news;
router.post(
    "/coverstory/search",
    verifyJWT,
    isBlockedUser,
    verifyRole("reporter"),
    getReporterCoverStoryNews
);

// routes to get all story news;
router.post(
    "/story/search",
    verifyJWT,
    isBlockedUser,
    verifyRole("reporter"),
    getAllReporterStoryNews
);

//router to update;
router.put(
    "/me/update",
    verifyJWT,
    upload.single("file"),
    isBlockedUser,
    verifyRole("reporter"),
    meReporterUpdate
);

//router to reporter reset password;
router.post("/reset-password", reporterForgetPassword); 
export default router;
