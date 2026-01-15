import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfessionalDialogProps {
    onSuccess?: () => void;
    professional?: any;
    onClose?: () => void;
}

export default function ProfessionalDialog({ onSuccess, professional, onClose }: ProfessionalDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialties: "",
        commission_rate: "",
    });

    useEffect(() => {
        if (professional) {
            setFormData({
                name: professional.name || "",
                email: professional.email || "",
                phone: professional.phone || "",
                specialties: professional.specialties ? professional.specialties.join(", ") : "",
                commission_rate: professional.commission_rate ? professional.commission_rate.toString() : "",
            });
            setOpen(true);
        } else {
            setFormData({ name: "", email: "", phone: "", specialties: "", commission_rate: "" });
        }
    }, [professional]);

    const handleClose = () => {
        setOpen(false);
        setFormData({ name: "", email: "", phone: "", specialties: "", commission_rate: "" });
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

        const specialtiesArray = formData.specialties
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);

        const commissionRate = formData.commission_rate ? parseFloat(formData.commission_rate) : null;

        if (professional) {
            const { error } = await supabase
                .from("professionals")
                .update({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    specialties: specialtiesArray,
                    commission_rate: commissionRate,
                })
                .eq("id", professional.id);

            if (error) {
                toast.error("Erro ao atualizar profissional");
            } else {
                toast.success("Profissional atualizado com sucesso!");
                handleClose();
                onSuccess?.();
            }
        } else {
            const { error } = await supabase
                .from("professionals")
                .insert({
                    user_id: user.id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    specialties: specialtiesArray,
                    commission_rate: commissionRate,
                });

            if (error) {
                toast.error("Erro ao criar profissional");
            } else {
                toast.success("Profissional criado com sucesso!");
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
            {!professional && (
                <DialogTrigger asChild>
                    <Button className="font-semibold shadow-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Profissional
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {professional ? "Editar Profissional" : "Novo Profissional"}
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
                            placeholder="Nome do profissional"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialties">Especialidades</Label>
                        <Input
                            id="specialties"
                            value={formData.specialties}
                            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                            placeholder="Corte, Coloração, Barba (separados por vírgula)"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                            <Label htmlFor="commission">Comissão (%)</Label>
                            <Input
                                id="commission"
                                type="number"
                                value={formData.commission_rate}
                                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                                placeholder="Ex: 50"
                                step="0.1"
                                min="0"
                                max="100"
                            />
                        </div>
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
                    <Button type="submit" className="w-full font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600" disabled={loading}>
                        {loading ? (professional ? "Atualizando..." : "Criando...") : (professional ? "Atualizar Profissional" : "Salvar Profissional")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
