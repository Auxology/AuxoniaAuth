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
        onError: (error) => {
            if (error.response?.status === 409) {
                toast({
                    title: "Error",
                    description: "Invalid Code.",
                })
            }
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
        <main className="bg-background min-h-screen flex justify-center items-center text-headline">

            <Card className="w-[40vh] space-y-2">

                <CardHeader className="text-center gap-2">
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Enter code to verify email.</CardDescription>
                </CardHeader>

                <CardContent className="">

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>

                                        </FormControl>
                                        <button onClick={resend} type="button" className="text-buttonText">Resend code</button>
                                        <FormDescription>
                                            Please enter the 6-digit code sent to your email.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">Submit</Button>

                        </form>
                    </Form>

                </CardContent>

            </Card>

        </main>
    )
}