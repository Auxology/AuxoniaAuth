import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { axiosInstance } from "@/lib/axios"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import { emailSchema } from "@/lib/schemas"

const newEmailSchema = z.object({
    email: emailSchema.shape.email,
    confirmEmail: emailSchema.shape.email
}).refine((data) => data.email === data.confirmEmail, {
    message: "Emails do not match",
    path: ["confirmEmail"]
})

type NewEmailFormData = z.infer<typeof newEmailSchema>

export default function NewEmailPage() {
    const navigate = useNavigate()

    const form = useForm<NewEmailFormData>({
        resolver: zodResolver(newEmailSchema),
        defaultValues: {
            email: "",
            confirmEmail: ""
        }
    })

    const mutation = useMutation({
        mutationFn: async (data: NewEmailFormData) => {
            const response = await axiosInstance.post("/auth/account-recovery/new-email", {
                email: data.email
            })
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Code has been sent to your new email",
            })
            setTimeout(() => navigate("/recovery/new-email/code"), 0)
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Error",
                description: error.response?.status === 409 ? "Email can not be same as current one" : "An error occurred",
                variant: "destructive"
            })
        }
    })

    function onSubmit(data: NewEmailFormData) {
        mutation.mutate(data)
    }

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        New Email Address
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Enter your new email address. This will be used for all future communications
                        and account recovery.
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
                                        <FormLabel className="text-headline">New Email</FormLabel>
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
                                name="confirmEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-headline">Confirm New Email</FormLabel>
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

                            <Button
                                type="submit"
                                className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                                disabled={mutation.isPending}
                            >
                                Update Email
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}