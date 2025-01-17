import type{ Request, Response } from "express";
import { emailSchema } from "../libs/zod.js";
import { encrypt } from "../utils/encrypt.js";
import { prisma } from "../libs/prisma.js";
import { verifyCode, getEmailFromVerificationCode, deleteVerificationCode, storeVerificationCode, createTemporarySession } from "../libs/redis.js";

// Start of sign up
export const signup = async (req: Request, res: Response):Promise<any> => {
    const { email } = req.body;

    // First we validate email for second time
    const isValid = emailSchema.safeParse(email);

    if (!isValid.success) {
        return res.status(400).json({ error: isValid.error });
    }

    // Now we encrypt the email, do not use this for temporary database, as this is meant for checking if email exists inside of main database
    try {
        const encryptedEmail = encrypt(email);

        // Here we should check if email already exists in the main database
        const emailExists = await prisma.user.findUnique({
            where: {
                email: encryptedEmail
            }
        })

        if(emailExists){
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Now we create verification code
        await storeVerificationCode(email);

        return res.status(200).json({ message: 'Email is available, Code has been sent' });
    }
    catch(err){
        console.error('Internal Server Error', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

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

        res.cookie('temp-session', sessionToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 45, // 45 minutes
            sameSite: 'strict',
        })

        return res.status(200).json({ message: 'Email verified'});
    }
    catch(err) {
        console.error('Internal Server Error', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}