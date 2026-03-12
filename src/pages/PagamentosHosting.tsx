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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Globe, Server, FileDown, CheckCircle2, AlertTriangle, Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AvisoPagamentoPDF } from "@/components/pdf/AvisoPagamentoPDF";

interface HostingPayment {
    id: string;
    client_id: string;
    service_id: string | null;
    tipo: string;
    nome_dominio: string | null;
    valor_dominio: number;
    valor_hospedagem: number;
    data_vencimento: string;
    data_vencimento_hospedagem: string | null;
    data_pagamento: string | null;
    status: string;
    periodo_renovacao: string;
    observacoes: string | null;
    clients: {
        nome: string;
        telefone: string;
        email: string | null;
        endereco: string | null;
    };
}

interface Client {
    id: string;
    nome: string;
    telefone: string;
    email: string | null;
    endereco: string | null;
}

interface PagamentosHostingProps {
    isAdmin?: boolean;
}

export default function PagamentosHosting({ isAdmin = false }: PagamentosHostingProps) {
    const [payments, setPayments] = useState<HostingPayment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("todos");
    const [empresaData, setEmpresaData] = useState<any>(null);

    // Form state
    const [formClientId, setFormClientId] = useState("");
    const [formTipo, setFormTipo] = useState("ambos");
    const [formNomeDominio, setFormNomeDominio] = useState("");
    const [formValorDominio, setFormValorDominio] = useState("");
    const [formValorHospedagem, setFormValorHospedagem] = useState("");
    const [formDataVencimentoDominio, setFormDataVencimentoDominio] = useState("");
    const [formDataVencimentoHospedagem, setFormDataVencimentoHospedagem] = useState("");
    const [formPeriodo, setFormPeriodo] = useState("anual");
    const [formObservacoes, setFormObservacoes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingPayment, setEditingPayment] = useState<HostingPayment | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
        fetchClients();
        fetchEmpresa();
    }, [isAdmin]);

    async function fetchEmpresa() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', user.id)
                .single();
            setEmpresaData(data);
        } catch (error) {
            console.error('Error fetching empresa:', error);
        }
    }

    async function fetchClients() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase.from('clients').select('id, nome, telefone, email, endereco');
            if (!isAdmin) {
                query = query.eq('user_id', user.id);
            }
            const { data } = await query.order('nome');
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    }

    async function fetchPayments() {
        try {
            let query = supabase
                .from('hosting_payments')
                .select(`
          *,
          clients (
            nome,
            telefone,
            email,
            endereco
          )
        `)
                .order('data_vencimento', { ascending: true });

            if (!isAdmin) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    query = query.eq('user_id', user.id);
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            setPayments((data as any) || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Erro ao carregar pagamentos');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formClientId) {
            toast.error('Selecione o cliente');
            return;
        }

        if ((formTipo === 'dominio' || formTipo === 'ambos') && !formDataVencimentoDominio) {
            toast.error('Preencha a data de vencimento do domínio');
            return;
        }

        if ((formTipo === 'hospedagem' || formTipo === 'ambos') && !formDataVencimentoHospedagem) {
            toast.error('Preencha a data de vencimento da hospedagem');
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const payload = {
                user_id: user.id,
                client_id: formClientId,
                tipo: formTipo,
                nome_dominio: formNomeDominio || null,
                valor_dominio: (formTipo === 'hospedagem' ? 0 : parseFloat(formValorDominio)) || 0,
                valor_hospedagem: (formTipo === 'dominio' ? 0 : parseFloat(formValorHospedagem)) || 0,
                data_vencimento: formTipo === 'hospedagem' ? formDataVencimentoHospedagem : formDataVencimentoDominio,
                data_vencimento_hospedagem: formTipo === 'ambos' ? formDataVencimentoHospedagem : null,
                periodo_renovacao: formTipo === 'dominio' ? 'anual' : formPeriodo,
                observacoes: formObservacoes || null,
            };

            if (editingPayment) {
                const { error } = await supabase
                    .from('hosting_payments')
                    .update(payload as any)
                    .eq('id', editingPayment.id);

                if (error) throw error;
                toast.success('Pagamento atualizado com sucesso!');
            } else {
                const { error } = await supabase
                    .from('hosting_payments')
                    .insert([{ ...payload, status: 'pendente' }] as any);

                if (error) throw error;
                toast.success('Pagamento registado com sucesso!');
            }

            setDialogOpen(false);
            setEditingPayment(null);
            resetForm();
            fetchPayments();
        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error('Erro ao registar pagamento');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleMarkPaid(payment: HostingPayment) {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Mark current payment as paid
            const { error: updateError } = await supabase
                .from('hosting_payments')
                .update({
                    status: 'pago',
                    data_pagamento: today,
                } as any)
                .eq('id', payment.id);

            if (updateError) throw updateError;

            // Create next payment entry based on renewal period
            const vencimento = new Date(payment.tipo === 'hospedagem' && payment.data_vencimento_hospedagem ? payment.data_vencimento_hospedagem : payment.data_vencimento);
            switch (payment.periodo_renovacao) {
                case 'anual':
                    vencimento.setFullYear(vencimento.getFullYear() + 1);
                    break;
                case 'semestral':
                    vencimento.setMonth(vencimento.getMonth() + 6);
                    break;
                case 'mensal':
                    vencimento.setMonth(vencimento.getMonth() + 1);
                    break;
            }

            let nextDataVencimento = vencimento.toISOString().split('T')[0];
            let nextDataVencimentoHospedagem = null;

            if (payment.tipo === 'ambos' && payment.data_vencimento_hospedagem) {
                const vencimentoHosp = new Date(payment.data_vencimento_hospedagem);
                switch (payment.periodo_renovacao) {
                    case 'anual':
                        vencimentoHosp.setFullYear(vencimentoHosp.getFullYear() + 1);
                        break;
                    case 'semestral':
                        vencimentoHosp.setMonth(vencimentoHosp.getMonth() + 6);
                        break;
                    case 'mensal':
                        vencimentoHosp.setMonth(vencimentoHosp.getMonth() + 1);
                        break;
                }
                nextDataVencimentoHospedagem = vencimentoHosp.toISOString().split('T')[0];

                // For ambos, data_vencimento refers to domain which is always annual
                const vencimentoDom = new Date(payment.data_vencimento);
                vencimentoDom.setFullYear(vencimentoDom.getFullYear() + 1);
                nextDataVencimento = vencimentoDom.toISOString().split('T')[0];
            }


            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error: insertError } = await supabase.from('hosting_payments').insert({
                user_id: user.id,
                client_id: payment.client_id,
                service_id: payment.service_id,
                tipo: payment.tipo,
                nome_dominio: payment.nome_dominio,
                valor_dominio: payment.valor_dominio,
                valor_hospedagem: payment.valor_hospedagem,
                data_vencimento: nextDataVencimento,
                data_vencimento_hospedagem: nextDataVencimentoHospedagem,
                periodo_renovacao: payment.periodo_renovacao,
                status: 'pendente',
            } as any);

            if (insertError) throw insertError;

            toast.success('Pagamento confirmado! Próximo vencimento criado automaticamente.');
            fetchPayments();
        } catch (error) {
            console.error('Error marking as paid:', error);
            toast.error('Erro ao confirmar pagamento');
        }
    }

    async function handleEdit(payment: HostingPayment) {
        setEditingPayment(payment);
        setFormClientId(payment.client_id);
        setFormTipo(payment.tipo);
        setFormNomeDominio(payment.nome_dominio || "");
        setFormValorDominio(payment.valor_dominio.toString());
        setFormValorHospedagem(payment.valor_hospedagem.toString());

        if (payment.tipo === 'hospedagem') {
            setFormDataVencimentoHospedagem(payment.data_vencimento);
            setFormDataVencimentoDominio("");
        } else {
            setFormDataVencimentoDominio(payment.data_vencimento);
            setFormDataVencimentoHospedagem(payment.data_vencimento_hospedagem || "");
        }

        setFormPeriodo(payment.periodo_renovacao);
        setFormObservacoes(payment.observacoes || "");
        setDialogOpen(true);
    }

    async function handleDelete(id: string) {
        try {
            const { error } = await supabase
                .from('hosting_payments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Pagamento removido com sucesso!');
            fetchPayments();
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast.error('Erro ao remover pagamento');
        } finally {
            setDeleteDialogOpen(false);
            setPaymentToDelete(null);
        }
    }

    function resetForm() {
        setFormClientId("");
        setFormTipo("ambos");
        setFormNomeDominio("");
        setFormValorDominio("");
        setFormValorHospedagem("");
        setFormDataVencimentoDominio("");
        setFormDataVencimentoHospedagem("");
        setFormPeriodo("anual");
        setFormObservacoes("");
    }

    const filteredPayments = payments.filter(p => {
        if (filterStatus === "todos") return true;
        return p.status === filterStatus;
    });

    const pendentesCount = payments.filter(p => p.status === 'pendente').length;
    const vencidosCount = payments.filter(p => {
        const hoje = new Date().toISOString().split('T')[0];
        const isVencidoDataPrincipal = p.status === 'pendente' && p.data_vencimento < hoje;
        const isVencidoHospedagem = p.status === 'pendente' && p.data_vencimento_hospedagem && p.data_vencimento_hospedagem < hoje;
        return isVencidoDataPrincipal || isVencidoHospedagem;
    }).length;
    const totalPendente = payments
        .filter(p => p.status === 'pendente')
        .reduce((sum, p) => sum + Number(p.valor_dominio || 0) + Number(p.valor_hospedagem || 0), 0);

    function getStatusBadge(payment: HostingPayment) {
        const hoje = new Date().toISOString().split('T')[0];
        if (payment.status === 'pago') {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Pago</Badge>;
        }
        if (payment.data_vencimento < hoje) {
            return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Vencido</Badge>;
        }
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    }

    function getClientData(payment: HostingPayment) {
        return payment.clients || clients.find(c => c.id === payment.client_id) || { nome: 'N/A', telefone: '', email: null, endereco: null };
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
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pagamentos de Domínio & Hospedagem</h1>
                        <p className="text-muted-foreground">
                            Gestão de renovações e pagamentos recorrentes
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) {
                            setEditingPayment(null);
                            resetForm();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setEditingPayment(null);
                                resetForm();
                            }} className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105">
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Pagamento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto dialog-content-mobile">
                            <DialogHeader>
                                <DialogTitle>{editingPayment ? 'Editar Pagamento' : 'Registar Pagamento de Domínio/Hospedagem'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Cliente *</Label>
                                    <Select value={formClientId} onValueChange={setFormClientId}>
                                        <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Tipo</Label>
                                    <Select value={formTipo} onValueChange={setFormTipo}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ambos">Domínio + Hospedagem</SelectItem>
                                            <SelectItem value="dominio">Apenas Domínio</SelectItem>
                                            <SelectItem value="hospedagem">Apenas Hospedagem</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(formTipo === 'dominio' || formTipo === 'ambos') && (
                                    <>
                                        <div>
                                            <Label>Nome do Domínio</Label>
                                            <Input
                                                placeholder="Ex: meusite.co.mz"
                                                value={formNomeDominio}
                                                onChange={(e) => setFormNomeDominio(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Valor do Domínio (MT)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formValorDominio}
                                                onChange={(e) => setFormValorDominio(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Data de Vencimento Domínio *</Label>
                                            <Input
                                                type="date"
                                                value={formDataVencimentoDominio}
                                                onChange={(e) => setFormDataVencimentoDominio(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {(formTipo === 'hospedagem' || formTipo === 'ambos') && (
                                    <>
                                        <div>
                                            <Label>Valor da Hospedagem (MT)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formValorHospedagem}
                                                onChange={(e) => setFormValorHospedagem(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Data de Vencimento Hospedagem *</Label>
                                            <Input
                                                type="date"
                                                value={formDataVencimentoHospedagem}
                                                onChange={(e) => setFormDataVencimentoHospedagem(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {(formTipo === 'hospedagem' || formTipo === 'ambos') && (
                                    <div>
                                        <Label>Período de Renovação</Label>
                                        <Select value={formPeriodo} onValueChange={setFormPeriodo}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="anual">Anual</SelectItem>
                                                <SelectItem value="semestral">Semestral</SelectItem>
                                                <SelectItem value="mensal">Mensal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div>
                                    <Label>Observações</Label>
                                    <Textarea
                                        placeholder="Notas adicionais..."
                                        value={formObservacoes}
                                        onChange={(e) => setFormObservacoes(e.target.value)}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? (editingPayment ? 'Atualizando...' : 'Registando...') : (editingPayment ? 'Atualizar Pagamento' : 'Registar Pagamento')}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <Card className="premium-card animate-fade-up stagger-1 border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{pendentesCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">pagamentos aguardando</p>
                        </CardContent>
                    </Card>

                    <Card className="premium-card animate-fade-up stagger-2 border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{vencidosCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">pagamentos em atraso</p>
                        </CardContent>
                    </Card>

                    <Card className="premium-card animate-fade-up stagger-3 border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Globe className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalPendente.toFixed(2)} MT</div>
                            <p className="text-xs text-muted-foreground mt-1">a receber</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pendente">Pendentes</SelectItem>
                            <SelectItem value="pago">Pagos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment cards */}
                <div className="grid gap-4">
                    {filteredPayments.map((payment, index) => {
                        const clientData = getClientData(payment);
                        const total = Number(payment.valor_dominio || 0) + Number(payment.valor_hospedagem || 0);
                        const hoje = new Date().toISOString().split('T')[0];
                        const isVencido = payment.status === 'pendente' && payment.data_vencimento < hoje;

                        return (
                            <Card key={payment.id} className={`premium-card border-none shadow-sm animate-fade-up stagger-${(index % 5) + 1} transition-all ${isVencido ? 'bg-red-50/50' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {payment.tipo === 'dominio' ? <Globe className="w-5 h-5 text-blue-500" /> :
                                                    payment.tipo === 'hospedagem' ? <Server className="w-5 h-5 text-purple-500" /> :
                                                        <><Globe className="w-4 h-4 text-blue-500" /><Server className="w-4 h-4 text-purple-500" /></>}
                                                {payment.nome_dominio || 'Domínio/Hospedagem'}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Cliente: {clientData.nome}
                                            </p>
                                        </div>
                                        {getStatusBadge(payment)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">{payment.tipo === 'ambos' ? 'Venc. Domínio' : 'Vencimento'}</p>
                                            <p className={`text-sm font-semibold ${payment.status === 'pendente' && payment.data_vencimento < hoje ? 'text-red-600' : ''}`}>
                                                {new Date(payment.data_vencimento).toLocaleDateString('pt-MZ')}
                                            </p>
                                        </div>
                                        {payment.tipo === 'ambos' && payment.data_vencimento_hospedagem && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Venc. Hospedagem</p>
                                                <p className={`text-sm font-semibold ${payment.status === 'pendente' && payment.data_vencimento_hospedagem < hoje ? 'text-red-600' : ''}`}>
                                                    {new Date(payment.data_vencimento_hospedagem).toLocaleDateString('pt-MZ')}
                                                </p>
                                            </div>
                                        )}
                                        {Number(payment.valor_dominio) > 0 && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Domínio</p>
                                                <p className="text-sm font-medium">{Number(payment.valor_dominio).toFixed(2)} MT</p>
                                            </div>
                                        )}
                                        {Number(payment.valor_hospedagem) > 0 && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Hospedagem</p>
                                                <p className="text-sm font-medium">{Number(payment.valor_hospedagem).toFixed(2)} MT</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                            <p className="text-sm font-bold">{total.toFixed(2)} MT</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            Renovação: {payment.tipo === 'dominio' ? 'Anual' : payment.periodo_renovacao === 'anual' ? 'Anual' : payment.periodo_renovacao === 'semestral' ? 'Semestral' : 'Mensal'}
                                        </Badge>
                                        {payment.data_pagamento && (
                                            <Badge variant="outline" className="text-xs text-green-600">
                                                Pago em: {new Date(payment.data_pagamento).toLocaleDateString('pt-MZ')}
                                            </Badge>
                                        )}
                                    </div>

                                    {payment.observacoes && (
                                        <p className="text-sm text-muted-foreground mt-3 border-t pt-3">
                                            {payment.observacoes}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                        <PDFDownloadLink
                                            document={
                                                <AvisoPagamentoPDF
                                                    cliente={clientData}
                                                    empresa={empresaData}
                                                    nomeDominio={payment.nome_dominio || undefined}
                                                    valorDominio={Number(payment.valor_dominio) || 0}
                                                    valorHospedagem={Number(payment.valor_hospedagem) || 0}
                                                    dataVencimento={payment.data_vencimento}
                                                    dataVencimentoHospedagem={payment.data_vencimento_hospedagem || undefined}
                                                    periodoRenovacao={payment.periodo_renovacao}
                                                    observacoes={payment.observacoes || undefined}
                                                />
                                            }
                                            fileName={`aviso-pagamento-${clientData.nome?.replace(/\s+/g, '-')}-${Date.now()}.pdf`}
                                        >
                                            {({ loading: pdfLoading }) => (
                                                <Button variant="outline" size="sm" disabled={pdfLoading} className="border-amber-300 text-amber-700 hover:bg-amber-50">
                                                    <FileDown className="w-4 h-4 mr-2" />
                                                    {pdfLoading ? 'Gerando...' : 'Aviso PDF'}
                                                </Button>
                                            )}
                                        </PDFDownloadLink>

                                        {payment.status === 'pendente' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-green-300 text-green-700 hover:bg-green-50"
                                                onClick={() => handleMarkPaid(payment)}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Marcar como Pago
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                            onClick={() => handleEdit(payment)}
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Editar
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-300 text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                setPaymentToDelete(payment.id);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Eliminar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                        <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            Nenhum pagamento de domínio/hospedagem encontrado.
                        </p>
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O registo de pagamento será permanentemente removido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => paymentToDelete && handleDelete(paymentToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout >
    );
}
