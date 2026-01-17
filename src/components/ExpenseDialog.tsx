import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transactionToEdit?: any;
}

export default function ExpenseDialog({ open, onClose, onSuccess, transactionToEdit }: ExpenseDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        category: "outros",
        status: "paid" // Default to paid
    });

    // Load data when dialog opens or transactionToEdit changes
    useState(() => {
        if (transactionToEdit) {
            setFormData({
                description: transactionToEdit.description,
                amount: transactionToEdit.amount,
                date: transactionToEdit.date,
                category: transactionToEdit.category || "outros",
                status: transactionToEdit.status
            });
        } else {
            // Reset if creating new
            setFormData({
                description: "",
                amount: "",
                date: new Date().toISOString().split('T')[0],
                category: "outros",
                status: "paid"
            });
        }
    });

    // Effect to update form when transactionToEdit changes while mounted
    // We utilize a key on the dialog or useEffect to reset, but explicitly setting state here is safer
    // Actually, simpler to just use useEffect dependent on transactionToEdit
    const categories = [
        { value: "aluguel", label: "Aluguel" },
        { value: "produtos", label: "Produtos" },
        { value: "energia", label: "Energia/Água" },
        { value: "marketing", label: "Marketing" },
        { value: "equipamentos", label: "Equipamentos" },
        { value: "impostos", label: "Impostos" },
        { value: "salarios", label: "Salários/Comissões" },
        { value: "outros", label: "Outros" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const payload = {
                user_id: user.id,
                description: formData.description,
                amount: Number(formData.amount),
                type: 'expense',
                status: formData.status,
                category: formData.category,
                date: formData.date
            };

            let error;
            if (transactionToEdit) {
                const { error: updateError } = await supabase
                    .from("financial_transactions")
                    .update(payload)
                    .eq('id', transactionToEdit.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("financial_transactions")
                    .insert(payload);
                error = insertError;
            }

            if (error) throw error;

            toast.success(transactionToEdit ? "Despesa atualizada!" : "Despesa lançada com sucesso!");
            if (!transactionToEdit) {
                setFormData({
                    description: "",
                    amount: "",
                    date: new Date().toISOString().split('T')[0],
                    category: "outros",
                    status: "paid"
                });
            }
            onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Erro ao salvar despesa:", error);
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Reset form when dialog opens/closes/changes mode
    // We use a React key in the parent to force re-mount usually, but let's add a useEffect here just in case parent doesn't
    const [initialized, setInitialized] = useState(false);
    if (open && !initialized) {
        if (transactionToEdit) {
            setFormData({
                description: transactionToEdit.description,
                amount: transactionToEdit.amount,
                date: transactionToEdit.date,
                category: transactionToEdit.category || "outros",
                status: transactionToEdit.status
            });
        } else {
            setFormData({
                description: "",
                amount: "",
                date: new Date().toISOString().split('T')[0],
                category: "outros",
                status: "paid"
            });
        }
        setInitialized(true);
    }
    if (!open && initialized) {
        setInitialized(false);
    }


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{transactionToEdit ? 'Editar Despesa' : 'Lançar Nova Despesa'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Conta de Luz"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Data de Vencimento</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paid">Pago</SelectItem>
                                    <SelectItem value="pending">A Pagar (Pendente)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lançar Despesa
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
