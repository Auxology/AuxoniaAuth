import {Link, useNavigate} from "react-router-dom";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/./card.tsx";
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
    
    function onSubmit(values: z.infer<typeof FormSchema>) {
        mutate.mutate(values.pin)
    }
    
    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">

            <Card className="w-[40vh] space-y-2">

                <CardHeader className="text-center gap-2">
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>Enter the code sent to your email.</CardDescription>
                </CardHeader>

                <CardContent>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                        <FormDescription>
                                            Please enter the 6-digit code sent to your email.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <Button type="submit" className="w-full">
                                Submit
                            </Button>

                            <CardFooter className="text-center">
                                <Link className="text-center" to="/forgot-password">Back</Link>
                            </CardFooter>

                        </form>
                    </Form>


                </CardContent>

            </Card>
            
        </div>
    )
}