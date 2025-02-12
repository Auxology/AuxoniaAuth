import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { ResetPasswordForm } from "@/components/forms/resetPasswordForm"
import type { ResetPasswordFormData } from "@/lib/schemas"

export default function ResetPasswordPage() {
    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: async (data: ResetPasswordFormData) => {
            const response = await axiosInstance.post("/auth/reset-password", data)
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password reset successfully.",
            })
            setTimeout(() => navigate("/login"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.statusText || "An error occurred",
                variant: "destructive",
            })
        }
    })

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ResetPasswordForm
                        onSubmit={(values) => mutation.mutate(values)}
                        isLoading={mutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}