import { Router } from "express";
import {
    ResendVerifyEmail,
    createNewUser,
    forgotPassword,
    loginUser,
    resetPassword,
    verifyEmail,
} from "../controller/user.controller.js";

const router = Router();

//routes to create user
router.post("/create", createNewUser);

//login user
router.post("/login", loginUser);

//forgot password
router.post("/forgot-password", forgotPassword);

//reset password
router.post("/reset-password", resetPassword);

//verify email
router.get("/verify-email/:token", verifyEmail);

//resend verify token;
router.get("/resend-verify-email/:token", ResendVerifyEmail)

export default router;
