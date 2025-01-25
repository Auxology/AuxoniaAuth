// Login function, user logs in with email and password, but you can use username it all about your preference
// With username you can avoid need for encryption,while usage of email is something that almost every user expects
// During the login,also keep in mind do not return too much information about the user
import type {Request, Response} from "express";
import {loginSchema} from "../libs/zod.js";
import {encrypt} from "../utils/encrypt.js";
import {getUserFromEmail, getUserPasswordHash} from "../utils/user.js";
import {correctPassword} from "../utils/password.js";
import {updateSession} from "../utils/session.js";

export const login = async (req: Request, res: Response):Promise<any> => {
    // First you should validate the email and password
    try {
        const { email, password } = req.body;

        const isValid = loginSchema.safeParse({ email, password });

        if (!isValid.success) {
            return res.status(400).json({ error: isValid.error.errors });
        }

        // Now We check user exits to that we will encrypt the email
        const encryptedEmail = encrypt(email);

        // Check if the user exists, we rely on function
        const user = await getUserFromEmail(encryptedEmail);

        if (user === null) {
            return res.status(404).json({ error: 'User not found' });
        }

        // We get hash from the database,we still rely on function
        const hashedPassword = await getUserPasswordHash(user.id);

        // We check if password is correct
        const isCorrect = await correctPassword(hashedPassword, password);

        if (!isCorrect) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // After that we create token
        req.session.userId = user.id

        const sessionId = req.session.id

        // Tie user id to the session,this should be done manually
        // TODO: This code is ugly and should be refactored
        await new Promise<void>((resolve) => {
            req.session.save(() => {
                updateSession(sessionId, user.id).then(resolve);
            });
        });

        return res.status(200).json({ message: 'Logged in' });
    }
    catch (err) {
        console.error('Internal Server Error', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Simple logout function
export const logout = async (req: Request, res: Response):Promise<any> => {
    try{
        req.session.destroy((err) => {
            if(err){
                console.error('Internal Server Error', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.clearCookie('connect.sid');

            return res.status(200).json({ message: 'Logged out' });
        });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
