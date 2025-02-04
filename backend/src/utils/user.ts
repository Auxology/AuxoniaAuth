// Those are all the functions related to user
import type{User} from "../types/types.js";
import {prisma} from "../libs/prisma.js";
import {decrypt} from "./encrypt.js";

// This is function used to create user
export const createUser = async (email: string, password: string, username:string): Promise<void> => {
    try {
        await prisma.user.create({
            data: {
                email: email,
                password: password,
                username: username,
                isVerified: true
            }
        })
    }
    catch(err){
        console.error('Failed to create user', err);
    }
}

// This function used to get user with email and makes sure that only needed information is returned
// For security reasons, you should not return too much information about the user
export const getUserFromEmail = async (email:string): Promise<User | null> => {
    try {
        const row = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id:true,
                email:true,
                username:true
            }
        })

        if(row===null){
            return null;
        }

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
    const row = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            password:true,
        }
    })

    if(row===null){
        throw new Error('User not found');
    }

    return row.password;
}

// This function which resets user password and deletes the session
export const resetUserPassword = async(email:string, password:string):Promise<void> => {
    try{
        const user = await prisma.user.update({
            where: {
                email: email
            },
            data: {
                password: password
            }
        })

        await prisma.session.deleteMany({
            where: {
                userId: user.id
            }
        })
    }
    catch (err) {
        console.error('Failed to reset password', err);
    }
}

export const deleteUser = async (userId:string):Promise<void> => {
    try {
        await prisma.user.delete({
            where: {
                id: userId
            }
        })
    }
    catch(err){
        console.error('Failed to delete user', err);
    }
}

// This user promises full user data
export const getUser = async (userId:string):Promise<User | null> => {
    try{
        const row = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(row===null){
            return null;
        }

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
        const row = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                email:true
            }
        })

        if(row===null){
            return null;
        }

        return row.email;
    }
    catch(err) {
        console.error('Failed to get email from user id', err);
        return null;
    }
}

export const changeUserEmail = async (userId:string, email:string, oldEmail:string):Promise<void> => {
    try{
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                email: email,
                previousEmails: [oldEmail]
            }
        })
    }
    catch(err){
        console.error('Failed to change email', err);
    }
}