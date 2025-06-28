import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Landing } from "@/pages/Landing";
import { SignUp } from "@/pages/auth/SignUp";
import { Login } from "@/pages/auth/Login";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { OpportunityList } from "@/pages/opportunities/OpportunityList";
import { SkillProviderList } from "@/pages/skills/SkillProviderList";
import { Dashboard } from "@/pages/dashboard/Dashboard";
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
              <Route path="my-profile" element={<div className="container py-8"><h1>My Profile - Coming Soon</h1></div>} />
              <Route path="notifications" element={<div className="container py-8"><h1>Notifications - Coming Soon</h1></div>} />
              <Route path="my-tokens" element={<div className="container py-8"><h1>My Tokens - Coming Soon</h1></div>} />
              <Route path="client/opportunities" element={<div className="container py-8"><h1>My Opportunities - Coming Soon</h1></div>} />
              <Route path="sp/proposals" element={<div className="container py-8"><h1>My Proposals - Coming Soon</h1></div>} />
              <Route path="about" element={<div className="container py-8"><h1>About Us - Coming Soon</h1></div>} />
              <Route path="contact" element={<div className="container py-8"><h1>Contact Us - Coming Soon</h1></div>} />
            </Route>
            
            {/* Auth routes (no layout) */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin routes (no layout) */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
