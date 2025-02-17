import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/schemas"
import { useState } from "react"
import { CheckIcon, XIcon } from "lucide-react"

interface ResetPasswordFormProps {
    onSubmit: (data: ResetPasswordFormData) => void
    isLoading?: boolean
}

export function ResetPasswordForm({ onSubmit, isLoading }: ResetPasswordFormProps) {
    const [password, setPassword] = useState("")
    
    const passwordRequirements = [
        { regex: /.{8,}/, label: "At least 8 characters" },
        { regex: /[A-Z]/, label: "One uppercase letter" },
        { regex: /[a-z]/, label: "One lowercase letter" },
        { regex: /[0-9]/, label: "One number" },
        { regex: /[\W_]/, label: "One special character" },
    ]

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
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        field.onChange(e)
                                    }}
                                />
                            </FormControl>
                            <div className="space-y-2 mt-2">
                                {passwordRequirements.map((requirement, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        {requirement.regex.test(password) ? (
                                            <CheckIcon className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XIcon className="w-4 h-4 text-button" />
                                        )}
                                        <span className={`${
                                            requirement.regex.test(password) 
                                                ? "text-green-500" 
                                                : "text-paragraph"
                                        }`}>
                                            {requirement.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
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