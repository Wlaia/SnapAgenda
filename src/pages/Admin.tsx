
import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Calendar, ShieldCheck, ShieldAlert, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserProfile {
    id: string;
    display_name: string;
    salon_name: string;
    whatsapp: string;
    subscription_status: string;
    trial_ends_at: string;
    last_payment_date: string;
    email?: string; // We might not get email directly from profiles unless joined, but let's see what we have
    // Note: To get email we usually need to join auth.users which is restricted. 
    // We will stick to public profile info plus subscription data available in profiles.
}

export default function Admin() {
    const { profile: myProfile, isLoading: myProfileLoading } = useProfile();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*"); // Select all fields including new subscription ones

        if (error) {
            toast.error("Erro ao buscar perfis: " + error.message);
        } else {
            setProfiles(data as any[] || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!myProfileLoading && myProfile.isAdmin) {
            fetchProfiles();
        }
    }, [myProfile, myProfileLoading]);

    const handleActivate = async (userId: string) => {
        const { error } = await supabase
            .from("profiles")
            .update({
                subscription_status: 'active',
                last_payment_date: new Date().toISOString()
            })
            .eq("id", userId);

        if (error) {
            toast.error("Erro ao ativar assinatura: " + error.message);
        } else {
            toast.success("Assinatura ativada com sucesso!");
            fetchProfiles(); // Refresh list
        }
    };

    const handleBlock = async (userId: string) => {
        if (!confirm("Tem certeza que deseja bloquear este usuário?")) return;

        const { error } = await supabase
            .from("profiles")
            .update({
                subscription_status: 'cancelled'
            })
            .eq("id", userId);

        if (error) {
            toast.error("Erro ao bloquear usuário: " + error.message);
        } else {
            toast.success("Usuário bloqueado.");
            fetchProfiles();
        }
    };

    if (myProfileLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    if (!myProfile.isAdmin) {
        return <div className="p-8 text-center text-red-500">Acesso Negado.</div>;
    }

    const filteredProfiles = profiles.filter(p =>
        (p.salon_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.display_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.whatsapp || "").includes(searchTerm)
    );

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel Admin</h1>
                    <p className="text-muted-foreground">Gerencie assinaturas e acesso dos clientes.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 border rounded-lg shadow-sm w-full md:w-auto">
                    <Search className="text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Buscar salão, nome ou whats..."
                        className="border-none shadow-none focus-visible:ring-0 w-full md:w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>
                ) : filteredProfiles.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Nenhum perfil encontrado.</div>
                ) : (
                    filteredProfiles.map((user) => (
                        <Card key={user.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                                            ${user.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                                                user.subscription_status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.salon_name ? user.salon_name.substring(0, 2).toUpperCase() : "??"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{user.salon_name || "Sem nome de salão"}</h3>
                                            <p className="text-sm text-gray-500">{user.display_name} • {user.whatsapp || "Sem whats"}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">

                                        <div className="flex flex-col items-end min-w-[140px]">
                                            <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                Status
                                            </div>
                                            <div className={`text-sm font-bold capitalize flex items-center gap-1
                                                ${user.subscription_status === 'active' ? 'text-green-600' :
                                                    user.subscription_status === 'trial' ? 'text-blue-600' : 'text-red-600'}`}>
                                                {user.subscription_status === 'active' && <ShieldCheck className="w-4 h-4" />}
                                                {user.subscription_status === 'trial' && <Calendar className="w-4 h-4" />}
                                                {(user.subscription_status === 'cancelled' || user.subscription_status === 'past_due') && <ShieldAlert className="w-4 h-4" />}
                                                {user.subscription_status}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end min-w-[140px]">
                                            <span className="text-xs text-muted-foreground">Fim do Teste / Pagamento</span>
                                            <span className="font-medium">
                                                {user.subscription_status === 'active'
                                                    ? (user.last_payment_date ? format(new Date(user.last_payment_date), 'dd/MM/yyyy') : '-')
                                                    : (user.trial_ends_at ? format(new Date(user.trial_ends_at), 'dd/MM/yyyy') : '-')}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto">
                                            {user.subscription_status !== 'active' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full md:w-auto" onClick={() => handleActivate(user.id)}>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    Ativar
                                                </Button>
                                            )}
                                            {user.subscription_status !== 'cancelled' && (
                                                <Button size="sm" variant="destructive" className="w-full md:w-auto" onClick={() => handleBlock(user.id)}>
                                                    Bloquear
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
