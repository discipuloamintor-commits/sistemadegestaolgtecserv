import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const clientSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  telefone: z.string().min(9, "Telefone inválido").max(20),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().max(255).optional().or(z.literal("")),
  observacoes: z.string().max(1000).optional().or(z.literal("")),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: {
    id: string;
    nome: string;
    telefone: string;
    email: string | null;
    endereco: string | null;
    foto_url: string | null;
    observacoes: string | null;
  } | null;
  onSuccess: () => void;
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(client?.foto_url || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome: client?.nome || "",
      telefone: client?.telefone || "",
      email: client?.email || "",
      endereco: client?.endereco || "",
      observacoes: client?.observacoes || "",
    },
  });

  async function uploadPhoto(file: File) {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('client-photos')
        .getPublicUrl(fileName);

      setPhotoUrl(data.publicUrl);
      toast.success('Foto carregada com sucesso');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao carregar foto');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: ClientFormData) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const clientData: {
        nome: string;
        telefone: string;
        email: string | null;
        endereco: string | null;
        observacoes: string | null;
        foto_url: string | null;
        user_id: string;
      } = {
        nome: data.nome,
        telefone: data.telefone,
        email: data.email || null,
        endereco: data.endereco || null,
        observacoes: data.observacoes || null,
        foto_url: photoUrl,
        user_id: user.id,
      };

      if (client) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (error) throw error;
        toast.success('Cliente atualizado com sucesso');
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert([clientData]);

        if (error) throw error;
        toast.success('Cliente cadastrado com sucesso');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Photo Upload */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={photoUrl || undefined} />
          <AvatarFallback>
            <Upload className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPhoto(file);
            }}
            disabled={uploading}
            className="max-w-xs"
          />
          {uploading && <p className="text-sm text-muted-foreground mt-1">Carregando...</p>}
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Cliente *</Label>
        <Input
          id="nome"
          {...register("nome")}
          placeholder="Nome completo"
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone *</Label>
        <Input
          id="telefone"
          {...register("telefone")}
          placeholder="+258 84 123 4567"
        />
        {errors.telefone && (
          <p className="text-sm text-destructive">{errors.telefone.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Endereço */}
      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          {...register("endereco")}
          placeholder="Rua, Bairro, Cidade"
        />
        {errors.endereco && (
          <p className="text-sm text-destructive">{errors.endereco.message}</p>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          {...register("observacoes")}
          placeholder="Observações adicionais sobre o cliente..."
          rows={4}
        />
        {errors.observacoes && (
          <p className="text-sm text-destructive">{errors.observacoes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {client ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
