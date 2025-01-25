import express from "express";
import {finishSignup, signup, verifyEmail} from "../controllers/signupControllers.js";
import {login, logout} from "../controllers/loginControllers.js";
import {forgetPasswordProtection, isAuthenticated, temporarySessionProtection} from "../middlewares/authMiddleware.js";
import {forgetPassword, resetPassword, verifyForgetPassword} from "../controllers/forgetPasswordControllers.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/finish-signup", temporarySessionProtection, finishSignup)
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/forget-password", forgetPassword);
authRoutes.post("/forget-password/code",verifyForgetPassword);
authRoutes.post("/reset-password", forgetPasswordProtection, resetPassword);
// This test route remove it in production
    authRoutes.post("/test", isAuthenticated, (req, res) => {
    res.status(200).json({message: "You are authenticated"});
});