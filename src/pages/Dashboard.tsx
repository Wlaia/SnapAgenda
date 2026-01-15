import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Briefcase, TrendingUp, Scissors, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
    const [stats, setStats] = useState({
        todayAppointments: "0",
        totalClients: "0",
        activePros: "0",
        occupationRate: "0%",
        totalServices: "0",
        monthlyRevenue: "R$ 0,00"
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

    const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const todayDate = format(new Date(), "yyyy-MM-dd");
        const startOfMonth = format(new Date(), "yyyy-MM-01");
        // Simple end of month calculation - logic from V1 verified
        const endOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd");

        const [appointmentsRes, clientsRes, professionalsRes, servicesRes, financialsRes] = await Promise.all([
            supabase
                .from("appointments")
                .select(`*, clients(name), professionals(name), services(name)`)
                .eq("user_id", user.id)
                .eq("appointment_date", todayDate)
                .order("appointment_time"),
            supabase.from("clients").select("id", { count: "exact" }).eq("user_id", user.id),
            supabase.from("professionals").select("id", { count: "exact" }).eq("user_id", user.id),
            supabase.from("services").select("id", { count: "exact" }).eq("user_id", user.id),
            supabase
                .from("financial_transactions")
                .select("final_amount")
                .eq("user_id", user.id)
                .eq("status", "paid")
                .gte("transaction_date", startOfMonth)
                .lte("transaction_date", endOfMonth)
        ]);

        const appointmentsToday = appointmentsRes.data || [];
        const totalClients = clientsRes.count || 0;
        const totalProfessionals = professionalsRes.count || 0;
        const totalServices = servicesRes.count || 0;

        // Calculate Monthly Revenue
        const revenueValue = (financialsRes.data || []).reduce((sum, t) => sum + Number(t.final_amount), 0);

        // Calculate Occupation
        const confirmedToday = appointmentsToday.filter(a => a.status === "confirmed").length;
        // Assuming 12 slots per professional as per V1 logic
        const totalSlots = totalProfessionals * 12;
        const occupationRate = totalSlots > 0 ? Math.round((confirmedToday / totalSlots) * 100) : 0;

        setStats({
            todayAppointments: appointmentsToday.length.toString(),
            totalClients: totalClients.toString(),
            activePros: totalProfessionals.toString(),
            occupationRate: `${occupationRate}%`,
            totalServices: totalServices.toString(),
            monthlyRevenue: `R$ ${revenueValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        });

        setUpcomingAppointments(appointmentsToday);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1 capitalize">{today}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statsConfig.map((item, index) => (
                    <Card key={item.title} className="hover:shadow-lg transition-all duration-300 border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {item.title}
                            </CardTitle>
                            <item.icon className={cn("h-5 w-5", item.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? "..." : stats[item.key as keyof typeof stats]}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>Próximos Atendimentos</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                    ) : upcomingAppointments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum agendamento para hoje
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-semibold">{apt.clients?.name}</p>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full border",
                                                apt.status === 'confirmed' ? "bg-green-100 text-green-700 border-green-200" :
                                                    apt.status === 'cancelled' ? "bg-red-100 text-red-700 border-red-200" :
                                                        "bg-yellow-100 text-yellow-700 border-yellow-200"
                                            )}>
                                                {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {apt.services?.name} • {apt.professionals?.name}
                                        </p>
                                    </div>
                                    <div className="text-right font-mono text-lg font-medium text-primary">
                                        {apt.appointment_time?.slice(0, 5)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
