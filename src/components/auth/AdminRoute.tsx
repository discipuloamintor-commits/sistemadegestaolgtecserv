import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/ui/PageLoader";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session, loading, isApproved, isAdmin, isRejected, isSuspended } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PageLoader text="A verificar permissões de administrador..." />
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

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
