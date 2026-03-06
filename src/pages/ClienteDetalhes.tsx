import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  foto_url: string | null;
  observacoes: string | null;
}

interface Service {
  id: string;
  nome_servico: string;
  data_servico: string;
  valor_total: number;
  valor_investimento: number | null;
  valor_lucro: number | null;
  status_pagamento: string;
  observacoes: string | null;
}

export default function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  async function fetchClientDetails() {
    try {
      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('client_id', id)
        .order('data_servico', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Erro ao carregar detalhes do cliente');
    } finally {
      setLoading(false);
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

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cliente não encontrado</p>
          <Button onClick={() => navigate('/clientes')} className="mt-4">
            Voltar para Clientes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalReceived = services.reduce((sum, s) => sum + Number(s.valor_total || 0), 0);
  const totalInvestment = services.reduce((sum, s) => sum + Number(s.valor_investimento || 0), 0);
  const totalProfit = services.reduce((sum, s) => sum + Number(s.valor_lucro || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Clientes
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={client.foto_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {client.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-4">{client.nome}</CardTitle>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{client.telefone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.endereco && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{client.endereco}</span>
                    </div>
                  )}
                </div>
                {client.observacoes && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm">{client.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

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
              <div className="text-2xl font-bold">{totalProfit.toFixed(2)} MT</div>
            </CardContent>
          </Card>
        </div>

        {/* Services History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Serviços ({services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum serviço registrado para este cliente ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{service.nome_servico}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(service.data_servico).toLocaleDateString('pt-MZ')}</span>
                        </div>
                      </div>
                      <Badge variant={
                        service.status_pagamento === 'pago' ? 'default' :
                        service.status_pagamento === 'pendente' ? 'secondary' :
                        'destructive'
                      }>
                        {service.status_pagamento}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-semibold">{Number(service.valor_total).toFixed(2)} MT</p>
                      </div>
                      {service.valor_investimento !== null && (
                        <div>
                          <p className="text-muted-foreground">Investimento</p>
                          <p className="font-semibold">{Number(service.valor_investimento).toFixed(2)} MT</p>
                        </div>
                      )}
                      {service.valor_lucro !== null && (
                        <div>
                          <p className="text-muted-foreground">Lucro</p>
                          <p className="font-semibold text-green-600">{Number(service.valor_lucro).toFixed(2)} MT</p>
                        </div>
                      )}
                    </div>
                    {service.observacoes && (
                      <div className="mt-3 flex items-start gap-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-muted-foreground">{service.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
