import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { Landing } from "@/pages/Landing";
import { SignUp } from "@/pages/auth/SignUp";
import { Login } from "@/pages/auth/Login";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { OpportunityList } from "@/pages/opportunities/OpportunityList";
import { SkillProviderList } from "@/pages/skills/SkillProviderList";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { MyProfile } from "@/pages/MyProfile";
import { Notifications } from "@/pages/Notifications";
import { MyTokens } from "@/pages/MyTokens";
import { ClientOpportunities } from "@/pages/ClientOpportunities";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Landing />} />
              <Route path="opportunities" element={<OpportunityList />} />
              <Route path="skills" element={<SkillProviderList />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="my-profile" element={<MyProfile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="my-tokens" element={<MyTokens />} />
              <Route path="client/opportunities" element={<ClientOpportunities />} />
              <Route path="sp/proposals" element={<div className="container py-8"><h1 className="text-2xl font-bold mb-4">My Proposals</h1><p className="text-muted-foreground">Feature coming soon - track and manage your submitted proposals here.</p></div>} />
              <Route path="about" element={<div className="container py-8"><h1 className="text-2xl font-bold mb-4">About SkillZone</h1><p className="text-muted-foreground">Learn more about Africa's premier freelance marketplace connecting talent across the SADC region.</p></div>} />
              <Route path="contact" element={<div className="container py-8"><h1 className="text-2xl font-bold mb-4">Contact Us</h1><p className="text-muted-foreground">Get in touch with our support team for assistance with your SkillZone experience.</p></div>} />
            </Route>
            
            {/* Auth routes (no layout) */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
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
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
