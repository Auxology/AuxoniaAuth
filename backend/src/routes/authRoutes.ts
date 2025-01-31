import express from "express";
import {finishSignup, signup, verifyEmail} from "../controllers/signupControllers.js";
import {login, logout} from "../controllers/loginControllers.js";
import {forgetPasswordProtection, temporarySessionProtection} from "../middlewares/authMiddleware.js";
import {forgetPassword, resetPassword, verifyForgetPassword} from "../controllers/forgetPasswordControllers.js";
import {ipLimit} from "../libs/rate-limits.js";
import {resendEmailVerificationCode, resendForgotPasswordCode} from "../controllers/resendCodeControllers.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", ipLimit,signup);
authRoutes.post("/verify-email",ipLimit, verifyEmail);
authRoutes.post("/finish-signup", temporarySessionProtection, finishSignup)

authRoutes.post("/login", ipLimit,login);
authRoutes.post("/logout", logout);

authRoutes.post("/forget-password", ipLimit,forgetPassword);
authRoutes.post("/forget-password/code",ipLimit, verifyForgetPassword);
authRoutes.post("/reset-password", forgetPasswordProtection, resetPassword);

authRoutes.post("/verify-email/resend", resendEmailVerificationCode);
authRoutes.post("/forget-password/resend",resendForgotPasswordCode);