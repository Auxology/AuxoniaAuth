// Those are function related to the email
import { emailSchema } from '../libs/zod.js';
import { db } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';

// Email validation function often used in signup process
export const validateEmail = async (email: string):Promise<boolean> => {
    try {
        emailSchema.safeParse(email);

        return true;
    }
    catch(err){
        console.error('Email validation error', err);
        return false;
    }
}

// Check if email is used in temporary database

// Check if email is used in main database, make sure to remember that this function expects encrypted email
export const emailInUse = async (email: string):Promise<boolean> => {
    const [row] = await db.select({id: users.id}).from(users).where(eq(users.email, email)).limit(1);

    return Boolean(row);
}