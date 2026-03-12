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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Calendar, DollarSign, TrendingUp, FileDown, Printer, FileText, Receipt, FileSignature, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ServiceForm } from "@/components/services/ServiceForm";
import { PropostaContratoForm } from "@/components/services/PropostaContratoForm";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { ReciboPDF } from "@/components/pdf/ReciboPDF";
import { CotacaoPDF } from "@/components/pdf/CotacaoPDF";
import { PropostaPDF } from "@/components/pdf/PropostaPDF";
import { FaturaPDF } from "@/components/pdf/FaturaPDF";

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
  detalhes_servico: any;
  clients: {
    nome: string;
    telefone: string;
    email: string | null;
    endereco: string | null;
  };
}

interface ServicosProps {
  isAdmin?: boolean;
}

export default function Servicos({ isAdmin = false }: ServicosProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

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
            nome,
            telefone,
            email,
            endereco
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

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Serviço eliminado com sucesso');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Erro ao eliminar serviço');
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  }

  const filteredServices = services.filter(service => {
    if (filterStatus === "todos") return true;
    return service.status_pagamento === filterStatus;
  });

  const totalReceived = filteredServices.reduce((sum, s) => sum + Number(s.valor_total || 0), 0);
  const totalInvestment = filteredServices.reduce((sum, s) => sum + Number(s.valor_investimento || 0), 0);
  const totalProfit = filteredServices.reduce((sum, s) => sum + Number(s.valor_lucro || 0), 0);

  async function handlePrint(service: Service, type: 'recibo' | 'cotacao' | 'proposta' | 'fatura') {
    try {
      let pdfDoc;
      switch (type) {
        case 'fatura':
          pdfDoc = <FaturaPDF servico={service} cliente={service.clients} empresa={empresaData} />;
          break;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{isAdmin ? 'Todos os Serviços' : 'Meus Serviços'}</h1>
            <p className="text-muted-foreground">
              Gerencie os serviços prestados no sistema
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingService(null);
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingService(null)} className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dialog-content-mobile">
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</DialogTitle>
                </DialogHeader>
                <ServiceForm
                  isAdmin={isAdmin}
                  service={editingService}
                  onSuccess={() => {
                    setDialogOpen(false);
                    setEditingService(null);
                    fetchServices();
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 rounded-xl transition-all hover:scale-105">
                  <FileSignature className="w-4 h-4 mr-2" />
                  Proposta Contrato
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dialog-content-mobile">
                <DialogHeader>
                  <DialogTitle>Nova Proposta de Contrato Mensal</DialogTitle>
                </DialogHeader>
                <PropostaContratoForm isAdmin={isAdmin} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="premium-card animate-fade-up stagger-1 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalReceived.toFixed(2)} MT</div>
              <p className="text-xs text-muted-foreground mt-1">Volume total bruto</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-2 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
              <div className="p-2 bg-amber-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalInvestment.toFixed(2)} MT</div>
              <p className="text-xs text-muted-foreground mt-1">Custo de operação</p>
            </CardContent>
          </Card>

          <Card className="premium-card animate-fade-up stagger-3 border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalProfit.toFixed(2)} MT</div>
              <p className="text-xs text-muted-foreground mt-1">Margem líquida</p>
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
          {filteredServices.map((service, index) => (
            <Card key={service.id} className={`premium-card animate-fade-up border-none shadow-sm stagger-${(index % 5) + 1}`}>
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
                    document={<FaturaPDF servico={service} cliente={service.clients} empresa={empresaData} />}
                    fileName={`fatura-${service.nome_servico.replace(/\s+/g, '-')}-${Date.now()}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button variant="outline" size="sm" disabled={pdfLoading} className="border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Receipt className="w-4 h-4 mr-2" />
                        {pdfLoading ? 'Gerando...' : 'Fatura PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>

                  <PDFDownloadLink
                    document={<ReciboPDF servico={service} cliente={service.clients} empresa={empresaData} />}
                    fileName={`recibo-${service.nome_servico.replace(/\s+/g, '-')}-${Date.now()}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <Button variant="outline" size="sm" disabled={pdfLoading} className="border-green-300 text-green-700 hover:bg-green-50">
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

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setEditingService(service);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setServiceToDelete(service.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O serviço será permanentemente removido da base de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => serviceToDelete && handleDelete(serviceToDelete)}
              className="bg-red-600 hover:bg-red-700 font-bold"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout >
  );
}
