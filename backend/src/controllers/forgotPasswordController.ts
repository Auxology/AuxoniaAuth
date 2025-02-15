import type {Request, Response} from "express";
import {encrypt} from "../utils/encrypt.js";
import {compareUserPasswords, getUserFromEmail, resetUserPassword} from "../utils/user.js";
import {
    checkIfResendingForgotPasswordCodeIsLocked,
    createForgotPasswordCode, createForgotPasswordSession, deleteForgotPasswordCode, deleteForgotPasswordSession,
    lockResendingForgotPasswordCode, verifyForgotPasswordCode
} from "../libs/redis.js";
import {createCookieWithEmailForForgotPassword, deleteCookieWithEmailForForgotPassword} from "../utils/cookies.js";
import {validateEmail} from "../utils/email.js";
import {createTokenForResetPassword, deleteTokenForResetPassword} from "../libs/jwt-sessions.js";
import {amIPwned, hashPassword, passwordIsValid} from "../utils/password.js";

export const forgotPassword = async(req: Request, res: Response):Promise<void> => {
    try{
        const { email } = req.body;

        // Encrypt email
        const encryptedEmail = encrypt(email);

        // Check if user exists
        const user = await getUserFromEmail(encryptedEmail);

        if(user === null){
            res.status(404).json({ error: 'User not found' });
            return;
        }


        // Check if user is locked out
        const isLocked = await checkIfResendingForgotPasswordCodeIsLocked(email);

        if(isLocked){
            res.status(429).json({ error: 'Resending forgot password code is locked' });
            return;
        }

        // Store email in cookie
        await createCookieWithEmailForForgotPassword(email, res);

        if(!email){
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        // Validate email
        const isValid = await validateEmail(email);

        if(!isValid){
            res.status(400).json({ error: 'Invalid email' });
            return;
        }

        // Create and store verification code
        // In front-end user will be redirected to the page where they will enter the code
        await createForgotPasswordCode(email);

        // Lock out user
        await lockResendingForgotPasswordCode(email);

        res.status(200).json({ message: 'Verification code sent' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Similar to the email verification process, we verify the code and then create temporary session
export const verifyForgotPassword = async(req: Request, res: Response):Promise<void> => {
    try {
        const {code} = req.body;
        const email = req.cookies.reset_email as string;


        if(!email || !code) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        const isValid = await verifyForgotPasswordCode(email,code);

        if(!isValid) {
            res.status(409).json({ error: 'Invalid code' });
            return;
        }

        if(!email) {
            res.status(404).json({ error: 'Email not found in Redis' });
            return;
        }

        // Get rid of the verification code
        await deleteForgotPasswordCode(email);

        // Create temporary session
        const sessionToken = await createForgotPasswordSession(email);
        ``
        deleteCookieWithEmailForForgotPassword(res);

        if(!sessionToken) {
            res.status(500).json({ error: 'Internal Server Error with session token' });
            return;
        }

        // Create cookie
        createTokenForResetPassword(email, sessionToken, res);

        res.status(200).json({ message: 'Forgot Password Verified' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const resetPassword = async(req: Request, res: Response):Promise<void> => {
    try {
        const email = req.forgot_password_email;
        const encryptedEmail = encrypt(email);

        if(!email){
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        // Expect password from body
        const { password } = req.body;

        // Validate password
        if(!password){
            res.status(400).json({ error: 'Password is required' });
            return;
        }

        // Check if password is valid and at same time check if it is pwned
        const [passwordValid, pwned] = await Promise.all([
            passwordIsValid(password),
            amIPwned(password),
        ]);

        if(!passwordValid){
            res.status(400).json({ error: 'Password is invalid' });
            return;
        }

        if(pwned){
            res.status(400).json({ error: 'Password is pwned' });
            return;
        }

        // Check if password has been used previously
        const isUsed = await compareUserPasswords(encryptedEmail, password);


        if(isUsed) {
            res.status(400).json({error: 'Password has been used previously'});
            return;
        }

        // Hash Password
        const hashedPassword = await hashPassword(password);

        if(!hashedPassword) {
            res.status(500).json({error: 'Internal Server Error'});
            return
        }


        // Update User, this also deletes the session
        await resetUserPassword(encryptedEmail, hashedPassword);

        // Delete temporary session and cookie
        await deleteForgotPasswordSession(email);
        deleteTokenForResetPassword(res);


        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}