// Those are functions related to user data change
import type{Request, Response} from "express";
import {
    createChangeEmailCode,
    verifyChangeEmailCode,
    deleteChangeEmailCode,
    createChangeEmailSession,
    deleteChangeEmailSession,
    createNewEmailCode,
    verifyNewEmailCode,
    deleteNewEmailCode,
    deleteChangeEmailSessionWithNewEmail,
    createChangeEmailSessionWithNewEmail,
    lockResendingChangeEmailCode,
    checkIfResendingChangeEmailCodeIsLocked,
    checkIfResendingChangeEmailCodeWithNewEmailIsLocked,
    lockResendingChangeEmailCodeWithNewEmail,
    createChangePasswordCode,
    verifyChangePasswordCode,
    deleteChangePasswordCode,
    createChangePasswordSession,
    deleteChangePasswordSession,
} from "../libs/redis.js";
import {
    createTokenForChangePassword,
    createTokenForEmailChange,
    createTokenForNewEmail, deleteTokenForChangePassword,
    deleteTokenForEmailChange,
    deleteTokenForNewEmail
} from "../libs/jwt-sessions.js";
import {validateEmail} from "../utils/email.js";
import {
    changeUserEmail,
    compareUserPasswords,
    deleteUser,
    getEmailFromUserId,
    getUser,
    getUserPasswordHash, updateUserPassword
} from "../utils/user.js";
import {createNewEmailCookie, deleteNewEmailCookie} from "../utils/cookies.js";
import {encrypt} from "../utils/encrypt.js";
import {amIPwned, correctPassword, hashPassword, passwordIsValid} from "../utils/password.js";



