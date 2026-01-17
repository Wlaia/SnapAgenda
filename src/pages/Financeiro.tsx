import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Clock, Calendar, CheckCircle, XCircle, Search, Percent, Scissors, PlusCircle, MinusCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isSameMonth, isSameDay, parseISO, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentDialog from "@/components/PaymentDialog";
import ExpenseDialog from "@/components/ExpenseDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Financeiro() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        pendingIncome: 0,
        pendingExpense: 0
    });

    // Filters
    const [viewType, setViewType] = useState("income"); // 'income' (Entradas) or 'expense' (Saídas)
    const [filterStatus, setFilterStatus] = useState("all");
    const [periodFilter, setPeriodFilter] = useState("current_month");
    const [searchTerm, setSearchTerm] = useState("");

    const [professionals, setProfessionals] = useState<any[]>([]);
    const [professionalFilter, setProfessionalFilter] = useState("all");
    const [totalCommission, setTotalCommission] = useState(0);

    // Dialogs
    const [paymentTransaction, setPaymentTransaction] = useState<any>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    // Expense Dialog
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<any>(null);

    useEffect(() => {
        loadTransactions();
        loadProfessionals();
    }, []);

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

        const filteredFinal = filteredByPeriod.filter(t => {
            if (professionalFilter !== 'all') {
                const profId = t.appointment?.professional?.id;
                // Only filter by professional for Income linked to appointments or generic income if we had that link
                // For expenses, usually they are generic, so maybe we shouldn't filter expenses by professional?
                // But if the user wants to see "Net" for a professional, it gets tricky.
                // For now, let's keep strict filtering: if expense is not linked to prof, it hides when prof is selected.
                if (profId !== professionalFilter) return false;
            }
            return true;
        });

        // Split Income vs Expense
        const incomes = filteredFinal.filter(t => t.type === 'income' || !t.type); // Default to income if null
        const expenses = filteredFinal.filter(t => t.type === 'expense');

        const totalIncome = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const totalExpense = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const pendingIncome = incomes
            .filter(t => t.status === 'pending')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const pendingExpense = expenses
            .filter(t => t.status === 'pending')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        // Commission (only on income)
        const comm = incomes.reduce((acc, curr) => {
            const rate = curr.appointment?.professional?.commission_rate || 0;
            const amount = Number(curr.amount) || 0;
            return acc + (amount * (rate / 100));
        }, 0);
        setTotalCommission(comm);

        setStats({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            pendingIncome,
            pendingExpense
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

    // Actions
    const handleAddExpense = () => {
        setExpenseToEdit(null);
        setIsExpenseDialogOpen(true);
    };

    const handleEditTransaction = (transaction: any) => {
        if (transaction.type === 'expense') {
            setExpenseToEdit(transaction);
            setIsExpenseDialogOpen(true);
        } else {
            // For income/appointments, we usually edit via Agenda, but maybe later manual income?
            // For now, only Expenses supported for full edit
            toast.info("Edite agendamentos pela Agenda");
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.")) return;

        const { error } = await supabase.from("financial_transactions").delete().eq("id", id);

        if (error) {
            toast.error("Erro ao excluir");
        } else {
            toast.success("Registro excluído");
            loadTransactions();
        }
    };

    const handleTransactionClick = (transaction: any) => {
        if (transaction.status === 'pending') {
            if (transaction.type === 'expense') {
                handleMarkAsPaid(transaction.id);
            } else {
                setPaymentTransaction(transaction);
                setIsPaymentDialogOpen(true);
            }
        } else {
            handleRevertPayment(transaction.id);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        if (!confirm("Confirmar pagamento desta despesa?")) return;
        const { error } = await supabase.from("financial_transactions").update({ status: 'paid' }).eq("id", id);
        if (error) {
            toast.error("Erro ao atualizar");
        } else {
            toast.success("Despesa paga!");
            loadTransactions();
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
        // 1. View Type Filter (Income vs Expense)
        const type = t.type || 'income'; // default
        if (type !== viewType) return false;

        // 2. Period Filter
        const date = parseISO(t.date);
        const now = new Date();
        let matchesPeriod = true;
        switch (periodFilter) {
            case 'today': matchesPeriod = isSameDay(date, now); break;
            case 'current_month': matchesPeriod = isSameMonth(date, now); break;
            case 'last_month': matchesPeriod = isSameMonth(date, subMonths(now, 1)); break;
            case 'all': matchesPeriod = true; break;
        }
        if (!matchesPeriod) return false;

        // 3. Status Filter
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;

        // 4. Search Filter
        const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        // 5. Professional Filter
        if (professionalFilter !== 'all') {
            return t.appointment?.professional?.id === professionalFilter;
        }

        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">Financeiro</h2>
                    <p className="text-muted-foreground mt-1">Gestão completa de fluxo de caixa</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleAddExpense} className="gap-2 border-red-200 hover:bg-red-50 text-red-700">
                        <MinusCircle className="h-4 w-4" />
                        Nova Despesa
                    </Button>
                    {/* Income usually comes from appointments, but maybe later manual income? */}
                </div>
            </div>

            {/* Stats Cards - Always visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-green-100 bg-green-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                        <CardTitle className="text-xs md:text-sm font-medium text-green-700">Entradas</CardTitle>
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-lg md:text-2xl font-bold text-green-700">R$ {stats.totalIncome.toFixed(2)}</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Receita bruta</p>
                    </CardContent>
                </Card>
                <Card className="border-red-100 bg-red-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                        <CardTitle className="text-xs md:text-sm font-medium text-red-700">Saídas</CardTitle>
                        <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-lg md:text-2xl font-bold text-red-700">R$ {stats.totalExpense.toFixed(2)}</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Despesas</p>
                    </CardContent>
                </Card>
                <Card className={stats.balance >= 0 ? "border-blue-100 bg-blue-50/20" : "border-orange-100 bg-orange-50/20"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                        <CardTitle className="text-xs md:text-sm font-medium text-blue-700">Saldo</CardTitle>
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className={`text-lg md:text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
                            R$ {stats.balance.toFixed(2)}
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Líquido</p>
                    </CardContent>
                </Card>
                {/* 4th Card: Dynamic based on view */}
                {viewType === 'income' ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                            <CardTitle className="text-xs md:text-sm font-medium">A Receber</CardTitle>
                            <Clock className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="text-lg md:text-2xl font-bold text-orange-500">R$ {stats.pendingIncome.toFixed(2)}</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Pendente</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                            <CardTitle className="text-xs md:text-sm font-medium">A Pagar</CardTitle>
                            <Clock className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="text-lg md:text-2xl font-bold text-red-500">R$ {stats.pendingExpense.toFixed(2)}</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Pendente</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col gap-4 bg-muted/20 p-4 rounded-lg border">
                {/* Top Level Tabs: Income vs Expense */}
                <Tabs value={viewType} onValueChange={setViewType} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="income" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                            <TrendingUp className="h-4 w-4 mr-2" /> Entradas
                        </TabsTrigger>
                        <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                            <TrendingDown className="h-4 w-4 mr-2" /> Saídas
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-between items-center sm:items-start">
                    {/* Search */}
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={viewType === 'income' ? "Buscar cliente..." : "Buscar despesa..."}
                            className="pl-10 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Select value={periodFilter} onValueChange={setPeriodFilter}>
                            <SelectTrigger className="w-full sm:w-[140px] bg-background">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hoje</SelectItem>
                                <SelectItem value="current_month">Este Mês</SelectItem>
                                <SelectItem value="last_month">Mês Passado</SelectItem>
                                <SelectItem value="all">Tudo</SelectItem>
                            </SelectContent>
                        </Select>

                        {viewType === 'income' && (
                            <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                                    <Scissors className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Profissional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {professionals.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
                            <TabsList>
                                <TabsTrigger value="all">Todos</TabsTrigger>
                                <TabsTrigger value="pending">{viewType === 'income' ? 'Pendentes' : 'A Pagar'}</TabsTrigger>
                                <TabsTrigger value="paid">Pagos</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        {viewType === 'income' ? 'Sem entradas registradas' : 'Nenhuma despesa encontrada'}
                    </h3>
                    <p className="text-sm text-gray-500">Nenhum registro com os filtros selecionados.</p>
                </div>
            ) : (
                <>
                    {/* Responsive Table Wrapper */}
                    <div className="rounded-md border bg-card overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b bg-muted/40">
                                    <tr className="border-b transition-colors">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground whitespace-nowrap">Data</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Descrição</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground hidden sm:table-cell">
                                            {viewType === 'expense' ? 'Categoria' : 'Serviço'}
                                        </th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Valor</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground hidden xs:table-cell">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredTransactions.map((t) => (
                                        <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="hidden sm:inline">{format(parseISO(t.date), "dd/MM/yy", { locale: ptBR })}</span>
                                                    <span className="sm:hidden">{format(parseISO(t.date), "dd/MM", { locale: ptBR })}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex flex-col">
                                                    <span>{t.description}</span>
                                                    {/* Show category on mobile here since column is hidden */}
                                                    <span className="text-xs text-muted-foreground sm:hidden capitalize">
                                                        {viewType === 'expense' ? (t.category || 'Outros') : "Atendimento"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground hidden sm:table-cell">
                                                {viewType === 'expense'
                                                    ? <Badge variant="outline" className="capitalize">{t.category || 'Outros'}</Badge>
                                                    : "Atendimento"
                                                }
                                            </td>
                                            <td className={`p-4 align-middle font-bold text-sm whitespace-nowrap ${viewType === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                                {viewType === 'expense' ? '- ' : ''} R$ {Number(t.amount).toFixed(2)}
                                            </td>
                                            <td className="p-4 align-middle hidden xs:table-cell">
                                                <Badge
                                                    variant={t.status === 'paid' ? "default" : "outline"}
                                                    className={
                                                        t.status === 'paid'
                                                            ? "bg-green-600 hover:bg-green-700"
                                                            : (viewType === 'expense' ? "text-red-500 border-red-500" : "text-orange-500 border-orange-500")
                                                    }
                                                >
                                                    {t.status === 'paid' ? "Pago" : "Pendente"}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Mobile/Compact Actions Menu */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {t.status === 'pending' && (
                                                                <DropdownMenuItem onClick={() => handleTransactionClick(t)}>
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                    <span>{viewType === 'expense' ? 'Pagar' : 'Baixar'}</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {t.status === 'paid' && (
                                                                <DropdownMenuItem onClick={() => handleTransactionClick(t)}>
                                                                    <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                                                                    <span>Estornar (Reabrir)</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {viewType === 'expense' && (
                                                                <DropdownMenuItem onClick={() => handleEditTransaction(t)}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    <span>Editar</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => handleDeleteTransaction(t.id)} className="text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Excluir</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <PaymentDialog
                open={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                onSuccess={() => {
                    loadTransactions();
                }}
                transaction={paymentTransaction}
            />

            <ExpenseDialog
                open={isExpenseDialogOpen}
                onClose={() => setIsExpenseDialogOpen(false)}
                onSuccess={() => {
                    loadTransactions();
                }}
                transactionToEdit={expenseToEdit}
            />
        </div>
    );
}
