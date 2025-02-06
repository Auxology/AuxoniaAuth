// Function related to the username

// This function will check if username is available in the database

import {prisma} from "../libs/prisma.js";
import {usernameSchema} from "../libs/zod.js";

export const usernameAvailable = async (username: string):Promise<boolean> => {
    try {
        const row = prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                username: true,
            }
        })


        console.log(Boolean(row));

        return Boolean(row);
    }
    catch (err) {
        console.error('Username availability error', err);
        return false;
    }
}

export const validateUsername = async (username: string):Promise<boolean> => {
    try {
        const isValid = usernameSchema.safeParse(username);

        return isValid.success;

    }
    catch (err) {
        console.error('Username validation error', err);
        return false;
    }
}