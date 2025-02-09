// This is public route

import React from "react";
import {useAuth} from "@/hooks/useAuth";
import {useForgotPasswordCookie, useVerifyEmailCookie} from "@/hooks/useEmailCookie.ts";
import { Navigate, useLocation } from "react-router-dom";
import {useTemporarySession} from "@/hooks/useTemporarySession.ts";
import {useForgotPasswordSession} from "@/hooks/useForgotPasswordSession.ts";

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

export function ForgotPasswordCookie({ children }: { children: React.ReactNode }) {
    const {data: user, isLoading} = useForgotPasswordCookie();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    if(!user) {
        return <Navigate to="/forgot-password" />
    }

    return <>{children}</>
}

export function TemporaryPublicRoute({ children }: { children: React.ReactNode }) {
    const {data: email, isLoading} = useTemporarySession();
    const location = useLocation();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    if(!email && location.pathname === '/signup/finish') {
        return <Navigate to="/" />
    }

    if(email && location.pathname !== '/signup/finish') {
        return <Navigate to="/signup/finish" />
    }

    return <>{children}</>
}


export function ForgetPasswordProtection({ children }: { children: React.ReactNode }) {
    const {data: user, isLoading} = useForgotPasswordSession();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    if(!user) {
        return <Navigate to="/forgot-password" />
    }

    return <>{children}</>
}