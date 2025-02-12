import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { VerificationCodeFormData, verificationCodeSchema } from "@/lib/schemas"

interface VerificationCodeFormProps {
    onSubmit: (data: VerificationCodeFormData) => void
    onResend: () => void
    isLoading?: boolean
    backUrl: string
}

export function VerificationCodeForm({ 
    onSubmit, 
    onResend, 
    isLoading,
    backUrl 
}: VerificationCodeFormProps) {
    const form = useForm<VerificationCodeFormData>({
        resolver: zodResolver(verificationCodeSchema),
        defaultValues: {
            pin: "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-headline">Code</FormLabel>
                            <FormControl>
                                <InputOTP maxLength={6} className="gap-2" {...field}>
                                    <InputOTPGroup>
                                        {[...Array(6)].map((_, i) => (
                                            <InputOTPSlot
                                                key={i}
                                                index={i}
                                                className="border-paragraph/20 text-headline bg-background/50"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormDescription className="space-y-2">
                                <p className="text-paragraph">
                                    Please enter the 6-digit code sent to your email.
                                </p>
                                <Button
                                    onClick={onResend}
                                    type="button"
                                    variant="link"
                                    className="text-paragraph hover:text-headline transition-colors p-0"
                                    disabled={isLoading}
                                >
                                    Resend code
                                </Button>
                            </FormDescription>
                            <FormMessage className="text-button"/>
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <Button
                        type="submit"
                        className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                        disabled={isLoading}
                    >
                        Submit
                    </Button>

                    <div className="flex justify-center">
                        <Link
                            to={backUrl}
                            className="text-paragraph hover:text-headline transition-colors"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </form>
        </Form>
    )
}