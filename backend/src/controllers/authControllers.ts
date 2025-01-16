import type{ Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
    res.send("Signup route");
}