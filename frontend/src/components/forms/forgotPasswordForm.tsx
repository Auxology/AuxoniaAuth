import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmailFormData, emailSchema } from "@/lib/schemas"

interface ForgotPasswordFormProps {
    onSubmit: (data: EmailFormData) => void
    isLoading?: boolean
}

export function ForgotPasswordForm({ onSubmit, isLoading }: ForgotPasswordFormProps) {
    const form = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    })

    return (
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
                                    disabled={isLoading}
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
                    disabled={isLoading}
                >
                    Reset Password
                </Button>
            </form>
        </Form>
    )
}