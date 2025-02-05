// This is public route

import React from "react";
import {useAuth} from "@/hooks/useAuth";
import {useVerifyEmailCookie} from "@/hooks/useEmailCookie.ts";
import { Navigate } from "react-router-dom";

export function PublicRoute({ children }: { children: React.ReactNode }) {
    const {data: user, isLoading} = useAuth();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    if(user) {
        return <Navigate to="/dashboard" />
    }

    return <>{children}</>
}

// This protects /signup/code page from user which have not started the signup process
export function VerifyEmailCookie({ children }: { children: React.ReactNode }) {
    const {data: user, isLoading} = useVerifyEmailCookie();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    if(!user) {
        return <Navigate to="/" />
    }

    return <>{children}</>
}