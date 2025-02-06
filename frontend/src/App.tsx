import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StartSignUpPage from "@/pages/signUp/startSignUpPage.tsx";
import VerifyEmailPage from "@/pages/signUp/verifyEmailPage.tsx";
import FinishSignUpPage from "@/pages/signUp/finishSignUpPage.tsx";
import {PublicRoute, TemporaryPublicRoute, VerifyEmailCookie} from './components/PublicRoute';

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
                </Routes>
            </Router>
        </QueryClientProvider>
    )
}