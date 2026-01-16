import { Home, Users, Calendar, Scissors, DollarSign, LogOut, Building, MessageCircle, Download } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Saiu com sucesso!");
        navigate("/auth");
    };

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="p-6 border-b flex flex-col items-center gap-3">
                {profile?.logoUrl ? (
                    <img
                        src={`${profile.logoUrl}?t=${new Date().getTime()}`}
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
                        {profile?.salonName || "SnapAgenda"}
                    </h1>
                    {profile?.salonName && <p className="text-xs text-muted-foreground">Sistema de Gestão</p>}
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

            <div className="p-4 border-t mt-auto space-y-2 pb-24 md:pb-4">
                {/* Support Section */}
                <div className="bg-primary/5 rounded-lg p-3 text-center mb-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Dúvidas e Sugestão?</p>
                    <a
                        href="https://wa.me/5524992777262"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-green-600 hover:underline flex items-center justify-center gap-1"
                    >
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp Suporte
                    </a>
                </div>

                {/* Install Button */}
                {deferredPrompt && (
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3 border-primary/20 hover:bg-primary/5 text-primary"
                        onClick={handleInstallClick}
                    >
                        <Download className="h-5 w-5" />
                        Instalar App
                    </Button>
                )}

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
