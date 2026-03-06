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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const serviceSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  nome_servico: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  data_servico: z.string().min(1, "Data é obrigatória"),
  valor_total: z.string().min(1, "Valor total é obrigatório"),
  tipo_pagamento: z.enum(['fixo', 'com_investimento']),
  valor_investimento: z.string().optional(),
  status_pagamento: z.enum(['pago', 'pendente', 'devendo']),
  observacoes: z.string().max(1000).optional().or(z.literal("")),
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
}

interface Client {
  id: string;
  nome: string;
}

export function ServiceForm({ onSuccess, isAdmin = false }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<'fixo' | 'com_investimento'>('fixo');

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

  async function fetchClients() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('clients')
        .select('id, nome')
        .order('nome');

      // Apenas filtrar por user_id se NÃO for admin
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

  async function onSubmit(data: ServiceFormData) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const valorTotal = parseFloat(data.valor_total);
      
      const valorInvestimento = data.tipo_pagamento === 'com_investimento' && data.valor_investimento
        ? parseFloat(data.valor_investimento)
        : 0;

      const serviceData = {
        client_id: data.client_id,
        nome_servico: data.nome_servico,
        data_servico: data.data_servico,
        valor_total: valorTotal,
        tipo_pagamento: data.tipo_pagamento,
        valor_investimento: valorInvestimento,
        status_pagamento: data.status_pagamento,
        observacoes: data.observacoes || null,
        user_id: user.id,
        tem_investimento: data.tipo_pagamento === 'com_investimento',
      };

      console.log('Tentando salvar serviço:', serviceData);

      const { error, data: insertedData } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }

      toast.success('Serviço cadastrado com sucesso');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving service:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error(`Erro ao salvar serviço: ${errorMessage}`);
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

      {/* Nome do Serviço */}
      <div className="space-y-2">
        <Label htmlFor="nome_servico">Nome do Serviço *</Label>
        <Input
          id="nome_servico"
          {...register("nome_servico")}
          placeholder="Ex: Manutenção preventiva"
        />
        {errors.nome_servico && (
          <p className="text-sm text-destructive">{errors.nome_servico.message}</p>
        )}
      </div>

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
          Cadastrar Serviço
        </Button>
      </div>
    </form>
  );
}
