import express from "express";
import {finishSignup, signup, verifyEmail} from "../controllers/signupControllers.js";
import {login, logout} from "../controllers/loginControllers.js";
import {
    accountRecoveryFinishProtection,
    accountRecoveryProtection,
    changeEmailProtection, changeEmailProtectionPlus, changePasswordProtection,
    forgetPasswordProtection,
    isAuthenticated,
    temporarySessionProtection
} from "../middlewares/authMiddleware.js";
import {
    accountRecoveryNewEmail, accountRecoveryNewEmailVerify,
    beginAccountRecovery,
    recoverAccount,
} from "../controllers/recoverControllers.js";
import {ipLimit} from "../libs/rate-limits.js";
import {
    resendEmailChangeCode,
    resendEmailVerificationCode,
    resendForgotPasswordCode
} from "../controllers/misc/resendControllers.js";
import {
    deleteAccount,
    getUserData,
} from "../controllers/userController.js";
import {
    checkAuth, checkForForgotPasswordSession,
    checkForgotPasswordCookie,
    checkForTemporarySession,
    checkVerifyEmailCookie
} from "../controllers/misc/checkerController.js";
import {forgotPassword, resetPassword, verifyForgotPassword} from "../controllers/forgotPasswordController.js";
import {
    changeEmail,
    requestEmailChange,
    startVerifyingNewEmail,
    verifyCodeForEmailChange,
    verifyNewEmail
} from "../controllers/emailController.js";
import {changePassword, requestPasswordChange, verifyCodeForPasswordChange } from "../controllers/passwordController.js";

export const authRoutes = express.Router();

// Signup routes
authRoutes.post("/signup", ipLimit,signup);
authRoutes.post("/verify-email",ipLimit, verifyEmail);
authRoutes.post("/finish-signup", temporarySessionProtection, finishSignup);

// Login and logout routes
authRoutes.post("/login", ipLimit,login);
authRoutes.post("/logout", logout);

// Forgot password routes
authRoutes.post("/forgot-password", ipLimit,forgotPassword);
authRoutes.post("/forgot-password/code",ipLimit, verifyForgotPassword);
authRoutes.post("/reset-password", forgetPasswordProtection, resetPassword);

// Code resending routes
authRoutes.post("/verify-email/resend", resendEmailVerificationCode);
authRoutes.post("/forget-password/resend",resendForgotPasswordCode);
authRoutes.post("/change-email/resend", isAuthenticated, resendEmailChangeCode);

// This routes will require user to be logged in
authRoutes.post("/delete-account", isAuthenticated, deleteAccount);
authRoutes.get("/user-data", isAuthenticated, getUserData);

// This route will be used to change user email
authRoutes.post("/change-email", isAuthenticated, requestEmailChange);
authRoutes.post("/change-email/code", isAuthenticated, verifyCodeForEmailChange);
authRoutes.post("/change-email/new", isAuthenticated, changeEmailProtection, startVerifyingNewEmail)
authRoutes.post("/change-email/new/verify", isAuthenticated, changeEmailProtection, verifyNewEmail);
authRoutes.post("/change-email/finish", isAuthenticated, changeEmailProtection, changeEmailProtectionPlus, changeEmail);

// This route will be used to change user password
authRoutes.post("/change-password", isAuthenticated, requestPasswordChange);
authRoutes.post("/change-password/code", isAuthenticated, verifyCodeForPasswordChange);
authRoutes.post("/change-password/finish", isAuthenticated, changePasswordProtection, changePassword);

// This route will be used to recover account
authRoutes.post("/account-recovery", beginAccountRecovery);
authRoutes.post("/account-recovery/new-email", accountRecoveryProtection, accountRecoveryNewEmail);
authRoutes.post("/account-recovery/new-email/code", accountRecoveryProtection, accountRecoveryNewEmailVerify);
authRoutes.post("/account-recovery/finish", accountRecoveryFinishProtection, recoverAccount);


// This route will be used to check if user is logged in
authRoutes.get("/is-authenticated", isAuthenticated, checkAuth);
authRoutes.get("/verify-email/check", checkVerifyEmailCookie);
authRoutes.get("/forgot-password/check", checkForgotPasswordCookie);
authRoutes.get("/reset-password/check", forgetPasswordProtection ,checkForForgotPasswordSession);
authRoutes.get("/temporary-session", temporarySessionProtection, checkForTemporarySession);