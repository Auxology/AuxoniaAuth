// Those are all the function related to passwords.

import {passwordSchema} from "../libs/zod.js";
import crypto from 'crypto';
import {Argon2id} from "oslo/password";
import {prisma} from "../libs/prisma.js";

const argon2 = new Argon2id();

// This approach does not belong to me.If it is flawed please let me know.
export const amIPwned = async (password: string): Promise<boolean> => {
    try {
        const hash = crypto.createHash('sha1')
            .update(password)
            .digest('hex')
            .toUpperCase();

        const prefix = hash.slice(0, 5);
        const suffix = hash.slice(5);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

        const text = await response.text();
        const hashes = text.split('\n');

        // Check if suffix exists and get breach count
        for (const line of hashes) {
            const [hashSuffix, count] = line.split(':');
            if (hashSuffix === suffix) {
                return parseInt(count as string) > 0;
            }
        }

        return false;

    } catch (error) {
        console.error('Password pwned check failed:', error);
        return false;
    }
};

export const passwordIsValid = async (password: string): Promise<boolean> => {
    const isValid = passwordSchema.safeParse(password);

    return isValid.success;
}

export const hashPassword = async (password: string): Promise<string | null> => {
    try {
        return await argon2.hash(password);
    }
    catch (error) {
        console.error('Password hashing failed:', error);
        return null;
    }
}

export const correctPassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        return await argon2.verify(password, hash);
    }
    catch (error) {
        console.error('Password verification failed:', error);
        return false;
    }
}