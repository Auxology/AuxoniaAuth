import type{ Request, Response } from "express";
import {emailInUse, validateEmail} from "../utils/email.js";
import { encrypt } from "../utils/encrypt.js";
import {
    verifyCode,
    deleteVerificationCode,
    storeVerificationCode,
    createTemporarySession,
    checkIfTemporarySessionExists,
    deleteTemporarySession,
    lockResendingEmailVerificationCode,
    checkIfResendingEmailVerificationCodeIsLocked,
} from "../libs/redis.js";
import {createCookieWithEmail,deleteCookieWithEmail,} from "../utils/cookies.js";
import {createToken, deleteToken} from "../libs/jwt-sessions.js";
import {usernameAvailable, validateUsername} from "../utils/username.js";
import {amIPwned, passwordIsValid, hashPassword} from "../utils/password.js";
import {createRecoveryCodes, createUser, getRecoveryCodes} from "../utils/user.js";


// Start of sign up(Optimization was done kind of)
export const signup = async (req: Request, res: Response):Promise<void> => {
    const email:string = req.body.email

    // Create cookie which temporary stores the email
    await createCookieWithEmail(email, res);

    try {
        // Validation and encryption in parallel
        const [isValid, encryptedEmail] = await Promise.all([
            validateEmail(email),
            encrypt(email),
        ]);

        // Check if user is locked out from resending the verification code
        const isLocked = await checkIfResendingEmailVerificationCodeIsLocked(email);

        if(isLocked){
            res.status(429).json({message: "Resending email verification code is locked"});
            return;
        }


        if(!isValid){
            res.status(400).json({ error: 'Invalid email' });
            return;
        }

        // Check main database before even doing anything with Redis
        const isUsed = await emailInUse(encryptedEmail);

        if(isUsed){
            res.status(409).json({ error: 'Email is already used' });
            return;
        }

        // Check if temp session exists inside Redis
        //Temporary session here means that the user has verified email, so we can't allow anybody to use the same email
        //Unless the temp session is deleted.
        // Also do net let the user finish sign up from here, because if somebody verified their email
        // they should finish sign up from the finish sign up endpoint
        const existingSession =  await checkIfTemporarySessionExists(email);

        if(existingSession){
            res.status(409).json({ error: 'Email is already used' });
            return;
        }

        // Store verification code asynchronously - no need to wait for it
        storeVerificationCode(email).catch(console.error);

        // Lockout the resending of the verification code
        // This is done to prevent spamming of the verification code
        await lockResendingEmailVerificationCode(email);

        res.status(200).json({ message: 'Verification code sent' });
    }
    catch(err){
        console.error('Internal Server Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const verifyEmail = async (req: Request, res: Response):Promise<void> => {
    const {code} = req.body;
    const email = req.cookies.user_email as string;


    if(!email || !code) {
        res.status(400).json({ error: 'Invalid data' });
        return;
    }

    try {

        // Here we should verify the code
        const isValid = await verifyCode(email,code);

        if(!isValid){
            res.status(409).json({ error: 'Invalid code' });
            return;
        }

        // Now we get rid of the verification code
        await deleteVerificationCode(email);


        // Now we can create temporary session for the user
        const sessionToken = await createTemporarySession(email);

        if(!sessionToken) {
            res.status(500).json({ error: 'Internal Server Error with session token' });
            return;
        }

        // We delete the cookie
        deleteCookieWithEmail(res);

        // We create cookie now
        createToken(email, sessionToken, res);

        res.status(200).json({ message: 'Email verified'});
    }
    catch(err) {
        console.error('Internal Server Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const finishSignup = async (req: Request, res: Response):Promise<void> => {
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

    // Check with email, I neglected this part previously,causing major security issues :)
    const userExits = await emailInUse(encryptedEmail);

    if(userExits) {
        res.status(400).json({ error: 'Invalid Email'});
        return;
    }

    // Here we should check if the username is valid
    const isValid = await validateUsername(username);

    if(!isValid){
        res.status(400).json({ error: 'Invalid username' });
        return;
    }

    // We check if username is in use
    const isUsed = await usernameAvailable(username);

    if(isUsed){
        res.status(409).json({ error: 'Username is already used' });
        return;
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
        res.status(400).json({ error: 'Invalid password' });
        return;
    }

    // We check if password is pwned, This is not a must, but it is a good practice
    if(pwned){
         res.status(400).json({ error: 'Password is pwned' });
         return;
    }

    // Before creating user we hash the password
    const hashedPassword = await hashPassword(password) as string;

    // TODO: Add pfp implementation

    // Now we can create user
    await createUser(encryptedEmail, hashedPassword, username);

    // Create recovery codes
    await createRecoveryCodes(encryptedEmail);

    // Get recovery codes
    const recoveryCodes = await getRecoveryCodes(encryptedEmail);

    // We delete the temporary session in redis
    await deleteTemporarySession(email);

    // We get rid of the cookie
    deleteToken(res);

    res.status(200).json({ message: 'Account created successfully', recoveryCodes });
}
