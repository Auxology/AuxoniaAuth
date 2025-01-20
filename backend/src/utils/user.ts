// Those are all the functions related to user

import {prisma} from "../libs/prisma.js";

export const createUser = async (email: string, password: string, username:string): Promise<boolean> => {
    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                password: password,
                username: username,
                isVerified: true,
            }
        })

        return true;
    }
    catch (error) {
        console.error('User creation failed:', error);
        return false;
    }
}