// Those are simple cookies which are not related to sessions
import type{Response} from 'express';


// Create temporary email token
export const createCookieWithEmail = async (email:string, res:Response):Promise<void> => {
    res.cookie("user_email", email, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
}

export const deleteCookieWithEmail = (res:Response):void => {
    res.clearCookie('user_email');
}

export const createCookieWithEmailForForgotPassword = async (email:string, res:Response):Promise<void> => {
    res.cookie("reset_email", email, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
}

export const deleteCookieWithEmailForForgotPassword = (res:Response):void => {
    res.clearCookie('reset_email');
}


export const createNewEmailCookie = async (email:string, res:Response):Promise<void> => {
    res.cookie("new_email", email, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
}

export const deleteNewEmailCookie = (res:Response):void => {
    res.clearCookie('new_email');
}
