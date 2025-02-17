// This is public route

import React from "react";
import {useAuth} from "@/hooks/useAuth";
import {useForgotPasswordCookie, useVerifyEmailCookie} from "@/hooks/useEmailCookie.ts";
import { Navigate, useLocation } from "react-router-dom";
import {useTemporarySession} from "@/hooks/useTemporarySession.ts";
import {useForgotPasswordSession} from "@/hooks/useForgotPasswordSession.ts";
import {useFinishRecoveryToken, useRecoveryToken} from "@/hooks/useRecoveryToken.ts";

// This route is for public pages like login, signup, forgot password, etc
// If user is logged in, it will redirect to /dashboard
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

// This protects /forgot-password/code page from user which have not started the forgot password process
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

// This is safe point function for temporary session
// If user has temporary session(meaning user has already verified email but not completed signup process),
// They will be redirected to /signup/finish page
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


// This is not a safe point similar to TemporaryPublicRoute
// It just check if user has "forgot" password session or not
// If user has "forgot" password session, they will be redirected to /forgot-password page
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

export function AccountRecoveryProtection({ children }: { children: React.ReactNode }) {
    const {data: user, isLoading} = useRecoveryToken();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    if(!user) {
        return <Navigate to="/recovery" />
    }

    return <>{children}</>
}

export function AccountRecoveryFinishProtection({ children }: { children: React.ReactNode }) {
    const {data: user, isLoading} = useFinishRecoveryToken();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    if(!user) {
        return <Navigate to="/recovery" />
    }

    return <>{children}</>
}