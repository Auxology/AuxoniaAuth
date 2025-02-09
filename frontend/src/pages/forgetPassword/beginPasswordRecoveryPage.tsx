import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from "@/components/ui/card.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {axiosInstance} from "@/lib/axios.ts";
import {useMutation} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast.ts";
import {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";

export default function ForgotPasswordPage() {

    const navigate = useNavigate();

    const formSchema = z.object({
        email: z.string().email().min(2, {message: "Email is too short"}),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const beginPasswordRecovery = async (email: string) => {
        const response = await axiosInstance.post("/auth/forgot-password", {email});

        return response.data;
    }

    const mutation = useMutation({
        mutationFn: beginPasswordRecovery,
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password reset code sent to email.",
            });
            setTimeout(() => {
                navigate("/forgot-password/code");
            }, 0);
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.statusText,
                variant: "destructive",
            });
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values.email);
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">

            <Card className="w-[40vh] space-y-2">

                <CardHeader className="text-center gap-2">
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>Enter your email to reset your password.</CardDescription>
                </CardHeader>

                <CardContent>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">Reset Password</Button>
                        </form>
                    </Form>

                </CardContent>

                <CardFooter>
                    <a href="/login" className="text-center text-sm text-gray-600">Remembered your password? Login</a>
                </CardFooter>

            </Card>

        </div>
    )
}