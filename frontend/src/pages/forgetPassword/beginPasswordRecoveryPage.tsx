import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { AxiosError } from "axios"
import { useNavigate, Link } from "react-router-dom"
import { axiosInstance } from "@/lib/axios"
import { ForgotPasswordForm } from "@/components/forms/forgotPasswordForm"
import { EmailFormData } from "@/lib/schemas"

export default function ForgotPasswordPage() {
    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: async (data: EmailFormData) => {
            const response = await axiosInstance.post("/auth/forgot-password", data)
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Reset initiated",
                description: "Check your email for the password reset code.",
            })
            setTimeout(() => navigate("/forgot-password/code"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Reset failed",
                description: error.response?.status === 404 ? "Email not found" : "Unable to initiate password reset",
                variant: "destructive"
            })
        }
    })

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Forgot Password
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Enter your email to reset your password.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ForgotPasswordForm 
                        onSubmit={(values) => mutation.mutate(values)}
                        isLoading={mutation.isPending}
                    />
                </CardContent>

                <CardFooter className="justify-center">
                    <Link
                        to="/login"
                        className="text-paragraph hover:text-headline transition-colors text-sm"
                    >
                        Remembered your password? Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}