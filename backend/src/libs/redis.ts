// Those are all the functions that we will use to interact with Redis(Temporary Database) in our application.
import { createClient } from 'redis';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config()

const redis = createClient({
    username: process.env.REDIS_USERNAME!,
    password: process.env.REDIS_PASSWORD!,
    socket: {
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!)
    }
});

export const initRedis = async () => {
    try {
        await redis.connect();
        console.log('Connected to Redis');
    }
    catch(err){
        console.error('Failed to connect to Redis', err);
    }
}


// This function will be used to store the verification code in Redis
export const storeVerificationCode = async (email: string):Promise<void> => {
    const code = crypto.randomBytes(3).toString('hex');
    const expiryDate = 60 * 15;  // 15 minutes
    
    try {
        await redis.setEx(`verification_code:${email}`, expiryDate, code);
        // In production, we should send this code to the user's email
        console.log(`Verification code ${code} created for ${email}`);
    }
    catch(err){
        console.error('Failed to store verification code', err);
    }
}

// This function will be used to verify the code that the user has entered
export const verifyCode = async (email:string, code: string):Promise<boolean> => {
    try {
        const getCode = await redis.get(`verification_code:${email}`);

        if(!getCode){
            return false;
        }

        if(getCode !== code){
            return false;
        }
        

        return true;
    }
    catch(err){
        console.error('Failed to verify code', err);
        return false;
    }
}

//(MAJOR SECURITY FLAW) If you ever decide to use this for sake of user experience keep in mind that this is not secure
// This function expects that key is the code and email is value,
// With this you no longer need to store email somewhere(cookies, session, etc), nor user needs to enter email again,
// This is not secure because user can spam endpoints to get multiple verification codes, keep in mind with this approach
// invalidating old codes is not possible, so if user gets multiple codes, they can use any of them to finish signup process and after that
// they can still use other codes to finish signup process again.
// I think you understand why this flawed.
export const getEmailFromVerificationCode = async (code: string):Promise<string | null> => {
    try {
        const email = await redis.get(`verification_code:${code}`);

        if(!email) {
            console.error('Email not found');
            return null;
        }

        return email;
    }
    catch(err){
        console.error('Failed to get email from verification code', err);
        return null;
    }
}
// !!!!!!!!!!!!!!!!!!!!!!////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// This function will be used to delete the verification code from Redis
export const deleteVerificationCode = async (email: string):Promise<void> => {
    try {
        await redis.del(`verification_code:${email}`);
    }
    catch(err){
        console.error('Failed to delete verification code', err);
    }
}

// After user completes verification we create temporary session(safe point) which will be deleted after 45 minutes
export const createTemporarySession = async (email: string):Promise<string | null> => {
    try {
        const sessionToken = crypto.randomUUID();
        const expiryDate = 60 * 45;  // 45 minutes

        const tempSessionData = {
            sessionToken,
            email,
            expiryDate
        }

        const existingSession = await redis.get(`temp_session:${email}`);

        if(existingSession){
            await redis.del(`temp_session:${email}`);
        }

        await redis.setEx(`temp_session:${email}`, expiryDate, JSON.stringify(tempSessionData));

        console.log(`Temporary session created for ${email}`);

        return sessionToken;
    }
    catch(err){
        console.error('Failed to create temporary session', err);
        return null;
    }
}

export const checkIfTemporarySessionExists = async (email: string):Promise<boolean> => {
    try {
        const tempSession = await redis.exists(`temp_session:${email}`);
        return Boolean(tempSession);
    }
    catch(err){
        console.error('Failed to check if temporary session exists', err);
        return true;
    }
}

