import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { OTPForm } from "@/components/forms/otpForm"
import type { VerifyEmailFormData } from "@/lib/schemas"

export default function VerifyEmailPage() {
    const navigate = useNavigate()

    const verifyMutation = useMutation({
        mutationFn: async (data: VerifyEmailFormData) => {
            const response = await axiosInstance.post("/auth/verify-email", { code: data.pin })
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Email verified successfully.",
            })
            navigate("/signup/finish")
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.statusText === "Conflict" ? "Invalid Code" : "An error occurred.",
                variant: "destructive"
            })
        }
    })

    const resendMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/auth/verify-email/resend")
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Email verification code sent successfully.",
            })
        },
        onError: () => {
            toast({
                title: "Please retry in 1 minutes",
                description: "Failed to send email verification code.",
            })
        }
    })

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Sign Up
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Enter code to verify email.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <OTPForm 
                        onSubmit={(values) => verifyMutation.mutate(values)}
                        onResend={() => resendMutation.mutate()}
                    />
                </CardContent>
            </Card>
        </div>
    )
}