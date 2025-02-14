import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card'
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { AxiosError } from "axios"
import { FinishSignUpForm } from "@/components/forms/finishSignUpForm"
import type { FinishSignUpFormData } from "@/lib/schemas"
import { useState } from "react"
import {Button} from "@/components/ui/button.tsx";

export default function FinishSignUpPage() {

    const [finished, setFinished] = useState(false)
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])

    const mutation = useMutation({
        mutationFn: async(values: FinishSignUpFormData) => {
            const response = await axiosInstance.post("/auth/finish-signup", values)

            setRecoveryCodes(response.data.recoveryCodes)

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
            setFinished(true)
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
            {!finished ? (
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
            ) : (
                <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                    <CardHeader className="text-center gap-2">
                        <CardTitle className="text-headline text-2xl font-bold">
                            Recovery Codes
                        </CardTitle>
                        <CardDescription className="text-paragraph">
                            Save these codes in a safe place. You won't see them again!
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="mt-4 space-y-3">
                            {recoveryCodes.map((code, index) => (
                                <div
                                    key={index}
                                    className="p-2 text-headline bg-background/80 rounded border border-paragraph/20 font-mono text-center"
                                >
                                    {code}
                                </div>
                            ))}
                        </div>

                    </CardContent>

                    <CardFooter className="flex justify-center">
                        <Button onClick={() => window.location.href = "/login"}>Login</Button>
                    </CardFooter>



                </Card>
            )}
        </div>
    )
}