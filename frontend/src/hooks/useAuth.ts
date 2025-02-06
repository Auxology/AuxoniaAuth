// This is a custom hook that checks if the user is authenticated or not. It uses the useQuery hook from react-query to make a request to the server to check if the user is authenticated. If the user is authenticated, it returns the user object, otherwise it returns null. The staleTime and gcTime options are set to 5 minutes to refetch the data after 5 minutes.
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
    return useQuery({
        queryKey: ['auth'],
        queryFn: async () => {
            try{
                const response = await axiosInstance.get("/auth/is-authenticated")

                return response.data;
            }
            catch(err) {
                return null;
            }
        },
    })
}

