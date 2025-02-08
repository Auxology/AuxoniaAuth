// Function related to the username
// This function will check if username is available in the database
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import {usernameSchema} from "../libs/zod.js";

export const usernameAvailable = async (username: string):Promise<boolean> => {
    try {
        const [row] = await db.select({username: users.username}).from(users).where(eq(users.username, username)).limit(1)

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