import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <AlertCircle className="w-24 h-24 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Página não encontrada</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
