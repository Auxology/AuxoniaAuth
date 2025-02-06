import type {Request, Response} from "express";

// This function will check if user has cookie with email
// If user has cookie with email, it means that they have started the process of verifying their email
// So they should access the verify email page
export const checkVerifyEmailCookie = async (req: Request, res: Response):Promise<void> => {
    try {
        const email = req.cookies.user_email as string;

        if(!email){
            res.status(400).json({ error: 'Invalid data' });
            return;
        }

        res.status(200).json({ message: 'User has cookie with email' });
    }
    catch(err){
        console.error('Internal Server Error', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// This will check if user is logged in
export const checkAuth = async (req: Request, res: Response):Promise<void> => {
    try {
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        res.status(200).json({message: "You are logged in"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const checkForTemporarySession = async (req: Request, res: Response):Promise<void> => {
    try{
        const email = req.email;

        if(!email){
            res.status(401).json({message: "Unauthorized - No Token Provided"});
            return;
        }


        res.status(200).json({email: email});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}