import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import TechnologyPage from "./pages/TechnologyPage";
import HealthcarePage from "./pages/HealthcarePage";
import SolutionsPage from "./pages/SolutionsPage";
import NotFound from "./pages/NotFound";
import { ScreeningFlow } from "./pages/ScreeningFlow";
import { ResultsPage } from "./pages/ResultsPage";
import Aurora from "@/components/Aurora";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Global Particles Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Main content wrapper with relative positioning */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/technology" element={<TechnologyPage />} />
            <Route path="/healthcare" element={<HealthcarePage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/old-home" element={<Index />} />
            <Route path="/screening" element={<ScreeningFlow />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
