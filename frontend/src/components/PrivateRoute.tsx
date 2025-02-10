// This protects the routes that require authentication. If the user is not authenticated, they will be redirected to the login page.
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth.ts";
import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: ReactNode }) {

    const {data: user, isLoading} = useAuth();

    if(isLoading) {
        return <div className="bg-background min-h-screen flex justify-center items-center">Loading...</div>
    }

    return user ? children : <Navigate to="/login" />;
}
