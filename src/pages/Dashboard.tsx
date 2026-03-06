import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Building2, Briefcase, DollarSign, TrendingUp, Smartphone, X, ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalServices: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    fetchStats();
    
    // Check if it's iOS and not already installed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (navigator as any).standalone === true;
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const bannerDismissed = localStorage.getItem('ios-install-banner-dismissed');
    
    // Only show banner for iOS users who haven't installed yet
    if (isIOS && !isInStandaloneMode && !isInstalled && !bannerDismissed) {
      setShowIOSBanner(true);
    }
  }, []);

  const handleDismissIOSBanner = () => {
    localStorage.setItem('ios-install-banner-dismissed', 'true');
    setShowIOSBanner(false);
  };

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Count user's clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count user's services
      const { count: totalServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate revenue and profit
      const { data: services } = await supabase
        .from('services')
        .select('valor_total, valor_lucro')
        .eq('user_id', user.id);

      const totalRevenue = services?.reduce((sum, s) => sum + Number(s.valor_total || 0), 0) || 0;
      const totalProfit = services?.reduce((sum, s) => sum + Number(s.valor_lucro || 0), 0) || 0;

      setStats({
        totalClients: totalClients || 0,
        totalServices: totalServices || 0,
        totalRevenue,
        totalProfit,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {showIOSBanner && (
          <Alert className="border-primary/50 bg-primary/5">
            <Smartphone className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <strong>📱 Instale para acesso rápido</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                    className="shrink-0"
                  >
                    {showIOSInstructions ? 'Ocultar' : 'Ver como'}
                    <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showIOSInstructions ? 'rotate-180' : ''}`} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleDismissIOSBanner}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {showIOSInstructions && (
                <div className="text-sm space-y-2 pt-2 border-t">
                  <p>Para instalar no iOS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Toque no botão de partilha (ícone com seta para cima)</li>
                    <li>Selecione "Adicionar ao Ecrã Principal"</li>
                    <li>Confirme tocando em "Adicionar"</li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral dos seus negócios</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} MT</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProfit.toFixed(2)} MT</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
