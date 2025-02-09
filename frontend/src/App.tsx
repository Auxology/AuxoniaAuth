import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StartSignUpPage from "@/pages/signUp/startSignUpPage.tsx";
import VerifyEmailPage from "@/pages/signUp/verifyEmailPage.tsx";
import FinishSignUpPage from "@/pages/signUp/finishSignUpPage.tsx";
import {
    ForgetPasswordProtection,
    ForgotPasswordCookie,
    PublicRoute,
    TemporaryPublicRoute,
    VerifyEmailCookie
} from './components/PublicRoute';
import LoginPage from "@/pages/login/page.tsx";
import DashboardPage from "@/pages/dashboard/page.tsx";
import {PrivateRoute} from "@/components/PrivateRoute.tsx";
import ForgetPasswordPage from "@/pages/forgetPassword/beginPasswordRecoveryPage.tsx";
import PasswordRecoveryCodePage from "@/pages/forgetPassword/passwordRecoveryCodePage.tsx";
import ResetPasswordPage from "@/pages/forgetPassword/resetPasswordPage.tsx";

const queryClient = new QueryClient()



export default function App() {

    

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>

                    // This is public route which is checked by useAuth hook
                    // If user is logged in, it will redirect to /dashboard
                    <Route path="/" element={
                        <PublicRoute>
                            <TemporaryPublicRoute>
                                <StartSignUpPage/>
                            </TemporaryPublicRoute>
                        </PublicRoute>
                    }/>

                    // This is public route which is checked by useAuth hook
                    // If user is logged in, it will redirect to /dashboard
                    <Route path="/signup/code" element={
                        <PublicRoute>
                            <VerifyEmailCookie>
                                <TemporaryPublicRoute>
                                    <VerifyEmailPage/>
                                </TemporaryPublicRoute>
                            </VerifyEmailCookie>
                        </PublicRoute>
                        }/>

                    // This is public route which is checked by useAuth hook
                    // If user is logged in, it will redirect to /dashboard
                    <Route path="/signup/finish" element={
                        <PublicRoute>
                            <TemporaryPublicRoute>
                                <FinishSignUpPage/>
                            </TemporaryPublicRoute>
                        </PublicRoute>
                    }/>

                    <Route path="/login" element={
                        <PublicRoute>
                            <TemporaryPublicRoute>
                                <LoginPage/>
                            </TemporaryPublicRoute>
                        </PublicRoute>
                        }
                    />

                    <Route path="/forgot-password" element={
                        <PublicRoute>
                            <TemporaryPublicRoute>
                                <ForgetPasswordPage/>
                            </TemporaryPublicRoute>
                        </PublicRoute>
                    }/>

                    <Route path="/forgot-password/code" element={
                        <PublicRoute>
                            <TemporaryPublicRoute>
                                <ForgotPasswordCookie>
                                    <PasswordRecoveryCodePage />
                                </ForgotPasswordCookie>
                            </TemporaryPublicRoute>
                        </PublicRoute>
                    }/>

                    <Route path="/reset-password" element={
                        <PublicRoute>
                            <TemporaryPublicRoute>
                                    <ForgetPasswordProtection>
                                        <ResetPasswordPage/>
                                    </ForgetPasswordProtection>
                            </TemporaryPublicRoute>
                        </PublicRoute>
                    }/>


                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }/>

                    <Route path="*" element={<h1>404</h1>} />

                </Routes>
            </Router>
        </QueryClientProvider>
    )
}