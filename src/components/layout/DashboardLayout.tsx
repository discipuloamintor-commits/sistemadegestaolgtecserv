import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import logo from "@/assets/logo.png";
import { LayoutDashboard, Users, Briefcase, Globe, Receipt, Settings, LogOut, Bell } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBadge } from "@/hooks/useBadge";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useState, useEffect } from "react";

// 3D Icons Premium
import dash3d from "@/assets/3d-icons/dash.png";
import users3d from "@/assets/3d-icons/users.png";
import services3d from "@/assets/3d-icons/services.png";
import hosting3d from "@/assets/3d-icons/hosting.png";
import expenses3d from "@/assets/3d-icons/expenses.png";
import allClients3d from "@/assets/3d-icons/Todos Clientes.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { session, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [overdueCount, setOverdueCount] = useState(0);
  const { permission, requestPermission, isSupported } = usePushNotifications();

  // Fetch overdue payment count for badge
  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const hoje = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('hosting_payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente')
          .lt('data_vencimento', hoje);
        setOverdueCount(count || 0);
      } catch (_) {
        // Silent fail
      }
    };
    fetchOverdue();
    const interval = setInterval(fetchOverdue, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  useBadge(overdueCount);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const mobNavItems = isAdmin
    ? [
      { icon: dash3d, label: "Admin", path: "/admin/dashboard" },
      { icon: users3d, label: "Usuários", path: "/admin/usuarios" },
      { icon: allClients3d, label: "Clientes", path: "/admin/clientes" },
      { icon: services3d, label: "Serviços", path: "/admin/servicos" },
      { icon: hosting3d, label: "Hosting", path: "/admin/pagamentos-hosting" },
      { icon: expenses3d, label: "Gastos", path: "/admin/gastos" },
    ]
    : [
      { icon: dash3d, label: "Dash", path: "/" },
      { icon: allClients3d, label: "Clientes", path: "/clientes" },
      { icon: services3d, label: "Serviços", path: "/servicos" },
      { icon: hosting3d, label: "Hosting", path: "/pagamentos-hosting" },
      { icon: expenses3d, label: "Gastos", path: "/gastos" },
      { icon: Settings, label: "Empresa", path: "/empresa" },
    ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#f8fafc]">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        <main className="flex-1 flex flex-col min-h-screen relative pb-20 md:pb-0">
          {/* Top Header - Mobile only */}
          <header className="sticky top-0 z-[100] h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:hidden shadow-sm">
            <div className="flex items-center gap-3 shrink-0">
              <img src={logo} alt="LG TecServ" className="h-9 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-2">
              {isSupported && permission === 'default' && (
                <button
                  onClick={requestPermission}
                  className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors animate-pulse"
                  title="Ativar Notificações"
                >
                  <Bell className="w-5 h-5" />
                </button>
              )}
              <div className="md:hidden flex items-center gap-2">
                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 px-4 py-6 md:py-8 md:px-8 max-w-7xl mx-auto w-full animate-fade-up pb-28 md:pb-8">
            {children}
          </div>

          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-[100] h-[80px] bg-white/98 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-t-2xl flex items-center justify-around px-2 pb-2 md:hidden">
            {mobNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 flex-1 min-w-0 max-w-[4.5rem] transition-all duration-300 ${isActive ? "text-primary transform -translate-y-1" : "text-gray-400 font-medium opacity-70"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex justify-center items-center w-8 h-8 md:w-9 md:h-9">
                      {typeof item.icon === "string" ? (
                        <img src={`${item.icon}?v=2`} alt={item.label} className={`w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-sm transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-md' : ''}`} />
                      ) : (
                        <item.icon className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-md text-primary' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-tighter truncate w-full text-center">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
