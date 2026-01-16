import { Home, Users, Calendar, Scissors, DollarSign, LogOut, Building } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Agenda", href: "/agenda" },
    { icon: Users, label: "Clientes", href: "/clientes" },
    { icon: Scissors, label: "Serviços", href: "/servicos" },
    { icon: Users, label: "Profissionais", href: "/profissionais" },
    { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
    { icon: Building, label: "Meu Negócio", href: "/perfil" },
];

interface SidebarContentProps {
    onNavigate?: () => void;
}

import { useProfile } from "@/contexts/ProfileContext";

export function SidebarContent({ onNavigate }: SidebarContentProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile } = useProfile();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Saiu com sucesso!");
        navigate("/auth");
    };

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="p-6 border-b flex flex-col items-center gap-3">
                {profile?.logo_url ? (
                    <img
                        src={`${profile.logo_url}?t=${new Date().getTime()}`}
                        alt="Logo do Salão"
                        className="h-16 w-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Scissors className="h-6 w-6 text-primary" />
                    </div>
                )}
                <div className="text-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate max-w-[200px]">
                        {profile?.salon_name || "SnapAgenda"}
                    </h1>
                    {profile?.salon_name && <p className="text-xs text-muted-foreground">Sistema de Gestão</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">v1.0.0</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </Button>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen sticky top-0">
            <SidebarContent />
        </aside>
    );
}
