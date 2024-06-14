import { Router } from "express";
import {
    ResendVerifyEmail,
    createNewUser,
    forgotPassword,
    loginUser,
    resetPassword,
    updatePassword,
    updateUser,
    userLogout,
    verifyEmail,
} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

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
router.get("/resend-verify-email/:token", ResendVerifyEmail);

// logout
router.get("/logout", userLogout);

// continue with google
router.get("/with-google", continueWithGoogle);

// routes to update user;
router.put("/update/me", verifyJWT, upload.single("file"), updateUser);

// routes to update password;
router.post("/update/password", verifyJWT, updatePassword);

export default router;
