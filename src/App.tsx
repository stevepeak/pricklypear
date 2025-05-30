import React from "react";
import { Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Threads from "./pages/Threads";
import ThreadView from "./pages/ThreadView";
import Connections from "./pages/Connections";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import Documents from "./pages/Documents";
import Integrations from "./pages/Integrations";
import Billing from "./pages/Billing";
import { ConnectionsProvider } from "@/contexts/ConnectionsContext";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import UpdatePassword from "./pages/update-password";
import TermsOfService from "./pages/terms-of-service";
import PrivacyPolicy from "./pages/privacy-policy";
import FeatureRequestPage from "./pages/feature-request";
import { getThread } from "@/services/threadService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

// Import CSS but don't include App.css anymore
import "./index.css";
import { AppSidebar } from "./components/AppSidebar";
import { CommandMenu } from "./components/CommandMenu";
import Calendar from "./pages/Calendar";
import Expenses from "./pages/Expenses";
import Breadcrumbs from "@/components/app/Breadcrumbs";

const queryClient = new QueryClient();

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      {/* Auth page: always without sidebar */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      {/* Home page: no sidebar if logged out */}
      <Route path="/" element={<Home />} />
      {/* All other routes: require auth, show sidebar */}
      <Route
        path="*"
        element={
          user ? (
            <SidebarProvider>
              <div className="flex min-h-screen w-full flex-col md:flex-row">
                <AppSidebar />
                <SidebarInset>
                  <Breadcrumbs />
                  <CommandMenu />
                  <div className="flex-1 min-h-0">
                    <Routes>
                      <Route path="/threads" element={<Threads />} />
                      <Route
                        path="/threads/:threadId"
                        element={<ThreadView />}
                      />
                      <Route path="/connections" element={<Connections />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/integrations" element={<Integrations />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/account" element={<Account />} />
                      <Route
                        path="/feature-request"
                        element={<FeatureRequestPage />}
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </SidebarInset>
              </div>
            </SidebarProvider>
          ) : (
            // If not logged in, redirect to /auth for all other routes
            <AuthPage />
          )
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ConnectionsProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ConnectionsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
