// Those are all the functions related to user

import {prisma} from "../libs/prisma.js";

// This is function used to create user
export const createUser = async (email: string, password: string, username:string): Promise<void> => {
    try {
        await prisma.user.create({
            data: {
                email: email,
                password: password,
                username: username
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


export interface User {
    id: string;
    email: string;
    username: string;
}