import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { OTPForm } from "@/components/forms/otpForm"
import type { VerifyEmailFormData } from "@/lib/schemas"
import { useState } from "react"

export default function VerifyEmailPage() {
    const navigate = useNavigate()
    const [isResendDisabled, setIsResendDisabled] = useState(false)
    const [timer, setTimer] = useState(0)

    const verifyMutation = useMutation({
        mutationFn: async (data: VerifyEmailFormData) => {
            const response = await axiosInstance.post("/auth/verify-email", { code: data.pin })
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Email verified",
                description: "Your email has been successfully verified.",
            })
            setTimeout(() => navigate("/signup/finish"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Verification failed",
                description: error.response?.status === 409 ? "Invalid verification code" : "Unable to verify email",
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
                title: "Code resent",
                description: "A new verification code has been sent to your email.",
            })
            setIsResendDisabled(true)
            setTimer(60)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Resend failed",
                description: error.response?.status === 429 ? "Please wait before requesting a new code" : "Unable to send new code",
                variant: "destructive"
            })
        }
    })

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Verify Email
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Enter the verification code sent to your email.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <OTPForm 
                        onSubmit={(values) => verifyMutation.mutate(values)}
                        onResend={() => !isResendDisabled && resendMutation.mutate()}
                        isLoading={verifyMutation.isPending || resendMutation.isPending}
                        disableResend={isResendDisabled}
                        timer={timer}
                    />
                </CardContent>
            </Card>
        </div>
    )
}