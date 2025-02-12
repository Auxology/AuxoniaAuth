import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { VerificationCodeForm } from "@/components/forms/verifyForgetPasswordForm"

export default function PasswordRecoveryCodePage() {
    const navigate = useNavigate()

    const verifyMutation = useMutation({
        mutationFn: async (pin: string) => {
            const response = await axiosInstance.post("auth/forgot-password/code", { code: pin })
            return response.data
        },
        onSuccess: () => {
            toast({ title: "Success" })
            setTimeout(() => navigate("/reset-password"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 409 ? "Invalid code" : "An error occurred",
                variant: "destructive",
            })
        }
    })

    const resendMutation = useMutation({
        mutationFn: async () => {
            await axiosInstance.post("auth/forget-password/resend")
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Code resent successfully.",
            })
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 429 ? "Please wait before trying again" : "An error occurred",
                variant: "destructive",
            })
        }
    })

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Forgot Password
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Enter the code sent to your email.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <VerificationCodeForm
                        onSubmit={(values: { pin: string }) => verifyMutation.mutate(values.pin)}
                        onResend={() => resendMutation.mutate()}
                        isLoading={verifyMutation.isPending || resendMutation.isPending}
                        backUrl="/forgot-password"
                    />
                </CardContent>
            </Card>
        </div>
    )
}