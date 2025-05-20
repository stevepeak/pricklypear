import React from "react";
import { Sonner } from "@/components/ui/sonner.js";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import "./index.css";
import { AppSidebar } from "./components/AppSidebar";
import { CommandMenu } from "./components/CommandMenu";
import TopNav from "@/components/ui/TopNav";
import Calendar from "./pages/Calendar";
import Expenses from "./pages/Expenses";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ConnectionsProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full flex-col md:flex-row">
                <AppSidebar />
                <SidebarInset>
                  <TopNav />
                  <CommandMenu />
                  <div className="flex-1 min-h-0">
                    <Routes>
                      <Route path="/" element={<Home />} />
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
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ConnectionsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
