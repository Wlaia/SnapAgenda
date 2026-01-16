import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Clock, Calendar, CheckCircle, XCircle, Search, Percent, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isSameMonth, isSameDay, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentDialog from "@/components/PaymentDialog";

export default function Financeiro() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMonth: 0,
        receivedToday: 0,
        pending: 0,
        count: 0
    });
    const [filterStatus, setFilterStatus] = useState("all");
    const [periodFilter, setPeriodFilter] = useState("current_month");
    const [searchTerm, setSearchTerm] = useState("");
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [professionalFilter, setProfessionalFilter] = useState("all");
    const [totalCommission, setTotalCommission] = useState(0);

    // Payment Dialog State
    const [paymentTransaction, setPaymentTransaction] = useState<any>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    useEffect(() => {
        loadTransactions();
        loadProfessionals();
    }, []);

    // Recalculate stats whenever transactions or periodFilter changes
    useEffect(() => {
        calculateStats(transactions);
    }, [transactions, periodFilter, professionalFilter]);

    const loadTransactions = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("financial_transactions")
            .select("*, appointment:appointments(professional:professionals(id, name, commission_rate))")
            .eq("user_id", user.id)
            .order("date", { ascending: false });

        if (error) {
            toast.error("Erro ao carregar financeiro");
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    };

    const loadProfessionals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("professionals")
            .select("*")
            .eq("user_id", user.id)
            .order("name");

        if (data) setProfessionals(data);
    };

    const calculateStats = (data: any[]) => {
        const now = new Date();
        const filteredByPeriod = data.filter(t => {
            const date = parseISO(t.date);
            switch (periodFilter) {
                case 'today': return isSameDay(date, now);
                case 'current_month': return isSameMonth(date, now);
                case 'last_month': return isSameMonth(date, subMonths(now, 1));
                case 'all': return true;
                default: return true;
            }
        });

        // Further filter for stats if professional selected?
        // Usually stats cards obey all filters including professional.
        const filteredFinal = filteredByPeriod.filter(t => {
            if (professionalFilter !== 'all') {
                const profId = t.appointment?.professional?.id;
                if (profId !== professionalFilter) return false;
            }
            return true;
        });


        const totalRevenue = filteredFinal.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const received = filteredFinal
            .filter(t => t.status === 'paid')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const pending = filteredFinal
            .filter(t => t.status === 'pending')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // Calculate Commission
        const comm = filteredFinal.reduce((acc, curr) => {
            const rate = curr.appointment?.professional?.commission_rate || 0;
            const amount = Number(curr.amount) || 0;
            return acc + (amount * (rate / 100));
        }, 0);
        setTotalCommission(comm);

        setStats({
            totalMonth: totalRevenue,
            receivedToday: received,
            pending: pending,
            count: filteredFinal.length
        });
    };

    const getPeriodLabel = () => {
        switch (periodFilter) {
            case 'today': return "de Hoje";
            case 'current_month': return "deste Mês";
            case 'last_month': return "do Mês Passado";
            case 'all': return "Total";
            default: return "";
        }
    };

    const handleTransactionClick = (transaction: any) => {
        if (transaction.status === 'pending') {
            setPaymentTransaction(transaction);
            setIsPaymentDialogOpen(true);
        } else {
            // If already paid, allow reverting to pending directly logic
            handleRevertPayment(transaction.id);
        }
    };

    const handleRevertPayment = async (id: string) => {
        if (!confirm("Deseja marcar esta transação como Pendente novamente?")) return;

        const { error } = await supabase
            .from("financial_transactions")
            .update({ status: 'pending' })
            .eq("id", id);

        if (error) {
            toast.error("Erro ao atualizar status");
        } else {
            toast.success("Marcado como pendente");
            const updatedTransactions = transactions.map(t =>
                t.id === id ? { ...t, status: 'pending' } : t
            );
            setTransactions(updatedTransactions);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const date = parseISO(t.date);
        const now = new Date();
        let matchesPeriod = true;

        switch (periodFilter) {
            case 'today': matchesPeriod = isSameDay(date, now); break;
            case 'current_month': matchesPeriod = isSameMonth(date, now); break;
            case 'last_month': matchesPeriod = isSameMonth(date, subMonths(now, 1)); break;
            case 'all': matchesPeriod = true; break;
        }

        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesSearch =
            t.description?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesProfessional = true;
        if (professionalFilter !== 'all') {
            matchesProfessional = t.appointment?.professional?.id === professionalFilter;
        }

        return matchesStatus && matchesSearch && matchesPeriod && matchesProfessional;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">Financeiro</h2>
                <p className="text-muted-foreground mt-1">Visão geral do seu faturamento</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita {getPeriodLabel()}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats.totalMonth.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Valor total no período selecionado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recebido {getPeriodLabel()}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">R$ {stats.receivedToday.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Pagamentos confirmados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendente {getPeriodLabel()}</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">R$ {stats.pending.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando recebimento
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comissões {getPeriodLabel()}</CardTitle>
                        <Percent className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">R$ {totalCommission.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Valor estimado de comissões
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col gap-4 bg-muted/20 p-4 rounded-lg border">
                {/* Row 1: Search - Full Width */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente ou serviço..."
                        className="pl-10 bg-background w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Row 2: Filters - Flex Container */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center sm:items-start">
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-background">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hoje</SelectItem>
                            <SelectItem value="current_month">Este Mês</SelectItem>
                            <SelectItem value="last_month">Mês Passado</SelectItem>
                            <SelectItem value="all">Todo o Período</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-background">
                            <Scissors className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Profissional" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Profissionais</SelectItem>
                            {professionals.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setFilterStatus}>
                        <TabsList className="grid w-full grid-cols-3 w-full sm:min-w-[300px]">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="pending">Pendentes</TabsTrigger>
                            <TabsTrigger value="paid">Pagos</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Transactions List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Sem movimentações</h3>
                    <p className="text-sm text-gray-500">Nenhuma transação encontrada com os filtros atuais.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block rounded-md border bg-card">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Data</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Descrição</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Valor</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredTransactions.map((t) => (
                                        <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {format(parseISO(t.date), "dd/MM/yy", { locale: ptBR })}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-medium">{t.description}</td>
                                            <td className="p-4 align-middle font-bold text-sm">
                                                R$ {Number(t.amount).toFixed(2)}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge
                                                    variant={t.status === 'paid' ? "default" : "outline"}
                                                    className={t.status === 'paid' ? "bg-green-600 hover:bg-green-700" : "text-orange-500 border-orange-500"}
                                                >
                                                    {t.status === 'paid' ? "Pago" : "Pendente"}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTransactionClick(t)}
                                                    className={t.status === 'pending' ? "text-green-600 hover:text-green-700 hover:bg-green-100" : "text-muted-foreground"}
                                                >
                                                    {t.status === 'pending' ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Baixar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Estornar
                                                        </>
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredTransactions.map((t) => (
                            <Card key={t.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(parseISO(t.date), "dd/MM/yy", { locale: ptBR })}
                                        </div>
                                        <Badge
                                            variant={t.status === 'paid' ? "default" : "outline"}
                                            className={t.status === 'paid' ? "bg-green-600 h-6 px-2 text-xs" : "text-orange-500 border-orange-500 h-6 px-2 text-xs"}
                                        >
                                            {t.status === 'paid' ? "Pago" : "Pendente"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        <h3 className="font-bold text-lg">{t.description}</h3>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="font-bold text-lg">
                                            R$ {Number(t.amount).toFixed(2)}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleTransactionClick(t)}
                                            className={t.status === 'pending' ? "bg-green-600 hover:bg-green-700 text-white h-8 text-xs px-3" : "bg-muted text-muted-foreground hover:bg-muted/80 h-8 text-xs px-3"}
                                        >
                                            {t.status === 'pending' ? (
                                                <>
                                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                                    Confirmar
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                                    Estornar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            <PaymentDialog
                open={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                onSuccess={() => {
                    loadTransactions();
                    // Maybe refresh other stats?
                }}
                transaction={paymentTransaction}
            />
        </div>
    );
}
