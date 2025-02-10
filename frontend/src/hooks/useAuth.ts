// This is hook which check if user is signed in or not.
// It used inside "@components/PublicRoute.tsx"
// This also used "@components/PrivateRoute.tsx
// If user is signed in they will be able to access the protected routes and also get the user data.
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
    return useQuery({
        queryKey: ['auth'],
        queryFn: async () => {
            try {
                const [authResponse, userDataResponse] = await Promise.all([
                    axiosInstance.get("/auth/is-authenticated"),
                    axiosInstance.get('/auth/user-data')
                ]);

                return {
                    isAuthenticated: authResponse.data,
                    user: userDataResponse.data.user
                };
            }
            catch {
                return null;
            }
        },
    })
}