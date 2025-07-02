
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthDebugPanel } from "@/components/AuthDebugPanel";
import { Landing } from "@/pages/Landing";
import { SignUp } from "@/pages/auth/SignUp";
import { Login } from "@/pages/auth/Login";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { OpportunityList } from "@/pages/opportunities/OpportunityList";
import NewOpportunity from "@/pages/opportunities/NewOpportunity";
import SkillProviderList from "@/pages/skills/SkillProviderList";
import Dashboard from "@/pages/dashboard/Dashboard";
import { MyProfile } from "@/pages/MyProfile";
import { Notifications } from "@/pages/Notifications";
import { MyTokens } from "@/pages/MyTokens";
import { ClientOpportunities } from "@/pages/ClientOpportunities";
import { MyProposals } from "@/pages/MyProposals";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Chat } from "@/pages/Chat";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.code === 'PGRST301') {
          return false
        }
        return failureCount < 3
      }
    },
  },
});

const App = () => {
  const [showAuthDebug, setShowAuthDebug] = useState(
    import.meta.env.DEV && import.meta.env.MODE === 'development'
  )

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes (redirect to dashboard if authenticated) */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/signup" element={
                  <PublicRoute>
                    <SignUp />
                  </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                } />
                
                {/* Main layout routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Landing />} />
                  <Route path="opportunities" element={<OpportunityList />} />
                  <Route path="skills" element={<SkillProviderList />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="privacy" element={<Privacy />} />
                  
                  {/* Protected routes */}
                  <Route path="opportunities/new" element={
                    <ProtectedRoute requiredRole="client">
                      <NewOpportunity />
                    </ProtectedRoute>
                  } />
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="my-profile" element={
                    <ProtectedRoute>
                      <MyProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  <Route path="my-tokens" element={
                    <ProtectedRoute>
                      <MyTokens />
                    </ProtectedRoute>
                  } />
                  <Route path="client/opportunities" element={
                    <ProtectedRoute requiredRole="client">
                      <ClientOpportunities />
                    </ProtectedRoute>
                  } />
                  <Route path="sp/proposals" element={
                    <ProtectedRoute requiredRole="freelancer">
                      <MyProposals />
                    </ProtectedRoute>
                  } />
                  <Route path="chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                </Route>
                
                {/* Admin routes (no layout) */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>

            {/* Debug panel for development */}
            <AuthDebugPanel 
              isVisible={showAuthDebug}
              onToggle={() => setShowAuthDebug(!showAuthDebug)}
            />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
};

export default App;
