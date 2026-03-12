import { Home, LayoutDashboard, Building2, Briefcase, BarChart3, Settings, LogOut, UserCheck, Receipt, Globe } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";

// 3D Icons
import dash3d from "@/assets/3d-icons/dash.png";
import users3d from "@/assets/3d-icons/users.png";
import services3d from "@/assets/3d-icons/services.png";
import hosting3d from "@/assets/3d-icons/hosting.png";
import expenses3d from "@/assets/3d-icons/expenses.png";
import allClients3d from "@/assets/3d-icons/Todos Clientes.png";

const adminItems = [
  { title: "Dashboard Admin", url: "/admin/dashboard", icon: dash3d },
  { title: "Gerenciar Usuários", url: "/admin/usuarios", icon: users3d },
  { title: "Todos Clientes", url: "/admin/clientes", icon: allClients3d },
  { title: "Todos Serviços", url: "/admin/servicos", icon: services3d },
  { title: "Pagamentos Hosting", url: "/admin/pagamentos-hosting", icon: hosting3d },
  { title: "Todos Gastos", url: "/admin/gastos", icon: expenses3d },
];

const membroItems = [
  { title: "Dashboard", url: "/", icon: dash3d },
  { title: "Clientes", url: "/clientes", icon: allClients3d },
  { title: "Serviços", url: "/servicos", icon: services3d },
  { title: "Pagamentos Hosting", url: "/pagamentos-hosting", icon: hosting3d },
  { title: "Gastos", url: "/gastos", icon: expenses3d },
  { title: "Minha Empresa", url: "/empresa", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const items = isAdmin ? adminItems : membroItems;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border overflow-hidden">
        {!isCollapsed && (
          <img src={logo} alt="LG TecServ" className="h-8 w-auto object-contain shrink-0" />
        )}
        <SidebarTrigger className="ml-auto shrink-0" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      {typeof item.icon === "string" ? (
                        <img src={item.icon} alt={item.title} className="h-5 w-5 object-contain" />
                      ) : (
                        <item.icon className="h-4 w-4" />
                      )}
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