// When user click (CHANGE EMAIL) button, we will send a verification code to the old email
export const requestEmailChange = async (req: Request, res: Response):Promise<void> => {
    try {
        // Check if user is logged in
        const userId = req.session.userId;
        const userInputtedEmail = req.body.email

        const encryptedEmail = encrypt(userInputtedEmail);

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Check if user is locked out
        const isLocked = await checkIfResendingChangeEmailCodeIsLocked(userId);

        if(isLocked){
            res.status(409).json({message: "Too many requests"});
            return;
        }

        // Get user email
        const email = await getEmailFromUserId(userId);

        if(email !== encryptedEmail){
            res.status(400).json({message: "Invalid email"});
            return;
        }

        await createChangeEmailCode(userId);

        // Lock sending email code
        await lockResendingChangeEmailCode(userId)

        res.status(200).json({message: "Email change code sent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// User has to verify old email before changing it
export const verifyCodeForEmailChange = async (req: Request, res: Response):Promise<void> => {
    try{
        // Check if user is logged in
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        const isValid = await verifyChangeEmailCode(userId, req.body.code);

        if(!isValid){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        // Delete the code after it's verified
        await deleteChangeEmailCode(userId);

        // Create session token for email change inside redis and cookies
        const session = await createChangeEmailSession(userId);
        createTokenForEmailChange(userId, session!, res);


        res.status(200).json({message: "Code verified"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// User should now start verifying the new email
export const startVerifyingNewEmail = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;
        const emailToken = req.cookies["email-change"];

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!emailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // Check if user is locked
        const isLocked = await checkIfResendingChangeEmailCodeWithNewEmailIsLocked(userId);

        if(isLocked){
            res.status(409).json({message: "Too many requests"});
            return;
        }

        const newEmail = req.body.email;

        // Validate email
        const isValid = await validateEmail(newEmail);

        if(!isValid){
            res.status(400).json({message: "Invalid email"});
            return;
        }

        // Create cookie for new email
        await createNewEmailCookie(newEmail, res);

        // Send the code to new email
        await createNewEmailCode(userId);

        // Lock sending email code
        await lockResendingChangeEmailCodeWithNewEmail(userId);

        res.status(200).json({message: "Verify your new email"});
    }
    catch (err) {
        console.error(err)
        res.status(500).json({message: "Internal Server Error"});
    }
}

// This is where user will verify new email
export const verifyNewEmail = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;
        const emailToken = req.cookies["email-change"];
        const newEmail = req.cookies.new_email as string

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!emailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        if(!newEmail){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // Check if their code is valid
        const isValid = await verifyNewEmailCode(userId, req.body.code);

        if(!isValid){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        await deleteNewEmailCode(userId);

        // Now we create session with new email

        // Create new session on top of old change email session
        const session = await createChangeEmailSessionWithNewEmail(userId, newEmail);

        createTokenForNewEmail(userId,session!,res);

        res.status(200).json({message: "New email verified"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const changeEmail = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Old email token
        const emailToken = req.cookies["email-change"];

        if(!emailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // New email token
        const newEmailToken = req.cookies["new-email-change"];

        if(!newEmailToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }

        const newEmail = req.cookies.new_email as string;

        // Encrypt new email
        const encryptedEmail = encrypt(newEmail);

        // Get old email
        const oldEmail = await getEmailFromUserId(userId);

        if(!oldEmail){
            res.status(404).json({message: "User not found"});
            return;
        }

        // Delete tokens
        deleteTokenForEmailChange(res);
        deleteTokenForNewEmail(res);
        deleteNewEmailCookie(res);
        await deleteChangeEmailSession(userId);
        await deleteChangeEmailSessionWithNewEmail(userId);

        //This also automatically deletes the session :)))
        await changeUserEmail(userId, encryptedEmail, oldEmail);


        res.status(200).json({message: "Email changed successfully"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// This function is responsible for deleting the user account. It will be called when the user sends a POST request to /delete-account.
// It is protected by the isAuthenticated middleware, which will check if the user is logged in before executing the function.
export const deleteAccount = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;
        const sessionId = req.sessionID;


        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!sessionId) {
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // Proceed to delete the account
        await deleteUser(userId);

        res.json({message: "Account deleted successfully"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const getUserData = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Fetch user data
        const user = await getUser(userId);

        if(!user) {
            res.status(404).json({message: "User not found"});
            return;
        }



        res.json({user});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// Change user password approach.
// This approach is similar to the email change approach. The user will first request a password change, then verify the code sent to their email.
// After that they receive session token and can change their password.
// User then will be asked to input old password and new password.
// Finally, the password will be changed.
export const requestPasswordChange = async (req: Request, res: Response):Promise<void> => {
    try{
        // First check if user is logged in
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Check if user is locked


        // Create code for password change
        await createChangePasswordCode(userId);
        res.status(200).json({message: "Password change code sent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const verifyCodeForPasswordChange = async (req: Request, res: Response):Promise<void> => {
    try {
        // Check if user is logged in
        const userId = req.session.userId;
        const code = req.body.code;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!code){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        // Check if their code is valid
        const isValid = await verifyChangePasswordCode(userId, code);

        if(!isValid){
            res.status(400).json({message: "Invalid code"});
            return;
        }

        // Delete the code after it's verified
        await deleteChangePasswordCode(userId);

        // Create session token for password change inside redis and cookies
        const session = await createChangePasswordSession(userId);

        createTokenForChangePassword(userId, session!, res);

        res.status(200).json({message: "Code verified"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const changePassword = async (req: Request, res: Response):Promise<void> => {
    try {
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Check if they have session token
        const sessionToken = req.cookies["change-password"];

        if(!sessionToken){
            res.status(401).json({message: "Invalid session"});
            return;
        }


        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        if(!oldPassword || !newPassword){
            res.status(400).json({message: "Invalid input"});
            return;
        }

        if(oldPassword === newPassword) {
            res.status(400).json({message: "Old password and new password cannot be the same"});
            return;
        }

        // Validate new password
        const [passwordValid, pwned] = await Promise.all([
            passwordIsValid(newPassword),
            amIPwned(newPassword),
        ]);

        if(!passwordValid){
            res.status(400).json({message: "Password is invalid"});
            return;
        }

        if(pwned){
            res.status(400).json({message: "Password is pwned"});
            return;
        }

        // Get email from user id
        const email = await getEmailFromUserId(userId);

        // Check if password has been used previously
        const isUsed = await compareUserPasswords(email!, newPassword);

        if(isUsed) {
            // Password has been used
            res.status(400).json({message: "Password has been used previously"});
            return;
        }

        // Check if old password is correct
        const passwordHash = await getUserPasswordHash(userId);


        const isCorrect = await correctPassword(passwordHash, oldPassword);


        if(!isCorrect){
            res.status(400).json({message: "Invalid password"});
            return;
        }

        // Create new password hash
        const newHash = await hashPassword(newPassword);

        // Delete session token
        await deleteChangePasswordSession(userId);
        deleteTokenForChangePassword(res);

        // Update user password
        await updateUserPassword(userId, newHash!, passwordHash);

        res.status(200).json({message: "Password changed successfully"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}