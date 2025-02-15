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

    res.cookie("forgot-password", token, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    return token;
}

// Delete token for reset password session
export const deleteTokenForResetPassword = (res:Response):void => {
    res.clearCookie('forgot-password');
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
        secure: true,
        sameSite: "none"
    })

    return token;
}

export const deleteTokenForEmailChange = (res:Response):void => {
    res.clearCookie('email-change');
}

export const createTokenForNewEmail = (userId:string, sessionToken:string, res:Response):string => {
    const payload = {
        userId,
        sessionToken
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '15m' // 15 minutes
    });

    res.cookie("new-email-change", token, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    return token;
}

export const deleteTokenForNewEmail = (res:Response):void => {
    res.clearCookie('new-email-change');
}

export const createTokenForChangePassword = (userId:string, sessionToken:string, res:Response):string => {
    const payload = {
        userId,
        sessionToken
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '15m' // 15 minutes
    });

    res.cookie("change-password", token, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    return token;
}

export const deleteTokenForChangePassword = (res:Response):void => {
    res.clearCookie('change-password');
}

export const createTokenForAccountRecovery = (userId:string, sessionToken:string, res:Response):string => {
    const payload = {
        userId,
        sessionToken
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '15m' // 15 minutes
    });

    res.cookie("account-recovery", token, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    return token;
}

export const deleteTokenForAccountRecovery = (res:Response):void => {
    res.clearCookie('account-recovery');
}

export const createTokenForAccountRecoveryFinish = (userId:string, sessionToken:string, res:Response):string => {
    const payload = {
        userId,
        sessionToken
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!, {
        expiresIn: '15m' // 15 minutes
    });

    res.cookie("account-recovery-finish", token, {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    return token;
}

export const deleteTokenForAccountRecoveryFinish = (res:Response):void => {
    res.clearCookie('account-recovery-finish');
}