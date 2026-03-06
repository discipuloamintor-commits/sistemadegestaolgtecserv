import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

export default function AguardandoAprovacao() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-accent/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <CardTitle className="text-2xl">Aguardando Aprovação</CardTitle>
          <CardDescription className="text-base">
            A sua conta foi criada com sucesso e está pendente de aprovação pelo administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Assim que a sua conta for aprovada, receberá acesso total ao sistema e poderá começar a gerir os seus clientes e serviços.
          </p>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Terminar Sessão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
