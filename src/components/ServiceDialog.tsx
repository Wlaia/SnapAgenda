import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface ServiceDialogProps {
    onSuccess?: () => void;
    service?: any;
    onClose?: () => void;
}

export default function ServiceDialog({ onSuccess, service, onClose }: ServiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        duration: "30",
        description: "",
    });

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name || "",
                price: service.price ? service.price.toString() : "",
                duration: service.duration ? service.duration.toString() : "30",
                description: service.description || "",
            });
            setOpen(true);
        } else {
            setFormData({ name: "", price: "", duration: "30", description: "" });
        }
    }, [service]);

    const handleClose = () => {
        setOpen(false);
        setFormData({ name: "", price: "", duration: "30", description: "" });
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

        const price = formData.price ? parseFloat(formData.price) : 0;
        const duration = formData.duration ? parseInt(formData.duration) : 30;

        if (service) {
            const { error } = await supabase
                .from("services")
                .update({
                    name: formData.name,
                    price: price,
                    duration: duration,
                    description: formData.description,
                })
                .eq("id", service.id);

            if (error) {
                toast.error("Erro ao atualizar serviço");
            } else {
                toast.success("Serviço atualizado com sucesso!");
                handleClose();
                onSuccess?.();
            }
        } else {
            const { error } = await supabase
                .from("services")
                .insert({
                    user_id: user.id,
                    name: formData.name,
                    price: price,
                    duration: duration,
                    description: formData.description,
                });

            if (error) {
                toast.error("Erro ao criar serviço");
            } else {
                toast.success("Serviço criado com sucesso!");
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
            {!service && (
                <DialogTrigger asChild>
                    <Button className="font-semibold shadow-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Serviço
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {service ? "Editar Serviço" : "Novo Serviço"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Serviço *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Ex: Corte Masculino"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço (R$)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duração (minutos)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="30"
                                step="5"
                                min="5"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalhes sobre o serviço..."
                            className="resize-none h-20"
                        />
                    </div>
                    <Button type="submit" className="w-full font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600" disabled={loading}>
                        {loading ? (service ? "Atualizando..." : "Criando...") : (service ? "Atualizar Serviço" : "Salvar Serviço")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
