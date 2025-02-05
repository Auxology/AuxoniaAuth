// Those are functions related to user data change
import type{Request, Response} from "express";
import {
    createChangeEmailCode,
    verifyChangeEmailCode,
    deleteChangeEmailCode,
    createChangeEmailSession,
    deleteChangeEmailSession
} from "../libs/redis.js";
import {createTokenForEmailChange, deleteTokenForEmailChange} from "../libs/jwt-sessions.js";
import {validateEmail} from "../utils/email.js";
import {encrypt} from "../utils/encrypt.js";
import {changeUserEmail, deleteUser, getEmailFromUserId, getUser} from "../utils/user.js";
import {deleteSession} from "../libs/express-session.js";



// When user click (CHANGE EMAIL) button, we will send a verification code to the old email
export const requestEmailChange = async (req: Request, res: Response):Promise<void> => {
    try {
        // Check if user is logged in
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        await createChangeEmailCode(userId);

        res.status(200).json({message: "Email change code sent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const verifyCodeForEmailChange = async (req: Request, res: Response):Promise<void> => {
    try{
        // Check if user is logged in
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        const isValid = await verifyChangeEmailCode(userId, req.body.code);

        if(!isValid){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        // Delete the code after it's verified
        await deleteChangeEmailCode(userId);

        // Create session token for email change inside redis and cookies
        const session = await createChangeEmailSession(userId);
        createTokenForEmailChange(userId, session!, res);

        res.status(200).json({message: "Code verified"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const changeEmail = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        const newEmail = req.body.email;

        // Validate email
        const isValid = await validateEmail(newEmail);

        if(!isValid){
            res.status(400).json({message: "Invalid email"});
            return;
        }

        const encryptedEmail = encrypt(newEmail);

        // Get Old email from Database
        const oldEmail = await getEmailFromUserId(userId);

        if(oldEmail===null){
            res.status(500).json({message: "Internal Server Error"});
            return;
        }

        // Update email
        await changeUserEmail(userId, encryptedEmail, oldEmail);
        await deleteChangeEmailSession(userId);
        deleteTokenForEmailChange(res);

        res.status(200).json({message: "Email changed"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// This function is responsible for deleting the user account. It will be called when the user sends a POST request to /delete-account.
// It is protected by the isAuthenticated middleware, which will check if the user is logged in before executing the function.
export const deleteAccount = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;
        const sessionId = req.sessionID;


        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!sessionId) {
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // Proceed to delete the account
        await deleteUser(userId);

        // We also need to destroy the session to log the user out
        await deleteSession(sessionId);

        res.json({message: "Account deleted successfully"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// Warn user that this they will not receive data about their sessions.
// Also warn them for security reasons, they won't receive password data.
export const getUserData = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Fetch user data
        const user = await getUser(userId);

        if(!user) {
            res.status(404).json({message: "User not found"});
            return;
        }


        // Send user data to the user
        // Ideally send trough email
        console.log("User data: ", user);

        res.json({message: "User data sent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}