import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils"; // Assuming this might exist, otherwise I'll implement inline format

interface PaymentDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transaction: any;
}

export default function PaymentDialog({ open, onClose, onSuccess, transaction }: PaymentDialogProps) {
    const [amountPaid, setAmountPaid] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setAmountPaid(transaction.amount.toString());
        }
    }, [transaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const paidValue = parseFloat(amountPaid.replace(',', '.'));
        const originalValue = parseFloat(transaction.amount);

        if (isNaN(paidValue) || paidValue <= 0) {
            toast.error("Valor inválido");
            setLoading(false);
            return;
        }

        if (paidValue > originalValue) {
            toast.error("O valor pago não pode ser maior que o valor original");
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // 1. Update the current transaction to be the PAID portion
            const { error: updateError } = await supabase
                .from("financial_transactions")
                .update({
                    amount: paidValue,
                    status: 'paid',
                    // paid_at: new Date().toISOString() // check if column exists, usually good practice but sticking to schema
                })
                .eq("id", transaction.id);

            if (updateError) throw updateError;

            // 2. If partial payment, create a NEW transaction for the remainder (Fiado)
            if (paidValue < originalValue) {
                const remainder = originalValue - paidValue;
                const { error: insertError } = await supabase
                    .from("financial_transactions")
                    .insert({
                        user_id: user.id,
                        description: `Restante/Fiado - ${transaction.description}`,
                        amount: remainder,
                        type: transaction.type,
                        status: 'pending',
                        date: transaction.date, // Keep original date or today? Usually original date to track debt age
                        appointment_id: transaction.appointment_id,
                        category: transaction.category
                    });

                if (insertError) throw insertError;

                toast.success(`Pagamento parcial registrado! Restante de R$ ${remainder.toFixed(2)} lançado como pendente.`);
            } else {
                toast.success("Pagamento integral confirmado!");
            }

            onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar pagamento");
        } finally {
            setLoading(false);
        }
    };

    const remaining = transaction ? (parseFloat(transaction.amount) - (parseFloat(amountPaid.replace(',', '.')) || 0)) : 0;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirmar Pagamento</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg space-y-1">
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-2xl font-bold">R$ {transaction ? parseFloat(transaction.amount).toFixed(2) : '0.00'}</p>
                        <p className="text-sm text-muted-foreground">{transaction?.description}</p>
                    </div>

                    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor Pago (R$)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                placeholder="0.00"
                                className="text-lg font-semibold"
                                autoFocus
                            />
                        </div>

                        {transaction && remaining > 0 && remaining < parseFloat(transaction.amount) && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                                <strong>Atenção:</strong> Será gerado um novo lançamento de
                                <strong> R$ {remaining.toFixed(2)}</strong> como pendente (Fiado).
                            </div>
                        )}
                    </form>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button type="submit" form="payment-form" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                        {loading ? "Processando..." : "Confirmar Pagamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
