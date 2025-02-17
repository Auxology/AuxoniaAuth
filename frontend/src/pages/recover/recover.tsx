import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { axiosInstance } from "@/lib/axios.ts";
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';

export default function FinishRecoveryPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState("");

    const passwordRequirements = [
        { regex: /.{8,}/, label: "At least 8 characters" },
        { regex: /[A-Z]/, label: "One uppercase letter" },
        { regex: /[a-z]/, label: "One lowercase letter" },
        { regex: /[0-9]/, label: "One number" },
        { regex: /[\W_]/, label: "One special character" },
    ];

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: ResetPasswordFormData) => {
            const response = await axiosInstance.post('/auth/account-recovery/finish', {
                password: data.password
            });
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "Account recovery successful",
                description: "You can now log in with your new credentials",
            });
            navigate('/login');
        },
        onError: (error) => {
            toast({
                title: "Password reset failed",
                description: "Please try again",
                variant: "destructive",
            });
            console.error('Password reset failed:', error);
        }
    });

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        resetPasswordMutation.mutate(data);
    };

    return (
        <div className="bg-background min-h-screen flex justify-center items-center text-headline">
            <Card className="w-[40vh] space-y-2 border-paragraph/20 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center gap-2">
                    <CardTitle className="text-headline text-2xl font-bold">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-paragraph">
                        Please enter your new password
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                                {...field}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    field.onChange(e);
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
                                disabled={resetPasswordMutation.isPending}
                            >
                                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}