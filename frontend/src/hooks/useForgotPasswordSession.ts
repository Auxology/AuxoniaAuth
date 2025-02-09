import {useQuery} from "@tanstack/react-query";
import { axiosInstance } from '@/lib/axios';


export const useForgotPasswordSession = () => {
    return useQuery({
        queryKey: ['forgot-password-session'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("auth/reset-password/check")
                const data = await response.data;

                return data;
            }
            catch(err) {
                return null;
            }
        },
    })
}