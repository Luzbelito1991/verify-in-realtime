import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import VerificarSMS from "./pages/VerificarSMS";
import PanelSMS from "./pages/PanelSMS";
import Usuarios from "./pages/Usuarios";
import AdminSMS from "./pages/AdminSMS";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/verificar" element={<VerificarSMS />} />
          <Route path="/sms" element={<PanelSMS />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/admin-sms" element={<AdminSMS />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
