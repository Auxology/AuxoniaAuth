// This where user will start the signup process

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import {z} from "zod"
import {emailSchema} from "@/lib/schemas.ts";

import {Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useMutation} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast.ts";
import {useNavigate} from "react-router-dom";
import {axiosInstance} from "@/lib/axios.ts";
import { AxiosError } from "axios";
import {Link} from "react-router-dom";

export default function StartSignUpPage() {

    const navigate = useNavigate()

    const form = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    })

    const startSignUp = async (email: string) => {
        const response = await axiosInstance.post("/auth/signup", {email: email});
        return response.data;
    }

    const mutation = useMutation({
        mutationFn: startSignUp,
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
                description: "Check your email for the verification code.",
            });
            // Ensure state updates before navigation
            setTimeout(() => {
                navigate("/signup/code");
            }, 0);
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 409 ? "Email is already used" : error.response?.status === 429 ? "To many requests" : "An error occurred",
                variant: "destructive"
            })
        }
    });

    function onSubmit(values: z.infer<typeof emailSchema>) {
        mutation.mutate(values.email)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">

            <Card className="w-[40vh] space-y-2">

                <CardHeader className="text-center gap-2">
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Enter your email to start your journey.</CardDescription>
                </CardHeader>

                <CardContent className="">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe@example.com" {...field} />
                                        </FormControl>
                                        <FormDescription>

                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Button className="w-full" type="submit">Submit</Button>
                        </form>
                    </Form>

                </CardContent>

                <CardFooter>
                    <Link to="/login" className="text-center">Already have an account? Login</Link>
                </CardFooter>


            </Card>

        </div>
    )
}