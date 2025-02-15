// Change user password approach.
// This approach is similar to the email change approach. The user will first request a password change, then verify the code sent to their email.
// After that they receive session token and can change their password.
// User then will be asked to input old password and new password.
// Finally, the password will be changed.
import type {Request, Response} from "express";
import {
    checkIfChangePasswordCodeIsLocked,
    createChangePasswordCode,
    createChangePasswordSession,
    deleteChangePasswordCode, deleteChangePasswordSession, lockChangePasswordCode,
    verifyChangePasswordCode
} from "../libs/redis.js";
import {createTokenForChangePassword, deleteTokenForChangePassword} from "../libs/jwt-sessions.js";
import {amIPwned, correctPassword, hashPassword, passwordIsValid} from "../utils/password.js";
import {compareUserPasswords, getEmailFromUserId, getUserPasswordHash, updateUserPassword} from "../utils/user.js";

export const requestPasswordChange = async (req: Request, res: Response):Promise<void> => {
    try{
        // First check if user is logged in
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Check if user is locked
        const isLocked = await checkIfChangePasswordCodeIsLocked(userId);

        if(isLocked){
            res.status(429).json({message: "Password change is locked"});
            return;
        }

        // Create code for password change
        await createChangePasswordCode(userId);

        // Create lock for user
        await lockChangePasswordCode(userId);
        res.status(200).json({message: "Password change code sent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const verifyCodeForPasswordChange = async (req: Request, res: Response):Promise<void> => {
    try {
        // Check if user is logged in
        const userId = req.session.userId;
        const code = req.body.code;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!code){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        // Check if their code is valid
        const isValid = await verifyChangePasswordCode(userId, code);

        if(!isValid){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        // Delete the code after it's verified
        await deleteChangePasswordCode(userId);

        // Create session token for password change inside redis and cookies
        const session = await createChangePasswordSession(userId);

        createTokenForChangePassword(userId, session!, res);

        res.status(200).json({message: "Code verified"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const changePassword = async (req: Request, res: Response):Promise<void> => {
    try {
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Check if they have session token
        const sessionToken = req.cookies["change-password"];

        if(!sessionToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }


        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        if(!oldPassword || !newPassword){
            res.status(400).json({message: "Invalid input"});
            return;
        }

        if(oldPassword === newPassword) {
            res.status(400).json({message: "Old password and new password cannot be the same"});
            return;
        }

        // Validate new password
        const [passwordValid, pwned] = await Promise.all([
            passwordIsValid(newPassword),
            amIPwned(newPassword),
        ]);

        if(!passwordValid){
            res.status(400).json({message: "Password is invalid"});
            return;
        }

        if(pwned){
            res.status(400).json({message: "Password is pwned"});
            return;
        }

        // Get email from user id
        const email = await getEmailFromUserId(userId);

        // Check if password has been used previously
        const isUsed = await compareUserPasswords(email!, newPassword);

        if(isUsed) {
            // Password has been used
            res.status(400).json({message: "Password has been used previously"});
            return;
        }

        // Check if old password is correct
        const passwordHash = await getUserPasswordHash(userId);


        const isCorrect = await correctPassword(passwordHash, oldPassword);


        if(!isCorrect){
            res.status(400).json({message: "Invalid password"});
            return;
        }

        // Create new password hash
        const newHash = await hashPassword(newPassword);

        // Delete session token
        await deleteChangePasswordSession(userId);
        deleteTokenForChangePassword(res);

        // Update user password
        await updateUserPassword(userId, newHash!, passwordHash);

        res.status(200).json({message: "Password changed successfully"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}