import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, MoreVertical, Trash2, Ban, PlayCircle } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  nome_completo: string;
  status_aprovacao: string;
  suspenso: boolean;
  data_suspensao: string | null;
  dias_suspensao: number | null;
  created_at: string;
}

export default function GerenciarUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({ 
    open: false, 
    userId: null 
  });
  const [suspendDialog, setSuspendDialog] = useState<{ 
    open: boolean; 
    userId: string | null; 
    days: number 
  }>({ 
    open: false, 
    userId: null, 
    days: 7 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      // Buscar IDs de todos os admins
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      const adminIds = adminRoles?.map(r => r.user_id) || [];
      
      // Buscar perfis excluindo admins
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Se existem admins, excluí-los da lista
      if (adminIds.length > 0) {
        query = query.not('id', 'in', `(${adminIds.join(',')})`);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function approveUser(userId: string) {
    try {
      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status_aprovacao: 'aprovado' })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Remove pendente role and add membro role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'pendente');

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'membro' });

      if (insertError) throw insertError;

      toast.success('Usuário aprovado com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Erro ao aprovar usuário');
    }
  }

  async function rejectUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status_aprovacao: 'rejeitado' })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário rejeitado');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Erro ao rejeitar usuário');
    }
  }

  async function suspendUser(userId: string, days: number) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          suspenso: true,
          data_suspensao: new Date().toISOString(),
          dias_suspensao: days,
          motivo_suspensao: `Suspenso por ${days} dias`,
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Usuário suspenso por ${days} dias`);
      fetchUsers();
      setSuspendDialog({ open: false, userId: null, days: 7 });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Erro ao suspender usuário');
    }
  }

  async function reactivateUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          suspenso: false,
          data_suspensao: null,
          dias_suspensao: null,
          motivo_suspensao: null,
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário reativado com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Erro ao reativar usuário');
    }
  }

  async function deleteUser(userId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      console.log('Chamando edge function para deletar usuário:', userId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao eliminar usuário');
      }

      toast.success('Usuário eliminado permanentemente com sucesso');
      fetchUsers();
      setDeleteDialog({ open: false, userId: null });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Erro ao eliminar usuário');
    }
  }

  const filteredUsers = users.filter(user => {
    if (filterStatus === "todos") return true;
    if (filterStatus === "suspenso") return user.suspenso;
    return user.status_aprovacao === filterStatus;
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Gerencie aprovações e permissões</p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="aprovado">Aprovados</SelectItem>
              <SelectItem value="rejeitado">Rejeitados</SelectItem>
              <SelectItem value="suspenso">Suspensos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{user.nome_completo}</CardTitle>
                  <div className="flex items-center gap-2">
                    {user.suspenso && (
                      <Badge variant="destructive">Suspenso</Badge>
                    )}
                    <Badge variant={
                      user.status_aprovacao === 'aprovado' ? 'default' :
                      user.status_aprovacao === 'pendente' ? 'secondary' :
                      'destructive'
                    }>
                      {user.status_aprovacao}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {user.status_aprovacao === 'pendente' && (
                          <>
                            <DropdownMenuItem onClick={() => approveUser(user.id)}>
                              <Check className="w-4 h-4 mr-2" />
                              Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => rejectUser(user.id)}>
                              <X className="w-4 h-4 mr-2" />
                              Rejeitar
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {user.suspenso ? (
                          <DropdownMenuItem onClick={() => reactivateUser(user.id)}>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => setSuspendDialog({ 
                              open: true, 
                              userId: user.id, 
                              days: 7 
                            })}>
                              <Ban className="w-4 h-4 mr-2" />
                              Suspender (7 dias)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSuspendDialog({ 
                              open: true, 
                              userId: user.id, 
                              days: 15 
                            })}>
                              <Ban className="w-4 h-4 mr-2" />
                              Suspender (15 dias)
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-MZ')}
                </p>
                {user.suspenso && user.data_suspensao && user.dias_suspensao && (
                  <p className="text-sm text-destructive mt-1">
                    Suspenso até: {new Date(
                      new Date(user.data_suspensao).getTime() + 
                      user.dias_suspensao * 24 * 60 * 60 * 1000
                    ).toLocaleDateString('pt-MZ')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
          setDeleteDialog({ ...deleteDialog, open })
        }>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Usuário?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todos os dados do usuário serão permanentemente removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDialog.userId && deleteUser(deleteDialog.userId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Suspend Confirmation Dialog */}
        <AlertDialog open={suspendDialog.open} onOpenChange={(open) => 
          setSuspendDialog({ ...suspendDialog, open })
        }>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspender Usuário?</AlertDialogTitle>
              <AlertDialogDescription>
                O usuário será suspenso por {suspendDialog.days} dias e não poderá acessar o sistema durante este período.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => suspendDialog.userId && suspendUser(suspendDialog.userId, suspendDialog.days)}
              >
                Suspender
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
