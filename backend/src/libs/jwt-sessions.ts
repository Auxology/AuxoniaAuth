// Approach for temporary session are kind of same, only difference is that we are using different tokens for different purposes.
// Also, all the functions are related to temporary sessions!!!
import type{Response} from 'express';
import jwt from 'jsonwebtoken';

// This creates token for temporary session during sign up
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
        secure: true,
        sameSite: 'none'
    });

    return token;
}

// This deletes the token for temporary session
export const deleteToken = (res:Response):void => {
    res.clearCookie('temp-session');
}

// Create token for reset password session
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

// Delete token for reset password session
export const deleteTokenForResetPassword = (res:Response):void => {
    res.clearCookie('forget-password');
}

// Create token for email change
export const createTokenForEmailChange = (userId:string, sessionToken:string, res:Response):string => {
    const payload = {
        userId,
        sessionToken
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '15m' // 15 minutes
    });

    res.cookie("email-change", token, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
    })

    return token;
}

export const deleteTokenForEmailChange = (res:Response):void => {
    res.clearCookie('email-change');
}