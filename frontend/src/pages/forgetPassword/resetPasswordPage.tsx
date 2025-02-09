import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {axiosInstance} from "@/lib/axios.ts";
import {useMutation} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast.ts";
import {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";

export default function ResetPasswordPage() {

    const navigate = useNavigate()

    const formSchema = z.object({
        password: z.string().min(8, {message: "Password is too short"}),
        confirmPassword: z.string().min(8, {message: "Password is too short"}),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const resetPassword = async (data: z.infer<typeof formSchema>) => {
        const response = await axiosInstance.post("/auth/reset-password", data);

        return response.data;
    }

    const mutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password reset successfully.",
            });
            setTimeout(() => {
                navigate("/login");
            }, 0);
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.statusText,
                variant: "destructive",
            });
        }
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        mutation.mutate(data);
    }

    return (
        <div className="bg-background flex flex-col items-center justify-center h-screen">

            <Card className="w-[40vh] space-y-2">

                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Reset Password</Button>
                        </form>
                    </Form>
                </CardContent>

            </Card>

        </div>
    )
}