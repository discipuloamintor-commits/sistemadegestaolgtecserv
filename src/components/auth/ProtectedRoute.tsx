import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/ui/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading, isApproved, isRejected, isSuspended } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PageLoader text="A verificar as suas credenciais..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (isRejected) {
    return <Navigate to="/conta-rejeitada" replace />;
  }

  if (isSuspended) {
    return <Navigate to="/conta-suspensa" replace />;
  }

  if (!isApproved) {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  return <>{children}</>;
}
