import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  Building2, 
  Zap, 
  MessageCircle, 
  Home, 
  LogOut,
  User as UserIcon 
} from "lucide-react";

interface MemberLayoutProps {
  children: React.ReactNode;
  activeTab?: "preferences" | "properties" | "matches" | "messages";
}

export default function MemberLayout({ children, activeTab }: MemberLayoutProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/");
      toast({ title: "تم تسجيل الخروج بنجاح" });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    { id: "preferences", label: "رغباتي", icon: Heart, href: "/profile?tab=preferences" },
    { id: "properties", label: "عروضي", icon: Building2, href: "/profile?tab=properties" },
    { id: "matches", label: "المتطابقة", icon: Zap, href: "/profile?tab=matches" },
    { id: "messages", label: "الرسائل", icon: MessageCircle, href: "/profile?tab=messages" },
  ];

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full" dir="rtl">
        {/* Sidebar on the right for RTL */}
        <Sidebar side="right" collapsible="icon">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="font-semibold truncate">{user?.name || "مستخدم"}</p>
                <p className="text-xs text-muted-foreground truncate" dir="ltr">{user?.phone}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <Link href={item.href}>
                        <SidebarMenuButton 
                          isActive={activeTab === item.id}
                          data-testid={`sidebar-${item.id}`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/">
                  <SidebarMenuButton data-testid="sidebar-home">
                    <Home className="h-4 w-4" />
                    <span>الرئيسية</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Sidebar Trigger */}
          <header className="border-b bg-card p-3 flex items-center gap-3 sticky top-0 z-40">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
