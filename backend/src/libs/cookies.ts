// Approach for temporary session are kind of same, only difference is that we are using different tokens for different purposes.
// Also time for the token to expire is different.
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

export const createToken = (email:string, sessionToken:string, res:Response):string => {
    const payload ={
        email,
        sessionToken
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '45m'// 45 minutes
    });

    res.cookie('temp-session', token, {
        maxAge: 1000 * 60 * 45, // 45 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    });

    return token;
}

export const deleteToken = (res:Response):void => {
    res.clearCookie('temp-session');
}

export const createTokenForResetPassword = (email:string, sessionToken:string,res:Response):string => {
    const payload = {
        email,
        sessionToken
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '15m' // 15 minutes
    });

    res.cookie("forget-password", token, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
    })

    return token;
}

export const deleteTokenForResetPassword = (res:Response):void => {
    res.clearCookie('forget-password');
}

// Create temporary email token
export const createTokenWithEmail = async (email:string, res:Response)=> {
    res.cookie("user_email", email, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
    });
}

export const deleteTokenWithEmail = (res:Response):void => {
    res.clearCookie('user_email');
}