import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2, Receipt, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import GastoForm from "@/components/gastos/GastoForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Gasto {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_gasto: string;
  forma_pagamento: string;
  comprovativo_url: string | null;
  observacoes: string | null;
  user_id: string;
}

interface GastosProps {
  isAdmin?: boolean;
}

export default function Gastos({ isAdmin = false }: GastosProps) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<string | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGastos();
  }, []);

  async function fetchGastos() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('gastos')
        .select('*')
        .order('data_gasto', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGastos(data || []);
    } catch (error) {
      console.error('Error fetching gastos:', error);
      toast.error('Erro ao carregar gastos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!gastoToDelete) return;

    try {
      const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', gastoToDelete);

      if (error) throw error;

      toast.success('Gasto eliminado com sucesso');
      fetchGastos();
    } catch (error) {
      console.error('Error deleting gasto:', error);
      toast.error('Erro ao eliminar gasto');
    } finally {
      setDeleteDialogOpen(false);
      setGastoToDelete(null);
    }
  }

  const filteredGastos = gastos.filter(gasto => {
    const matchesCategoria = filterCategoria === "todos" || gasto.categoria === filterCategoria;
    const matchesSearch = gasto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategoria && matchesSearch;
  });

  const totalGastos = filteredGastos.reduce((sum, g) => sum + Number(g.valor), 0);

  const gastosPorCategoria = filteredGastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + Number(gasto.valor);
    return acc;
  }, {} as Record<string, number>);

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      operacional: "Operacional",
      marketing: "Marketing",
      infraestrutura: "Infraestrutura",
      pessoal: "Pessoal",
      outros: "Outros"
    };
    return labels[categoria] || categoria;
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const labels: Record<string, string> = {
      dinheiro: "Dinheiro",
      transferencia: "Transferência",
      cartao: "Cartão",
      outro: "Outro"
    };
    return labels[forma] || forma;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gastos e Despesas</h1>
            <p className="text-muted-foreground">Gerencie suas despesas operacionais</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingGasto(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGasto ? 'Editar Gasto' : 'Novo Gasto'}</DialogTitle>
              </DialogHeader>
              <GastoForm
                gasto={editingGasto}
                onSuccess={() => {
                  setDialogOpen(false);
                  setEditingGasto(null);
                  fetchGastos();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totalGastos.toFixed(2)} MT</div>
              <p className="text-xs text-muted-foreground">{filteredGastos.length} registros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categoria Principal</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {Object.keys(gastosPorCategoria).length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {getCategoriaLabel(Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1])[0][0])}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1])[0][1].toFixed(2)} MT
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Nenhum gasto registrado</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredGastos.length > 0 ? (totalGastos / 12).toFixed(2) : '0.00'} MT
              </div>
              <p className="text-xs text-muted-foreground">Estimativa baseada no período</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredGastos.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum gasto encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGastos.map((gasto) => (
                  <div key={gasto.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{gasto.descricao}</h3>
                        <Badge variant="outline">{getCategoriaLabel(gasto.categoria)}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{format(new Date(gasto.data_gasto), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                        <span>•</span>
                        <span>{getFormaPagamentoLabel(gasto.forma_pagamento)}</span>
                      </div>
                      {gasto.observacoes && (
                        <p className="text-sm text-muted-foreground">{gasto.observacoes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-destructive">{Number(gasto.valor).toFixed(2)} MT</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {gasto.comprovativo_url && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(gasto.comprovativo_url!, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingGasto(gasto);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setGastoToDelete(gasto.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar este gasto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGastoToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}