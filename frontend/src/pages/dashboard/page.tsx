import LogoutButton from '@/components/ui/LogoutButton.tsx';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {useMutation} from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast.ts";
import {axiosInstance} from "@/lib/axios.ts";
import { AxiosError } from 'axios';

export default function DashboardPage() {
    const { data, isLoading, error } = useAuth();
    const [step, setStep] = useState<'old-email' | 'verify-old' | 'new-email' | 'verify-new' | 'confirm'>('old-email');
    const [passwordStep, setPasswordStep] = useState<'verify-email' | 'change-password'>('verify-email');
    const [passwordCodeTimeout, setPasswordCodeTimeout] = useState(0);
    const [oldEmailCodeTimeout, setOldEmailCodeTimeout] = useState(0);
    const [newEmailCodeTimeout, setNewEmailCodeTimeout] = useState(0);

    useEffect(() => {
        if (passwordCodeTimeout > 0) {
            const timer = setTimeout(() => {
                setPasswordCodeTimeout(passwordCodeTimeout - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [passwordCodeTimeout]);

    useEffect(() => {
        if (oldEmailCodeTimeout > 0) {
            const timer = setTimeout(() => {
                setOldEmailCodeTimeout(oldEmailCodeTimeout - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [oldEmailCodeTimeout]);

    useEffect(() => {
        if (newEmailCodeTimeout > 0) {
            const timer = setTimeout(() => {
                setNewEmailCodeTimeout(newEmailCodeTimeout - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [newEmailCodeTimeout]);

    const verificationSchema = z.object({
        code: z.string().min(6, { message: "Verification code must be 6 characters" }),
    });

    const emailSchema = z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
    });

    const changePasswordSchema = z.object({
        oldPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
        newPassword: z.string()
            .min(8, { message: "Password must be at least 8 characters" })
            .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
            .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
            .regex(/[0-9]/, { message: "Password must contain at least one number" })
            .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    });

    const oldEmailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const newEmailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const oldVerificationForm = useForm<z.infer<typeof verificationSchema>>({
        resolver: zodResolver(verificationSchema),
        defaultValues: { code: "" },
    });

    const newVerificationForm = useForm<z.infer<typeof verificationSchema>>({
        resolver: zodResolver(verificationSchema),
        defaultValues: { code: "" },
    });

    const passwordVerificationForm = useForm<z.infer<typeof verificationSchema>>({
        resolver: zodResolver(verificationSchema),
        defaultValues: { code: "" },
    });

    const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { oldPassword: "", newPassword: "" },
    });

    const oldEmailSendCodeMutation = useMutation({
        mutationFn: async(data: { email: string }) => {
            const response = await axiosInstance.post("/auth/change-email", data)
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Code sent",
                description: "Verification code sent to your current email.",
            })
            setStep('verify-old')
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Failed to send code",
                description: error.response?.status === 429 ? "Please wait before requesting a new code" : "Unable to send verification code",
                variant: "destructive"
            })
        }
    })

    const oldEmailVerifyCodeMutation = useMutation({
        mutationFn: async(data: { code: string }) => {
            const response = await axiosInstance.post("/auth/change-email/code", data);
            return response.data;
        },
        onSuccess() {
            setStep('new-email');
        },
        onError() {
            toast({
                title: "Error",
                description: "Invalid verification code",
            })
        }
    })

    const newEmailSendCodeMutation = useMutation({
        mutationFn: async(data: { email: string }) => {
            const response = await axiosInstance.post("/auth/change-email/new", data);
            return response.data;
        },
        onSuccess() {
            setStep('verify-new');
            setNewEmailCodeTimeout(60);
        },
        onError() {
            toast({
                title: "Error",
                description: "Failed to send verification code",
            })
        }
    });

    const newEmailVerifyCodeMutation = useMutation({
        mutationFn: async(data: { code: string }) => {
            const response = await axiosInstance.post("/auth/change-email/new/verify", data);
            return response.data;
        },
        onSuccess() {
            setStep('confirm');
        },
        onError() {
            toast({
                title: "Error",
                description: "Invalid verification code",
            })
        }
    });

    const changeEmailMutation = useMutation({
        mutationFn: async(data: { email: string }) => {
            const response = await axiosInstance.post("/auth/change-email/finish", data)
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Email updated",
                description: "Your email has been successfully changed.",
            })
            window.location.reload()
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Update failed",
                description: error.response?.status === 409 ? "This email is already in use" : "Unable to update email",
                variant: "destructive"
            })
        }
    })

    const deleteAccountMutation = useMutation({
        mutationFn: async() => {
            await axiosInstance.post("/auth/delete-account");
        },
        onSuccess() {
            window.location.reload();
        },
        onError() {
            toast({
                title: "Error",
                description: "Failed to delete account",
            })
        }
    })

    const passwordSendCodeMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/auth/change-password");
            return response.data;
        },
        onSuccess() {
            setPasswordCodeTimeout(60); // Start the 60 second countdown
        },
        onError() {
            toast({
                title: "Error",
                description: "Failed to send verification code",
            })
        }
    });

    const passwordVerifyCodeMutation = useMutation({
        mutationFn: async (data: { code: string }) => {
            const response = await axiosInstance.post("/auth/change-password/code", data);
            return response.data;
        },
        onSuccess() {
            setPasswordStep('change-password');
        },
        onError() {
            toast({
                title: "Error",
                description: "Invalid verification code",
            })
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: { oldPassword: string, newPassword: string }) => {
            const response = await axiosInstance.post("/auth/change-password/finish", data)
            return response.data
        },
        onSuccess: () => {
            toast({
                title: "Password updated",
                description: "Your password has been successfully changed.",
            })
            window.location.reload()
        },
        onError: (error: AxiosError) => {
            toast({
                title: "Update failed",
                description: error.response?.status === 401 ? "Current password is incorrect" : "Unable to update password",
                variant: "destructive"
            })
        }
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-headline animate-pulse">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="border-paragraph/20 bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-button">Error: {error.message}</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const userInfo = data?.user;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="w-full max-w-4xl space-y-8">
                <div className="flex justify-between items-center px-4">
                    <h1 className="text-4xl font-bold text-headline">Dashboard</h1>
                    <LogoutButton />
                </div>

                {userInfo && (
                    <Card className="border-paragraph/20 bg-background/50 backdrop-blur-sm">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl text-headline">
                                Profile Information
                            </CardTitle>
                            <CardDescription className="text-paragraph">
                                View and manage your account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Username', value: userInfo.username },
                                    { label: 'Email', value: userInfo.email },
                                    { label: 'ID', value: userInfo.id },
                                    { 
                                        label: 'Joined Date', 
                                        value: new Date(userInfo.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                    }
                                ].map(({ label, value }) => (
                                    <div 
                                        key={label} 
                                        className="space-y-2 p-4 rounded-lg bg-paragraph/5 hover:bg-paragraph/10 transition-colors"
                                    >
                                        <p className="text-paragraph text-sm font-medium">{label}</p>
                                        <p className="text-headline text-lg break-all">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-row gap-6">

                                <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="w-full sm:w-auto bg-button hover:bg-button/90 text-buttonText transition-colors"
                                    >
                                        Change Email
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-background border-paragraph/20">
                                    <SheetHeader className="space-y-4">
                                        <SheetTitle className="text-2xl text-headline">
                                            {step === 'old-email' && "Verify Current Email"}
                                            {step === 'verify-old' && "Enter Verification Code"}
                                            {step === 'new-email' && "Enter New Email"}
                                            {step === 'verify-new' && "Verify New Email"}
                                            {step === 'confirm' && "Confirm Email Change"}
                                        </SheetTitle>
                                        <SheetDescription className="text-paragraph">
                                            {step === 'old-email' && "First, let's verify your current email address."}
                                            {step === 'verify-old' && "Enter the verification code sent to your current email."}
                                            {step === 'new-email' && "Enter the new email address you'd like to use."}
                                            {step === 'verify-new' && "Enter the verification code sent to your new email."}
                                            {step === 'confirm' && "Are you sure you want to change your email address?"}
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="space-y-6 py-6">
                                        {step === 'old-email' && (
                                            <Form {...oldEmailForm}>
                                                <form onSubmit={oldEmailForm.handleSubmit((data) => {
                                                    // Send verification code to old email
                                                    oldEmailSendCodeMutation.mutate(data);
                                                })} className="space-y-4">
                                                    <FormField
                                                        control={oldEmailForm.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-headline">Current Email</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your current email"
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
                                                        className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                    >
                                                        Send Verification Code
                                                    </Button>
                                                </form>
                                            </Form>
                                        )}

                                        {step === 'verify-old' && (
                                            <Form {...oldVerificationForm}>
                                                <form onSubmit={oldVerificationForm.handleSubmit((data) => {
                                                    oldEmailVerifyCodeMutation.mutate(data);
                                                })} className="space-y-4">
                                                    <FormField
                                                        control={oldVerificationForm.control}
                                                        name="code"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-headline">Verification Code</FormLabel>
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
                                                                <FormMessage className="text-button"/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <Button 
                                                            type="submit" 
                                                            className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                        >
                                                            Verify Code
                                                        </Button>
                                                        <Button 
                                                            type="button"
                                                            variant="secondary"
                                                            onClick={() => {
                                                                oldEmailSendCodeMutation.mutate({ email: oldEmailForm.getValues().email });
                                                            }}
                                                            disabled={oldEmailCodeTimeout > 0}
                                                            className="w-full bg-paragraph/10 hover:bg-paragraph/20 text-paragraph transition-colors disabled:opacity-50"
                                                        >
                                                            {oldEmailCodeTimeout > 0 
                                                                ? `Resend Code (${oldEmailCodeTimeout}s)` 
                                                                : 'Resend Code'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        )}

                                        {step === 'new-email' && (
                                            <Form {...newEmailForm}>
                                                <form onSubmit={newEmailForm.handleSubmit((data) => {
                                                    // Send email to new email
                                                    newEmailSendCodeMutation.mutate(data);
                                                })} className="space-y-4">
                                                    <FormField
                                                        control={newEmailForm.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-headline">New Email</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your new email"
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
                                                        className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                    >
                                                        Send Verification Code
                                                    </Button>
                                                </form>
                                            </Form>
                                        )}

                                        {step === 'verify-new' && (
                                            <Form {...newVerificationForm}>
                                                <form onSubmit={newVerificationForm.handleSubmit((data) => {
                                                    newEmailVerifyCodeMutation.mutate(data);
                                                })} className="space-y-4">
                                                    <FormField
                                                        control={newVerificationForm.control}
                                                        name="code"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-headline">Verification Code</FormLabel>
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
                                                                <FormMessage className="text-button"/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <Button 
                                                            type="submit" 
                                                            className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                        >
                                                            Verify Code
                                                        </Button>
                                                        <Button 
                                                            type="button"
                                                            variant="secondary"
                                                            onClick={() => {
                                                                newEmailSendCodeMutation.mutate({ email: newEmailForm.getValues().email });
                                                            }}
                                                            disabled={newEmailCodeTimeout > 0}
                                                            className="w-full bg-paragraph/10 hover:bg-paragraph/20 text-paragraph transition-colors disabled:opacity-50"
                                                        >
                                                            {newEmailCodeTimeout > 0 
                                                                ? `Resend Code (${newEmailCodeTimeout}s)` 
                                                                : 'Resend Code'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        )}

                                        {step === 'confirm' && (
                                            <div className="space-y-4">
                                                <p className="text-paragraph">
                                                    Change email from {oldEmailForm.getValues().email} to {newEmailForm.getValues().email}?
                                                </p>
                                                <div className="flex gap-4">
                                                    <Button
                                                        onClick={() => {
                                                            changeEmailMutation.mutate({ email: newEmailForm.getValues().email });
                                                        }}
                                                        className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setStep('old-email');
                                                        }}
                                                        variant="secondary"
                                                        className="w-full bg-paragraph/10 hover:bg-paragraph/20 text-paragraph transition-colors"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="w-full sm:w-auto bg-button hover:bg-button/90 text-buttonText transition-colors"
                                    >
                                        Change Password
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-background border-paragraph/20">
                                    <SheetHeader className="space-y-4">
                                        <SheetTitle className="text-2xl text-headline">
                                            {passwordStep === 'verify-email' ? "Verify Email" : "Change Password"}
                                        </SheetTitle>
                                        <SheetDescription className="text-paragraph">
                                            {passwordStep === 'verify-email' 
                                                ? "First, let's verify your email address."
                                                : "Enter your old password and new password."}
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="space-y-6 py-6">
                                        {passwordStep === 'verify-email' && (
                                            <Form {...passwordVerificationForm}>
                                                <form onSubmit={passwordVerificationForm.handleSubmit((data) => {
                                                    passwordVerifyCodeMutation.mutate(data);
                                                })} className="space-y-4">
                                                    <FormField
                                                        control={passwordVerificationForm.control}
                                                        name="code"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-headline">Verification Code</FormLabel>
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
                                                                <FormMessage className="text-button"/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <Button 
                                                            type="submit" 
                                                            className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                        >
                                                            Verify Code
                                                        </Button>
                                                        <Button 
                                                            type="button"
                                                            variant="secondary"
                                                            onClick={() => {
                                                                passwordSendCodeMutation.mutate();
                                                            }}
                                                            disabled={passwordCodeTimeout > 0}
                                                            className="w-full bg-paragraph/10 hover:bg-paragraph/20 text-paragraph transition-colors disabled:opacity-50"
                                                        >
                                                            {passwordCodeTimeout > 0 
                                                                ? `Resend Code (${passwordCodeTimeout}s)` 
                                                                : 'Send Code'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        )}

                                        {passwordStep === 'change-password' && (
                                            <Form {...changePasswordForm}>
                                                <form onSubmit={changePasswordForm.handleSubmit((data) => {
                                                    changePasswordMutation.mutate(data);
                                                })} className="space-y-4">
                                                    <FormField
                                                        control={changePasswordForm.control}
                                                        name="oldPassword"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-headline">Old Password</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="Enter your old password"
                                                                        className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-button"/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={changePasswordForm.control}
                                                        name="newPassword"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-headline">New Password</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="Enter your new password"
                                                                        className="border-paragraph/20 text-headline bg-background/50 placeholder:text-paragraph/50"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-button"/>
                                                                <ul className="mt-2 text-sm space-y-1">
                                                                    <li className={`flex items-center gap-2 ${
                                                                        field.value.length >= 8 ? "text-green-500" : "text-paragraph/50"
                                                                    }`}>
                                                                        {field.value.length >= 8 ? "✓" : "○"} At least 8 characters
                                                                    </li>
                                                                    <li className={`flex items-center gap-2 ${
                                                                        /[A-Z]/.test(field.value) ? "text-green-500" : "text-paragraph/50"
                                                                    }`}>
                                                                        {/[A-Z]/.test(field.value) ? "✓" : "○"} One uppercase letter
                                                                    </li>
                                                                    <li className={`flex items-center gap-2 ${
                                                                        /[a-z]/.test(field.value) ? "text-green-500" : "text-paragraph/50"
                                                                    }`}>
                                                                        {/[a-z]/.test(field.value) ? "✓" : "○"} One lowercase letter
                                                                    </li>
                                                                    <li className={`flex items-center gap-2 ${
                                                                        /[0-9]/.test(field.value) ? "text-green-500" : "text-paragraph/50"
                                                                    }`}>
                                                                        {/[0-9]/.test(field.value) ? "✓" : "○"} One number
                                                                    </li>
                                                                    <li className={`flex items-center gap-2 ${
                                                                        /[^A-Za-z0-9]/.test(field.value) ? "text-green-500" : "text-paragraph/50"
                                                                    }`}>
                                                                        {/[^A-Za-z0-9]/.test(field.value) ? "✓" : "○"} One special character
                                                                    </li>
                                                                </ul>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button 
                                                        type="submit" 
                                                        className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                    >
                                                        Change Password
                                                    </Button>
                                                </form>
                                            </Form>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="w-full sm:w-auto bg-button hover:bg-button/90 text-buttonText transition-colors"
                                    >
                                        Delete Account
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="bg-background border-paragraph/20">
                                    <SheetHeader className="space-y-4">
                                        <SheetTitle className="text-2xl text-headline">
                                            Delete Account
                                        </SheetTitle>
                                        <SheetDescription className="text-paragraph">
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="space-y-6 py-6">
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <Button
                                                    onClick={() => {
                                                        deleteAccountMutation.mutate();
                                                    }}
                                                    variant="default"
                                                    className="w-full bg-button hover:bg-button/90 text-buttonText transition-colors"
                                                >
                                                    Delete Account
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="w-full bg-paragraph/10 hover:bg-paragraph/20 text-paragraph transition-colors"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            </div>

                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}