// Those are all the functions related to user
import type{User} from "../types/types.js";
import {decrypt} from "./encrypt.js";
import {db} from "../db/index.js";
import {sessions, users} from "../db/schema.js";
import { arrayContains, eq } from "drizzle-orm";
import {correctPassword, hashPassword} from "./password.js";
import {generateRecoveryCodes, hashRecoveryCode, verifyRecoveryCode} from "./codes.js";

// This is function used to create user
export const createUser = async (email: string, password: string, username:string): Promise<void> => {
    try{
        await db.insert(users).values({
            email: email,
            password: password,
            username: username,
            isVerified: true,
            // Set previous instance of password and email
            previousPasswords: [password],
            previousEmails: [email]
        })
    }
    catch (err) {
        console.error('Failed to create user', err);
    }
}

// This function used to get user with email and makes sure that only needed information is returned
// For security reasons, you should not return too much information about the user
export const getUserFromEmail = async (email:string): Promise<User | null> => {
    try {
        const [row] = await db.select({
            id: users.id,
            email: users.email,
            username: users.username
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

        if (!row) return null;

        const user:User = {
            id: row.id,
            email: row.email,
            username: row.username
        }

        return user;
    }
    catch(err){
        console.error('Failed to get user from email', err);
        return null;
    }
}


// There is reason why we use this as separate function
// It improves readability and makes it easier to understand the code
// Whilst make ensuring more safety.
export const getUserPasswordHash = async (userId:string):Promise<string> => {
    const [row] = await db.select({
        password: users.password
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

    if(!row){
        throw new Error('User not found');
    }

    return row.password;
}

// This function which resets user password and deletes the session
export const resetUserPassword = async(email:string, password:string):Promise<void> => {
    try{
        const [user] = await db.update(users).set({
            password: password,
            previousPasswords: [password]
        })
        .where(eq(users.email, email))
        .returning({ id: users.id })

        if(!user){
            throw new Error('User not found');
        }

        await db.delete(sessions).where(eq(sessions.userId, user.id))
    }
    catch (err) {
        console.error('Failed to reset password', err);
    }
}

export const deleteUser = async (userId:string):Promise<void> => {
    try {
        // First delete all sessions(or else drizzle will throw error)
        await db.delete(sessions).where(eq(sessions.userId, userId))
        await db.delete(users).where(eq(users.id, userId))
    }
    catch(err){
        console.error('Failed to delete user', err);
    }
}

// This user promises full user data
export const getUser = async (userId:string):Promise<User | null> => {
    try{
        const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if(!row) return null;

        // Decrypt email
        const decryptedEmail = decrypt(row.email);

        // DO NOT INCLUDE PASSWORD
        const user:User = {
            id: row.id,
            email: decryptedEmail,
            username: row.username,
            isVerified: row.isVerified,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }

        return user;
    }
    catch(err){
        console.error('Failed to get user', err);
        return null;
    }
}

// This is function which retrieves old user email from database during email change.
// Reason is to stored it inside previous email field in database.
// NEVER RETURN DECRYPTED EMAIL
export const getEmailFromUserId = async (userId:string):Promise<string | null> => {
    try{
        const [row] = await db.select({email: users.email}).from(users).where(eq(users.id, userId)).limit(1);

        if(!row) return null;

        return row.email;
    }
    catch(err) {
        console.error('Failed to get email from user id', err);
        return null;
    }
}

export const changeUserEmail = async (userId:string, email:string):Promise<void> => {
    try{
        const [row] = await db.select({
            previousEmails: users.previousEmails
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

        if (!row) throw new Error('User not found');

        // Push new email to previous emails array
        const updatedPreviousEmails = [...(row.previousEmails || []), email];

        // Update the user's email and previous emails
        await db.update(users)
            .set({
                email: email,
                previousEmails: updatedPreviousEmails
            })
            .where(eq(users.id, userId));

        // Delete all sessions for this user
        await db.delete(sessions).where(eq(sessions.userId, userId));
    }
    catch(err){
        console.error('Failed to change email', err);
    }
}

export const compareUserPasswords = async (email:string, password:string):Promise<boolean> => {
    try{
        // Get old password hashes
        const [row] = await db.select({
            previousPasswords: users.previousPasswords
        }).from(users).where(eq(users.email, email))

        if(!row || !row.previousPasswords) {
            return false;
        }

        for(const oldPassword of row.previousPasswords){
            const isMatch = await correctPassword(oldPassword, password);

            if(isMatch){
                console.log('Password match found');
                return true;
            }
        }

        return false;
    }
    catch (err) {
        console.error('Failed to compare user passwords', err);
        return false;
    }
}

export const updateUserPassword = async (userId:string, password:string, oldPassword: string):Promise<void> => {
    try{
        // First get the current previousPasswords array
        const [user] = await db.select({
            previousPasswords: users.previousPasswords
        }).from(users).where(eq(users.id, userId));

        if (!user) {
            throw new Error('User not found');
        }

        // Create new array with old password added
        const updatedPreviousPasswords = [...(user.previousPasswords || []), oldPassword];

        // Update password and previous passwords array
        await db.update(users).set({
            password: password,
            previousPasswords: updatedPreviousPasswords
        }).where(eq(users.id, userId));

        // Delete all sessions for this user
        await db.delete(sessions).where(eq(sessions.userId, userId));
    }
    catch(err){
        console.error('Failed to update user password', err);
        throw err; // Re-throw the error to handle it in the calling function
    }
}

export const createRecoveryCodes = async (email:string,):Promise<string[] | null> => {
    try{
        // Create array which will store 3 recovery codes
        const recoveryCodes = generateRecoveryCodes();

        // Hash recovery codes
        const hashedRecoveryCodes = await Promise.all(recoveryCodes.map(code => hashRecoveryCode(code)));

        await db.update(users).set({
            recoveryCodes: hashedRecoveryCodes
        })
        .where(eq(users.email, email))

        return recoveryCodes;
    }

    catch(err){
        console.error('Failed to create recovery code', err);
        return null;
    }
}

// Only show user recovery codes once
export const getRecoveryCodes = async (email:string):Promise<string[] | null> => {
    try{
        const [row] = await db.select({
            recoveryCodes: users.recoveryCodes
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

        if(!row || !row.recoveryCodes) return null;

        return row.recoveryCodes;
    }
    catch(err){
        console.error('Failed to show recovery codes', err);
        return null;
    }
}

// Those functions will be searched by recovery code
// This will check if the email given by user has been linked to the recovery code previously
export const checkEmailByRecoveryCode = async (recoveryCode: string, email: string): Promise<string | null> => {
    try {
        // First, let's select both recoveryCodes and previousEmails to debug
        const [row] = await db.select({
            recoveryCodes: users.recoveryCodes,
            previousEmails: users.previousEmails,
            id: users.id
        })
        .from(users)
        .where(arrayContains(users.previousEmails, [email]))
        .limit(1);


        if (!row) {
            return null;
        }

        if (!row.recoveryCodes) {
            return null;
        }

        // Compare recovery code with hashed recovery codes
        for (const code of row.recoveryCodes) {
            const isMatch = await verifyRecoveryCode(recoveryCode, code);
            if (isMatch) return row.id;
        }

        return null;
    } catch (err) {
        console.error('Failed to check email by recovery code:', err);
        return null;
    }
}


export const accountRecover = async(userId:string, email:string, password:string):Promise<void> => {
    try{
        // Get arrays of old emails and passwords
        const oldPasswords = await db.select({
            previousPasswords: users.previousPasswords,
        }).from(users).where(eq(users.id, userId));

        const oldEmails = await db.select({
            previousEmails: users.previousEmails,
        }).from(users).where(eq(users.id, userId));

    
        // Add new email and password to the arrays
        const updatedPreviousPasswords = [...(oldPasswords[0]?.previousPasswords || []), password];
        const updatedPreviousEmails = [...(oldEmails[0]?.previousEmails || []), email];

        // Update the user's email, password, previous emails, and previous passwords
        await db.update(users)
            .set({
                email: email,
                password: password,
                previousEmails: updatedPreviousEmails,
                previousPasswords: updatedPreviousPasswords,
            })
            .where(eq(users.id, userId));

        // Delete all sessions for this user
        await db.delete(sessions).where(eq(sessions.userId, userId));
    }
    catch(err){
        console.error('Failed to recover account', err);
    }
}