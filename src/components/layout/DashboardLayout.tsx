import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import logo from "@/assets/logo.png";
import { LayoutDashboard, Users, Briefcase, Globe, Receipt, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    ]
    : [
      { icon: dash3d, label: "Dash", path: "/" },
      { icon: allClients3d, label: "Clientes", path: "/clientes" },
      { icon: services3d, label: "Serviços", path: "/servicos" },
      { icon: hosting3d, label: "Hosting", path: "/pagamentos-hosting" },
      { icon: expenses3d, label: "Gastos", path: "/gastos" },
    ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#f8fafc]">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        <main className="flex-1 flex flex-col min-h-screen relative pb-20 md:pb-0">
          {/* Top Header - Fixed for Mobile, Sticky for Desktop */}
          <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:static md:bg-transparent md:border-none md:h-20">
            <div className="flex items-center gap-3 shrink-0">
              <img src={logo} alt="LG TecServ" className="h-9 w-auto object-contain" />
              <div className="hidden md:flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 leading-none">LG TecServ</h2>
                <p className="text-[10px] text-gray-500 font-medium tracking-tight">Sistema de Gestão</p>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 px-4 py-8 mt-16 md:mt-0 md:px-8 max-w-7xl mx-auto w-full animate-fade-up">
            {children}
          </div>

          {/* Mobile Bottom Navigation - Hidden on desktop with display: none */}
          <nav className="fixed bottom-4 left-4 right-4 z-50 h-20 bg-white/95 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl flex items-center justify-around px-2 md:hidden animate-scale-in">
            {mobNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-gray-400 font-medium opacity-70"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`transition-all duration-300 ${isActive ? "transform -translate-y-2" : ""
                      }`}>
                      <img src={item.icon} alt={item.label} className="w-10 h-10 object-contain drop-shadow-md" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
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
