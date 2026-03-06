import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

const gastoSchema = z.object({
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres").max(200),
  categoria: z.enum(['operacional', 'marketing', 'infraestrutura', 'pessoal', 'outros']),
  valor: z.string().min(1, "Valor é obrigatório"),
  data_gasto: z.string().min(1, "Data é obrigatória"),
  forma_pagamento: z.enum(['dinheiro', 'transferencia', 'cartao', 'outro']),
  observacoes: z.string().max(500).optional().or(z.literal("")),
});

type GastoFormData = z.infer<typeof gastoSchema>;

interface GastoFormProps {
  onSuccess: () => void;
  gasto?: any;
}

export default function GastoForm({ onSuccess, gasto }: GastoFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [comprovantivoUrl, setComprovantivoUrl] = useState<string | null>(gasto?.comprovativo_url || null);

  const form = useForm<GastoFormData>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      descricao: gasto?.descricao || "",
      categoria: gasto?.categoria || "operacional",
      valor: gasto?.valor?.toString() || "",
      data_gasto: gasto?.data_gasto || "",
      forma_pagamento: gasto?.forma_pagamento || "dinheiro",
      observacoes: gasto?.observacoes || "",
    },
  });

  async function uploadComprovativo(file: File) {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('comprovativos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovativos')
        .getPublicUrl(fileName);

      setComprovantivoUrl(publicUrl);
      toast.success('Comprovativo enviado com sucesso');
    } catch (error) {
      console.error('Error uploading comprovativo:', error);
      toast.error('Erro ao enviar comprovativo');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: GastoFormData) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const gastoData = {
        user_id: user.id,
        descricao: data.descricao,
        categoria: data.categoria,
        valor: parseFloat(data.valor),
        data_gasto: data.data_gasto,
        forma_pagamento: data.forma_pagamento,
        comprovativo_url: comprovantivoUrl,
        observacoes: data.observacoes || null,
      };

      if (gasto) {
        const { error } = await supabase
          .from('gastos')
          .update(gastoData)
          .eq('id', gasto.id);

        if (error) throw error;
        toast.success('Gasto atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('gastos')
          .insert([gastoData]);

        if (error) throw error;
        toast.success('Gasto cadastrado com sucesso');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving gasto:', error);
      toast.error('Erro ao salvar gasto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Compra de equipamentos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (MT) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="data_gasto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Gasto *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="forma_pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pagamento *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Comprovativo (Opcional)</FormLabel>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadComprovativo(file);
              }}
              disabled={uploading}
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          {comprovantivoUrl && (
            <p className="text-sm text-green-600">✓ Comprovativo enviado</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {gasto ? 'Atualizar' : 'Cadastrar'} Gasto
        </Button>
      </form>
    </Form>
  );
}