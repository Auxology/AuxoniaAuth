// This is a custom hook that fetches the temporary session data from the backend.
// If user is not logged in, it will return null.
// used in "@components/PublicRoute.tsx"
import {useQuery} from "@tanstack/react-query";
import {axiosInstance} from "@/lib/axios.ts";

export const useTemporarySession = () => {
    return useQuery({
        queryKey: ['temporary-session'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("auth/temporary-session")
                return await response.data;
            }
            catch {
                return null;
            }
        },
    })
}