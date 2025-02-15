// Those are functions related to user data change
import type{Request, Response} from "express";
import {
    deleteUser,
    getUser,
} from "../utils/user.js";

// This function is responsible for deleting the user account. It will be called when the user sends a POST request to /delete-account.
// It is protected by the isAuthenticated middleware, which will check if the user is logged in before executing the function.
export const deleteAccount = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;
        const sessionId = req.sessionID;


        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        if(!sessionId) {
            res.status(401).json({message: "Invalid session"});
            return;
        }

        // Proceed to delete the account
        await deleteUser(userId);

        res.json({message: "Account deleted successfully"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const getUserData = async (req: Request, res: Response):Promise<void> => {
    try{
        const userId = req.session.userId;

        if(!userId){
            res.status(401).json({message: "You are not logged in"});
            return;
        }

        // Fetch user data
        const user = await getUser(userId);

        if(!user) {
            res.status(404).json({message: "User not found"});
            return;
        }



        res.json({user});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}
