import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Plus, Trash2 } from "lucide-react";

const itemSchema = z.object({
    nome: z.string().min(1, "Obrigatório"),
    quantidade: z.number().min(1, "Obrigatório"),
    cor: z.string().optional(),
    marca: z.string().optional(),
    preco_unitario: z.number().min(0, "Obrigatório"),
});

const serviceEletricoSchema = z.object({
    client_id: z.string().min(1, "Selecione um cliente"),
    data_servico: z.string().min(1, "Data é obrigatória"),
    status_pagamento: z.enum(['pago', 'pendente', 'devendo']),
    observacoes: z.string().max(1000).optional().or(z.literal("")),
    itens_servico: z.array(itemSchema),
    incluir_mao_de_obra: z.boolean(),
    valor_mao_de_obra: z.number().min(0).optional(),
});

type EletricoFormData = z.infer<typeof serviceEletricoSchema>;

interface Client {
    id: string;
    nome: string;
}

interface ServiceFormEletricaProps {
    onSuccess: () => void;
    isAdmin?: boolean;
    service?: any | null;
}

export function ServiceFormEletrica({ onSuccess, isAdmin = false, service = null }: ServiceFormEletricaProps) {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<EletricoFormData>({
        resolver: zodResolver(serviceEletricoSchema),
        defaultValues: {
            status_pagamento: 'pago',
            itens_servico: [],
            incluir_mao_de_obra: true,
            valor_mao_de_obra: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "itens_servico",
    });

    const watchItens = watch("itens_servico");
    const watchIncluirMaoDeObra = watch("incluir_mao_de_obra");
    const watchValorMaoDeObra = watch("valor_mao_de_obra") || 0;

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
            if (detalhes.itens_servico) {
                setValue('itens_servico', detalhes.itens_servico);
            }
            setValue('incluir_mao_de_obra', detalhes.incluir_mao_de_obra ?? true);
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
    const valorMateriais = (watchItens || []).reduce((sum, item) => sum + ((item.quantidade || 0) * (item.preco_unitario || 0)), 0);
    const valorTotal = valorMateriais + (watchIncluirMaoDeObra ? watchValorMaoDeObra : 0);
    const valorLucro = watchIncluirMaoDeObra ? watchValorMaoDeObra : 0;
    // Assumimos que o custo material é o investimento, logo o lucro é apenas a mão de obra.

    async function onSubmit(data: EletricoFormData) {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const detalhes = {
                categoria: 'instalacao_eletrica',
                itens_servico: data.itens_servico,
                incluir_mao_de_obra: data.incluir_mao_de_obra,
                valor_mao_de_obra: data.valor_mao_de_obra || 0,
            };

            const finalValorMaterial = data.itens_servico.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
            const finalValorTotal = finalValorMaterial + (data.incluir_mao_de_obra ? (data.valor_mao_de_obra || 0) : 0);
            const finalValorLucro = data.incluir_mao_de_obra ? (data.valor_mao_de_obra || 0) : 0;

            const serviceData = {
                client_id: data.client_id,
                nome_servico: 'Instalação Elétrica',
                data_servico: data.data_servico,
                valor_total: finalValorTotal,
                tipo_pagamento: 'com_investimento',
                valor_investimento: finalValorMaterial, // Custos de material = investimento
                valor_lucro: finalValorLucro,
                status_pagamento: data.status_pagamento,
                observacoes: data.observacoes || null,
                user_id: user.id,
                tem_investimento: finalValorMaterial > 0,
                detalhes_servico: detalhes,
            };

            if (service) {
                const { error } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', service.id);

                if (error) throw error;
                toast.success('Serviço elétrico atualizado com sucesso');
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert([serviceData]);

                if (error) throw error;
                toast.success('Serviço elétrico cadastrado com sucesso');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving electrical service:', error);
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

            {/* Tabela de Materiais/Itens */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">Materiais / Equipamentos</h4>
                    <Button type="button" size="sm" variant="outline" onClick={() => append({ nome: '', quantidade: 1, cor: '', marca: '', preco_unitario: 0 })}>
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Item
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        {fields.length > 0 ? (
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center bg-background p-2 rounded border border-border">
                                        <div className="col-span-3">
                                            <Input placeholder="Nome do Item" {...register(`itens_servico.${index}.nome` as const)} />
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" placeholder="Qtd" {...register(`itens_servico.${index}.quantidade` as const, { valueAsNumber: true })} />
                                        </div>
                                        <div className="col-span-2">
                                            <Input placeholder="Cor (Op)" {...register(`itens_servico.${index}.cor` as const)} />
                                        </div>
                                        <div className="col-span-2">
                                            <Input placeholder="Marca (Op)" {...register(`itens_servico.${index}.marca` as const)} />
                                        </div>
                                        <div className="col-span-2">
                                            <Input type="number" step="0.01" placeholder="Preço Un." {...register(`itens_servico.${index}.preco_unitario` as const, { valueAsNumber: true })} />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground bg-background rounded border border-dashed border-border">
                                Nenhum material adicionado. Liste os materiais necessários para a instalação.
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right text-sm text-muted-foreground mt-2">
                    Total Material: <span className="font-bold text-foreground">{valorMateriais.toFixed(2)} MT</span>
                </div>
            </div>

            {/* Mão de Obra */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="incluir_mao_de_obra" className="cursor-pointer">Mão de Obra</Label>
                        <p className="text-xs text-muted-foreground">Incluir taxa de mão de obra neste orçamento/fatura</p>
                    </div>
                    <Switch
                        id="incluir_mao_de_obra"
                        checked={watchIncluirMaoDeObra}
                        onCheckedChange={(checked) => setValue('incluir_mao_de_obra', checked)}
                    />
                </div>

                {watchIncluirMaoDeObra && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                        <div className="space-y-2">
                            <Label htmlFor="valor_mao_de_obra">Valor Mão de Obra (MT) *</Label>
                            <Input
                                id="valor_mao_de_obra"
                                type="number"
                                step="0.01"
                                {...register("valor_mao_de_obra", { valueAsNumber: true })}
                                placeholder="0.00"
                            />
                            {errors.valor_mao_de_obra && <p className="text-sm text-destructive">{errors.valor_mao_de_obra.message}</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status de Pagamento */}
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

                {/* Resumo Financeiro Automático */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Materiais/Investimento:</span>
                        <span className="font-medium">{valorMateriais.toFixed(2)} MT</span>
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
                <Label htmlFor="observacoes">Observações Técnicas</Label>
                <Textarea
                    id="observacoes"
                    {...register("observacoes")}
                    placeholder="Ex: Quadro elétrico trifásico no Rés-do-chão..."
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {service ? 'Atualizar Instalação' : 'Registar Instalação'}
                </Button>
            </div>
        </form>
    );
}
