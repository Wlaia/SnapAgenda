import { useState } from "react";
import { Sidebar, SidebarContent, menuItems } from "./Sidebar";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const DashboardIcon = menuItems[0].icon;
    const AgendaIcon = menuItems[1].icon;
    const ClientesIcon = menuItems[2].icon;
    const ServicosIcon = menuItems[3].icon;
    const FinanceiroIcon = menuItems[5].icon;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        SnapAgenda
                    </h1>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="h-6 w-6 text-muted-foreground" />
                </Button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 fade-in-0 animate-in"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-card shadow-lg animate-in slide-in-from-left duration-300 z-50 h-full border-r">
                        <div className="absolute right-4 top-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <SidebarContent onNavigate={() => setIsSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-auto pt-16 pb-20 md:pt-0 md:pb-0">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50 flex justify-around items-center px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <Link
                    to="/dashboard"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                        location.pathname === "/dashboard" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <DashboardIcon className={cn("h-5 w-5", location.pathname === "/dashboard" && "fill-current")} />
                    <span className="text-[10px]">Início</span>
                </Link>

                <Link
                    to="/clientes"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                        location.pathname === "/clientes" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <ClientesIcon className={cn("h-5 w-5", location.pathname === "/clientes" && "fill-current")} />
                    <span className="text-[10px]">Clientes</span>
                </Link>

                {/* Central Highlighted Button */}
                <div className="relative -top-5">
                    <Link
                        to="/agenda?new=true"
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-4 border-background"
                    >
                        <AgendaIcon className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </Link>
                    <span className="text-[10px] absolute -bottom-5 left-1/2 -translate-x-1/2 font-medium text-foreground">Agenda</span>
                </div>

                <Link
                    to="/servicos"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                        location.pathname === "/servicos" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <ServicosIcon className={cn("h-5 w-5", location.pathname === "/servicos" && "fill-current")} />
                    <span className="text-[10px]">Serviços</span>
                </Link>

                <Link
                    to="/financeiro"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                        location.pathname === "/financeiro" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <FinanceiroIcon className={cn("h-5 w-5", location.pathname === "/financeiro" && "fill-current")} />
                    <span className="text-[10px]">Financ.</span>
                </Link>
            </div>
        </div>
    );
}
