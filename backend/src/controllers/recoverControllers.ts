import type { Request, Response } from "express";
import {emailInUse, validateEmail} from "../utils/email.js";
import {
    accountRecover,
    checkEmailByRecoveryCode,
} from "../utils/user.js";
import {
    createAccountRecoverySession,
    deleteAccountRecoverySession,
    accountRecoveryStoreNewEmailCode,
    accountRecoveryVerifyNewEmailCode,
    accountRecoveryDeleteNewEmailCode,
    createAccountRecoverySessionForVerifiedEmail,
    deleteAccountRecoverySessionForVerifiedEmail,
    checkIfSendingCodeForRecoveryIsLocked, lockSendingCodeForRecovery
} from "../libs/redis.js";
import { encrypt } from "../utils/encrypt.js";
import {createNewEmailCookie} from "../utils/cookies.js";
import {
    createTokenForAccountRecovery,
    createTokenForAccountRecoveryFinish,
    deleteTokenForAccountRecovery,
    deleteTokenForAccountRecoveryFinish,

} from "../libs/jwt-sessions.js";
import {hashPassword} from "../utils/password.js";

// TODO: Add a function to recovery account completely if user loses access to email
// This can be done by verifying the user's identity through other means
// They will be asked to enter their previous password and email
// Alongside recovery code. If all of these match, user can reset their email
// They will also need to have have recovery session to do this

export const beginAccountRecovery = async(req: Request, res: Response):Promise<void> => {
    try{
        // Get email, password and recovery code from the body
        const { email, code } = req.body;

        if(!email || !code){
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        // We need to encrypt email
        const encryptedEmail = encrypt(email);

        // Now check if user with this info exists
        const userId = await checkEmailByRecoveryCode(code, encryptedEmail);

        if(!userId){
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Create session and token
        const sessionToken = await createAccountRecoverySession(userId);

        if(!sessionToken){
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        createTokenForAccountRecovery(userId, sessionToken, res);

        res.status(200).json({ message: 'Account recovery started' });
    }
    catch (err) {
        console.error('Internal Server Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const accountRecoveryNewEmail = async(req: Request, res: Response):Promise<void> => {
    try{
        const email = req.body.email;
        const userId = req.userId;

        if(!userId) {
            res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if user is locked
        const isLocked = await checkIfSendingCodeForRecoveryIsLocked(userId);

        if(isLocked) {
            res.status(429).json({ error: 'Too many requests' });
            return;
        }

        const isValid = validateEmail(email);

        if(!isValid) {
            res.status(400).json({ error: 'Invalid email' });
            return;
        }

        // Check if email is already in use
        const encryptedEmail = encrypt(email);

        const isUsed = await emailInUse(encryptedEmail);

        if(isUsed) {
            res.status(409).json({ error: 'Email is already in use' });
            return;
        }

        // Create code and store it in Redis
        await accountRecoveryStoreNewEmailCode(userId);

        // Create cookie with new email
        await createNewEmailCookie(email, res);

        // Lock user
        await lockSendingCodeForRecovery(userId);

        res.status(200).json({ message: 'New email code sent' });
    }
    catch (err) {
        console.error('Internal Server Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const accountRecoveryNewEmailVerify = async(req: Request, res: Response):Promise<void> => {
    try{
        const code = req.body.code;
        const email = req.cookies.new_email as string;
        const userId = req.userId;

        if(!email || !code) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        // Check if code is valid
        const isValid = await accountRecoveryVerifyNewEmailCode(userId, code);

        if(!isValid) {
            res.status(409).json({ error: 'Invalid code' });
            return;
        }

        // Delete code
        await accountRecoveryDeleteNewEmailCode(userId);

        // Delete old session
        await deleteAccountRecoverySession(userId);
        deleteTokenForAccountRecovery(res);

        // Create new session
        const session = await createAccountRecoverySessionForVerifiedEmail(userId);

        if(!session) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Create new token
        createTokenForAccountRecoveryFinish(userId, session, res);

        res.status(200).json({ message: 'New email verified' });
    }
    catch (err) {
        console.error('Internal Server Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const recoverAccount = async(req: Request, res: Response):Promise<void> => {
    try{
        const email = req.cookies.new_email as string;
        const password = req.body.password;
        const userId = req.userId

        if(!userId) {
            res.status(401).json({ error: 'Unauthorized' });
        }

        if(!email || !password){
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        // Encrypt email
        const encryptedEmail = encrypt(email);
        const hashedPassword = await hashPassword(password);

        if(!encryptedEmail || !hashedPassword) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Update user
        await accountRecover(userId, encryptedEmail, hashedPassword);

        // Delete session and token
        await deleteAccountRecoverySessionForVerifiedEmail(userId);
        deleteTokenForAccountRecoveryFinish(res);

        res.status(200).json({ message: 'Account recovered' });
    }
    catch (err) {
        console.error('Internal Server Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
