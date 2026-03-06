import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";

const companySchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  descricao: z.string().max(500).optional(),
  endereco: z.string().max(200).optional(),
  contato: z.string().max(100).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function MinhaEmpresa() {
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  async function fetchCompanyData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCompanyData(data);
        setValue('nome', data.nome);
        setValue('descricao', data.descricao || '');
        setValue('endereco', data.endereco || '');
        setValue('contato', data.contato || '');
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  }

  async function onSubmit(data: CompanyFormData) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (companyData) {
        // Update
        const { error } = await supabase
          .from('companies')
          .update(data)
          .eq('id', companyData.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('companies')
          .insert([{ 
            nome: data.nome,
            descricao: data.descricao,
            endereco: data.endereco,
            contato: data.contato,
            user_id: user.id 
          }]);

        if (error) throw error;
      }

      toast.success('Dados da empresa salvos com sucesso');
      fetchCompanyData();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Erro ao salvar dados da empresa');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingLogo(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client-photos')
        .getPublicUrl(fileName);

      // Update company with logo URL
      if (companyData) {
        const { error } = await supabase
          .from('companies')
          .update({ logotipo_url: publicUrl })
          .eq('id', companyData.id);

        if (error) throw error;
        toast.success('Logotipo atualizado com sucesso');
        fetchCompanyData();
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao fazer upload do logotipo');
    } finally {
      setUploadingLogo(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Minha Empresa
          </h1>
          <p className="text-muted-foreground">
            Gerencie os dados da sua empresa
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <Input
                    id="nome"
                    {...register("nome")}
                    placeholder="Ex: LG TecServ"
                  />
                  {errors.nome && (
                    <p className="text-sm text-destructive">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    {...register("descricao")}
                    placeholder="Breve descrição da empresa..."
                    rows={3}
                  />
                  {errors.descricao && (
                    <p className="text-sm text-destructive">{errors.descricao.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    {...register("endereco")}
                    placeholder="Endereço completo"
                  />
                  {errors.endereco && (
                    <p className="text-sm text-destructive">{errors.endereco.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contato">Contato</Label>
                  <Input
                    id="contato"
                    {...register("contato")}
                    placeholder="Email ou telefone"
                  />
                  {errors.contato && (
                    <p className="text-sm text-destructive">{errors.contato.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar Dados
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Logotipo */}
          <Card>
            <CardHeader>
              <CardTitle>Logotipo da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyData?.logotipo_url ? (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/20">
                  <img
                    src={companyData.logotipo_url}
                    alt="Logotipo"
                    className="max-h-48 object-contain"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum logotipo carregado</p>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="logo">Upload de Logotipo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo || !companyData}
                  className="cursor-pointer"
                />
                {!companyData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Salve os dados da empresa primeiro
                  </p>
                )}
                {uploadingLogo && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Enviando logotipo...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
