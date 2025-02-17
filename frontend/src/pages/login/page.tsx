import { CardTitle, Card, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { AxiosError } from "axios"
import { axiosInstance } from "@/lib/axios"
// Import LoginForm component
import { LoginForm } from "@/components/forms/LoginForm"
// Import LoginFormData type
import { LoginFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const navigate = useNavigate()

    // Define mutation(function) to login
    const mutation = useMutation({
        mutationFn: async (values: LoginFormData) => {
            const response = await axiosInstance.post("/auth/login", values)
            return response.data
        },
        onMutate: () => {
            toast({
                title: "Logging in",
                description: "Please wait...",
            })
        },
        onSuccess: () => {
            toast({
                title: "Welcome back!",
                description: "Successfully logged into your account.",
            })
            setTimeout(() => navigate("/dashboard"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Login failed",
                description: error.response?.status === 401 ? "Invalid credentials" : "An error occurred during login",
                variant: "destructive"
            })
        },
    })

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">Login</CardTitle>
                    <CardDescription className="text-paragraph">
                        Login to continue your journey.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <LoginForm onSubmit={(values) => mutation.mutate(values)} />
                </CardContent>

                <CardFooter className="justify-center flex flex-col gap-6">
                    <Link
                        to="/"
                        className="text-paragraph hover:text-headline transition-colors text-sm"
                    >
                        Don't have an account? Sign Up
                    </Link>
                    <Link
                        to="/forgot-password"
                        className="text-paragraph hover:text-headline transition-colors text-sm"
                    >  
                        Forgot your password?
                    </Link>
                    <Link
                        to="/recovery"
                        className="text-paragraph hover:text-headline transition-colors text-sm"
                    >
                        Recover your account
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}