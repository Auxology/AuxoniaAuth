import express from "express";
import {finishSignup, signup, verifyEmail} from "../controllers/signupControllers.js";
import {login, logout} from "../controllers/loginControllers.js";
import {
    changeEmailProtection,
    forgetPasswordProtection,
    isAuthenticated,
    temporarySessionProtection
} from "../middlewares/authMiddleware.js";
import {forgotPassword, resetPassword, verifyForgotPassword} from "../controllers/recoveryControllers.js";
import {ipLimit} from "../libs/rate-limits.js";
import {
    resendEmailChangeCode,
    resendEmailVerificationCode,
    resendForgotPasswordCode
} from "../controllers/resendControllers.js";
import {
    changeEmail,
    requestEmailChange,
    verifyCodeForEmailChange,
    deleteAccount,
    getUserData,
} from "../controllers/userController.js";
import {
    checkAuth, checkForForgotPasswordSession,
    checkForgotPasswordCookie,
    checkForTemporarySession,
    checkVerifyEmailCookie
} from "../controllers/checkerController.js";

export const authRoutes = express.Router();

authRoutes.post("/signup", ipLimit,signup);
authRoutes.post("/verify-email",ipLimit, verifyEmail);
authRoutes.post("/finish-signup", temporarySessionProtection, finishSignup)

authRoutes.post("/login", ipLimit,login);
authRoutes.post("/logout", logout);

authRoutes.post("/forgot-password", ipLimit,forgotPassword);
authRoutes.post("/forgot-password/code",ipLimit, verifyForgotPassword);
authRoutes.post("/reset-password", forgetPasswordProtection, resetPassword);

authRoutes.post("/verify-email/resend", resendEmailVerificationCode);
authRoutes.post("/forget-password/resend",resendForgotPasswordCode);
authRoutes.post("/change-email/resend", isAuthenticated, resendEmailChangeCode);

// This routes will require user to be logged in
authRoutes.post("/delete-account", isAuthenticated, deleteAccount);
authRoutes.post("/user-data", isAuthenticated, getUserData);
authRoutes.post("/request-email-change", isAuthenticated, requestEmailChange);
authRoutes.post("/verify-email-change-code", isAuthenticated, verifyCodeForEmailChange);
authRoutes.post("/change-email", isAuthenticated, changeEmailProtection, changeEmail)

// This route will be used to check if user is logged in
authRoutes.get("/is-authenticated", isAuthenticated, checkAuth);
authRoutes.get("/verify-email/check", checkVerifyEmailCookie);
authRoutes.get("/forgot-password/check", checkForgotPasswordCookie);
authRoutes.get("/reset-password/check", forgetPasswordProtection ,checkForForgotPasswordSession);
authRoutes.get("/temporary-session", temporarySessionProtection, checkForTemporarySession);