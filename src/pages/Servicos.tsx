import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, DollarSign, Edit, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ServiceDialog from "@/components/ServiceDialog";
import { Badge } from "@/components/ui/badge";

export default function Servicos() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingService, setEditingService] = useState<any>(null);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("services")
            .select("*")
            .eq("user_id", user.id)
            .order("name");

        if (error) {
            toast.error("Erro ao carregar serviços");
        } else {
            setServices(data || []);
        }
        setLoading(false);
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Serviços</h2>
                    <p className="text-muted-foreground mt-1">Gerencie seu catálogo de serviços</p>
                </div>
                <ServiceDialog onSuccess={loadServices} service={editingService} onClose={() => setEditingService(null)} />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome ou descrição..."
                    className="pl-10 h-12 text-lg shadow-sm bg-card border-muted"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                    <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        {search ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Adicione os serviços que você oferece para começar a agendar.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredServices.map((service) => (
                        <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 group">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                            <Scissors className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {service.name}
                                            </h3>

                                        </div>
                                        <Badge variant="secondary" className="font-bold text-base px-2 py-0.5 whitespace-nowrap">
                                            R$ {service.price?.toFixed(2)}
                                        </Badge>
                                    </div>

                                    {service.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                            {service.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1.5" />
                                            {service.duration} min
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-foreground w-full"
                                            onClick={() => setEditingService(service)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar Serviço
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
