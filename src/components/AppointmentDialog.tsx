import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, UserPlus, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AppointmentDialogProps {
    selectedDate: Date;
    onSuccess?: () => void;
    appointment?: any;
    onClose?: () => void;
    initialClientId?: string;
}

export default function AppointmentDialog({ selectedDate, onSuccess, appointment, onClose, initialClientId }: AppointmentDialogProps) {
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [appointmentDate, setAppointmentDate] = useState<Date>(selectedDate);
    const [formData, setFormData] = useState({
        clientId: "",
        professionalId: "",
        serviceId: "",
        time: "",
    });
    const [showQuickClientForm, setShowQuickClientForm] = useState(false);
    const [quickClientData, setQuickClientData] = useState({
        name: "",
        phone: "",
    });
    const [savingQuickClient, setSavingQuickClient] = useState(false);

    useEffect(() => {
        if (appointment) {
            setFormData({
                clientId: appointment.client_id,
                professionalId: appointment.professional_id,
                serviceId: appointment.service_id,
                time: appointment.date ? format(new Date(appointment.date), "HH:mm") : "",
            });
            if (appointment.date) {
                setAppointmentDate(new Date(appointment.date));
            }
            setOpen(true);
        }
    }, [appointment]);

    useEffect(() => {
        if (initialClientId && !appointment) {
            setOpen(true);
        }
    }, [initialClientId, appointment]);

    useEffect(() => {
        if (open) {
            loadData();
            if (initialClientId && !appointment) {
                setFormData(prev => ({ ...prev, clientId: initialClientId }));
            }
        }
    }, [open, initialClientId]);

    // Update internal date state when prop changes
    useEffect(() => {
        setAppointmentDate(selectedDate);
    }, [selectedDate]);


    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [clientsRes, professionalsRes, servicesRes] = await Promise.all([
            supabase.from("clients").select("*").eq("user_id", user.id),
            supabase.from("professionals").select("*").eq("user_id", user.id),
            supabase.from("services").select("*").eq("user_id", user.id),
        ]);

        if (clientsRes.data) setClients(clientsRes.data);
        if (professionalsRes.data) setProfessionals(professionalsRes.data);
        if (servicesRes.data) setServices(servicesRes.data);
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

        if (appointment) {
            const { error } = await supabase
                .from("appointments")
                .update({
                    client_id: formData.clientId,
                    professional_id: formData.professionalId,
                    service_id: formData.serviceId,
                    date: new Date(format(appointmentDate, "yyyy-MM-dd") + "T" + formData.time).toISOString(),
                })
                .eq("id", appointment.id);

            if (error) {
                toast.error("Erro ao atualizar agendamento");
            } else {
                toast.success("Agendamento atualizado com sucesso!");
                handleClose();
            }
        } else {
            // Get client, service info for financial transaction
            const client = clients.find(c => c.id === formData.clientId);
            const service = services.find(s => s.id === formData.serviceId);

            const { data: appointmentData, error } = await supabase
                .from("appointments")
                .insert({
                    user_id: user.id,
                    client_id: formData.clientId,
                    professional_id: formData.professionalId,
                    service_id: formData.serviceId,
                    date: new Date(format(appointmentDate, "yyyy-MM-dd") + "T" + formData.time).toISOString(),
                })
                .select()
                .single();

            if (error) {
                toast.error("Erro ao criar agendamento");
            } else {
                // Create financial transaction
                const { error: finError } = await supabase
                    .from("financial_transactions")
                    .insert({
                        user_id: user.id,
                        appointment_id: appointmentData.id,
                        description: `${service?.name || "Serviço"} - ${client?.name || "Cliente"}`,
                        amount: service?.price || 0,
                        type: 'income',
                        status: "pending",
                        date: format(appointmentDate, "yyyy-MM-dd"), // Schema is 'date' type, usually YYYY-MM-DD string is fine or Date object.
                    });

                if (finError) {
                    console.error("Erro ao criar transação financeira:", finError);
                }

                toast.success("Agendamento criado com sucesso!");
                handleClose();
            }
        }
        setLoading(false);
    };

    const handleQuickClientSave = async () => {
        if (!quickClientData.name.trim()) {
            toast.error("Nome é obrigatório");
            return;
        }

        setSavingQuickClient(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Você precisa estar logado");
            setSavingQuickClient(false);
            return;
        }

        const { data, error } = await supabase
            .from("clients")
            .insert({
                user_id: user.id,
                name: quickClientData.name.trim(),
                phone: quickClientData.phone.trim() || null,
            })
            .select()
            .single();

        if (error) {
            toast.error("Erro ao cadastrar cliente");
        } else {
            toast.success("Cliente cadastrado!");
            setClients([...clients, data]);
            setFormData({ ...formData, clientId: data.id });
            setQuickClientData({ name: "", phone: "" });
            setShowQuickClientForm(false);
        }
        setSavingQuickClient(false);
    };

    const handleClose = () => {
        setFormData({ clientId: "", professionalId: "", serviceId: "", time: "" });
        setAppointmentDate(selectedDate);
        setQuickClientData({ name: "", phone: "" });
        setShowQuickClientForm(false);
        setOpen(false);
        onSuccess?.();
        onClose?.();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) handleClose();
        }}>
            {!appointment && (
                <DialogTrigger asChild>
                    <Button className="font-semibold shadow-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Agendamento
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {appointment ? "Editar Agendamento" : "Novo Agendamento"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Data *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !appointmentDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {appointmentDate ? format(appointmentDate, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={appointmentDate}
                                    onSelect={(date) => date && setAppointmentDate(date)}
                                    initialFocus
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="client">Cliente *</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowQuickClientForm(!showQuickClientForm)}
                                className="text-xs h-8 text-primary hover:text-primary/90"
                            >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Cadastro Rápido
                            </Button>
                        </div>

                        <Collapsible open={showQuickClientForm} onOpenChange={setShowQuickClientForm}>
                            <CollapsibleContent className="space-y-3 pb-3">
                                <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="quickName" className="text-xs font-semibold text-muted-foreground">Nome do Cliente *</Label>
                                        <Input
                                            id="quickName"
                                            value={quickClientData.name}
                                            onChange={(e) => setQuickClientData({ ...quickClientData, name: e.target.value })}
                                            placeholder="Nome completo"
                                            className="h-9 bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quickPhone" className="text-xs font-semibold text-muted-foreground">Telefone</Label>
                                        <Input
                                            id="quickPhone"
                                            value={quickClientData.phone}
                                            onChange={(e) => setQuickClientData({ ...quickClientData, phone: e.target.value })}
                                            placeholder="(11) 98765-4321"
                                            className="h-9 bg-background"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleQuickClientSave}
                                        disabled={savingQuickClient || !quickClientData.name.trim()}
                                        className="w-full text-xs"
                                    >
                                        {savingQuickClient ? "Salvando..." : "Salvar Cliente"}
                                    </Button>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Select
                            value={formData.clientId}
                            onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                            disabled={showQuickClientForm}
                        >
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="professional">Profissional *</Label>
                        <Select value={formData.professionalId} onValueChange={(value) => setFormData({ ...formData, professionalId: value })}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecione o profissional" />
                            </SelectTrigger>
                            <SelectContent>
                                {professionals.map((professional) => (
                                    <SelectItem key={professional.id} value={professional.id}>
                                        {professional.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="service">Serviço *</Label>
                        <Select value={formData.serviceId} onValueChange={(value) => setFormData({ ...formData, serviceId: value })}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecione o serviço" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id}>
                                        {service.name} - R$ {service.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time">Horário *</Label>
                        <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {Array.from({ length: 26 }, (_, i) => {
                                    const hour = Math.floor(i / 2) + 8; // Start at 8:00
                                    const minute = i % 2 === 0 ? "00" : "30";
                                    return `${hour.toString().padStart(2, "0")}:${minute}`;
                                }).map((time) => (
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" disabled={loading}>
                        {loading ? (appointment ? "Atualizando..." : "Criando...") : (appointment ? "Salvar Agendamento" : "Confirmar Agendamento")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
