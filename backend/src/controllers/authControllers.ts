import type{ Request, Response } from "express";
import {emailAvailable, validateEmail} from "../utils/email.js";
import { encrypt } from "../utils/encrypt.js";
import {
    verifyCode,
    getEmailFromVerificationCode,
    deleteVerificationCode,
    storeVerificationCode,
    createTemporarySession,
    checkIfTemporarySessionExists,
} from "../libs/redis.js";
import {createToken} from "../libs/session.js";

// Start of sign up(Optimization was done kind of)
export const signup = async (req: Request, res: Response):Promise<any> => {
    const email:string = req.body.email;

    try {
        // Validation and encryption in parallel
        const [isValid, encryptedEmail] = await Promise.all([
            validateEmail(email),
            encrypt(email),
        ]);

        if(!isValid){
            return res.status(409).json({ error: 'Invalid email' });
        }

        // Check if temp session exists inside Redis
        const existingSession =  await checkIfTemporarySessionExists(email);

        if(existingSession){
            return res.status(409).json({ error: 'Email is already used' });
        }

        // Check database only if not in Redis
        // Todo: Prisma is slowing down the process
        const isUsed = await emailAvailable(encryptedEmail);

        if(isUsed){
            return res.status(409).json({ error: 'Email is already used' });
        }

        // Store verification code asynchronously - no need to wait for it
        storeVerificationCode(email).catch(console.error);

        return res.status(200).json({ message: 'Verification code sent' });
    }
    catch(err){
        console.error('Internal Server Error', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const verifyEmail = async (req: Request, res: Response):Promise<any> => {
    const { code} = req.body;

    if(!code){
        return res.status(409).json({ error: 'Code is required' });
    }

    try {
        // Here we should verify the code
        const isValid = await verifyCode(code);

        if(!isValid){
            return res.status(409).json({ error: 'Invalid code' });
        }

        // Here we should get the email from Redis
        const email = await getEmailFromVerificationCode(code);

        if(!email){
            return res.status(409).json({ error: 'Email not found in Redis' });
        }

        // Now we get rid of the verification code
        await deleteVerificationCode(code);


        // Now we can create temporary session for the user
        const sessionToken = await createTemporarySession(email);

        if(!sessionToken) {
            return res.status(500).json({ error: 'Internal Server Error with session token' });
        }

        // We create cookie now
        createToken(email, sessionToken, res);

        return res.status(200).json({ message: 'Email verified'});
    }
    catch(err) {
        console.error('Internal Server Error', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}