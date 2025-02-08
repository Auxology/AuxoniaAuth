import {CardTitle, Card, CardHeader, CardDescription, CardContent, CardFooter} from "@/components/ui/card.tsx";
import {Link, useNavigate} from "react-router-dom";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {axiosInstance} from "@/lib/axios.ts";
import {useMutation} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast.ts";
import {AxiosError} from "axios";


export default function LoginPage() {
    const navigate = useNavigate()

    const loginSchema = z.object({
        email: z.string().email().min(2, {message: "Email is too short"}),
        password: z.string().min(8, {message: "Password is too short"}),
    })

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const login = async (values: z.infer<typeof loginSchema>) => {
        const response = await axiosInstance.post("/auth/login", values)
        return response.data
    }

    const mutation = useMutation({
        mutationFn: login,
        onMutate: () => {
            // Show loading state
            toast({
                title: "Processing",
                description: "Please wait...",
            });
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Logged in successfully.",
            });
            // Ensure state updates before navigation
            setTimeout(() => {
                navigate("/dashboard");
            }, 0);
        },
        onError: (error: AxiosError) => {
            if (error.status === 401) {
                toast({
                    title: "Error",
                    description: "Invalid email or password.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: "An error occurred.",
                    variant: "destructive"
                });
            }
        },
    });

    function onSubmit(values: z.infer<typeof loginSchema>) {
        mutation.mutate(values)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">

            <Card className="w-[40vh] space-y-2">

                <CardHeader className="text-center gap-2">
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Login to continue your journey.</CardDescription>
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
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Password must be at least 8 characters long.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">Login</Button>
                        </form>
                    </Form>

                </CardContent>

                <CardFooter>
                    <Link to="/" className="text-center">Don't have an account? Sign Up</Link>
                </CardFooter>

            </Card>

        </div>
    )
}