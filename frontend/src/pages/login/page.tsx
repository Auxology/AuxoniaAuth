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
            toast({
                title: "Error",
                description: error.response?.statusText || "An error occurred.",
                variant: "destructive"
            })
        },
    });

    function onSubmit(values: z.infer<typeof loginSchema>) {
        mutation.mutate(values)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Login
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Login to continue your journey.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-headline">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="johndoe@example.com"
                                                className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-button"/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-headline">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="********"
                                                className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            <Link
                                                to="/forgot-password"
                                                className="text-paragraph hover:text-headline transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
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
                                    Login
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="justify-center">
                    <Link
                        to="/"
                        className="text-paragraph hover:text-headline transition-colors text-sm"
                    >
                        Don't have an account? Sign Up
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}