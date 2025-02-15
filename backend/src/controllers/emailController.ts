// Those functions are related to changing user email
import type {Request, Response} from "express";
import {encrypt} from "../utils/encrypt.js";
import {
    checkIfResendingChangeEmailCodeIsLocked,
    checkIfResendingChangeEmailCodeWithNewEmailIsLocked,
    createChangeEmailCode,
    createChangeEmailSession,
    createChangeEmailSessionWithNewEmail,
    createNewEmailCode,
    deleteChangeEmailCode, deleteChangeEmailSession, deleteChangeEmailSessionWithNewEmail,
    deleteNewEmailCode,
    lockResendingChangeEmailCode,
    lockResendingChangeEmailCodeWithNewEmail,
    verifyChangeEmailCode,
    verifyNewEmailCode
} from "../libs/redis.js";
import {changeUserEmail, getEmailFromUserId} from "../utils/user.js";
import {
    createTokenForEmailChange,
    createTokenForNewEmail,
    deleteTokenForEmailChange,
    deleteTokenForNewEmail
} from "../libs/jwt-sessions.js";
import {validateEmail} from "../utils/email.js";
import {createNewEmailCookie, deleteNewEmailCookie} from "../utils/cookies.js";

export const requestEmailChange = async (req: Request, res: Response):Promise<void> => {
    try {
        // Check if user is logged in
        const userId = req.session.userId;
        const userInputtedEmail = req.body.email

        const encryptedEmail = encrypt(userInputtedEmail);

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Check if user is locked out
        const isLocked = await checkIfResendingChangeEmailCodeIsLocked(userId);

        if(isLocked){
            res.status(409).json({message: "Too many requests"});
            return;
        }

        // Get user email
        const email = await getEmailFromUserId(userId);

        if(email !== encryptedEmail){
            res.status(400).json({message: "Invalid email"});
            return;
        }

        await createChangeEmailCode(userId);

        // Lock sending email code
        await lockResendingChangeEmailCode(userId)

        res.status(200).json({message: "Email change code sent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// User has to verify old email before changing it
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

// User should now start verifying the new email
export const startVerifyingNewEmail = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;
        const emailToken = req.cookies["email-change"];

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!emailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // Check if user is locked
        const isLocked = await checkIfResendingChangeEmailCodeWithNewEmailIsLocked(userId);

        if(isLocked){
            res.status(409).json({message: "Too many requests"});
            return;
        }

        const newEmail = req.body.email;

        // Validate email
        const isValid = await validateEmail(newEmail);

        if(!isValid){
            res.status(400).json({message: "Invalid email"});
            return;
        }

        // Create cookie for new email
        await createNewEmailCookie(newEmail, res);

        // Send the code to new email
        await createNewEmailCode(userId);

        // Lock sending email code
        await lockResendingChangeEmailCodeWithNewEmail(userId);

        res.status(200).json({message: "Verify your new email"});
    }
    catch (err) {
        console.error(err)
        res.status(500).json({message: "Internal Server Error"});
    }
}

// This is where user will verify new email
export const verifyNewEmail = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;
        const emailToken = req.cookies["email-change"];
        const newEmail = req.cookies.new_email as string

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!emailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        if(!newEmail){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // Check if their code is valid
        const isValid = await verifyNewEmailCode(userId, req.body.code);

        if(!isValid){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        await deleteNewEmailCode(userId);

        // Now we create session with new email

        // Create new session on top of old change email session
        const session = await createChangeEmailSessionWithNewEmail(userId, newEmail);

        createTokenForNewEmail(userId,session!,res);

        res.status(200).json({message: "New email verified"});
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

        // Old email token
        const emailToken = req.cookies["email-change"];

        if(!emailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // New email token
        const newEmailToken = req.cookies["new-email-change"];

        if(!newEmailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        const newEmail = req.cookies.new_email as string;

        // Encrypt new email
        const encryptedEmail = encrypt(newEmail);

        // Get old email
        const oldEmail = await getEmailFromUserId(userId);

        if(!oldEmail){
            res.status(404).json({message: "User not found"});
            return;
        }

        // Delete tokens
        deleteTokenForEmailChange(res);
        deleteTokenForNewEmail(res);
        deleteNewEmailCookie(res);
        await deleteChangeEmailSession(userId);
        await deleteChangeEmailSessionWithNewEmail(userId);

        //This also automatically deletes the session :)))
        await changeUserEmail(userId, encryptedEmail);


        res.status(200).json({message: "Email changed successfully"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}
