import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, LogOut, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ContaSuspensa() {
  const navigate = useNavigate();
  const { suspensionEndsAt, suspensionReason } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-warning">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-warning" />
          </div>
          <CardTitle className="text-2xl">Conta Suspensa</CardTitle>
          <CardDescription className="text-base">
            Sua conta foi temporariamente suspensa pelo administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suspensionEndsAt && (
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Reativação prevista:</span>
              </div>
              <p className="text-lg font-semibold text-center">
                {format(suspensionEndsAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}
          
          {suspensionReason && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Motivo da suspensão:</p>
              <p className="text-sm text-muted-foreground">{suspensionReason}</p>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Se você tiver dúvidas sobre esta suspensão, entre em contato com o administrador do sistema.
            </p>
          </div>

          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Fazer Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
