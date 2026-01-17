import { useState, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Ensure these are exported from ui/tabs or install
import { Switch } from "@/components/ui/switch"; // Need to ensure Switch exists or use Checkbox
import { toast } from "sonner";
import { Clock, ShieldAlert, Bell, Save, Loader2, Globe, Copy, ExternalLink } from "lucide-react";

// Types for our settings
interface DaySchedule {
    open: string;
    close: string;
    active: boolean;
}

interface BusinessHours {
    [key: string]: DaySchedule;
}

interface BusinessRules {
    cancellationWindow: number; // in hours
    bufferTime: number; // in minutes
}

interface OnlineBookingConfig {
    active: boolean;
}

interface NotificationTemplates {
    confirmation: string;
    reminder: string;
}

const DAYS = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' },
];

const DEFAULT_HOURS: BusinessHours = {
    monday: { open: "09:00", close: "18:00", active: true },
    tuesday: { open: "09:00", close: "18:00", active: true },
    wednesday: { open: "09:00", close: "18:00", active: true },
    thursday: { open: "09:00", close: "18:00", active: true },
    friday: { open: "09:00", close: "18:00", active: true },
    saturday: { open: "09:00", close: "14:00", active: true },
    sunday: { open: "00:00", close: "00:00", active: false },
};

const DEFAULT_RULES: BusinessRules = {
    cancellationWindow: 24,
    bufferTime: 0
};

const DEFAULT_NOTIFICATIONS: NotificationTemplates = {
    confirmation: "Olá {nome}, seu agendamento de {servico} está confirmado para {data} às {hora}. 💇‍♀️",
    reminder: "Oi {nome}! Passando para lembrar do seu horário de {servico} amanhã às {hora}. Até lá! ✨"
};

