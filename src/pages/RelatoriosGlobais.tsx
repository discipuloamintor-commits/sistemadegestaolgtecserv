import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart as RechartsLine, Line } from "recharts";

interface RelatoriosGlobaisProps {
  isAdmin?: boolean;
}

interface Service {
  id: string;
  nome_servico: string;
  valor_total: number;
  valor_lucro: number;
  valor_investimento: number;
  status_pagamento: string;
  data_servico: string;
  client_id: string;
  clients?: { nome: string };
}

interface Gasto {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_gasto: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RelatoriosGlobais({ isAdmin = false }: RelatoriosGlobaisProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriodo, setFilterPeriodo] = useState("mes");

  useEffect(() => {
    fetchData();
  }, [filterPeriodo]);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calcular data inicial baseado no filtro
      let dataInicial = new Date();
      switch (filterPeriodo) {
        case "hoje":
          dataInicial = new Date();
          dataInicial.setHours(0, 0, 0, 0);
          break;
        case "7dias":
          dataInicial = subDays(new Date(), 7);
          break;
        case "mes":
          dataInicial = startOfMonth(new Date());
          break;
        case "trimestre":
          dataInicial = subDays(new Date(), 90);
          break;
        case "ano":
          dataInicial = startOfYear(new Date());
          break;
        case "tudo":
          dataInicial = new Date(2000, 0, 1);
          break;
      }

      // Buscar serviços
      let servicesQuery = supabase
        .from('services')
        .select('*, clients(nome)')
        .gte('data_servico', format(dataInicial, 'yyyy-MM-dd'));

      if (!isAdmin) {
        servicesQuery = servicesQuery.eq('user_id', user.id);
      }

      const { data: servicesData, error: servicesError } = await servicesQuery;
      if (servicesError) throw servicesError;

      // Buscar gastos
      let gastosQuery = supabase
        .from('gastos')
        .select('*')
        .gte('data_gasto', format(dataInicial, 'yyyy-MM-dd'));

      if (!isAdmin) {
        gastosQuery = gastosQuery.eq('user_id', user.id);
      }

      const { data: gastosData, error: gastosError } = await gastosQuery;
      if (gastosError) throw gastosError;

      setServices(servicesData || []);
      setGastos(gastosData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Cálculos
  const servicosPagos = services.filter(s => s.status_pagamento === 'pago');
  const servicosPendentes = services.filter(s => s.status_pagamento === 'pendente');
  const servicosDevendo = services.filter(s => s.status_pagamento === 'devendo');

  const totalReceitas = servicosPagos.reduce((sum, s) => sum + Number(s.valor_total), 0);
  const totalInvestimentos = servicosPagos.reduce((sum, s) => sum + Number(s.valor_investimento || 0), 0);
  const totalLucros = servicosPagos.reduce((sum, s) => sum + Number(s.valor_lucro || 0), 0);
  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.valor), 0);
  const lucroReal = totalLucros - totalGastos;
  const margemLucro = totalReceitas > 0 ? (lucroReal / totalReceitas) * 100 : 0;

  // Dados para gráficos
  const statusData = [
    { name: 'Pagos', value: servicosPagos.length, color: '#10b981' },
    { name: 'Pendentes', value: servicosPendentes.length, color: '#f59e0b' },
    { name: 'Devendo', value: servicosDevendo.length, color: '#ef4444' },
  ];

  const gastosPorCategoria = gastos.reduce((acc, gasto) => {
    const categoria = gasto.categoria;
    const existing = acc.find(item => item.name === categoria);
    if (existing) {
      existing.value += Number(gasto.valor);
    } else {
      acc.push({ name: categoria, value: Number(gasto.valor) });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Top 5 clientes
  const clientesReceita = services.reduce((acc, service) => {
    if (service.status_pagamento === 'pago' && service.clients) {
      const clienteName = service.clients.nome;
      acc[clienteName] = (acc[clienteName] || 0) + Number(service.valor_total);
    }
    return acc;
  }, {} as Record<string, number>);

  const topClientes = Object.entries(clientesReceita)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios Globais</h1>
            <p className="text-muted-foreground">Análise financeira completa</p>
          </div>
          <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7dias">Últimos 7 Dias</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
              <SelectItem value="tudo">Todo Período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalReceitas.toFixed(2)} MT</div>
              <p className="text-xs text-muted-foreground">{servicosPagos.length} serviços pagos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totalGastos.toFixed(2)} MT</div>
              <p className="text-xs text-muted-foreground">{gastos.length} despesas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Real</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lucroReal >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {lucroReal.toFixed(2)} MT
              </div>
              <p className="text-xs text-muted-foreground">Receitas - Gastos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{margemLucro.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Eficiência financeira</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(0)} MT`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top 5 Clientes por Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topClientes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Receita (MT)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pendências */}
        {(servicosPendentes.length > 0 || servicosDevendo.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Serviços Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...servicosPendentes, ...servicosDevendo].map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{service.nome_servico}</h3>
                        <Badge variant={service.status_pagamento === 'pendente' ? 'outline' : 'destructive'}>
                          {service.status_pagamento}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.clients?.nome} • {format(new Date(service.data_servico), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{Number(service.valor_total).toFixed(2)} MT</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}