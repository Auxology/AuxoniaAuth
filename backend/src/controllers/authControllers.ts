import type{ Request, Response } from "express";
import {emailInUse, validateEmail} from "../utils/email.js";
import { encrypt } from "../utils/encrypt.js";
import {
    verifyCode,
    getEmailFromVerificationCode,
    deleteVerificationCode,
    storeVerificationCode,
    createTemporarySession,
    checkIfTemporarySessionExists,
} from "../libs/redis.js";
import {createToken, deleteToken} from "../libs/session.js";
import type {RequestWithEmail} from "../types/types.js";
import {usernameAvailable, validateUsername} from "../utils/username.js";
import {amIPwned, passwordIsValid, hashPassword} from "../utils/password.js";
import {createUser} from "../utils/user.js";

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
            return res.status(400).json({ error: 'Invalid email' });
        }

        // Check if temp session exists inside Redis
        //Temporary session here means that the user has verified email, so we can't allow anybody to use the same email
        //Unless the temp session is deleted.
        const existingSession =  await checkIfTemporarySessionExists(email);

        if(existingSession){
            return res.status(409).json({ error: 'Email is already used' });
        }

        // Check database only if not in Redis
        // Todo: Prisma is slowing down the process
        const isUsed = await emailInUse(encryptedEmail);

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
        return res.status(400).json({ error: 'Code is required' });
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
            return res.status(404).json({ error: 'Email not found in Redis' });
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

export const finishSignup = async (req: RequestWithEmail, res: Response):Promise<any> => {
    // This function is protected by middleware!!!!!!!!
    // We can use email from the middleware,which means that the user has verified email
    // and has temporary session related to the email.I still know for fact that
    // some of you will be concerned about the security and I will not blame you for that.
    // If you are scared of this approach, you can always rerun the email verification process
    // and check if the user has verified email.
    const email = req.email;

    // Encrypt email
    const encryptedEmail = encrypt(email);

    const {username, password} = req.body;

    // Here we should check if the username is valid
    const isValid = await validateUsername(username);

    if(!isValid){
        return res.status(400).json({ error: 'Invalid username' });
    }

    // We check if username is in use
    const isAvailable = await usernameAvailable(username);

    if(!isAvailable){
        return res.status(409).json({ error: 'Username is already used' });
    }

    // We simultaneously check if password is valid and pwned
    const [passwordValid, pwned] = await Promise.all([
        passwordIsValid(password),
        amIPwned(password),
    ]);

    // Also keep in mind that this "server-side" validation should be done also on the client side
    // There is chance that the user will disable JavaScript and send the request
    // without validation,and we should not allow that to happen.Treat your database as a king :)
    // You are the guardian of the database, and you should protect it at all costs.
    // Do you really want some assassins to kill your king? I don't think so.
    if(!passwordValid){
        return res.status(400).json({ error: 'Invalid password' });
    }

    // We check if password is pwned, This is not a must, but it is a good practice
    if(pwned){
        return res.status(400).json({ error: 'Password is pwned' });
    }

    // Before creating user we hash the password
    const hashedPassword = await hashPassword(password) as string;

    // TODO: Add pfp implementation

    // Now we can create user
    const newUser = await createUser(encryptedEmail, hashedPassword, username);

    if(!newUser){
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    // We delete the temporary session in redis
    await deleteVerificationCode(email);

    // We get rid of the cookie
    await deleteToken(res);

    return res.status(200).json({ message: 'User created' });
}