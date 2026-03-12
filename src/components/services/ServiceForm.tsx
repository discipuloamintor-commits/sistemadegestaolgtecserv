import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const SERVICE_CATEGORIES = [
  { value: 'website', label: 'Criação de Website' },
  { value: 'aplicativo', label: 'Criação de Aplicativo' },
  { value: 'sistema', label: 'Criação de Sistema' },
  { value: 'trafego_pago', label: 'Gestão de Tráfego Pago' },
  { value: 'redes_sociais', label: 'Gestão de Redes Sociais' },
  { value: 'outro', label: 'Outro' },
];

const serviceSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  categoria_servico: z.string().min(1, "Selecione uma categoria"),
  nome_servico: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  nome_servico_custom: z.string().optional(),
  data_servico: z.string().min(1, "Data é obrigatória"),
  valor_total: z.string().min(1, "Valor total é obrigatório"),
  tipo_pagamento: z.enum(['fixo', 'com_investimento']),
  valor_investimento: z.string().optional(),
  status_pagamento: z.enum(['pago', 'pendente', 'devendo']),
  observacoes: z.string().max(1000).optional().or(z.literal("")),
  // Website fields
  valor_dominio: z.string().optional(),
  valor_hospedagem: z.string().optional(),
  hospedagem_gratuita: z.boolean().optional(),
  periodo_hospedagem_gratuita: z.string().optional(),
  // Tráfego pago fields
  orcamento_anuncios: z.string().optional(),
  plataformas: z.string().optional(),
}).refine((data) => {
  if (data.tipo_pagamento === 'com_investimento') {
    return data.valor_investimento && data.valor_investimento.length > 0;
  }
  return true;
}, {
  message: "Valor do investimento é obrigatório quando tipo é 'Com Investimento'",
  path: ["valor_investimento"],
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  onSuccess: () => void;
  isAdmin?: boolean;
  service?: any | null;
}

interface Client {
  id: string;
  nome: string;
}

export function ServiceForm({ onSuccess, isAdmin = false, service = null }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<'fixo' | 'com_investimento'>(service?.tipo_pagamento || 'fixo');
  const [selectedCategoria, setSelectedCategoria] = useState<string>(service?.detalhes_servico?.categoria || '');
  const [hospedagemGratuita, setHospedagemGratuita] = useState(service?.detalhes_servico?.hospedagem_gratuita || false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      tipo_pagamento: 'fixo',
      status_pagamento: 'pago',
      hospedagem_gratuita: false,
    },
  });

  const watchValorTotal = watch('valor_total');
  const watchValorInvestimento = watch('valor_investimento');
  const watchTipo = watch('tipo_pagamento');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    setSelectedTipo(watchTipo);
  }, [watchTipo]);

  useEffect(() => {
    if (service) {
      setSelectedTipo(service.tipo_pagamento);
      setSelectedCategoria(service.detalhes_servico?.categoria || '');
      setHospedagemGratuita(service.detalhes_servico?.hospedagem_gratuita || false);

      setValue('client_id', service.client_id);
      setValue('categoria_servico', service.detalhes_servico?.categoria || '');
      setValue('data_servico', service.data_servico);
      setValue('valor_total', service.valor_total.toString());
      setValue('tipo_pagamento', service.tipo_pagamento);
      setValue('status_pagamento', service.status_pagamento);
      setValue('observacoes', service.observacoes || '');

      if (service.tipo_pagamento === 'com_investimento') {
        setValue('valor_investimento', service.valor_investimento?.toString() || '');
      }

      if (service.detalhes_servico?.categoria === 'website') {
        setValue('valor_dominio', service.detalhes_servico.valor_dominio?.toString() || '');
        setValue('valor_hospedagem', service.detalhes_servico.valor_hospedagem?.toString() || '');
        setValue('hospedagem_gratuita', service.detalhes_servico.hospedagem_gratuita || false);
        setValue('periodo_hospedagem_gratuita', service.detalhes_servico.periodo_hospedagem_gratuita?.toString() || '');
      }

      if (service.detalhes_servico?.categoria === 'trafego_pago') {
        setValue('orcamento_anuncios', service.detalhes_servico.orcamento_anuncios?.toString() || '');
        setValue('plataformas', service.detalhes_servico.plataformas || '');
      }

      if (service.detalhes_servico?.categoria === 'outro') {
        setValue('nome_servico_custom', service.nome_servico);
      }
      setValue('nome_servico', service.nome_servico);
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

  const calculateLucro = () => {
    if (selectedTipo === 'com_investimento' && watchValorTotal && watchValorInvestimento) {
      const total = parseFloat(watchValorTotal) || 0;
      const investimento = parseFloat(watchValorInvestimento) || 0;
      return (total - investimento).toFixed(2);
    }
    return watchValorTotal ? parseFloat(watchValorTotal).toFixed(2) : '0.00';
  };

  function handleCategoriaChange(value: string) {
    setSelectedCategoria(value);
    setValue('categoria_servico', value);
    const cat = SERVICE_CATEGORIES.find(c => c.value === value);
    if (cat && value !== 'outro') {
      setValue('nome_servico', cat.label);
    } else {
      setValue('nome_servico', '');
    }
  }

  async function onSubmit(data: ServiceFormData) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const valorTotal = parseFloat(data.valor_total);
      const valorInvestimento = data.tipo_pagamento === 'com_investimento' && data.valor_investimento
        ? parseFloat(data.valor_investimento)
        : 0;

      // Build detalhes_servico based on category
      const detalhes: Record<string, any> = {
        categoria: data.categoria_servico,
      };

      if (data.categoria_servico === 'website') {
        detalhes.valor_dominio = data.valor_dominio ? parseFloat(data.valor_dominio) : 0;
        detalhes.valor_hospedagem = data.valor_hospedagem ? parseFloat(data.valor_hospedagem) : 0;
        detalhes.hospedagem_gratuita = data.hospedagem_gratuita || false;
        detalhes.periodo_hospedagem_gratuita = data.periodo_hospedagem_gratuita ? parseInt(data.periodo_hospedagem_gratuita) : 0;
      }

      if (data.categoria_servico === 'trafego_pago') {
        detalhes.orcamento_anuncios = data.orcamento_anuncios ? parseFloat(data.orcamento_anuncios) : 0;
        detalhes.plataformas = data.plataformas || '';
      }

      const finalName = data.categoria_servico === 'outro' && data.nome_servico_custom
        ? data.nome_servico_custom
        : data.nome_servico;

      const serviceData = {
        client_id: data.client_id,
        nome_servico: finalName,
        data_servico: data.data_servico,
        valor_total: valorTotal,
        tipo_pagamento: data.tipo_pagamento,
        valor_investimento: valorInvestimento,
        status_pagamento: data.status_pagamento,
        observacoes: data.observacoes || null,
        user_id: user.id,
        tem_investimento: data.tipo_pagamento === 'com_investimento',
        detalhes_servico: detalhes,
      };

      if (service) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);

        if (error) throw error;
        toast.success('Serviço atualizado com sucesso');
      } else {
        // Insert new service
        const { error } = await supabase
          .from('services')
          .insert([serviceData])
          .select();

        if (error) throw error;
        toast.success('Serviço cadastrado com sucesso');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(`Erro ao salvar serviço: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        {errors.client_id && (
          <p className="text-sm text-destructive">{errors.client_id.message}</p>
        )}
      </div>

      {/* Categoria do Serviço */}
      <div className="space-y-2">
        <Label>Categoria do Serviço *</Label>
        <Select onValueChange={handleCategoriaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoria_servico && (
          <p className="text-sm text-destructive">{errors.categoria_servico.message}</p>
        )}
      </div>

      {/* Nome personalizado (apenas para "Outro") */}
      {selectedCategoria === 'outro' && (
        <div className="space-y-2">
          <Label htmlFor="nome_servico_custom">Nome do Serviço *</Label>
          <Input
            id="nome_servico_custom"
            {...register("nome_servico_custom")}
            placeholder="Descreva o serviço..."
            onChange={(e) => {
              setValue('nome_servico_custom', e.target.value);
              setValue('nome_servico', e.target.value || 'Outro');
            }}
          />
        </div>
      )}

      {/* Hidden field for nome_servico when not "outro" */}
      <input type="hidden" {...register("nome_servico")} />

      {/* === CAMPOS ESPECÍFICOS: WEBSITE === */}
      {selectedCategoria === 'website' && (
        <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="font-semibold text-sm text-foreground">Detalhes do Website</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_dominio">Valor do Domínio (MT)</Label>
              <Input
                id="valor_dominio"
                type="number"
                step="0.01"
                {...register("valor_dominio")}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_hospedagem">Valor da Hospedagem (MT)</Label>
              <Input
                id="valor_hospedagem"
                type="number"
                step="0.01"
                {...register("valor_hospedagem")}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md border border-border bg-background">
            <div>
              <Label htmlFor="hospedagem_gratuita" className="cursor-pointer">Hospedagem Gratuita?</Label>
              <p className="text-xs text-muted-foreground">Oferecer período de hospedagem gratuita</p>
            </div>
            <Switch
              id="hospedagem_gratuita"
              checked={hospedagemGratuita}
              onCheckedChange={(checked) => {
                setHospedagemGratuita(checked);
                setValue('hospedagem_gratuita', checked);
              }}
            />
          </div>

          {hospedagemGratuita && (
            <div className="space-y-2">
              <Label htmlFor="periodo_hospedagem_gratuita">Período Gratuito (meses)</Label>
              <Input
                id="periodo_hospedagem_gratuita"
                type="number"
                min="1"
                {...register("periodo_hospedagem_gratuita")}
                placeholder="Ex: 3"
              />
            </div>
          )}
        </div>
      )}

      {/* === CAMPOS ESPECÍFICOS: TRÁFEGO PAGO === */}
      {selectedCategoria === 'trafego_pago' && (
        <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="font-semibold text-sm text-foreground">Detalhes de Tráfego Pago</h4>

          <div className="space-y-2">
            <Label htmlFor="orcamento_anuncios">Orçamento de Anúncios (MT)</Label>
            <Input
              id="orcamento_anuncios"
              type="number"
              step="0.01"
              {...register("orcamento_anuncios")}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plataformas">Plataformas</Label>
            <Input
              id="plataformas"
              {...register("plataformas")}
              placeholder="Ex: Facebook, Google, Instagram"
            />
          </div>
        </div>
      )}

      {/* Data do Serviço */}
      <div className="space-y-2">
        <Label htmlFor="data_servico">Data do Serviço *</Label>
        <Input
          id="data_servico"
          type="date"
          {...register("data_servico")}
        />
        {errors.data_servico && (
          <p className="text-sm text-destructive">{errors.data_servico.message}</p>
        )}
      </div>

      {/* Tipo de Pagamento */}
      <div className="space-y-2">
        <Label>Tipo de Pagamento *</Label>
        <RadioGroup
          defaultValue="fixo"
          onValueChange={(value) => setValue('tipo_pagamento', value as 'fixo' | 'com_investimento')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fixo" id="fixo" />
            <Label htmlFor="fixo" className="font-normal cursor-pointer">
              Valor Fixo (sem investimento)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="com_investimento" id="com_investimento" />
            <Label htmlFor="com_investimento" className="font-normal cursor-pointer">
              Valor com Investimento
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Valor Total */}
      <div className="space-y-2">
        <Label htmlFor="valor_total">Valor Total (MT) *</Label>
        <Input
          id="valor_total"
          type="number"
          step="0.01"
          {...register("valor_total")}
          placeholder="0.00"
        />
        {errors.valor_total && (
          <p className="text-sm text-destructive">{errors.valor_total.message}</p>
        )}
      </div>

      {/* Valor do Investimento (condicional) */}
      {selectedTipo === 'com_investimento' && (
        <div className="space-y-2">
          <Label htmlFor="valor_investimento">Valor do Investimento (MT) *</Label>
          <Input
            id="valor_investimento"
            type="number"
            step="0.01"
            {...register("valor_investimento")}
            placeholder="0.00"
          />
          {errors.valor_investimento && (
            <p className="text-sm text-destructive">{errors.valor_investimento.message}</p>
          )}
        </div>
      )}

      {/* Lucro Calculado */}
      <div className="p-4 bg-muted rounded-lg">
        <Label>Lucro Líquido</Label>
        <p className="text-2xl font-bold text-green-600">{calculateLucro()} MT</p>
        <p className="text-xs text-muted-foreground">
          {selectedTipo === 'com_investimento'
            ? 'Calculado automaticamente: Valor Total - Investimento'
            : 'Igual ao Valor Total (sem investimento)'
          }
        </p>
      </div>

      {/* Status de Pagamento */}
      <div className="space-y-2">
        <Label htmlFor="status_pagamento">Status de Pagamento *</Label>
        <Select
          defaultValue="pago"
          onValueChange={(value) => setValue('status_pagamento', value as 'pago' | 'pendente' | 'devendo')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="devendo">Devendo</SelectItem>
          </SelectContent>
        </Select>
        {errors.status_pagamento && (
          <p className="text-sm text-destructive">{errors.status_pagamento.message}</p>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register("observacoes")}
          placeholder="Observações adicionais sobre o serviço..."
          rows={4}
        />
        {errors.observacoes && (
          <p className="text-sm text-destructive">{errors.observacoes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {service ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
        </Button>
      </div>
    </form>
  );
}
