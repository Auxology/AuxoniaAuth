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
