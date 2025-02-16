import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"

const recoverySchema = z.object({
    email: z.string().email("Please enter a valid email"),
    code: z.string().length(10, "Recovery code must be 8 characters")
})

type RecoveryFormData = z.infer<typeof recoverySchema>

export default function StartRecoveryPage() {
    const navigate = useNavigate()

    const form = useForm<RecoveryFormData>({
        resolver: zodResolver(recoverySchema),
        defaultValues: {
            email: "",
            code: ""
        }
    })

    const mutation = useMutation({
        mutationFn: async (data: RecoveryFormData) => {
            const response = await axiosInstance.post("/auth/account-recovery", data)
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Account recovery started",
            })
            setTimeout(() => navigate("/recovery/new-email"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 409 ? "Invalid recovery code" : "An error occurred",
                variant: "destructive"
            })
        }
    })

    function onSubmit(data: RecoveryFormData) {
        mutation.mutate(data)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Account Recovery
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Each account has recovery codes that are associated with it.
                        You should enter recovery code of your choice and email that is
                        associated with your account.This means that previous email can
                        also be used to recover account.
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
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-headline">Recovery Code</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={10} className="gap-2" {...field}>
                                                <InputOTPGroup>
                                                    {[...Array(10)].map((_, i) => (
                                                        <InputOTPSlot
                                                            key={i}
                                                            index={i}
                                                            className="border-paragraph/20 text-headline bg-background/50"
                                                        />
                                                    ))}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage className="text-button"/>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                                disabled={mutation.isPending}
                            >
                                Recover Account
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}