import LogoutButton from '@/components/ui/LogoutButton.tsx';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
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

export default function DashboardPage() {
    const { data, isLoading, error } = useAuth();
    const [step, setStep] = useState<'old-email' | 'verify-old' | 'new-email' | 'verify-new' | 'confirm'>('old-email');
    const [passwordStep, setPasswordStep] = useState<'verify-email' | 'change-password'>('verify-email');

    const verificationSchema = z.object({
        code: z.string().min(6, { message: "Verification code must be 6 characters" }),
    });

    const emailSchema = z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
    });

    const changePasswordSchema = z.object({
        oldPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
        newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
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
            const response = await axiosInstance.post("/auth/change-email", data);
            return response.data;
        },
        onSuccess() {
            setStep('verify-old');
        },
        onError() {
            toast({
                title: "Error",
                description: "Failed to send verification code",
            })
        }
    });

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
            const response = await axiosInstance.post("/auth/change-email/finish", data);
            return response.data;
        },
        onSuccess() {
            toast({
                title: "Success",
                description: "Email changed successfully",
            })
            window.location.reload();
        },
        onError() {
            toast({
                title: "Error",
                description: "Failed to change email",
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
            const response = await axiosInstance.post("/auth/change-password/finish", data);
            return response.data;
        },
        onSuccess() {
            toast({
                title: "Success",
                description: "Password changed successfully",
            });
            window.location.reload();
        },
        onError() {
            toast({
                title: "Error",
                description: "Failed to change password",
            })
        }
    });

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
                                        variant="outline"
                                        className="w-full sm:w-auto border-paragraph/20 text-paragraph hover:bg-paragraph/10 hover:text-headline transition-colors"
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
                                                    <Button type="submit" className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors">
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
                                                        <Button type="submit" className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors">
                                                            Verify Code
                                                        </Button>
                                                        <Button 
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                oldEmailSendCodeMutation.mutate({ email: oldEmailForm.getValues().email });
                                                            }}
                                                            className="w-full text-paragraph hover:text-headline hover:bg-paragraph/10"
                                                        >
                                                            Resend Code
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
                                                    <Button type="submit" className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors">
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
                                                        <Button type="submit" className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors">
                                                            Verify Code
                                                        </Button>
                                                        <Button 
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                newEmailSendCodeMutation.mutate({ email: newEmailForm.getValues().email });
                                                            }}
                                                            className="w-full text-paragraph hover:text-headline hover:bg-paragraph/10"
                                                        >
                                                            Resend Code
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
                                                        className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors"
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setStep('old-email');
                                                        }}
                                                        variant="outline"
                                                        className="w-full border-paragraph/20 text-paragraph hover:bg-paragraph/10 hover:text-headline transition-colors"
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
                                        variant="outline"
                                        className="w-full sm:w-auto border-paragraph/20 text-paragraph hover:bg-paragraph/10 hover:text-headline transition-colors"
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
                                                        <Button type="submit" className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors">
                                                            Verify Code
                                                        </Button>
                                                        <Button 
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                passwordSendCodeMutation.mutate();
                                                            }}
                                                            className="w-full text-paragraph hover:text-headline hover:bg-paragraph/10"
                                                        >
                                                            Send Code
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
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button type="submit" className="w-full bg-button text-buttonText hover:bg-button/90 transition-colors">
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
                                        variant="outline"
                                        className="w-full sm:w-auto border-paragraph/20 text-paragraph hover:bg-paragraph/10 hover:text-headline transition-colors"
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
                                                    variant="outline"
                                                    className="w-full border-button text-button hover:bg-button hover:text-buttonText transition-colors"
                                                >
                                                    Delete Account
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-paragraph/20 text-paragraph hover:bg-paragraph/10 hover:text-headline transition-colors"
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