import React from "react";
import { Sonner } from "@/components/ui/sonner.js";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import { ConnectionsProvider } from "@/contexts/ConnectionsContext";
import {
  SidebarProvider,
  Sidebar,
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

import "./index.css";
import { AppSidebar } from "./components/AppSidebar";
import { CommandMenu } from "./components/CommandMenu";
import TopNav from "./components/TopNav";

const queryClient = new QueryClient();

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb className="p-3 sticky top-0 z-20 bg-white">
      <BreadcrumbList>
        <BreadcrumbItem>
          <SidebarTrigger className="" />
        </BreadcrumbItem>
        {pathnames.map((value, idx) => {
          const to = `/${pathnames.slice(0, idx + 1).join("/")}`;
          const isLast = idx === pathnames.length - 1;
          const label = capitalize(decodeURIComponent(value));
          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={to}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

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
                      <Route path="/integrations" element={<Integrations />} />
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
