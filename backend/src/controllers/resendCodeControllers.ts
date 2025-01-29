// Those are function related to resending code
import type{ Request, Response } from 'express';
import {
    checkIfResendingEmailVerificationCodeIsLocked,
    lockResendingEmailVerificationCode,
    storeVerificationCode,
} from "../libs/redis.js";

export const resendEmailVerificationCode = async (req: Request, res: Response):Promise<any> => {
    try{
        const email = "johndoe@gmail.com"; // Hardcode for now

        // First check if resending email verification code is locked
        const isLocked = await checkIfResendingEmailVerificationCodeIsLocked(email);

        if(isLocked){
            return res.status(429).json({message: "Resending email verification code is locked"});
        }

        await storeVerificationCode(email)

        // Create new lock
        await lockResendingEmailVerificationCode(email);

        return res.status(200).json({message: "Verification code resent"});
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal server error"});
    }
}