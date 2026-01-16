import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBirthdays } from "@/hooks/use-birthdays";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AppointmentDialog from "@/components/AppointmentDialog";
import { Check, X, Edit, Bell, Clock, Plus, ChevronLeft, ChevronRight, Cake } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import {
    sendWhatsAppMessage,
    generateConfirmationMessage,
    generateCancellationMessage,
    generateReminderMessage
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { DateStrip } from "@/components/DateStrip";

type ViewMode = 'day' | 'week' | 'month';

export default function Agenda() {
    const { profile } = useProfile();
    const [searchParams, setSearchParams] = useSearchParams();
    const [date, setDate] = useState<Date>(new Date());
    const [view, setView] = useState<ViewMode>('day');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [allAppointments, setAllAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { birthdaysToday } = useBirthdays();
    // const [birthdaysToday, setBirthdaysToday] = useState<any[]>([]); // Removed local state

    useEffect(() => {
        loadAllAppointments();
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [date, view]);

    const loadAllAppointments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch just dates for dots in calendar
        const { data } = await supabase
            .from("appointments")
            .select("date")
            .eq("user_id", user.id);

        setAllAppointments(data || []);
    };

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("Agenda: User not found");
                return;
            }

            console.log("Agenda: User found, fetching appointments...");

            let query = supabase
                .from("appointments")
                .select(`
                    *,
                    clients (name, phone),
                    professionals (name),
                    services (name)
                `)
                .eq("user_id", user.id);

            // Date filter based on view
            if (view === 'day') {
                const dateStr = format(date, "yyyy-MM-dd");
                const dayStart = new Date(dateStr + "T00:00:00").toISOString();
                const dayEnd = new Date(dateStr + "T23:59:59").toISOString();
                query = query.gte("date", dayStart).lte("date", dayEnd);
            } else if (view === 'week') {
                const startStr = format(startOfWeek(date), "yyyy-MM-dd");
                const endStr = format(endOfWeek(date), "yyyy-MM-dd");
                query = query.gte("date", startStr + "T00:00:00").lte("date", endStr + "T23:59:59");
            } else if (view === 'month') {
                const startStr = format(startOfMonth(date), "yyyy-MM-dd");
                const endStr = format(endOfMonth(date), "yyyy-MM-dd");
                query = query.gte("date", startStr + "T00:00:00").lte("date", endStr + "T23:59:59");
            }

            const { data, error } = await query.order("date");

            if (error) {
                console.error("Agenda: Error fetching appointments", error);
                toast.error("Erro ao carregar agendamentos");
            } else {
                console.log("Agenda: Appointments loaded", data?.length);
                setAppointments(data || []);
            }
        } catch (err) {
            console.error("Agenda: Unexpected error", err);
            toast.error("Erro inesperado ao carregar agenda");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string, appointment: any) => {
        const { error } = await supabase
            .from("appointments")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error("Erro ao atualizar agendamento");
        } else {
            if (newStatus === "confirmed") {
                await supabase
                    .from("financial_transactions")
                    .update({ status: "paid", paid_at: new Date().toISOString() })
                    .eq("appointment_id", id);

                if (appointment.clients?.phone) {
                    const apptDate = new Date(appointment.date);
                    const formattedDate = format(apptDate, "dd/MM/yyyy");
                    const message = generateConfirmationMessage(
                        appointment.clients.name,
                        formattedDate,
                        format(apptDate, "HH:mm"),
                        appointment.services.name,
                        appointment.professionals.name,
                        profile?.salonName || undefined
                    );
                    sendWhatsAppMessage(appointment.clients.phone, message);
                }
            }

            toast.success(newStatus === 'confirmed' ? "Agendamento confirmado!" : "Status atualizado!");
            loadAppointments();
            if (view !== 'month') loadAllAppointments();
        }
    };

    const handleSendReminder = (appointment: any) => {
        if (appointment.clients?.phone) {
            const apptDate = new Date(appointment.date);
            const formattedDate = format(apptDate, "dd/MM/yyyy");
            const message = generateReminderMessage(
                appointment.clients.name,
                formattedDate,
                format(apptDate, "HH:mm"),
                appointment.services.name,
                appointment.professionals.name,
                profile?.salonName || undefined
            );
            sendWhatsAppMessage(appointment.clients.phone, message);
            toast.success("Lembrete enviado via WhatsApp!");
        } else {
            toast.error("Cliente não possui telefone cadastrado");
        }
    };

    const handleDelete = async (id: string, appointment: any) => {
        if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
            if (appointment.clients?.phone) {
                const apptDate = new Date(appointment.date);
                const formattedDate = format(apptDate, "dd/MM/yyyy");
                const message = generateCancellationMessage(
                    appointment.clients.name,
                    formattedDate,
                    format(apptDate, "HH:mm"),
                    appointment.services.name,
                    profile?.salonName || undefined
                );
                sendWhatsAppMessage(appointment.clients.phone, message);
            }

            const { error } = await supabase
                .from("appointments")
                .update({ status: 'cancelled' })
                .eq("id", id);

            if (error) {
                toast.error("Erro ao cancelar agendamento");
            } else {
                await supabase
                    .from("financial_transactions")
                    .update({ status: "cancelled" })
                    .eq("appointment_id", id);

                toast.success("Agendamento cancelado!");
                loadAppointments();
                if (view !== 'month') loadAllAppointments();
            }
        }
    };

    const renderAppointmentCard = (appointment: any, isCompact = false) => (
        <Card
            key={appointment.id}
            className={cn(
                "transition-all duration-200 border-l-[4px] shadow-sm hover:shadow-md",
                appointment.status === 'confirmed' ? "border-l-green-500" :
                    appointment.status === 'cancelled' ? "border-l-red-500" :
                        "border-l-amber-500",
                isCompact ? "mb-2" : "mb-3"
            )}
        >
            <CardContent className={cn("p-4", isCompact && "p-3")}>
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
                        <span className="text-lg font-bold text-foreground">
                            {format(new Date(appointment.date), "HH:mm")}
                        </span>
                        <div className={cn(
                            "w-2 h-2 rounded-full mt-1 md:hidden",
                            appointment.status === 'confirmed' ? "bg-green-500" :
                                appointment.status === 'cancelled' ? "bg-red-500" :
                                    "bg-amber-500"
                        )} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-base truncate pr-2">
                                {appointment.clients.name}
                            </h4>
                            {!isCompact && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "hidden md:inline-flex capitalize text-[10px] h-5",
                                        appointment.status === "confirmed" && "text-green-700 border-green-200 bg-green-50",
                                        appointment.status === "pending" && "text-amber-700 border-amber-200 bg-amber-50",
                                        appointment.status === "cancelled" && "text-red-700 border-red-200 bg-red-50"
                                    )}
                                >
                                    {appointment.status === 'confirmed' ? 'Confirmado' :
                                        appointment.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                            {appointment.services.name}
                        </p>
                        {!isCompact && (
                            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                                {appointment.professionals.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed">
                    <div className="flex gap-1">
                        {appointment.status !== "confirmed" && appointment.status !== "cancelled" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(appointment.id, "confirmed", appointment)}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleSendReminder(appointment)}
                        >
                            <Bell className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                                setEditingAppointment(appointment);
                                setIsDialogOpen(true);
                            }}
                        >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        {appointment.status !== "cancelled" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(appointment.id, appointment)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] relative animate-in fade-in duration-500">
            {/* Header with View Toggle */}
            <div className="shrink-0 z-10 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <div className="flex items-center justify-between p-2">
                    <div className="flex-1">
                        {view !== 'day' && (
                            <div className="flex items-center gap-2 px-2">
                                <h2 className="text-lg font-bold capitalize text-primary">
                                    {format(date, "MMMM yyyy", { locale: ptBR })}
                                </h2>
                            </div>
                        )}
                    </div>
                    <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-3 h-8">
                            <TabsTrigger value="day" className="text-xs">Dia</TabsTrigger>
                            <TabsTrigger value="week" className="text-xs">Sem</TabsTrigger>
                            <TabsTrigger value="month" className="text-xs">Mês</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {view === 'day' && (
                    <DateStrip
                        selectedDate={date}
                        onSelectDate={setDate}
                    />
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                {birthdaysToday.length > 0 && (
                    <div className="mb-4 animate-in slide-in-from-top-2 duration-700">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 flex items-start gap-3 shadow-sm">
                            <div className="p-2 bg-pink-100 rounded-full">
                                <Cake className="h-5 w-5 text-pink-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-pink-700">Aniversariantes do Dia!</h4>
                                <p className="text-sm text-pink-600 mt-1">
                                    Parabéns para: {birthdaysToday.map(c => c.name).join(", ")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* DAY VIEW */}
                        {view === 'day' && (
                            appointments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4 space-y-4">
                                    <div className="bg-primary/5 p-6 rounded-full">
                                        <Clock className="h-12 w-12 text-primary/40" />
                                    </div>
                                    <h3 className="text-xl font-medium text-muted-foreground">Dia Livre</h3>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                            Você não tem agendamentos para esta data. Toque no botão + para adicionar.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto">
                                    {appointments.map(apt => renderAppointmentCard(apt))}
                                </div>
                            )
                        )}

                        {/* WEEK VIEW */}
                        {view === 'week' && (
                            <div className="space-y-6 max-w-3xl mx-auto">
                                {eachDayOfInterval({ start: startOfWeek(date), end: endOfWeek(date) }).map((day) => {
                                    const dayAppointments = appointments.filter(a => isSameDay(new Date(a.date), day));
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <div key={day.toISOString()} className={cn("space-y-2", isToday && "bg-primary/5 -mx-4 px-4 py-2 rounded-lg")}>
                                            <h3 className={cn("font-medium sticky top-0 bg-background/95 py-1 z-0", isToday ? "text-primary" : "text-muted-foreground")}>
                                                {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                            </h3>
                                            {dayAppointments.length > 0 ? (
                                                dayAppointments.map(apt => renderAppointmentCard(apt, true))
                                            ) : (
                                                <p className="text-sm text-muted-foreground/50 italic pl-2">Sem agendamentos</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}


                        {/* MONTH VIEW - Updated Grid & List */}
                        {view === 'month' && (
                            <div className="flex flex-col space-y-4">
                                <Card className="shadow-md overflow-hidden">
                                    <div className="p-4 bg-primary/5 border-b flex justify-between items-center">
                                        <Button variant="ghost" size="icon" onClick={() => setDate(subMonths(date, 1))}>
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <h3 className="font-bold text-lg capitalize">
                                            {format(date, "MMMM yyyy", { locale: ptBR })}
                                        </h3>
                                        <Button variant="ghost" size="icon" onClick={() => setDate(addMonths(date, 1))}>
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                                <div key={day} className="text-xs font-semibold text-muted-foreground uppercase py-1">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {(() => {
                                                const monthStart = startOfMonth(date);
                                                const monthEnd = endOfMonth(monthStart);
                                                const startDate = startOfWeek(monthStart);
                                                const endDate = endOfWeek(monthEnd);
                                                const days = eachDayOfInterval({ start: startDate, end: endDate });

                                                return days.map((day, idx) => {
                                                    const isCurrentMonth = isSameMonth(day, date);
                                                    const isToday = isSameDay(day, new Date());
                                                    const isSelected = isSameDay(day, date);
                                                    const dayAppointments = allAppointments.filter(a =>
                                                        isSameDay(new Date(a.date), day)
                                                    );
                                                    const hasAppointments = dayAppointments.length > 0;

                                                    return (
                                                        <div
                                                            key={day.toISOString()}
                                                            className={cn(
                                                                "aspect-square relative flex items-center justify-center rounded-lg cursor-pointer transition-all border border-transparent",
                                                                !isCurrentMonth && "opacity-30 text-muted-foreground bg-muted/20",
                                                                isCurrentMonth && !isSelected && "hover:bg-accent hover:text-accent-foreground",
                                                                isToday && !isSelected && "bg-primary/10 font-bold border-primary/20",
                                                                isSelected && isCurrentMonth && "bg-primary text-primary-foreground font-bold shadow-md scale-105 z-10"
                                                            )}
                                                            onClick={() => setDate(day)}
                                                        >
                                                            <span className="text-sm">{format(day, 'd')}</span>
                                                            {hasAppointments && !isSelected && (
                                                                <div className="absolute bottom-1.5 flex gap-0.5 justify-center">
                                                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                                                    {dayAppointments.length > 1 && <div className="w-1 h-1 rounded-full bg-primary/60" />}
                                                                    {dayAppointments.length > 3 && <div className="w-1 h-1 rounded-full bg-primary/30" />}
                                                                </div>
                                                            )}
                                                            {hasAppointments && isSelected && (
                                                                <div className="absolute bottom-1.5 flex gap-0.5 justify-center">
                                                                    <div className="w-1 h-1 rounded-full bg-primary-foreground" />
                                                                    {dayAppointments.length > 1 && <div className="w-1 h-1 rounded-full bg-primary-foreground/60" />}
                                                                    {dayAppointments.length > 3 && <div className="w-1 h-1 rounded-full bg-primary-foreground/30" />}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 p-2 text-center border-t">
                                        <p className="text-[10px] text-muted-foreground">Selecione um dia para ver os agendamentos abaixo</p>
                                    </div>
                                </Card>

                                <div className="animate-in slide-in-from-bottom-5 duration-500">
                                    <h3 className="font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="h-4 w-1 bg-primary rounded-full"></div>
                                        Agendamentos de {format(date, "dd 'de' MMMM", { locale: ptBR })}
                                    </h3>

                                    {(() => {
                                        const daysAppointments = appointments.filter(a =>
                                            isSameDay(new Date(a.date), date)
                                        );

                                        return daysAppointments.length > 0 ? (
                                            <div className="space-y-3 pb-20">
                                                {daysAppointments.map(apt => renderAppointmentCard(apt))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                                                <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                                <p className="text-sm text-muted-foreground">Nenhum agendamento para este dia</p>
                                                <Button
                                                    variant="link"
                                                    className="text-primary"
                                                    onClick={() => {
                                                        setEditingAppointment(null);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    Agendar agora
                                                </Button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* FAB */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform duration-200"
                    onClick={() => {
                        setEditingAppointment(null);
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="h-6 w-6 text-white" />
                </Button>
            </div>

            {/* Appointment Dialog - Controlled visibility */}
            {isDialogOpen && (
                <AppointmentDialog
                    selectedDate={date}
                    onSuccess={() => {
                        loadAppointments();
                        loadAllAppointments();
                        // setIsDialogOpen(false); 
                    }}
                    appointment={editingAppointment}
                    onClose={() => {
                        setEditingAppointment(null);
                        setIsDialogOpen(false);
                    }}
                />
            )}
        </div>
    );
}