export function BusinessSettings() {
    const { profile } = useProfile();
    const [loading, setLoading] = useState(false);

    // Config State
    const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS);
    const [rules, setRules] = useState<BusinessRules>(DEFAULT_RULES);
    const [onlineBooking, setOnlineBooking] = useState<OnlineBookingConfig>({ active: false });
    const [notifications, setNotifications] = useState<NotificationTemplates>(DEFAULT_NOTIFICATIONS);

    // Load settings from profile
    useEffect(() => {
        if (profile?.settings) {
            const settings = profile.settings as any;
            if (settings.hours) setHours({ ...DEFAULT_HOURS, ...settings.hours });
            if (settings.rules) setRules({ ...DEFAULT_RULES, ...settings.rules });
            if (settings.onlineBooking) setOnlineBooking(settings.onlineBooking);
            if (settings.notifications) setNotifications({ ...DEFAULT_NOTIFICATIONS, ...settings.notifications });
        }
    }, [profile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newSettings = {
                hours,
                rules,
                onlineBooking,
                notifications
            };

            const { error } = await supabase
                .from('profiles')
                .update({
                    settings: newSettings as any,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success("Configurações salvas com sucesso!");

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar configurações");
        } finally {
            setLoading(false);
        }
    };

    const handleHourChange = (day: string, field: 'open' | 'close', value: string) => {
        setHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleDayToggle = (day: string, checked: boolean) => {
        setHours(prev => ({
            ...prev,
            [day]: { ...prev[day], active: checked }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Configurações Operacionais</h3>
                    <p className="text-sm text-muted-foreground">Defina horários e regras do seu negócio.</p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Tudo
                </Button>
            </div>

            <Tabs defaultValue="hours" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="hours" className="flex items-center gap-2"><Clock className="h-4 w-4" /> Horários</TabsTrigger>
                    <TabsTrigger value="rules" className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Regras</TabsTrigger>
                    <TabsTrigger value="online" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Online</TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifs</TabsTrigger>
                </TabsList>

                {/* --- Business Hours Tab --- */}
                <TabsContent value="hours" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horário de Funcionamento</CardTitle>
                            <CardDescription>Estes horários limitarão quando os clientes podem agendar.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {DAYS.map((day) => (
                                <div key={day.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Switch
                                            checked={hours[day.id]?.active}
                                            onCheckedChange={(c) => handleDayToggle(day.id, c)}
                                        />
                                        <span className={`font-medium w-24 ${!hours[day.id]?.active && 'text-muted-foreground line-through'}`}>
                                            {day.label}
                                        </span>
                                    </div>

                                    {hours[day.id]?.active ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={hours[day.id]?.open}
                                                onChange={(e) => handleHourChange(day.id, 'open', e.target.value)}
                                                className="w-24"
                                            />
                                            <span className="text-muted-foreground">até</span>
                                            <Input
                                                type="time"
                                                value={hours[day.id]?.close}
                                                onChange={(e) => handleHourChange(day.id, 'close', e.target.value)}
                                                className="w-24"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic mr-4">
                                            Fechado
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Rules Tab --- */}
                <TabsContent value="rules" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Políticas de Agendamento</CardTitle>
                            <CardDescription>Defina restrições para seus clientes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cancelWindow">Janela de Cancelamento (Horas)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="cancelWindow"
                                        type="number"
                                        min="0"
                                        value={rules.cancellationWindow}
                                        onChange={(e) => setRules(prev => ({ ...prev, cancellationWindow: parseInt(e.target.value) || 0 }))}
                                        className="w-32"
                                    />
                                    <span className="text-sm text-muted-foreground">horas de antecedência mínima</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Clientes não poderão cancelar sozinhos após este prazo.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bufferTime">Tempo de Buffer (Minutos)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="bufferTime"
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={rules.bufferTime}
                                        onChange={(e) => setRules(prev => ({ ...prev, bufferTime: parseInt(e.target.value) || 0 }))}
                                        className="w-32"
                                    />
                                    <span className="text-sm text-muted-foreground">minutos após cada serviço</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Tempo extra automático para limpeza/preparação entre clientes.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Online Booking Tab --- */}
                <TabsContent value="online" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agendamento Online</CardTitle>
                            <CardDescription>Permita que seus clientes agendem sozinhos através de um link público.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Habilitar Link Público</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Se desativado, o link mostrará uma mensagem de "Indisponível".
                                    </p>
                                </div>
                                <Switch
                                    checked={onlineBooking.active}
                                    onCheckedChange={(c) => setOnlineBooking(prev => ({ ...prev, active: c }))}
                                />
                            </div>

                            {onlineBooking.active && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label>Seu Link de Agendamento</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm truncate border">
                                            {profile?.id
                                                ? `${window.location.origin}/agendar/${profile.id}`
                                                : <span className="text-muted-foreground animate-pulse">Carregando link...</span>
                                            }
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/agendar/${profile?.id}`);
                                                toast.success("Link copiado!");
                                            }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => window.open(`/agendar/${profile?.id}`, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Compartilhe este link no seu WhatsApp, Instagram ou Bio.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Notifications Tab --- */}
                <TabsContent value="notifications" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Modelos de Mensagem</CardTitle>
                            <CardDescription>
                                Personalize as mensagens que serão enviadas para o WhatsApp dos clientes.
                                <br />
                                <span className="text-xs text-muted-foreground">Variáveis disponíveis: {'{nome}'}, {'{servico}'}, {'{data}'}, {'{hora}'}, {'{profissional}'}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="msgConfirmation">Mensagem de Confirmação</Label>
                                <textarea
                                    id="msgConfirmation"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={notifications.confirmation}
                                    onChange={(e) => setNotifications(prev => ({ ...prev, confirmation: e.target.value }))}
                                    placeholder="Olá {nome}, seu agendamento de {servico} está confirmado para {data} às {hora}."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="msgReminder">Mensagem de Lembrete (24h antes)</Label>
                                <textarea
                                    id="msgReminder"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={notifications.reminder}
                                    onChange={(e) => setNotifications(prev => ({ ...prev, reminder: e.target.value }))}
                                    placeholder="Oi {nome}, passando para lembrar do seu horário de {servico} amanhã às {hora} com {profissional}."
                                />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
