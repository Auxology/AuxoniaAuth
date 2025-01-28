import express from "express";
import {finishSignup, signup, verifyEmail} from "../controllers/signupControllers.js";
import {login, logout} from "../controllers/loginControllers.js";
import {forgetPasswordProtection, isAuthenticated, temporarySessionProtection} from "../middlewares/authMiddleware.js";
import {forgetPassword, resetPassword, verifyForgetPassword} from "../controllers/forgetPasswordControllers.js";
import {ipLimit} from "../libs/rate-limits.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", ipLimit,signup);
authRoutes.post("/verify-email",ipLimit, verifyEmail);
// There is no need to spam protect this route, as it is only used once
authRoutes.post("/finish-signup", temporarySessionProtection, finishSignup)
authRoutes.post("/login", ipLimit,login);
// There is no need to spam protect this route, as it is only used once
authRoutes.post("/logout", logout);
authRoutes.post("/forget-password", ipLimit,forgetPassword);
authRoutes.post("/forget-password/code",ipLimit, verifyForgetPassword);
// There is no need to spam protect this route, as it is only used once
authRoutes.post("/reset-password", forgetPasswordProtection, resetPassword);
// This test route remove it in production
    authRoutes.post("/test", isAuthenticated, (req, res) => {
    res.status(200).json({message: "You are authenticated"});
});