import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, CalendarIcon, History, User, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface ClientDialogProps {
    onSuccess?: () => void;
    client?: any;
    onClose?: () => void;
}

export default function ClientDialog({ onSuccess, client, onClose }: ClientDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("data");
    const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
    const [birthDateInput, setBirthDateInput] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [totalDebt, setTotalDebt] = useState(0);

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || "",
                email: client.email || "",
                phone: client.phone || "",
                address: client.address || "",
            });
            if (client.birth_date) {
                const dateParts = client.birth_date.split('-');
                if (dateParts.length === 3) {
                    const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                    setBirthDate(d);
                    setBirthDateInput(format(d, "dd/MM/yyyy"));
                }
            } else {
                setBirthDate(undefined);
                setBirthDateInput("");
            }
            setOpen(true);
            loadHistory(client.id);
        } else {
            setFormData({ name: "", email: "", phone: "", address: "" });
            setBirthDate(undefined);
            setBirthDateInput("");
            setHistory([]);
            setTotalDebt(0);
            setActiveTab("data");
        }
    }, [client]);

    const loadHistory = async (clientId: string) => {
        setLoadingHistory(true);
        const { data, error } = await supabase
            .from("appointments")
            .select(`
                *,
                services (name),
                professionals (name),
                financial_transactions (id, amount, status, type)
            `)
            .eq("client_id", clientId)
            .order("date", { ascending: false });

        if (!error && data) {
            setHistory(data);

            // Calculate total debt for this client
            let debt = 0;
            data.forEach((appt: any) => {
                const transactions = appt.financial_transactions || [];
                transactions.forEach((t: any) => {
                    if (t.status === 'pending') {
                        debt += Number(t.amount);
                    }
                });
            });
            setTotalDebt(debt);
        }
        setLoadingHistory(false);
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({ name: "", email: "", phone: "", address: "" });
        setBirthDate(undefined);
        setBirthDateInput("");
        onClose?.();
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 8) value = value.slice(0, 8);

        if (value.length > 4) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }

        setBirthDateInput(value);

        if (value.length === 10) {
            const [day, month, year] = value.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            if (
                date.getDate() === day &&
                date.getMonth() === month - 1 &&
                date.getFullYear() === year &&
                year > 1900 &&
                year <= new Date().getFullYear()
            ) {
                setBirthDate(date);
            } else {
                setBirthDate(undefined);
            }
        } else {
            setBirthDate(undefined);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Você precisa estar logado");
            setLoading(false);
            return;
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : null
        };

        if (client) {
            const { error } = await supabase
                .from("clients")
                .update(payload)
                .eq("id", client.id);

            if (error) {
                toast.error("Erro ao atualizar cliente");
            } else {
                toast.success("Cliente atualizado com sucesso!");
                handleClose();
                onSuccess?.();
            }
        } else {
            const { error } = await supabase
                .from("clients")
                .insert({
                    user_id: user.id,
                    ...payload
                });

            if (error) {
                toast.error("Erro ao criar cliente");
            } else {
                toast.success("Cliente criado com sucesso!");
                handleClose();
                onSuccess?.();
            }
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) handleClose();
        }}>
            {!client && (
                <DialogTrigger asChild>
                    <Button className="font-semibold shadow-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Cliente
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {client ? <User className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                        {client ? "Editar Cliente" : "Novo Cliente"}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="data">Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="history" disabled={!client}>
                            <span className="hidden sm:inline">Histórico de Agendamentos</span>
                            <span className="sm:hidden">Histórico</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="data" className="flex-1 overflow-y-auto pr-1">
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Nome do cliente"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                                    <Input
                                        id="birthDate"
                                        type="tel"
                                        maxLength={10}
                                        placeholder="DD/MM/AAAA"
                                        value={birthDateInput}
                                        onChange={handleBirthDateChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Endereço</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Rua, Número - Bairro"
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" className="w-full font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600" disabled={loading}>
                                    {loading ? (client ? "Atualizando..." : "Criando...") : (client ? "Salvar Cliente" : "Salvar Cliente")}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 overflow-hidden flex flex-col h-full min-h-[300px]">
                        {loadingHistory ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                                <History className="h-12 w-12 mb-2" />
                                <p>Nenhum agendamento encontrado</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                {totalDebt > 0 && (
                                    <Card className="mb-3 bg-red-50 border-red-200">
                                        <CardContent className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-red-100 rounded-full">
                                                    <Wallet className="h-4 w-4 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-red-700">Débito Total (Fiado)</p>
                                                    <p className="font-bold text-red-800">R$ {totalDebt.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-100" asChild>
                                                {/* In a real app, this would link to payment page or open dialog. 
                                                    For now we just instruct user */}
                                                <span>Ver no Financeiro</span>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                <ScrollArea className="flex-1 pr-3 -mr-3">
                                    <div className="space-y-3 pt-2 pl-1 pr-1">
                                        {history.map((apt) => {
                                            const apptDebt = apt.financial_transactions?.filter((t: any) => t.status === 'pending').reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;

                                            return (
                                                <div key={apt.id} className="flex flex-col gap-2 p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={
                                                                    apt.status === 'confirmed' ? "default" :
                                                                        apt.status === 'cancelled' ? "destructive" :
                                                                            "outline"
                                                                } className={cn(
                                                                    "text-[10px] h-5 px-1.5",
                                                                    apt.status === 'confirmed' && "bg-green-600 hover:bg-green-700",
                                                                    apt.status === 'pending' && "text-amber-600 border-amber-600"
                                                                )}>
                                                                    {apt.status === 'confirmed' ? 'Confirmado' :
                                                                        apt.status === 'cancelled' ? 'Cancelado' :
                                                                            apt.status === 'completed' ? 'Concluído' : 'Pendente'}
                                                                </Badge>
                                                                <span className="text-sm font-medium text-muted-foreground">
                                                                    {format(new Date(apt.date), "dd/MM/yyyy HH:mm")}
                                                                </span>
                                                            </div>
                                                            <p className="font-medium text-sm">{apt.services?.name}</p>
                                                            <p className="text-xs text-muted-foreground">{apt.professionals?.name}</p>
                                                        </div>
                                                        {apptDebt > 0 && (
                                                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                                Devendo R$ {apptDebt.toFixed(2)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
