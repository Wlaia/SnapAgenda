import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Edit, CalendarPlus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ClientDialog from "@/components/ClientDialog";
import AppointmentDialog from "@/components/AppointmentDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Clientes() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingClient, setEditingClient] = useState<any>(null);
    const [schedulingClientId, setSchedulingClientId] = useState<string | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("clients")
            .select("*")
            .eq("user_id", user.id)
            .order("name");

        if (error) {
            toast.error("Erro ao carregar clientes");
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email?.toLowerCase().includes(search.toLowerCase()) ||
        client.phone?.includes(search)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Clientes</h2>
                    <p className="text-muted-foreground mt-1">Gerencie sua base de clientes</p>
                </div>
                <ClientDialog onSuccess={loadClients} client={editingClient} onClose={() => setEditingClient(null)} />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar clientes por nome, email ou telefone..."
                    className="pl-10 h-12 text-lg shadow-sm bg-card border-muted"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Cadastre seus clientes para gerenciar agendamentos e manter um histórico de serviços.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 group">
                            <CardContent className="p-0">
                                <div className="p-6 flex items-start gap-4">
                                    <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xl font-bold">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{client.name}</h3>
                                        <div className="space-y-1 mt-1">
                                            {client.phone && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="h-3.5 w-3.5 mr-2" />
                                                    {client.phone}
                                                </div>
                                            )}
                                            {client.email && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Mail className="h-3.5 w-3.5 mr-2" />
                                                    <span className="truncate">{client.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 shadow-sm"
                                        onClick={() => setSchedulingClientId(client.id)}
                                    >
                                        <CalendarPlus className="h-4 w-4 mr-2" />
                                        Agendar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={() => setEditingClient(client)}
                                    >
                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {schedulingClientId && (
                <AppointmentDialog
                    selectedDate={new Date()}
                    initialClientId={schedulingClientId}
                    onSuccess={loadClients}
                    onClose={() => setSchedulingClientId(null)}
                />
            )}
        </div>
    );
}
