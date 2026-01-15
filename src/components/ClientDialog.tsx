import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientDialogProps {
    onSuccess?: () => void;
    client?: any;
    onClose?: () => void;
}

export default function ClientDialog({ onSuccess, client, onClose }: ClientDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || "",
                email: client.email || "",
                phone: client.phone || "",
                address: client.address || "",
            });
            setOpen(true);
        } else {
            setFormData({ name: "", email: "", phone: "", address: "" });
        }
    }, [client]);

    const handleClose = () => {
        setOpen(false);
        setFormData({ name: "", email: "", phone: "", address: "" });
        onClose?.();
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

        if (client) {
            const { error } = await supabase
                .from("clients")
                .update({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                })
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
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {client ? "Editar Cliente" : "Novo Cliente"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                        />
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
                    <Button type="submit" className="w-full font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600" disabled={loading}>
                        {loading ? (client ? "Atualizando..." : "Criando...") : (client ? "Atualizar Cliente" : "Salvar Cliente")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
