
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Calendar as CalendarIcon, Clock, Check, Scissors, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Booking Steps
type Step = 'service' | 'professional' | 'date' | 'confirm' | 'success';

export default function PublicBooking() {
    const { uid } = useParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [step, setStep] = useState<Step>('service');

    // Data State
    const [services, setServices] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);

    // Selection State
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string>("");

    // Client Info
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadBusinessData();
    }, [uid]);

    const loadBusinessData = async () => {
        if (!uid) return;
        setLoading(true);

        // Load Profile & Settings
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

        if (error || !profileData) {
            setLoading(false);
            return;
        }

        // Check if online booking is active
        const settings = profileData.settings as any;
        if (!settings?.onlineBooking?.active) {
            setProfile({ ...profileData, onlineDisabled: true });
            setLoading(false);
            return;
        }

        setProfile(profileData);

        // Load Services
        const { data: servicesData } = await supabase
            .from('services')
            .select('*')
            .eq('user_id', uid)
            .order('name');

        setServices(servicesData || []);

        // Load Professionals
        const { data: prosData } = await supabase
            .from('professionals')
            .select('*')
            .eq('user_id', uid);

        setProfessionals(prosData || []);

        setLoading(false);
    };

    const getAvailableTimes = () => {
        if (!selectedDate || !profile) return [];

        const settings = profile.settings as any;
        const dayName = format(selectedDate, 'EEEE').toLowerCase(); // monday, tuesday...
        const dayConfig = settings?.hours?.[dayName];

        if (!dayConfig || !dayConfig.active) return [];

        // Generate slots based on duration (simple version)
        // Ideally should check existing appointments here (omitted for brevity, can add later)

        const openH = parseInt(dayConfig.open.split(':')[0]);
        const closeH = parseInt(dayConfig.close.split(':')[0]);

        const slots = [];
        for (let h = openH; h < closeH; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`);
            slots.push(`${h.toString().padStart(2, '0')}:30`);
        }

        return slots;
    };

    const handleConfirmBooking = async () => {
        if (!clientName || !clientPhone) {
            toast.error("Preencha seus dados.");
            return;
        }
        setSubmitting(true);

        try {
            // 1. Find or Create Client
            const { data: existingClient } = await supabase
                .from('clients')
                .select('id')
                .eq('user_id', uid)
                .eq('phone', clientPhone) // Simple match by phone
                .single();

            let clientId = existingClient?.id;

            if (!clientId) {
                const { data: newClient, error: clientError } = await supabase
                    .from('clients')
                    .insert({
                        user_id: uid,
                        name: clientName,
                        phone: clientPhone
                    })
                    .select()
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            // 2. Create Appointment
            const dateStr = format(selectedDate!, "yyyy-MM-dd");
            const dateTime = new Date(`${dateStr}T${selectedTime}`).toISOString();

            const { error: apptError } = await supabase
                .from('appointments')
                .insert({
                    user_id: uid,
                    client_id: clientId,
                    professional_id: selectedProfessional.id,
                    service_id: selectedService.id,
                    date: dateTime,
                    status: 'pending' // Online bookings start as pending usually? Or confirmed. Let's say pending.
                });

            if (apptError) throw apptError;

            setStep('success');
        } catch (error) {
            console.error(error);
            toast.error("Erro ao realizar agendamento.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile || profile.onlineDisabled) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <h2 className="text-xl font-bold mb-2">Agendamento Indisponível</h2>
                    <p className="text-muted-foreground">Este estabelecimento não está aceitando agendamentos online no momento.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            {/* Header */}
            <div className="w-full max-w-lg mb-8 text-center pt-8">
                {profile.logo_url ? (
                    <img src={profile.logo_url} alt={profile.salon_name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover shadow-md" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary font-bold text-2xl">
                        {profile.salon_name?.charAt(0) || "S"}
                    </div>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{profile.salon_name}</h1>
                <p className="text-gray-500">{profile.address || "Agende seu horário online"}</p>
            </div>

            {/* Wizard Card */}
            <Card className="w-full max-w-lg shadow-xl border-none">
                <CardHeader className="border-b bg-white rounded-t-xl sticky top-0 z-10">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span className={step === 'service' ? "font-bold text-primary" : ""}>1. Serviço</span>
                        <span className={step === 'professional' ? "font-bold text-primary" : ""}>2. Profissional</span>
                        <span className={step === 'date' ? "font-bold text-primary" : ""}>3. Data</span>
                        <span className={step === 'confirm' ? "font-bold text-primary" : ""}>4. Confirmar</span>
                    </div>
                    {step !== 'success' && <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                                width: step === 'service' ? '25%' :
                                    step === 'professional' ? '50%' :
                                        step === 'date' ? '75%' : '100%'
                            }}
                        />
                    </div>}
                </CardHeader>

                <CardContent className="p-6">
                    {/* STEP 1: SERVICE */}
                    {step === 'service' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-lg font-semibold mb-4">Selecione o Serviço</h2>
                            <div className="grid gap-3">
                                {services.map(service => (
                                    <div
                                        key={service.id}
                                        className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex items-center justify-between group"
                                        onClick={() => {
                                            setSelectedService(service);
                                            setStep('professional');
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-white transition-colors">
                                                <Scissors className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{service.name}</h3>
                                                <p className="text-xs text-muted-foreground">{service.duration} min</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-primary">
                                            R$ {service.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PROFESSIONAL */}
                    {step === 'professional' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <Button variant="ghost" size="sm" onClick={() => setStep('service')} className="mb-2 -ml-2 text-muted-foreground">
                                ← Voltar
                            </Button>
                            <h2 className="text-lg font-semibold mb-4">Com quem deseja agendar?</h2>
                            <div className="grid gap-3">
                                {professionals.map(pro => (
                                    <div
                                        key={pro.id}
                                        className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all flex items-center gap-3 group"
                                        onClick={() => {
                                            setSelectedProfessional(pro);
                                            setStep('date');
                                        }}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                            {pro.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{pro.name}</h3>
                                            <p className="text-xs text-muted-foreground">Profissional</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DATE & TIME */}
                    {step === 'date' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <Button variant="ghost" size="sm" onClick={() => setStep('professional')} className="mb-2 -ml-2 text-muted-foreground">
                                ← Voltar
                            </Button>

                            <div className="space-y-2">
                                <Label>Selecione o Dia</Label>
                                <div className="border rounded-lg p-2 flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        locale={ptBR}
                                        disabled={(date) => {
                                            const dayName = format(date, 'EEEE').toLowerCase();
                                            const settings = profile.settings as any;
                                            const isActive = settings?.hours?.[dayName]?.active;
                                            return date < startOfToday() || !isActive;
                                        }}
                                        initialFocus
                                    />
                                </div>
                            </div>

                            {selectedDate && (
                                <div className="space-y-2 animate-in fade-in">
                                    <Label>Horários Disponíveis</Label>
                                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                        {getAvailableTimes().map(time => (
                                            <Button
                                                key={time}
                                                variant={selectedTime === time ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedTime(time)}
                                                className="w-full text-xs"
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                    {getAvailableTimes().length === 0 && (
                                        <p className="text-sm text-red-500 text-center py-2">Sem horários livres nesta data.</p>
                                    )}
                                </div>
                            )}

                            <Button
                                className="w-full mt-4"
                                disabled={!selectedDate || !selectedTime}
                                onClick={() => setStep('confirm')}
                            >
                                Continuar
                            </Button>
                        </div>
                    )}

                    {/* STEP 4: CONFIRM */}
                    {step === 'confirm' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <Button variant="ghost" size="sm" onClick={() => setStep('date')} className="mb-2 -ml-2 text-muted-foreground">
                                ← Voltar
                            </Button>

                            <div className="bg-primary/5 p-4 rounded-lg space-y-3">
                                <h3 className="font-semibold text-primary mb-2">Resumo do Agendamento</h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <Scissors className="h-4 w-4 opacity-70" />
                                    <span>{selectedService?.name} (R$ {selectedService?.price})</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 opacity-70" />
                                    <span>{selectedProfessional?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarIcon className="h-4 w-4 opacity-70" />
                                    <span className="capitalize">
                                        {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })} às {selectedTime}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Seu Nome Completo</Label>
                                    <Input
                                        placeholder="Ex: Maria Silva"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Seu WhatsApp</Label>
                                    <Input
                                        placeholder="(11) 99999-9999"
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-semibold shadow-lg"
                                onClick={handleConfirmBooking}
                                disabled={submitting || !clientName || !clientPhone}
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Agendamento"}
                            </Button>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {step === 'success' && (
                        <div className="text-center space-y-6 py-8 animate-in zoom-in duration-500">
                            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Agendamento Solicitado!</h2>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Obrigado, {clientName.split(' ')[0]}! O estabelecimento confirmará seu horário em breve.
                            </p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Fazer outro agendamento
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>

            <a
                href="https://www.snapagenda.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
                Powered by <span className="font-bold text-primary">SnapAgenda</span>
            </a>
        </div>
    );
}
