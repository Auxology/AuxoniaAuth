import {useQuery} from "@tanstack/react-query";
import {axiosInstance} from "@/lib/axios.ts";

export const useTemporarySession = () => {
    return useQuery({
        queryKey: ['temporary-session'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("auth/temporary-session")
                const data = await response.data;

                return data;
            }
            catch(err) {
                return null;
            }
        },
    })
}