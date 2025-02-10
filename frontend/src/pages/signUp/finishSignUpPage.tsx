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
import {AxiosError} from "axios";

export default function FinishSignUpPage() {


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
            window.location.href = '/login'
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 409 ? "Username is already used" : "An error occurred",
                variant: "destructive"
            })
        }
    });

    function onSubmit(values: z.infer<typeof finishSignUpSchema>) {
        mutation.mutate(values)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Sign Up
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Complete your account setup
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-headline">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="johndoe"
                                                className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-paragraph">
                                            This is your public display name.
                                        </FormDescription>
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
                                        <FormDescription className="text-paragraph">
                                            Password must be at least 8 characters long.
                                        </FormDescription>
                                        <FormMessage className="text-button"/>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                            >
                                Complete Sign Up
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}