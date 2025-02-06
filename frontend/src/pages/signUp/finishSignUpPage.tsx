import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card'
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {finishSignUpSchema} from "@/lib/schemas";
import {Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {axiosInstance} from "@/lib/axios.ts";
import {useMutation} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast";
import {useNavigate} from "react-router-dom";
import {AxiosError} from "axios";

export default function FinishSignUpPage() {

    const navigate = useNavigate()

    const form = useForm<z.infer<typeof finishSignUpSchema>>({
        resolver: zodResolver(finishSignUpSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    const finishSignUp = async (values: z.infer<typeof finishSignUpSchema>) => {
        const response = await axiosInstance.post("/auth/finish-signup", values)
        return response.data
    }

    const mutation = useMutation({
        mutationFn: finishSignUp,
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
                description: "Account created successfully.",
            });
            // Ensure state updates before navigation
            setTimeout(() => {
                navigate("/login");
            }, 0);
        },
        onError: (error: AxiosError) => {
            if (error.status === 409) {
                toast({
                    title: "Error",
                    description: "Username is already in use.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: "An error occurred.",
                    variant: "destructive"
                });
            }
        }
    });

    function onSubmit(values: z.infer<typeof finishSignUpSchema>) {
        mutation.mutate(values)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">

            <Card className="w-[40vh] space-y-2">
                    <CardHeader className="text-center gap-2">
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>Finish Sign Up</CardDescription>
                    </CardHeader>

                    <CardContent>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="shadcn" {...field} />
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

                                <Button type="submit">Submit</Button>
                            </form>
                        </Form>

                    </CardContent>
            </Card>

        </div>
    )
}