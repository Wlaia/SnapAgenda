import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Briefcase, TrendingUp, Scissors, DollarSign, Cake, Clock } from "lucide-react";
import { format, addHours, startOfHour, isSameHour } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useBirthdays } from "@/hooks/use-birthdays";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";

const statsConfig = [
    { title: "Agendamentos Hoje", icon: Calendar, color: "text-blue-500", key: "todayAppointments" },
    { title: "Total de Clientes", icon: Users, color: "text-purple-500", key: "totalClients" },
    { title: "Profissionais Ativos", icon: Briefcase, color: "text-amber-500", key: "activePros" },
    { title: "Taxa de Ocupação", icon: TrendingUp, color: "text-emerald-500", key: "occupationRate" },
    { title: "Total de Serviços", icon: Scissors, color: "text-pink-500", key: "totalServices" },
    { title: "Receita Mensal", icon: DollarSign, color: "text-green-600", key: "monthlyRevenue" },
];

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const { profile } = useProfile();
    const { birthdaysToday } = useBirthdays();
    const [stats, setStats] = useState({
        todayAppointments: "0",
        totalClients: "0",
        activePros: "0",
        occupationRate: "0%",
        totalServices: "0",
        monthlyRevenue: "R$ 0,00"
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    // Removed local userName state in favor of profile

    const todayDate = new Date();
    const todayFormatted = format(todayDate, "EEEE, dd 'de' MMMM", { locale: ptBR });

    // Timeline Generation (Next 6 hours)
    const currentHour = startOfHour(new Date());
    const timelineHours = Array.from({ length: 6 }).map((_, i) => addHours(currentHour, i));

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Name fetching logic removed, using profile context instead

        const todayStr = format(new Date(), "yyyy-MM-dd");
        const startOfMonth = format(new Date(), "yyyy-MM-01");
        const endOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd");

        const [appointmentsRes, clientsRes, professionalsRes, servicesRes, financialsRes] = await Promise.all([
            supabase
                .from("appointments")
                .select(`*, clients(name), professionals(name), services(name)`)
                .eq("user_id", user.id)
                .gte("date", `${todayStr}T00:00:00`)
                .lte("date", `${todayStr}T23:59:59`)
                .order("date"),
            supabase.from("clients").select("id", { count: "exact" }).eq("user_id", user.id),
            supabase.from("professionals").select("id", { count: "exact" }).eq("user_id", user.id),
            supabase.from("services").select("id", { count: "exact" }).eq("user_id", user.id),
            supabase
                .from("financial_transactions")
                .select("amount")
                .eq("user_id", user.id)
                .eq("type", "income")
                .eq("status", "paid")
                .gte("date", startOfMonth)
                .lte("date", endOfMonth)
        ]);

        const appointmentsToday = appointmentsRes.data || [];
        const totalClients = clientsRes.count || 0;
        const totalProfessionals = professionalsRes.count || 0;
        const totalServices = servicesRes.count || 0;

        const revenueValue = (financialsRes.data || []).reduce((sum, t) => sum + Number(t.amount), 0);
        const confirmedToday = appointmentsToday.filter(a => a.status === "confirmed").length;
        const totalSlots = totalProfessionals * 12; // Estimate
        const occupationRate = totalSlots > 0 ? Math.round((confirmedToday / totalSlots) * 100) : 0;

        setStats({
            todayAppointments: appointmentsToday.length.toString(),
            totalClients: totalClients.toString(),
            activePros: totalProfessionals.toString(),
            occupationRate: `${occupationRate}%`,
            totalServices: totalServices.toString(),
            monthlyRevenue: `R$ ${revenueValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        });

        // Filter for upcoming (future or current hour)
        const now = new Date();
        const upcoming = appointmentsToday.filter(a => new Date(a.date) >= addHours(now, -1));
        setUpcomingAppointments(upcoming);
        setLoading(false);
    };

    const getAppointmentsForHour = (hourDate: Date) => {
        return upcomingAppointments.filter(apt => isSameHour(new Date(apt.date), hourDate));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-light tracking-tight text-foreground">
                        Olá, <span className="font-semibold text-gradient">{
                            profile.contactName?.split(' ')[0] ||
                            profile.displayName?.split(' ')[0] ||
                            profile.salonName ||
                            "Gestor"
                        }</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg capitalize flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> {todayFormatted}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button className="glass-card text-foreground hover:bg-primary/20 hover:text-primary transition-all shadow-sm" variant="outline" asChild>
                        <Link to="/agenda">Ver Agenda Completa</Link>
                    </Button>
                    <Button className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all" asChild>
                        <Link to="/agenda?action=new">Novo Agendamento</Link>
                    </Button>
                </div>
            </div>

            {/* Birthday Alert */}
            {birthdaysToday.length > 0 && (
                <div className="animate-in slide-in-from-top-4 duration-700">
                    <div className="bg-gradient-to-r from-pink-100/80 to-rose-100/80 dark:from-pink-950/40 dark:to-rose-950/40 border border-pink-200 dark:border-pink-800 rounded-2xl p-6 shadow-sm backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-full shadow-sm">
                                <Cake className="h-8 w-8 text-pink-500 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-pink-700 dark:text-pink-300">Dia de Festa!</h3>
                                <p className="text-pink-600 dark:text-pink-400">
                                    Aniversariantes: <span className="font-bold">{birthdaysToday.map(c => c.name).join(", ")}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statsConfig.map((item) => (
                    <div key={item.title} className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                            <div className={cn("p-2 rounded-lg bg-primary/5", item.color)}>
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold tracking-tight">
                            {loading ? <div className="h-8 w-16 bg-muted/50 rounded animate-pulse" /> : stats[item.key as keyof typeof stats]}
                        </div>
                    </div>
                ))}
            </div>

            {/* Timeline Widget & Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline - Takes up 2 cols */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">Linha do Tempo (Próximas Horas)</h3>
                    </div>

                    <div className="relative pt-2 pb-4 overflow-x-auto">
                        <div className="flex gap-4 min-w-[600px]">
                            {timelineHours.map((hour, i) => {
                                const apts = getAppointmentsForHour(hour);
                                const isBusy = apts.length > 0;
                                return (
                                    <div key={i} className="flex-1 min-w-[100px] flex flex-col gap-2">
                                        <div className="text-sm font-medium text-muted-foreground text-center border-b pb-2">
                                            {format(hour, "HH:00")}
                                        </div>
                                        <div className={cn(
                                            "h-24 rounded-xl border-dashed border-2 flex flex-col items-center justify-center p-2 text-center transition-colors",
                                            isBusy
                                                ? "bg-primary/10 border-primary/20"
                                                : "bg-muted/20 border-border hover:bg-muted/30"
                                        )}>
                                            {loading ? (
                                                <div className="h-2 w-full bg-muted/50 animate-pulse rounded" />
                                            ) : isBusy ? (
                                                <>
                                                    <div className="font-bold text-primary text-lg">{apts.length}</div>
                                                    <div className="text-xs text-primary/80">clientes</div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Livre</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Upcoming List - Takes up 1 col */}
                <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-6">Próximos Clientes</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        {loading ? (
                            <p className="text-muted-foreground text-center">Carregando...</p>
                        ) : upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Agenda livre por hoje!
                            </div>
                        ) : (
                            upcomingAppointments.slice(0, 5).map((apt) => (
                                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-border/50 hover:bg-white/80 dark:hover:bg-black/40 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {apt.clients?.name?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium truncate">{apt.clients?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{apt.services?.name}</p>
                                    </div>
                                    <div className="text-sm font-mono font-medium text-primary bg-primary/5 px-2 py-1 rounded">
                                        {format(new Date(apt.date), "HH:mm")}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
