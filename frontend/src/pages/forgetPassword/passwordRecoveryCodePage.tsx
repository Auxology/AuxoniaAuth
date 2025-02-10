import {Link, useNavigate} from "react-router-dom";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/./card.tsx";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp.tsx";
import {Button} from "@/components/ui/button.tsx";
import {axiosInstance} from "@/lib/axios.ts";
import {useMutation} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast.ts";
import {AxiosError} from "axios";


export default function PasswordRecoveryCodePage() {
    const navigate = useNavigate();

    const FormSchema = z.object({
        pin: z.string().min(6, {
            message: "Your one-time password must be 6 characters.",
        }),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    const verifyCode = async (pin: string) => {
        const response = await axiosInstance.post("auth/forgot-password/code", {code: pin})

        return response.data
    }

    const resendCode = async () => {
        await axiosInstance.post("auth/forget-password/resend")
    }

    const mutate = useMutation({
        mutationFn: verifyCode,
        onSuccess: () => {
            toast({
                title: "Success",
            })
            setTimeout(() => {
                navigate("/reset-password")
            }, 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status,
                variant: "destructive",
            })
        }
    })

    const resendMutation = useMutation({
        mutationFn: resendCode,
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Code resent successfully.",
            })
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status,
                variant: "destructive",
            })
        }
    })

    function onSubmit(values: z.infer<typeof FormSchema>) {
        mutate.mutate(values.pin)
    }

    function resend() {
        resendMutation.mutate()
    }

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

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                                >
                                    Submit
                                </Button>

                                <div className="flex justify-center">
                                    <Link
                                        to="/forgot-password"
                                        className="text-paragraph hover:text-headline transition-colors"
                                    >
                                        Back
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}