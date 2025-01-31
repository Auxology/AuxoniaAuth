// Function related to forget password, it is ideal to use sessions for this
// These temporary sessions are similar to the ones used in the signup process
import type { Request, Response } from "express";
import { validateEmail } from "../utils/email.js";
import {getUserFromEmail, resetUserPassword} from "../utils/user.js";
import {
    createForgetPasswordCode,
    createForgetPasswordSession,
    deleteForgetPasswordCode,
    verifyForgetPasswordCode,
    deleteForgetPasswordSession
} from "../libs/redis.js";
import { encrypt } from "../utils/encrypt.js";
import {
    createCookieWithEmail,
    createTokenForResetPassword,
    deleteTokenForResetPassword,
    deleteCookieWithEmail
} from "../libs/cookies.js";
import {amIPwned, passwordIsValid, hashPassword} from "../utils/password.js";

export const forgetPassword = async(req: Request, res: Response):Promise<void> => {
    try{
        const { email } = req.body;

        // Store email in cookie
        await createCookieWithEmail(email, res);

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

        // Encrypt email
        const encryptedEmail = encrypt(email);

        // Check if user exists
        const user = await getUserFromEmail(encryptedEmail);

        if(user === null){
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Create and store verification code
        // In front-end user will be redirected to the page where they will enter the code
        await createForgetPasswordCode(email);

        res.status(200).json({ message: 'Verification code sent' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Similar to the email verification process, we verify the code and then create temporary session
export const verifyForgetPassword = async(req: Request, res: Response):Promise<void> => {
    try {
        const {code} = req.body;
        const email = req.cookies.user_email as string;

        if(!email || !code) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        const isValid = await verifyForgetPasswordCode(email,code);

        if(!isValid) {
            res.status(409).json({ error: 'Invalid code' });
            return;
        }

        if(!email) {
            res.status(404).json({ error: 'Email not found in Redis' });
            return;
        }

        // Get rid of the verification code
        await deleteForgetPasswordCode(email);

        // Create temporary session
        const sessionToken = await createForgetPasswordSession(email);

        // Get rid of email cookie
        deleteCookieWithEmail(res);

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
        const email = req.email;

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

        // Hash Password
        const hashedPassword = await hashPassword(password);

        if(!hashedPassword) {
            res.status(500).json({error: 'Internal Server Error'});
            return
        }

        const encryptedEmail = encrypt(email);

        // Update User, this also deletes the session
        await resetUserPassword(encryptedEmail, hashedPassword);

        // Delete temporary session and cookie
        await deleteForgetPasswordSession(email);
        deleteTokenForResetPassword(res);


        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
