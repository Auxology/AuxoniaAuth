import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { FinishSignUpForm } from "@/components/forms/finishSignUpForm"
import type { FinishSignUpFormData } from "@/lib/schemas"

export default function FinishSignUpPage() {
    const mutation = useMutation({
        mutationFn: async(values: FinishSignUpFormData) => {
            const response = await axiosInstance.post("/auth/finish-signup", values)
            return response.data
        },
        onMutate: () => {
            toast({
                title: "Processing",
                description: "Please wait...",
            })
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Account created successfully.",
            })
            window.location.href = '/login'
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 409 ? "Username is already used" : "An error occurred",
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
                        Complete your account setup
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <FinishSignUpForm onSubmit={(values) => mutation.mutate(values)} />
                </CardContent>
            </Card>
        </div>
    )
}