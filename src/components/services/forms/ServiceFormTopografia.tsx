import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const serviceTopografiaSchema = z.object({
    client_id: z.string().min(1, "Selecione um cliente"),
    data_servico: z.string().min(1, "Data é obrigatória"),
    status_pagamento: z.enum(['pago', 'pendente', 'devendo']),
    observacoes: z.string().max(1000).optional().or(z.literal("")),

    instrumentos: z.string().min(2, "Informe os instrumentos planeados"),
    equipamento_empresa: z.boolean(),
    custo_aluguel: z.number().min(0).optional(),
    tempo_entrega: z.number().min(1, "Obrigatório"),
    valor_transporte: z.number().min(0, "Obrigatório"),
    area_local: z.number().min(0, "Obrigatório"),
    valor_mao_de_obra: z.number().min(0, "Obrigatório"),
});

type TopografiaFormData = z.infer<typeof serviceTopografiaSchema>;

interface Client {
    id: string;
    nome: string;
}

interface ServiceFormTopografiaProps {
    onSuccess: () => void;
    isAdmin?: boolean;
    service?: any | null;
}

export function ServiceFormTopografia({ onSuccess, isAdmin = false, service = null }: ServiceFormTopografiaProps) {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TopografiaFormData>({
        resolver: zodResolver(serviceTopografiaSchema),
        defaultValues: {
            status_pagamento: 'pago',
            equipamento_empresa: true,
            custo_aluguel: 0,
            valor_transporte: 0,
            valor_mao_de_obra: 0,
        },
    });

    const watchEquipamentoEmpresa = watch("equipamento_empresa");
    const watchAluguel = watch("custo_aluguel") || 0;
    const watchTransporte = watch("valor_transporte") || 0;
    const watchMaoDeObra = watch("valor_mao_de_obra") || 0;

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (service) {
            setValue('client_id', service.client_id);
            setValue('data_servico', service.data_servico);
            setValue('status_pagamento', service.status_pagamento);
            setValue('observacoes', service.observacoes || '');

            const detalhes = service.detalhes_servico || {};
            setValue('instrumentos', detalhes.instrumentos || '');
            setValue('equipamento_empresa', detalhes.equipamento_empresa ?? true);
            setValue('custo_aluguel', detalhes.custo_aluguel ?? 0);
            setValue('tempo_entrega', detalhes.tempo_entrega ?? 1);
            setValue('valor_transporte', detalhes.valor_transporte ?? 0);
            setValue('area_local', detalhes.area_local ?? 0);
            setValue('valor_mao_de_obra', detalhes.valor_mao_de_obra ?? 0);
        }
    }, [service, setValue]);

    async function fetchClients() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase
                .from('clients')
                .select('id, nome')
                .order('nome');

            if (!isAdmin) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;
            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Erro ao carregar clientes');
        }
    }

    // Cálculos Automáticos
    const valorInvestimento = watchTransporte + (!watchEquipamentoEmpresa ? watchAluguel : 0);
    const valorTotal = watchMaoDeObra + valorInvestimento;
    const valorLucro = watchMaoDeObra;

    async function onSubmit(data: TopografiaFormData) {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const detalhes = {
                categoria: 'topografia',
                instrumentos: data.instrumentos,
                equipamento_empresa: data.equipamento_empresa,
                custo_aluguel: !data.equipamento_empresa ? (data.custo_aluguel || 0) : 0,
                tempo_entrega: data.tempo_entrega,
                valor_transporte: data.valor_transporte,
                area_local: data.area_local,
                valor_mao_de_obra: data.valor_mao_de_obra,
            };

            const finalInvestimento = data.valor_transporte + (!data.equipamento_empresa ? (data.custo_aluguel || 0) : 0);
            const finalValorTotal = data.valor_mao_de_obra + finalInvestimento;
            const finalValorLucro = data.valor_mao_de_obra;

            const serviceData = {
                client_id: data.client_id,
                nome_servico: 'Levantamento Topográfico',
                data_servico: data.data_servico,
                valor_total: finalValorTotal,
                tipo_pagamento: 'com_investimento',
                valor_investimento: finalInvestimento,
                valor_lucro: finalValorLucro,
                status_pagamento: data.status_pagamento,
                observacoes: data.observacoes || null,
                user_id: user.id,
                tem_investimento: finalInvestimento > 0,
                detalhes_servico: detalhes,
            };

            if (service) {
                const { error } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', service.id);

                if (error) throw error;
                toast.success('Serviço de topografia atualizado com sucesso');
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert([serviceData]);

                if (error) throw error;
                toast.success('Serviço de topografia cadastrado com sucesso');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving topography service:', error);
            toast.error(`Erro ao salvar: ${error?.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="space-y-2">
                    <Label htmlFor="client_id">Cliente *</Label>
                    <Select onValueChange={(value) => setValue('client_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.client_id && <p className="text-sm text-destructive">{errors.client_id.message}</p>}
                </div>

                {/* Data do Serviço */}
                <div className="space-y-2">
                    <Label htmlFor="data_servico">Data do Serviço *</Label>
                    <Input id="data_servico" type="date" {...register("data_servico")} />
                    {errors.data_servico && <p className="text-sm text-destructive">{errors.data_servico.message}</p>}
                </div>
            </div>

            {/* Detalhes Técnicos da Topografia */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <h4 className="font-semibold text-sm text-foreground">Detalhes Técnicos</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="area_local">Área do Local (m²/ha) *</Label>
                        <Input id="area_local" type="number" step="0.01" {...register("area_local", { valueAsNumber: true })} placeholder="Ex: 500" />
                        {errors.area_local && <p className="text-sm text-destructive">{errors.area_local.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tempo_entrega">Tempo de Entrega (Dias) *</Label>
                        <Input id="tempo_entrega" type="number" {...register("tempo_entrega", { valueAsNumber: true })} placeholder="Ex: 7" />
                        {errors.tempo_entrega && <p className="text-sm text-destructive">{errors.tempo_entrega.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="instrumentos">Instrumentos a Usar *</Label>
                        <Input id="instrumentos" {...register("instrumentos")} placeholder="Ex: Estação Total, GPS RTK, Drone..." />
                        {errors.instrumentos && <p className="text-sm text-destructive">{errors.instrumentos.message}</p>}
                    </div>
                </div>
            </div>

            {/* Custos e Equipamento */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <h4 className="font-semibold text-sm text-foreground">Equipamentos & Investimento</h4>

                <div className="flex items-center justify-between p-3 rounded-md border border-border bg-background">
                    <div>
                        <Label htmlFor="equipamento_empresa" className="cursor-pointer">Equipamento da Empresa?</Label>
                        <p className="text-xs text-muted-foreground">O equipamento pertence à empresa (não alugado)</p>
                    </div>
                    <Switch
                        id="equipamento_empresa"
                        checked={watchEquipamentoEmpresa}
                        onCheckedChange={(checked) => setValue('equipamento_empresa', checked)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!watchEquipamentoEmpresa && (
                        <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="custo_aluguel">Custo de Aluguel (MT) *</Label>
                            <Input id="custo_aluguel" type="number" step="0.01" {...register("custo_aluguel", { valueAsNumber: true })} placeholder="0.00" />
                            {errors.custo_aluguel && <p className="text-sm text-destructive">{errors.custo_aluguel.message}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="valor_transporte">Valor de Transporte (MT) *</Label>
                        <Input id="valor_transporte" type="number" step="0.01" {...register("valor_transporte", { valueAsNumber: true })} placeholder="0.00" />
                        {errors.valor_transporte && <p className="text-sm text-destructive">{errors.valor_transporte.message}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mão de Obra e Status */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="valor_mao_de_obra">Valor pelo Serviço / Mão de Obra (MT) *</Label>
                        <Input id="valor_mao_de_obra" type="number" step="0.01" {...register("valor_mao_de_obra", { valueAsNumber: true })} placeholder="0.00" />
                        {errors.valor_mao_de_obra && <p className="text-sm text-destructive">{errors.valor_mao_de_obra.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status_pagamento">Status de Pagamento *</Label>
                        <Select defaultValue="pago" onValueChange={(value) => setValue('status_pagamento', value as 'pago' | 'pendente' | 'devendo')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pago">Pago</SelectItem>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="devendo">Devendo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Resumo Financeiro Automático */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2 h-fit mt-auto mb-auto">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transporte + Alugueres:</span>
                        <span className="font-medium">{valorInvestimento.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mão de Obra (Lucro):</span>
                        <span className="font-medium text-green-600">{valorLucro.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-primary/20">
                        <span className="text-primary">Valor Total:</span>
                        <span className="text-primary">{valorTotal.toFixed(2)} MT</span>
                    </div>
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Técnicas / Anotações</Label>
                <Textarea
                    id="observacoes"
                    {...register("observacoes")}
                    placeholder="Condições do terreno, limitações de acesso..."
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {service ? 'Atualizar Serviço' : 'Registar Topografia'}
                </Button>
            </div>
        </form>
    );
}
