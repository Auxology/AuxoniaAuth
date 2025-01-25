// Function related to forget password, it is ideal to use sessions for this
// These temporary sessions are similar to the ones used in the signup process
import type { Request, Response } from "express";
import { validateEmail } from "../utils/email.js";
import { getUserFromEmail } from "../utils/user.js";
import {
    createForgetPasswordCode,
    createForgetPasswordSession,
    deleteForgetPasswordCode,
    getEmailFromForgetPasswordCode,
    verifyForgetPasswordCode,
    deleteForgetPasswordSession
} from "../libs/redis.js";
import { encrypt } from "../utils/encrypt.js";
import {createTokenForResetPassword, deleteTokenForResetPassword} from "../libs/session.js";
import {amIPwned, passwordIsValid, hashPassword} from "../utils/password.js";
import {prisma} from "../libs/prisma.js";

export const forgetPassword = async(req: Request, res: Response):Promise<any> => {
    try{
        const { email } = req.body;

        if(!email){
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email
        const isValid = await validateEmail(email);

        if(!isValid){
            return res.status(400).json({ error: 'Invalid email' });
        }

        // Encrypt email
        const encryptedEmail = encrypt(email);

        // Check if user exists
        const user = await getUserFromEmail(encryptedEmail);

        if(user === null){
            return res.status(404).json({ error: 'User not found' });
        }

        // Create and store verification code
        // In front-end user will be redirected to the page where they will enter the code
        await createForgetPasswordCode(email);

        return res.status(200).json({ message: 'Verification code sent' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Similar to the email verification process, we verify the code and then create temporary session
export const verifyForgetPassword = async(req: Request, res: Response):Promise<any> => {
    try {
        const {code} = req.body;

        if(!code){
            return res.status(400).json({ error: 'Code is required' });
        }

        const isValid = await verifyForgetPasswordCode(code);

        if(!isValid){
            return res.status(409).json({ error: 'Invalid code' });
        }

        // Get email from redis
        const email = await getEmailFromForgetPasswordCode(code);

        if(!email){
            return res.status(404).json({ error: 'Email not found in Redis' });
        }

        // Get rid of the verification code
        await deleteForgetPasswordCode(code);

        // Create temporary session
        const sessionToken = await createForgetPasswordSession(email);

        if(!sessionToken) {
            return res.status(500).json({ error: 'Internal Server Error with session token' });
        }

        // Create cookie
        createTokenForResetPassword(email, sessionToken, res);

        return res.status(200).json({ message: 'Forgot Password Verified' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const resetPassword = async(req: Request, res: Response):Promise<any> => {
    try {
        const email = req.email;

        // Expect password from body
        const { password } = req.body;

        // Validate password
        if(!password){
            return res.status(400).json({ error: 'Password is required' });
        }

        // Check if password is valid and at same time check if it is pwned
        const [passwordValid, pwned] = await Promise.all([
            passwordIsValid(password),
            amIPwned(password),
        ]);

        if(!passwordValid){
            return res.status(400).json({ error: 'Password is invalid' });
        }

        if(pwned){
            return res.status(400).json({ error: 'Password is pwned' });
        }

        // Hash Password
        const hashedPassword = await hashPassword(password);

        if(!hashedPassword) {
            return res.status(500).json({error: 'Internal Server Error'});
        }

        const encryptedEmail = encrypt(email);

        // Update User
        const user = await prisma.user.update({
            where: {
                email: encryptedEmail
            },
            data: {
                password: hashedPassword
            }
        })

        if(!user){
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Delete temporary session and cookie
        await deleteForgetPasswordSession(email);
        deleteTokenForResetPassword(res);

        return res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}