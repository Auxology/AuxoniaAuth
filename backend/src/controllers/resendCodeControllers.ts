// Those are function related to resending code
import type{ Request, Response } from 'express';
import {
    checkIfResendingEmailVerificationCodeIsLocked,
    lockResendingEmailVerificationCode,
    storeVerificationCode,
    checkIfResendingForgetPasswordCodeIsLocked, createForgetPasswordCode, lockResendingForgetPasswordCode
} from "../libs/redis.js";

export const resendEmailVerificationCode = async (req: Request, res: Response):Promise<void> => {
    try{
        const email = req.cookies.user_email as string;

        // First check if resending email verification code is locked
        const isLocked = await checkIfResendingEmailVerificationCodeIsLocked(email);

        if(isLocked){
            res.status(429).json({message: "Resending email verification code is locked"});
            return;
        }

        await storeVerificationCode(email)

        // Create new lock
        await lockResendingEmailVerificationCode(email);

        res.status(200).json({message: "Verification code resent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }
}

export const resendForgotPasswordCode = async (req: Request, res: Response):Promise<void> => {
    try{
        const email = req.cookies.user_email as string;

        // First check if resending forgot password code is locked
        const isLocked = await checkIfResendingForgetPasswordCodeIsLocked(email);

        if(isLocked){
            res.status(429).json({message: "Resending forgot password code is locked"});
            return;
        }

        await createForgetPasswordCode(email);

        // Create new lock
        await lockResendingForgetPasswordCode(email);

        res.status(200).json({message: "Forgot password code resent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }
}