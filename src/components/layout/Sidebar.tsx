import { Home, LayoutDashboard, Building2, Briefcase, BarChart3, Settings, LogOut, UserCheck, Receipt } from "lucide-react";
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

const adminItems = [
  { title: "Dashboard Admin", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Gerenciar Usuários", url: "/admin/usuarios", icon: UserCheck },
  { title: "Todos Clientes", url: "/admin/clientes", icon: Building2 },
  { title: "Todos Serviços", url: "/admin/servicos", icon: Briefcase },
  { title: "Todos Gastos", url: "/admin/gastos", icon: Receipt },
  { title: "Relatórios Globais", url: "/admin/relatorios", icon: BarChart3 },
];

const membroItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Clientes", url: "/clientes", icon: Building2 },
  { title: "Serviços", url: "/servicos", icon: Briefcase },
  { title: "Gastos", url: "/gastos", icon: Receipt },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
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
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <img src={logo} alt="LG TecServ" className="h-10 object-contain" />
        )}
        <SidebarTrigger className="ml-auto" />
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
                      <item.icon className="h-4 w-4" />
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
