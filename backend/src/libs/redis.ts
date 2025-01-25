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
        await redis.setEx(`verification_code:${code}`, expiryDate, email);
        // In production, we should send this code to the user's email
        console.log(`Verification code ${code} created for ${email}`);
    }
    catch(err){
        console.error('Failed to store verification code', err);
    }
}

// This function will be used to verify the code that the user has entered
export const verifyCode = async (code: string):Promise<boolean> => {
    try {
        const isValid = await redis.exists(`verification_code:${code}`);
        
        if(!isValid) return false;

        return true;
    }
    catch(err){
        console.error('Failed to verify code', err);
        return false;
    }
}

// This function will be used to get the email from Redis
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


// This function will be used to delete the verification code from Redis
export const deleteVerificationCode = async (code: string):Promise<void> => {
    try {
        await redis.del(`verification_code:${code}`);
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
export const createForgetPasswordCode = async (email: string):Promise<void> =>{
    const code = crypto.randomBytes(3).toString('hex');
    const expiryDate = 60 * 15;  // 15 minutes

    try {
        await redis.setEx(`forget_password_code:${code}`, expiryDate, email);
        // In production, we should send this code to the user's email
        console.log(`Forget password code ${code} created for ${email}`);
    }
    catch(err){
        console.error('Failed to store forget password code', err);
    }
}

export const verifyForgetPasswordCode = async (code: string):Promise<boolean> => {
    try {
        const isValid = await redis.exists(`forget_password_code:${code}`);

        if(!isValid) return false;

        return true;
    }
    catch(err){
        console.error('Failed to verify forget password code', err);
        return false;
    }
}

export const getEmailFromForgetPasswordCode = async (code: string):Promise<string | null> => {
    try {
        const email = await redis.get(`forget_password_code:${code}`);

        if(!email) {
            console.error('Email not found');
            return null;
        }

        return email;
    }
    catch(err){
        console.error('Failed to get email from forget password code', err);
        return null;
    }
}

export const deleteForgetPasswordCode = async (code: string):Promise<void> => {
    try {
        await redis.del(`forget_password_code:${code}`);
    }
    catch(err){
        console.error('Failed to delete forget password code', err);
    }
}

export const createForgetPasswordSession = async (email:string):Promise<string | null> => {
    try{
        const sessionToken = crypto.randomUUID();
        const expiryDate = 60 * 15;  // 15 minutes

        const forgetPasswordData = {
            sessionToken,
            email,
            expiryDate
        }

        const existingSession = await redis.get(`forget_password_session:${email}`);

        if(existingSession){
            await redis.del(`forget_password_session:${email}`);
        }

        await redis.setEx(`forget_password_session:${email}`, expiryDate, JSON.stringify(forgetPasswordData));

        console.log(`Forget password session created for ${email}`);

        return sessionToken
    }
    catch (error) {
        console.error('Failed to create forget password session', error);
        return null;
    }
}

export const verifyForgetPasswordSession = async (email:string):Promise<boolean> => {
    try {
        const forgetPasswordSession = await redis.get(`forget_password_session:${email}`);

        if(!forgetPasswordSession){
            console.error('Forget password session not found');
            return false;
        }

        return true;
    }
    catch(err){
        console.error('Failed to verify forget password session', err);
        return false;
    }
}

export const deleteForgetPasswordSession = async (email:string):Promise<void> => {
    try {
        await redis.del(`forget_password_session:${email}`);
    }
    catch(err){
        console.error('Failed to delete forget password session', err);
    }
}