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
