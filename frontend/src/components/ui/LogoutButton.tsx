// This button used to log out the user

import { axiosInstance } from "@/lib/axios.ts";
import { Button } from "./button.tsx";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast.ts";

export default function LogoutButton() {

    const handleLogout :() => Promise<void> = async():Promise<void> => {
        await axiosInstance.post("/auth/logout")
    }

    const mutation = useMutation({
        mutationFn: handleLogout,
        onSuccess: () => {
            window.location.reload()
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to log out",
            })
        }
    })

    function logout() {
        mutation.mutate()
    }

    return (
        <Button 
            onClick={logout}
            variant="outline"
            className="bg-background border-paragraph/20 text-paragraph hover:text-headline hover:bg-background/80 transition-colors"
        >
            Logout
        </Button>
    )
}