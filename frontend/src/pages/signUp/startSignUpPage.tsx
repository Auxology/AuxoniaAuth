import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { EmailForm } from "@/components/forms/emailForm"
import type { StartSignUpSchema } from "@/lib/schemas"

export default function StartSignUpPage() {
    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: async (data: StartSignUpSchema) => {
            const response = await axiosInstance.post("/auth/signup", data)
            return response.data
        },
        onMutate: () => {
            toast({
                title: "Creating account",
                description: "Setting up your new account...",
            })
        },
        onSuccess: () => {
            toast({
                title: "Verify your email",
                description: "We've sent a verification code to your email.",
            })
            setTimeout(() => navigate("/signup/code"), 0)
        },
        onError: (error: AxiosError) => {
            const errorMessages = {
                409: "This email is already registered",
                429: "Please wait before trying again",
            }
            toast({
                title: "Sign up failed",
                description: errorMessages[error.response?.status as keyof typeof errorMessages] || "Unable to create account",
                variant: "destructive"
            })
        }
    })

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Sign Up
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Enter your email to start your journey.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <EmailForm onSubmit={(values) => mutation.mutate(values)} />
                </CardContent>

                <CardFooter className="justify-center">
                    <Link
                        to="/login"
                        className="text-paragraph hover:text-headline transition-colors text-sm"
                    >
                        Already have an account? Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}