// This function will be used to verify the temporary session
export const verifyTemporarySession = async(email:string):Promise<boolean> => {
    try {
        const tempSession = await redis.get(`temp_session:${email}`);

        if(!tempSession){
            console.error('Temporary session not found');
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify temporary session', err);
        return false;
    }
}

export const deleteTemporarySession = async(email:string):Promise<void> => {
    try {
        await redis.del(`temp_session:${email}`);
    }
    catch(err){
        console.error('Failed to delete temporary session', err);
    }
}


// Those are temporary session for forgot password
export const createForgotPasswordCode = async (email: string):Promise<void> =>{
    const code = crypto.randomBytes(3).toString('hex');
    const expiryDate = 60 * 15;  // 15 minutes

    try {
        await redis.setEx(`forgot_password_code:${email}`, expiryDate, code);
        // In production, we should send this code to the user's email
        console.log(`Forgot password code ${code} created for ${email}`);
    }
    catch(err){
        console.error('Failed to store forgot password code', err);
    }
}

export const verifyForgotPasswordCode = async (email:string, code: string):Promise<boolean> => {
    try {
        const getCode = await redis.get(`forgot_password_code:${email}`);

        if(!getCode){
            return false;
        }

        if(getCode !== code){
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify forgot password code', err);
        return false;
    }
}

// (SECURITY FLAW) If you ever decide to use this for sake of user experience keep in mind that this is not secure
// This function expects that key is the code and email is value, you already now why this is flawed.
export const getEmailFromForgotPasswordCode = async (code: string):Promise<string | null> => {
    try {
        const email = await redis.get(`forgot_password_code:${code}`);

        if(!email) {
            console.error('Email not found');
            return null;
        }

        return email;
    }
    catch(err){
        console.error('Failed to get email from forgot password code', err);
        return null;
    }
}

export const deleteForgotPasswordCode = async (email:string):Promise<void> => {
    try {
        await redis.del(`forgot_password_code:${email}`);
    }
    catch(err){
        console.error('Failed to delete forgot password code', err);
    }
}

export const createForgotPasswordSession = async (email:string):Promise<string | null> => {
    try{
        const sessionToken = crypto.randomUUID();
        const expiryDate = 60 * 15;  // 15 minutes

        const forgotPasswordData = {
            sessionToken,
            email,
            expiryDate
        }

        const existingSession = await redis.get(`forgot_password_session:${email}`);

        if(existingSession){
            await redis.del(`forgot_password_session:${email}`);
        }

        await redis.setEx(`forgot_password_session:${email}`, expiryDate, JSON.stringify(forgotPasswordData));

        console.log(`Forgot password session created for ${email}`);

        return sessionToken
    }
    catch (error) {
        console.error('Failed to create forgot password session', error);
        return null;
    }
}

export const verifyForgotPasswordSession = async (email:string):Promise<boolean> => {
    try {
        const forgotPasswordSession = await redis.get(`forgot_password_session:${email}`);

        if(!forgotPasswordSession){
            console.error('Forgot password session not found');
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify forgot password session', err);
        return false;
    }
}

export const deleteForgotPasswordSession = async (email:string):Promise<void> => {
    try {
        await redis.del(`forgot_password_session:${email}`);
    }
    catch(err){
        console.error('Failed to delete forgot password session', err);
    }
}

// Change email functions
// In this approach we will use userId instead of email, because we don't want user to type email again
export const createChangeEmailCode = async (userId: string):Promise<void> => {
    const code = crypto.randomBytes(3).toString('hex');
    const expiryDate = 60 * 15;  // 15 minutes

    try {
        await redis.setEx(`change_email_code:${userId}`, expiryDate, code);
        // In production, we should send this code to the user's email
        console.log(`Change email code ${code} created for ${userId}`);
    }
    catch(err){
        console.error('Failed to store change email code', err);
    }
}

export const verifyChangeEmailCode = async (userId: string, code: string):Promise<boolean> => {
    try {
        const getCode = await redis.get(`change_email_code:${userId}`);

        if(!getCode){
            return false;
        }

        if(getCode !== code){
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify change email code', err);
        return false;
    }
}

export const deleteChangeEmailCode = async (userId: string):Promise<void> => {
    try {
        await redis.del(`change_email_code:${userId}`);
    }
    catch(err){
        console.error('Failed to delete change email code', err);
    }
}

export const createChangeEmailSession = async (userId: string):Promise<string | null> => {
    try {
        const sessionToken = crypto.randomUUID();
        const expiryDate = 60 * 15;  // 15 minutes

        const changeEmailData = {
            sessionToken,
            userId,
            expiryDate
        }

        const existingSession = await redis.get(`change_email_session:${userId}`);

        if(existingSession){
            await redis.del(`change_email_session:${userId}`);
        }

        await redis.setEx(`change_email_session:${userId}`, expiryDate, JSON.stringify(changeEmailData));

        console.log(`Change email session created for ${userId}`);

        return sessionToken;
    }
    catch(err){
        console.error('Failed to create change email session', err);
        return null;
    }
}

export const verifyChangeEmailSession = async (userId: string):Promise<boolean> => {
    try {
        const changeEmailSession = await redis.get(`change_email_session:${userId}`);

        if(!changeEmailSession){
            console.error('Change email session not found');
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify change email session', err);
        return false;
    }
}

export const deleteChangeEmailSession = async (userId: string):Promise<void> => {
    try {
        await redis.del(`change_email_session:${userId}`);
    }
    catch(err){
        console.error('Failed to delete change email session', err);
    }
}

// Those are functions which will be used for verifying new email
export const createNewEmailCode = async (userId: string):Promise<void> => {
    const code = crypto.randomBytes(3).toString('hex');
    const expiryDate = 60 * 15;  // 15 minutes

    try {
        await redis.setEx(`new_email_code:${userId}`, expiryDate, code);
        // In production, we should send this code to the user's email
        console.log(`New email code ${code} created for ${userId}`);
    }
    catch(err){
        console.error('Failed to store new email code', err);
    }
}

export const verifyNewEmailCode = async (userId: string, code: string):Promise<boolean> => {
    try {
        const getCode = await redis.get(`new_email_code:${userId}`);

        if(!getCode){
            return false;
        }

        if(getCode !== code){
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify new email code', err);
        return false;
    }
}

export const deleteNewEmailCode = async (userId: string):Promise<void> => {
    try {
        await redis.del(`new_email_code:${userId}`);
    }
    catch(err){
        console.error('Failed to delete new email code', err);
    }
}

export const createChangeEmailSessionWithNewEmail = async (userId: string, newEmail: string):Promise<string | null> => {
    try {
        const sessionToken = crypto.randomUUID();
        const expiryDate = 60 * 15;  // 15 minutes

        const changeEmailData = {
            sessionToken,
            userId,
            newEmail,
            expiryDate
        }

        await redis.setEx(`new_change_email_session:${userId}`, expiryDate, JSON.stringify(changeEmailData));

        console.log(`Change email session created for ${userId}`);

        return sessionToken;
    }
    catch(err){
        console.error('Failed to create change email session with new email', err);
        return null;
    }
}

export const verifyChangeEmailSessionWithNewEmail = async (userId: string):Promise<boolean> => {
    try {
        const changeEmailSession = await redis.get(`new_change_email_session:${userId}`);

        if(!changeEmailSession){
            console.error('Change email session with new email not found');
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify change email session with new email', err);
        return false;
    }
}

export const deleteChangeEmailSessionWithNewEmail = async (userId: string):Promise<void> => {
    try {
        await redis.del(`new_change_email_session:${userId}`);
    }
    catch(err){
        console.error('Failed to delete change email session with new email', err);
    }
}

export const createChangePasswordCode = async (userId: string):Promise<void> => {
    const code = crypto.randomBytes(3).toString('hex');
    const expiryDate = 60 * 15;  // 15 minutes

    try {
        await redis.setEx(`change_password_code:${userId}`, expiryDate, code);
        // In production, we should send this code to the user's email
        console.log(`Change password code ${code} created for ${userId}`);
    }
    catch(err){
        console.error('Failed to store change password code', err);
    }
}

export const verifyChangePasswordCode = async (userId: string, code: string):Promise<boolean> => {
    try {
        const getCode = await redis.get(`change_password_code:${userId}`);

        if(!getCode){
            return false;
        }

        if(getCode !== code){
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify change password code', err);
        return false;
    }
}

export const deleteChangePasswordCode = async (userId: string):Promise<void> => {
    try {
        await redis.del(`change_password_code:${userId}`);
    }
    catch(err){
        console.error('Failed to delete change password code', err);
    }
}

export const createChangePasswordSession = async (userId: string):Promise<string | null> => {
    try {
        const sessionToken = crypto.randomUUID();
        const expiryDate = 60 * 15;  // 15 minutes

        const changePasswordData = {
            sessionToken,
            userId,
            expiryDate
        }

        await redis.setEx(`change_password_session:${userId}`, expiryDate, JSON.stringify(changePasswordData));

        console.log(`Change password session created for ${userId}`);

        return sessionToken;
    }
    catch(err){
        console.error('Failed to create change password session', err);
        return null;
    }
}

export const verifyChangePasswordSession = async (userId: string):Promise<boolean> => {
    try {
        const changePasswordSession = await redis.get(`change_password_session:${userId}`);

        if(!changePasswordSession){
            console.error('Change password session not found');
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify change password session', err);
        return false;
    }
}

export const deleteChangePasswordSession = async (userId: string):Promise<void> => {
    try {
        await redis.del(`change_password_session:${userId}`);
    }
    catch(err){
        console.error('Failed to delete change password session', err);
    }
}

// Lock functions
// You might wonder why do I create lock for resending email verification code inside redis?
// The reason is that if we don't create lock, the user can spam the resending email verification code endpoint,and we don't want that.
// Also with redis you don't have to check for expiration, because it will automatically expire after 60 seconds
// This is a simple and fast way of preventing spamming

// This function will be used to lock resending email verification code, so the user can't spam it.
// It takes email from controller and locks it for 60 seconds.
export const lockResendingEmailVerificationCode = async (email: string):Promise<void> => {
    try {
        await redis.setEx(`locked_resend_email_verification_code:${email}`, 60, 'locked');
    }
    catch(err){
        console.error('Failed to lock resending email verification code', err);
    }
}

// This function will be used to check if resending email verification code is locked
// Since we are using redis, we don't have to check for expiration, because it will automatically expire after 60 seconds
// Also email is take from controller
export const checkIfResendingEmailVerificationCodeIsLocked = async (email: string):Promise<boolean> => {
    try {
        const exists = await redis.exists(`locked_resend_email_verification_code:${email}`);

        if(!exists) return false;

        return true;

    }
    catch(err){
        console.error('Failed to check if resending email verification code is locked', err);
        return true;
    }
}


export const lockResendingForgotPasswordCode = async (email: string):Promise<void> =>  {
    try {
        await redis.setEx(`locked_resend_forgot_password_code:${email}`, 60, 'locked');
    }
    catch(err){
        console.error('Failed to lock resending forgot password code', err);
    }
}

export const checkIfResendingForgotPasswordCodeIsLocked = async (email: string):Promise<boolean> => {
    try {
        const isLocked = await redis.exists(`locked_resend_forgot_password_code:${email}`);

        if(!isLocked) return false;

        return true;
    }
    catch(err){
        console.error('Failed to check if resending forgot password code is locked', err);
        return true;
    }
}

export const lockResendingChangeEmailCode = async (userId: string):Promise<void> => {
    try {
        await redis.setEx(`locked_resend_change_email_code:${userId}`, 60, 'locked');
    }
    catch(err){
        console.error('Failed to lock resending change email code', err);
    }
}

export const checkIfResendingChangeEmailCodeIsLocked = async (userId: string):Promise<boolean> => {
    try {
        const isLocked = await redis.exists(`locked_resend_change_email_code:${userId}`);

        if(!isLocked) return false;

        return true;
    }
    catch(err){
        console.error('Failed to check if resending change email code is locked', err);
        return true;
    }
}

export const lockResendingChangeEmailCodeWithNewEmail = async (userId: string):Promise<void> => {
    try {
        await redis.setEx(`locked_resend_change_email_code_with_new_email:${userId}`, 60, 'locked');
    }
    catch(err){
        console.error('Failed to lock resending change email code with new email', err);
    }
}

export const checkIfResendingChangeEmailCodeWithNewEmailIsLocked = async (userId: string):Promise<boolean> => {
    try {
        const isLocked = await redis.exists(`locked_resend_change_email_code_with_new_email:${userId}`);

        if(!isLocked) return false;

        return true;
    }
    catch(err){
        console.error('Failed to check if resending change email code with new email is locked', err);
        return true;
    }
}