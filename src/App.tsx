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
import Preferences from "./pages/Preferences";
import Documents from "./pages/Documents";
import { ConnectionsProvider } from "@/contexts/ConnectionsContext";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Import CSS but don't include App.css anymore
import "./index.css";
import { AppSidebar } from "./components/AppSidebar";

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
                <Sidebar>
                  <AppSidebar />
                </Sidebar>
                <SidebarInset>
                  <SidebarTrigger />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/threads" element={<Threads />} />
                    <Route path="/threads/:threadId" element={<ThreadView />} />
                    <Route path="/connections" element={<Connections />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/preferences" element={<Preferences />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
