import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FinishSignUpFormData, finishSignUpSchema } from "@/lib/schemas"

interface FinishSignUpFormProps {
    onSubmit: (data: FinishSignUpFormData) => void
}

export function FinishSignUpForm({ onSubmit }: FinishSignUpFormProps) {
    const form = useForm<FinishSignUpFormData>({
        resolver: zodResolver(finishSignUpSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-headline">Username</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="johndoe"
                                    className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-paragraph">
                                This is your public display name.
                            </FormDescription>
                            <FormMessage className="text-button"/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-headline">Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="********"
                                    className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-paragraph">
                                Password must be at least 8 characters long.
                            </FormDescription>
                            <FormMessage className="text-button"/>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                >
                    Complete Sign Up
                </Button>
            </form>
        </Form>
    )
}