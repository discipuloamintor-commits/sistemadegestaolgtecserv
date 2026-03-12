import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PropostaContratoMensalPDF, SERVICOS_DISPONIVEIS } from "@/components/pdf/PropostaContratoMensalPDF";

interface Client {
    id: string;
    nome: string;
    telefone: string;
    email: string | null;
    endereco: string | null;
}

interface PropostaContratoFormProps {
    isAdmin?: boolean;
}

export function PropostaContratoForm({ isAdmin = false }: PropostaContratoFormProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
    const [valorMensal, setValorMensal] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [condicoesAdicionais, setCondicoesAdicionais] = useState("");
    const [empresaData, setEmpresaData] = useState<any>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        fetchClients();
        fetchEmpresa();
    }, []);

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

    function handleClientChange(clientId: string) {
        setSelectedClientId(clientId);
        const client = clients.find(c => c.id === clientId) || null;
        setSelectedClient(client);
        setReady(false);
    }

    function handleServicoToggle(servicoId: string, checked: boolean) {
        setServicosSelecionados(prev =>
            checked ? [...prev, servicoId] : prev.filter(id => id !== servicoId)
        );
        setReady(false);
    }

    function handlePrepare() {
        if (!selectedClientId) {
            toast.error('Selecione um cliente');
            return;
        }
        if (servicosSelecionados.length === 0) {
            toast.error('Selecione pelo menos um serviço');
            return;
        }
        if (!valorMensal || parseFloat(valorMensal) <= 0) {
            toast.error('Informe o valor mensal');
            return;
        }
        setReady(true);
        toast.success('Proposta pronta! Clique em "Descarregar PDF" para gerar o documento.');
    }

    const valor = parseFloat(valorMensal) || 0;

    return (
        <div className="space-y-6">
            {/* Cliente */}
            <div>
                <Label className="text-sm font-semibold">Cliente *</Label>
                <Select value={selectedClientId} onValueChange={handleClientChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                        {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Checklist */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">Serviços Incluídos *</Label>
                <div className="space-y-3">
                    {SERVICOS_DISPONIVEIS.map(servico => (
                        <div key={servico.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                            <Checkbox
                                id={servico.id}
                                checked={servicosSelecionados.includes(servico.id)}
                                onCheckedChange={(checked) => handleServicoToggle(servico.id, checked as boolean)}
                            />
                            <label htmlFor={servico.id} className="text-sm cursor-pointer flex-1">
                                {servico.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Valor */}
            <div>
                <Label className="text-sm font-semibold">Valor Mensal (MT) *</Label>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 15000.00"
                    value={valorMensal}
                    onChange={(e) => { setValorMensal(e.target.value); setReady(false); }}
                    className="text-lg font-bold"
                />
            </div>

            {/* Observações */}
            <div>
                <Label className="text-sm font-semibold">Observações</Label>
                <Textarea
                    placeholder="Notas adicionais para a proposta..."
                    value={observacoes}
                    onChange={(e) => { setObservacoes(e.target.value); setReady(false); }}
                />
            </div>

            {/* Condições Adicionais */}
            <div>
                <Label className="text-sm font-semibold">Condições Adicionais</Label>
                <Textarea
                    placeholder="Condições extras além das padrão..."
                    value={condicoesAdicionais}
                    onChange={(e) => { setCondicoesAdicionais(e.target.value); setReady(false); }}
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t">
                {!ready ? (
                    <Button onClick={handlePrepare} className="w-full bg-green-700 hover:bg-green-800">
                        Preparar Proposta
                    </Button>
                ) : (
                    <PDFDownloadLink
                        document={
                            <PropostaContratoMensalPDF
                                cliente={selectedClient}
                                empresa={empresaData}
                                servicosSelecionados={servicosSelecionados}
                                valorMensal={valor}
                                observacoes={observacoes || undefined}
                                condicoesAdicionais={condicoesAdicionais || undefined}
                            />
                        }
                        fileName={`proposta-contrato-${selectedClient?.nome?.replace(/\s+/g, '-')}-${Date.now()}.pdf`}
                    >
                        {({ loading: pdfLoading }) => (
                            <Button className="w-full bg-green-700 hover:bg-green-800" disabled={pdfLoading}>
                                <FileDown className="w-4 h-4 mr-2" />
                                {pdfLoading ? 'Gerando PDF...' : 'Descarregar PDF da Proposta'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                )}
            </div>
        </div>
    );
}
