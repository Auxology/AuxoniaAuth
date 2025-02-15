// Those are function related to resending code
import type{ Request, Response } from 'express';
import {
    checkIfResendingEmailVerificationCodeIsLocked,
    storeVerificationCode,
    checkIfResendingChangeEmailCodeIsLocked,
    createChangeEmailCode,
    lockResendingChangeEmailCode,
    lockResendingEmailVerificationCode,
    checkIfResendingForgotPasswordCodeIsLocked,
    createForgotPasswordCode,
    lockResendingForgotPasswordCode
} from "../../libs/redis.js";

export const resendEmailVerificationCode = async (req: Request, res: Response):Promise<void> => {
    try{
        const email = req.cookies.user_email as string;

        if(!email) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        // First check if resending email verification code is locked
        const isLocked = await checkIfResendingEmailVerificationCodeIsLocked(email);

        console.log(isLocked);

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
        const email = req.cookies.reset_email as string;

        if(!email) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        // First check if resending forgot password code is locked
        const isLocked = await checkIfResendingForgotPasswordCodeIsLocked(email);

        if(isLocked){
            res.status(429).json({message: "Resending forgot password code is locked"});
            return;
        }

        await createForgotPasswordCode(email);

        // Create new lock
        await lockResendingForgotPasswordCode(email);

        res.status(200).json({message: "Forgot password code resent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }
}

export const resendEmailChangeCode = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;

        if(!userId) {
            res.status(401).json({message: "Unauthorized"});
            return;
        }

        // First check if resending change email code is locked
        const isLocked = await checkIfResendingChangeEmailCodeIsLocked(userId);

        if(isLocked){
            res.status(429).json({message: "Resending change email code is locked"});
            return;
        }

        await createChangeEmailCode(userId);

        // Create new lock
        await lockResendingChangeEmailCode(userId);

        res.status(200).json({message: "Change email code resent"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    }
}