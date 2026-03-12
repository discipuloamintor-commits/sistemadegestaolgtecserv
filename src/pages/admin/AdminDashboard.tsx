import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Building2, Briefcase, DollarSign, TrendingUp, TrendingDown, Activity, CalendarDays, AlertCircle, PieChart, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfMonth, startOfYear } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalClients: 0,
    totalServices: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalExpenses: 0,
    predictedRevenue: 0,
    overdueCount: 0,
    overdueAmount: 0,
  });
  const [chartData, setChartData] = useState<{
    statusData: any[],
    gastosData: any[],
    topClientes: any[]
  }>({
    statusData: [],
    gastosData: [],
    topClientes: []
  });
  const [filterPeriodo, setFilterPeriodo] = useState("tudo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [filterPeriodo]);

  async function fetchStats() {
    try {
      setLoading(true);
      // Calculate date filter
      let dataMinima: Date | null = null;
      switch (filterPeriodo) {
        case "hoje":
          dataMinima = new Date();
          dataMinima.setHours(0, 0, 0, 0);
          break;
        case "7dias":
          dataMinima = subDays(new Date(), 7);
          break;
        case "mes":
          dataMinima = startOfMonth(new Date());
          break;
        case "ano":
          dataMinima = startOfYear(new Date());
          break;
        case "tudo":
          dataMinima = null;
          break;
      }

      const dateStr = dataMinima ? format(dataMinima, 'yyyy-MM-dd') : null;

      // Count total users (Global)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count pending users (Global)
      const { count: pendingUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status_aprovacao', 'pendente');

      // Count total clients (Global)
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Count total services (Global - regardless of period)
      const { count: totalServicesGlobal } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      // Count total hosting (Global)
      const { count: totalHostingCount } = await supabase
        .from('hosting_payments')
        .select('*', { count: 'exact', head: true });

      // Financials Query (Period-filtered)
      let servicesQuery = supabase
        .from('services')
        .select('valor_total, valor_lucro, status_pagamento, clients(nome)');

      if (dateStr) {
        servicesQuery = servicesQuery.gte('data_servico', dateStr);
      }
      const { data: services } = await servicesQuery;

      const servicesRevenue = services?.filter(s => s.status_pagamento === 'pago').reduce((sum, s) => sum + Number(s.valor_total || 0), 0) || 0;
      const servicesProfit = services?.filter(s => s.status_pagamento === 'pago').reduce((sum, s) => sum + Number(s.valor_lucro || 0), 0) || 0;

      // Chart Status Data
      const statuses = services?.reduce((acc: any, s) => {
        acc[s.status_pagamento] = (acc[s.status_pagamento] || 0) + 1;
        return acc;
      }, {});

      const statusDataArray = [
        { name: 'Pagos', value: statuses?.['pago'] || 0, color: '#10b981' },
        { name: 'Pendentes', value: statuses?.['pendente'] || 0, color: '#f59e0b' },
        { name: 'Devendo', value: statuses?.['devendo'] || 0, color: '#ef4444' },
      ].filter(d => d.value > 0);

      // Top Clients Data
      const clientsRevenue = services?.filter(s => s.status_pagamento === 'pago').reduce((acc: any, s) => {
        const name = s.clients?.nome || 'N/A';
        acc[name] = (acc[name] || 0) + Number(s.valor_total || 0);
        return acc;
      }, {});

      const topClientsArray = Object.entries(clientsRevenue || {})
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      // Expenses Query (Period-filtered)
      let gastosQuery = supabase
        .from('gastos')
        .select('valor, categoria');

      if (dateStr) {
        gastosQuery = gastosQuery.gte('data_gasto', dateStr);
      }
      const { data: gastos } = await gastosQuery;

      const totalExpenses = gastos?.reduce((sum, g) => sum + Number(g.valor || 0), 0) || 0;

      // Chart Gastos Data
      const gastosPorCat = gastos?.reduce((acc: any, g) => {
        acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.valor);
        return acc;
      }, {});

      const gastosDataArray = Object.entries(gastosPorCat || {})
        .map(([name, value]) => ({ name, value }));

      // Hosting Revenue (Global & Pending)
      const { data: hosting } = await supabase
        .from('hosting_payments')
        .select('valor_dominio, valor_hospedagem, status, data_vencimento, data_vencimento_hospedagem');

      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');

      let hostingRevenueReal = 0;
      let totalAReceberHosting = 0;
      let overdueCount = 0;
      let overdueAmount = 0;

      hosting?.forEach(p => {
        const value = Number(p.valor_dominio || 0) + Number(p.valor_hospedagem || 0);
        const isWithinPeriod = !dataMinima || new Date(p.data_vencimento) >= dataMinima;

        if (p.status === 'pago') {
          if (isWithinPeriod) hostingRevenueReal += value;
        } else if (p.status === 'pendente') {
          // All pending hosting are "A Receber" (Avisos)
          totalAReceberHosting += value;

          if (p.data_vencimento < todayStr || (p.data_vencimento_hospedagem && p.data_vencimento_hospedagem < todayStr)) {
            overdueCount++;
            overdueAmount += value;
          }
        }
      });

      setStats({
        totalUsers: totalUsers || 0,
        pendingUsers: pendingUsers || 0,
        totalClients: totalClients || 0,
        totalServices: (totalServicesGlobal || 0) + (totalHostingCount || 0),
        totalRevenue: servicesRevenue + hostingRevenueReal,
        totalProfit: (servicesProfit + hostingRevenueReal) - totalExpenses,
        totalExpenses,
        predictedRevenue: totalAReceberHosting,
        overdueCount,
        overdueAmount,
      });

      setChartData({
        statusData: statusDataArray,
        gastosData: gastosDataArray,
        topClientes: topClientsArray
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const periodLabel = filterPeriodo === "tudo" ? "total" : "no período";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel do Administrador</h1>
            <p className="text-muted-foreground">Visão geral do sistema</p>
          </div>
          <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7dias">Últimos 7 Dias</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
              <SelectItem value="tudo">Todo Período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {stats.overdueCount > 0 && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 flex items-center justify-between w-full">
              <span>
                <strong>Atenção:</strong> Existem {stats.overdueCount} {stats.overdueCount === 1 ? 'pagamento' : 'pagamentos'} de hosting vencidos no sistema ({stats.overdueAmount.toFixed(2)} MT).
              </span>
              <Button variant="link" className="text-red-700 h-auto p-0 font-bold underline" onClick={() => window.location.href = '/admin/pagamentos-hosting'}>
                Ver todos
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="premium-card animate-fade-up stagger-1 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Usuários</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-gray-900">{stats.totalUsers}</div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Total registados</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-2 border-l-4 border-l-warning bg-warning/5 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-orange-700">Pendentes</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-orange-600">{stats.pendingUsers}</div>
              <p className="text-[9px] text-orange-700/70 mt-0.5">Aguardando ação</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-3 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Clientes</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-slate-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-gray-900">{stats.totalClients}</div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Base global</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-4 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Serviços</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-gray-900">{stats.totalServices}</div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Acumulado (Real)</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-1 border-l-4 border-l-green-500 bg-green-50/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-green-700">Lucro</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalProfit.toFixed(0)} MT
              </div>
              <p className="text-[9px] text-green-700/70 mt-0.5">{periodLabel}</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-2 border-l-4 border-l-red-500 bg-red-50/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-red-700">Despesas</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-red-600">
                {stats.totalExpenses.toFixed(0)} MT
              </div>
              <p className="text-[9px] text-red-700/70 mt-0.5">{periodLabel}</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-3 border-l-4 border-l-blue-500 bg-blue-50/20 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-blue-700">A Receber</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-blue-600">
                {stats.predictedRevenue.toFixed(0)} MT
              </div>
              <p className="text-[9px] text-blue-700/70 mt-0.5">Hosting (Avisos)</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-4 bg-slate-900 text-white border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Eficiência</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold text-white">
                {stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">{periodLabel}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de BI migrados */}
        <div className="grid gap-4 md:grid-cols-2">
          {chartData.statusData.length > 0 && (
            <Card className="premium-card animate-fade-up stagger-1 border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Status dos Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={chartData.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} serviços`, 'Quantidade']} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {chartData.gastosData.length > 0 && (
            <Card className="premium-card animate-fade-up stagger-2 border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  Gastos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={chartData.gastosData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value.toFixed(0)} MT`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.gastosData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} MT`, 'Valor']} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {chartData.topClientes.length > 0 && (
            <Card className="md:col-span-2 premium-card animate-fade-up stagger-3 border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Top 5 Clientes por Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.topClientes}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} MT`, 'Receita']} />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" name="Receita Acumulada (MT)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
