import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loading } from "@/components/ui/loading";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useAutoInstallPrompt } from "@/hooks/useAutoInstallPrompt";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import Auth from "./pages/Auth";
import Offline from "./pages/Offline";

// Lazy load routes for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clientes = lazy(() => import("./pages/Clientes"));
const ClienteDetalhes = lazy(() => import("./pages/ClienteDetalhes"));
const Servicos = lazy(() => import("./pages/Servicos"));
const Gastos = lazy(() => import("./pages/Gastos"));
const RelatoriosGlobais = lazy(() => import("./pages/RelatoriosGlobais"));
const MinhaEmpresa = lazy(() => import("./pages/MinhaEmpresa"));
const AguardandoAprovacao = lazy(() => import("./pages/AguardandoAprovacao"));
const ContaRejeitada = lazy(() => import("./pages/ContaRejeitada"));
const ContaSuspensa = lazy(() => import("./pages/ContaSuspensa"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const GerenciarUsuarios = lazy(() => import("./pages/admin/GerenciarUsuarios"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Install = lazy(() => import("./pages/Install"));
const PWADebug = lazy(() => import("./pages/PWADebug"));
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute").then(m => ({ default: m.ProtectedRoute })));
const AdminRoute = lazy(() => import("./components/auth/AdminRoute").then(m => ({ default: m.AdminRoute })));

const queryClient = new QueryClient();

const App = () => {
  const { isInstalled, deferredPrompt, promptToInstall, canShowPrompt, dismissPrompt } = useAutoInstallPrompt();
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  console.log('🎯 App.tsx - PWA State:', {
    isInstalled,
    canShowPrompt,
    hasDeferredPrompt: !!deferredPrompt,
    updateAvailable,
    shouldShowPrompt: canShowPrompt && !isInstalled
  });

  const handleInstall = async () => {
    console.log('📲 App.tsx: handleInstall chamado');
    if (updateAvailable) {
      console.log('🔄 Aplicando atualização...');
      applyUpdate();
    } else {
      console.log('📥 Instalando app...');
      await promptToInstall();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/offline" element={<Offline />} />
              <Route path="/pwa-debug" element={<PWADebug />} />
              <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
              <Route path="/conta-rejeitada" element={<ContaRejeitada />} />
              <Route path="/conta-suspensa" element={<ContaSuspensa />} />
              <Route path="/install" element={<Install />} />
            
            {/* Member Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
              <Route path="/clientes/:id" element={<ProtectedRoute><ClienteDetalhes /></ProtectedRoute>} />
              <Route path="/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
              <Route path="/gastos" element={<ProtectedRoute><Gastos /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><RelatoriosGlobais /></ProtectedRoute>} />
              <Route path="/empresa" element={<ProtectedRoute><MinhaEmpresa /></ProtectedRoute>} />
            
            {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/usuarios" element={<AdminRoute><GerenciarUsuarios /></AdminRoute>} />
              <Route path="/admin/clientes" element={<AdminRoute><Clientes isAdmin /></AdminRoute>} />
              <Route path="/admin/servicos" element={<AdminRoute><Servicos isAdmin /></AdminRoute>} />
              <Route path="/admin/gastos" element={<AdminRoute><Gastos isAdmin /></AdminRoute>} />
              <Route path="/admin/relatorios" element={<AdminRoute><RelatoriosGlobais isAdmin /></AdminRoute>} />
            
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        
        {/* Install Prompt */}
        {canShowPrompt && !isInstalled && (
          <InstallPrompt
            deferredPrompt={deferredPrompt}
            onInstall={handleInstall}
            onDismiss={dismissPrompt}
            isUpdateAvailable={updateAvailable}
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
