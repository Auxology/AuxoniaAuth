import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/schemas"

interface ResetPasswordFormProps {
    onSubmit: (data: ResetPasswordFormData) => void
    isLoading?: boolean
}

export function ResetPasswordForm({ onSubmit, isLoading }: ResetPasswordFormProps) {
    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-headline">Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                    disabled={isLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-button"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-headline">Confirm Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Confirm your password"
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