import { useState, useEffect } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Save, Loader2, MapPin, Phone, Store, CreditCard, Settings, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessSettings } from "@/components/settings/BusinessSettings";

export default function Perfil() {
    const { profile, refreshProfile } = useProfile();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const [formData, setFormData] = useState({
        salonName: "",
        whatsapp: "",
        address: "",
        logoUrl: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                salonName: profile.salonName || "",
                whatsapp: profile.whatsapp || "",
                address: profile.address || "",
                logoUrl: profile.logoUrl || ""
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const updates: any = {
            id: user.id,
            salon_name: formData.salonName,
            whatsapp: formData.whatsapp,
            updated_at: new Date(),
        };

        if (formData.address) updates.address = formData.address;
        if (formData.logoUrl) updates.logo_url = formData.logoUrl;

        const { error } = await supabase
            .from("profiles")
            .upsert(updates);

        if (error) {
            console.error(error);
            if (error.code === '42703') {
                toast.error("Erro: Colunas faltando no banco de dados.");
            } else {
                toast.error("Erro ao atualizar perfil");
            }
        } else {
            toast.success("Perfil atualizado com sucesso!");
            refreshProfile();
        }
        setLoading(false);
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !event.target.files || event.target.files.length === 0) {
                setUploading(false);
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/logo.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, logoUrl: `${publicUrl}?t=${new Date().getTime()}` }));
            toast.success("Logo enviada! Não esqueça de salvar.");

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao fazer upload da imagem.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Minha Conta</h2>
                <p className="text-muted-foreground mt-1">Gerencie seu perfil e configurações do negócio</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Geral
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Configurações
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 pt-6">
                    <form onSubmit={handleSave} className="grid gap-6">
                        {/* Logo Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Identidade Visual</CardTitle>
                                <CardDescription>Logo e imagem do seu salão</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full border-4 border-muted flex items-center justify-center overflow-hidden bg-muted/50">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-12 h-12 text-muted-foreground" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Clique na câmera para alterar a logo
                                </p>
                            </CardContent>
                        </Card>

                        {/* Details Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações de Contato</CardTitle>
                                <CardDescription>Dados visíveis para seus clientes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salonName">Nome do Salão</Label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="salonName"
                                            name="salonName"
                                            value={formData.salonName}
                                            onChange={handleChange}
                                            placeholder="Ex: Studio Concept Hair"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="whatsapp"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            placeholder="Ex: 11 99999-9999"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Endereço Completo</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Rua, Número, Bairro, Cidade - Estado"
                                            className="pl-9 min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Segurança</CardTitle>
                                <CardDescription>Atualize sua senha de acesso</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-end gap-4 p-4 border rounded-lg bg-muted/20">
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label htmlFor="newPassword">Nova Senha</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Digite sua nova senha"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={!newPassword || newPassword.length < 6}
                                        onClick={async () => {
                                            setLoading(true);
                                            const { error } = await supabase.auth.updateUser({ password: newPassword });

                                            if (error) {
                                                toast.error("Erro ao atualizar senha: " + error.message);
                                            } else {
                                                toast.success("Senha atualizada com sucesso!");
                                                setNewPassword("");
                                            }
                                            setLoading(false);
                                        }}
                                    >
                                        Atualizar Senha
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="settings" className="pt-6">
                    <BusinessSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
