// This function is used to check if the forgot password session is still valid or not.
// This function is used inside "@components/PublicRoute" to redirect the user to the correct page.
import {useQuery} from "@tanstack/react-query";
import {axiosInstance} from '@/lib/axios';


export const useForgotPasswordSession = () => {
    return useQuery({
        queryKey: ['forgot-password-session'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("auth/reset-password/check")
                return await response.data;
            }
            catch {
                return null;
            }
        },
    })
}