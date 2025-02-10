import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
    const { data, isLoading, error } = useAuth();

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
                <Card className="border-button/20 bg-background/50 backdrop-blur-sm">
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

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button 
                                    className="w-full sm:w-auto bg-paragraph text-background hover:bg-paragraph/90 transition-colors"
                                >
                                    Edit Profile
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full sm:w-auto border-paragraph/20 text-gray-600 hover:bg-paragraph/10 hover:text-headline transition-colors"
                                >
                                    Change Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}