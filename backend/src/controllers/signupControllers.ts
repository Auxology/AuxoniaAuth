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
    deleteTemporarySession,
    createForgetPasswordCode,
    verifyForgetPasswordCode,
    getEmailFromForgetPasswordCode, deleteForgetPasswordCode,
} from "../libs/redis.js";
import {createToken, deleteToken} from "../libs/session.js";
import {usernameAvailable, validateUsername} from "../utils/username.js";
import {amIPwned, passwordIsValid, hashPassword, correctPassword} from "../utils/password.js";
import {createUser, getUserFromEmail, getUserPasswordHash} from "../utils/user.js";
import {loginSchema} from "../libs/zod.js";
import {prisma} from "../libs/prisma.js";
import {updateSession} from "../utils/session.js";

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
        // Also do net let the user finish sign up from here, because if somebody verified their email
        // they should finish sign up from the finish sign up endpoint
        const existingSession =  await checkIfTemporarySessionExists(email);

        if(existingSession){
            return res.status(409).json({ error: 'Email is already used' });
        }

        // Check database only if not in Redis
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

        // Here we should get the email from Redis, this is just used for then creating temporary session
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

export const finishSignup = async (req: Request, res: Response):Promise<any> => {
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
    await createUser(encryptedEmail, hashedPassword, username);

    // We delete the temporary session in redis
    await deleteTemporarySession(email);

    // We get rid of the cookie
    deleteToken(res);

    return res.status(200).json({ message: 'User created' });
}

// Login function, user logs in with email and password, but you can use username it all about your preference
// With username you can avoid need for encryption,while usage of email is something that almost every user expects
// During the login,also keep in mind do not return too much information about the user
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

// Function related to forget password, it is ideal to use sessions for this
// These temporary sessions are similar to the ones used in the signup process
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

        // TODO: Create temporary session
        return res.status(200).json({ message: 'Email verified' });
    }
    catch (error) {
        console.error('Internal Server Error', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}