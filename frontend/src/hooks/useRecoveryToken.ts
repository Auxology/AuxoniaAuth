import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export const useRecoveryToken = () => {
    return useQuery({
        queryKey: ['account-recovery'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("/auth/account-recovery/check")
                return await response.data;
            }
            catch {
                return null;
            }
        },
    })
}