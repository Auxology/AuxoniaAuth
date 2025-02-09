import {useQuery} from "@tanstack/react-query";
import {axiosInstance} from "@/lib/axios.ts";


// This function check if user has cookie for email verification
export function useVerifyEmailCookie () {
    return useQuery({
        queryKey: ['verify-email'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("/auth/verify-email/check")
                return response.data;
            }
            catch(err) {
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
            catch(err) {
                return null;
            }
        },
    })
}