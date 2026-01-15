import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Edit, Scissors, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProfessionalDialog from "@/components/ProfessionalDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Profissionais() {
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingProfessional, setEditingProfessional] = useState<any>(null);

    useEffect(() => {
        loadProfessionals();
    }, []);

    const loadProfessionals = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("professionals")
            .select("*")
            .eq("user_id", user.id)
            .order("name");

        if (error) {
            toast.error("Erro ao carregar profissionais");
        } else {
            setProfessionals(data || []);
        }
        setLoading(false);
    };

    const filteredProfessionals = professionals.filter(professional =>
        professional.name.toLowerCase().includes(search.toLowerCase()) ||
        professional.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Profissionais</h2>
                    <p className="text-muted-foreground mt-1">Gerencie sua equipe</p>
                </div>
                <ProfessionalDialog onSuccess={loadProfessionals} professional={editingProfessional} onClose={() => setEditingProfessional(null)} />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome ou email..."
                    className="pl-10 h-12 text-lg shadow-sm bg-card border-muted"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredProfessionals.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
                    <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        {search ? "Nenhum profissional encontrado" : "Nenhum profissional cadastrado"}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Adicione membros à sua equipe para distribuir os agendamentos.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProfessionals.map((professional) => (
                        <Card key={professional.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 group">
                            <CardContent className="p-0">
                                <div className="p-6 flex items-start gap-4">
                                    <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white text-xl font-bold">
                                            {professional.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{professional.name}</h3>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {professional.specialties && professional.specialties.map((specialty: string, index: number) => (
                                                <Badge key={index} variant="secondary" className="text-[10px] px-1.5 h-5">
                                                    {specialty}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-2 space-y-2">
                                    {professional.phone && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Phone className="h-3.5 w-3.5 mr-2" />
                                            {professional.phone}
                                        </div>
                                    )}
                                    {professional.email && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5 mr-2" />
                                            <span className="truncate">{professional.email}</span>
                                        </div>
                                    )}
                                    {professional.commission_rate && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Percent className="h-3.5 w-3.5 mr-2" />
                                            Comissão: {professional.commission_rate}%
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 mt-2 flex justify-end opacity-80 group-hover:opacity-100 transition-opacity border-t border-border/50 bg-muted/20">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={() => setEditingProfessional(professional)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
