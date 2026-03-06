import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, DollarSign, TrendingUp, FileDown, Printer, FileText } from "lucide-react";
import { toast } from "sonner";
import { ServiceForm } from "@/components/services/ServiceForm";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { ReciboPDF } from "@/components/pdf/ReciboPDF";
import { CotacaoPDF } from "@/components/pdf/CotacaoPDF";
import { PropostaPDF } from "@/components/pdf/PropostaPDF";

interface Service {
  id: string;
  nome_servico: string;
  data_servico: string;
  valor_total: number;
  valor_investimento: number | null;
  valor_lucro: number | null;
  status_pagamento: string;
  tipo_pagamento: string;
  observacoes: string | null;
  client_id: string;
  clients: {
    nome: string;
  };
}

interface ServicosProps {
  isAdmin?: boolean;
}

export default function Servicos({ isAdmin = false }: ServicosProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [empresaData, setEmpresaData] = useState<any>(null);

  useEffect(() => {
    fetchServices();
    fetchEmpresa();
  }, [isAdmin]);

  async function fetchEmpresa() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setEmpresaData(data);
    } catch (error) {
      console.error('Error fetching empresa:', error);
    }
  }

  async function fetchServices() {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          clients (
            nome
          )
        `)
        .order('data_servico', { ascending: false });

      // Se não for admin, filtrar apenas serviços do usuário
      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = services.filter(service => {
    if (filterStatus === "todos") return true;
    return service.status_pagamento === filterStatus;
  });

  const totalReceived = filteredServices.reduce((sum, s) => sum + Number(s.valor_total || 0), 0);
  const totalInvestment = filteredServices.reduce((sum, s) => sum + Number(s.valor_investimento || 0), 0);
  const totalProfit = filteredServices.reduce((sum, s) => sum + Number(s.valor_lucro || 0), 0);

  async function handlePrint(service: Service, type: 'recibo' | 'cotacao' | 'proposta') {
    try {
      let pdfDoc;
      switch (type) {
        case 'recibo':
          pdfDoc = <ReciboPDF servico={service} cliente={service.clients} empresa={empresaData} />;
          break;
        case 'cotacao':
          pdfDoc = <CotacaoPDF servico={service} cliente={service.clients} empresa={empresaData} />;
          break;
        case 'proposta':
          pdfDoc = <PropostaPDF servico={service} cliente={service.clients} empresa={empresaData} />;
          break;
      }
      
      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Erro ao imprimir documento');
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
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
            <h1 className="text-3xl font-bold">{isAdmin ? 'Todos os Serviços' : 'Meus Serviços'}</h1>
            <p className="text-muted-foreground">
              Gerencie os serviços prestados
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
              </DialogHeader>
          <ServiceForm
            isAdmin={isAdmin}
            onSuccess={() => {
              setDialogOpen(false);
              fetchServices();
            }}
          />
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReceived.toFixed(2)} MT</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvestment.toFixed(2)} MT</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalProfit.toFixed(2)} MT</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="devendo">Devendo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.nome_servico}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliente: {service.clients.nome}
                    </p>
                  </div>
                  <Badge variant={
                    service.status_pagamento === 'pago' ? 'default' :
                    service.status_pagamento === 'pendente' ? 'secondary' :
                    'destructive'
                  }>
                    {service.status_pagamento}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data</p>
                      <p className="text-sm font-medium">
                        {new Date(service.data_servico).toLocaleDateString('pt-MZ')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-sm font-semibold">{Number(service.valor_total).toFixed(2)} MT</p>
                  </div>
                  {service.valor_investimento !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Investimento</p>
                      <p className="text-sm font-medium">{Number(service.valor_investimento).toFixed(2)} MT</p>
                    </div>
                  )}
                  {service.valor_lucro !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Lucro</p>
                      <p className="text-sm font-semibold text-green-600">
                        {Number(service.valor_lucro).toFixed(2)} MT
                      </p>
                    </div>
                  )}
                </div>
                {service.observacoes && (
                  <p className="text-sm text-muted-foreground mt-3 border-t pt-3">
                    {service.observacoes}
                  </p>
                )}
                
                {/* Botões de PDF */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <PDFDownloadLink
                    document={<ReciboPDF servico={service} cliente={service.clients} empresa={empresaData} />}
                    fileName={`recibo-${service.nome_servico.replace(/\s+/g, '-')}-${Date.now()}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button variant="outline" size="sm" disabled={pdfLoading}>
                        <FileDown className="w-4 h-4 mr-2" />
                        {pdfLoading ? 'Gerando...' : 'Recibo PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>

                  <PDFDownloadLink
                    document={<CotacaoPDF servico={service} cliente={service.clients} empresa={empresaData} />}
                    fileName={`cotacao-${service.nome_servico.replace(/\s+/g, '-')}-${Date.now()}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button variant="outline" size="sm" disabled={pdfLoading}>
                        <FileText className="w-4 h-4 mr-2" />
                        {pdfLoading ? 'Gerando...' : 'Cotação PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>

                  <PDFDownloadLink
                    document={<PropostaPDF servico={service} cliente={service.clients} empresa={empresaData} />}
                    fileName={`proposta-${service.nome_servico.replace(/\s+/g, '-')}-${Date.now()}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button variant="outline" size="sm" disabled={pdfLoading}>
                        <FileText className="w-4 h-4 mr-2" />
                        {pdfLoading ? 'Gerando...' : 'Proposta PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrint(service, 'recibo')}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Recibo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum serviço encontrado.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
