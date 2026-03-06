import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function ContaRejeitada() {
  const navigate = useNavigate();

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
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Solicitação Rejeitada</CardTitle>
          <CardDescription className="text-base">
            Infelizmente, sua solicitação de acesso foi rejeitada pelo administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Se você acredita que isso foi um erro ou deseja mais informações, entre em contato com o administrador do sistema.
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
