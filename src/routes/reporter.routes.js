import { Router } from "express";
import { createNewReporter, loginReporter } from "../controller/reporter.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//routes to create reporter
router.post("/create",verifyJWT, createNewReporter);

//login reporter
router.post("/login", loginReporter);

 //forgot password
// router.post("/forgot-password", forgotPassword);

// //reset password
// router.post("/reset-password", resetPassword);

// //verify email
// router.get("/verify-email/:token", verifyEmail);

// //resend verify token;
// router.get("/resend-verify-email/:token", ResendVerifyEmail)

export default router;
