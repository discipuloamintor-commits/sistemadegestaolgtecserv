import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Building2, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalClients: 0,
    totalServices: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Count total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count pending users
      const { count: pendingUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status_aprovacao', 'pendente');

      // Count total clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Count total services
      const { count: totalServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      // Calculate total revenue and profit
      const { data: services } = await supabase
        .from('services')
        .select('valor_total, valor_lucro');

      const totalRevenue = services?.reduce((sum, s) => sum + Number(s.valor_total || 0), 0) || 0;
      const totalProfit = services?.reduce((sum, s) => sum + Number(s.valor_lucro || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        pendingUsers: pendingUsers || 0,
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
        <div>
          <h1 className="text-3xl font-bold">Painel do Administrador</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="border-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
              <UserCheck className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
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
