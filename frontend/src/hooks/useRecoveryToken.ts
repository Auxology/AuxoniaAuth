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

export const useFinishRecoveryToken = () => {
    return useQuery({
        queryKey: ['account-recovery/finish'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("/auth/account-recovery/finish/check")
                return await response.data;
            }
            catch {
                return null;
            }
        },
    })
}