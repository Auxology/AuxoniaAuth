import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import { useState } from "react"

const verifySchema = z.object({
    code: z.string().length(6, "Verification code must be 6 characters")
})

type VerifyFormData = z.infer<typeof verifySchema>

export default function NewEmailVerifyPage() {
    const navigate = useNavigate()
    const [isResendDisabled, setIsResendDisabled] = useState(false)
    const [timer, setTimer] = useState(0)

    const form = useForm<VerifyFormData>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: ""
        }
    })

    const verifyMutation = useMutation({
        mutationFn: async (data: VerifyFormData) => {
            const response = await axiosInstance.post("/auth/account-recovery/new-email/code", data)
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Email verified successfully",
            })
            setTimeout(() => navigate("/recovery/finish"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 409 ? "Invalid verification code" : error.response?.status === 429 ? "Too many attempts, try again later" : "Failed to verify email",
                variant: "destructive"
            })
        }
    })

    const resendMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/auth/account-recovery/resend-code")
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "New verification code sent",
            })
            setIsResendDisabled(true)
            setTimer(60)
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setIsResendDisabled(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to resend verification code",
                variant: "destructive"
            })
        }
    })

    function onSubmit(data: VerifyFormData) {
        verifyMutation.mutate(data)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Verify New Email
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Please enter the verification code that was sent to your new email address.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-headline">Verification Code</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} className="gap-2" {...field}>
                                                <InputOTPGroup>
                                                    {[...Array(6)].map((_, i) => (
                                                        <InputOTPSlot
                                                            key={i}
                                                            index={i}
                                                            className="border-paragraph/20 text-headline bg-background/50"
                                                        />
                                                    ))}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage className="text-button"/>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                                    disabled={verifyMutation.isPending}
                                >
                                    Verify Email
                                </Button>
                                
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full bg-transparent border-transparent text-paragraph "
                                    disabled={isResendDisabled || resendMutation.isPending}
                                    onClick={() => resendMutation.mutate()}
                                >
                                    {isResendDisabled 
                                        ? `Resend code in ${timer}s` 
                                        : "Resend code"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}