import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {InputOTP, InputOTPSlot, InputOTPGroup} from "@/components/ui/input-otp.tsx";
import {toast} from "@/hooks/use-toast.ts";

import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {useMutation} from "@tanstack/react-query";
import { useNavigate} from "react-router-dom";
import {axiosInstance} from "@/lib/axios.ts";
import { AxiosError } from "axios";


const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})



export default function VerifyEmailPage() {

    const navigate = useNavigate();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    const verifyEmail = async (pin: string) => {
        const response = await axiosInstance.post("/auth/verify-email", {code: pin});
        return response.data;
    }

    const resendEmailVerificationCode = async () => {
        const response = await axiosInstance.post("/auth/verify-email/resend");
        return response.data;
    }

    const mutation = useMutation({
        mutationFn: verifyEmail,
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
        mutationFn: resendEmailVerificationCode,
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

    function onSubmit(values: z.infer<typeof FormSchema>) {
        mutation.mutate(values.pin)
    }

    function resend() {
        resendMutation.mutate()
    }

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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-headline">Code</FormLabel>
                                        <FormControl>
                                            <InputOTP
                                                maxLength={6}
                                                className="gap-2"
                                                {...field}
                                            >
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
                                        <FormDescription className="space-y-2">
                                            <p className="text-paragraph">
                                                Please enter the 6-digit code sent to your email.
                                            </p>
                                            <Button
                                                onClick={resend}
                                                type="button"
                                                variant="link"
                                                className="text-paragraph hover:text-headline transition-colors p-0"
                                            >
                                                Resend code
                                            </Button>
                                        </FormDescription>
                                        <FormMessage className="text-button"/>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                            >
                                Verify Email
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}