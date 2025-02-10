// those are the hooks that are used to check if the user has the email cookie or the forgot password cookie
// those hooks are used inside "@components/PublicRoute" to redirect the user to the correct page
import {useQuery} from "@tanstack/react-query";
import {axiosInstance} from "@/lib/axios.ts";


export function useVerifyEmailCookie () {
    return useQuery({
        queryKey: ['verify-email'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("/auth/verify-email/check")
                return response.data;
            }
            catch {
                return null;
            }
        },
    })
}

export function useForgotPasswordCookie () {
    return useQuery({
        queryKey: ['forget-password'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("/auth/forgot-password/check")
                return response.data
            }
            catch {
                return null;
            }
        },
    })
}