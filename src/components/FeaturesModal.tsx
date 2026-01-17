
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles, MessageCircle, ArrowRight, Wallet } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeaturesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FeaturesModal({ open, onOpenChange }: FeaturesModalProps) {
    const features = [
        {
            icon: Globe,
            title: "Agendamento Online Público",
            description: "Seus clientes agora podem agendar sozinhos! Ative seu link exclusivo em Configurações > Online e compartilhe.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Sparkles,
            title: "Novo Visual Premium",
            description: "Interface renovada com design Glassmorphism, trazendo mais elegância e modernidade para o seu dia a dia.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: MessageCircle,
            title: "Notificações Personalizadas",
            description: "Configure as mensagens automáticas de confirmação e lembrete que enviamos para o WhatsApp dos clientes.",
            color: "text-green-500",
        },
        {
            icon: Wallet,
            title: "Contas a Pagar & Lucro Real",
            description: "Agora você tem controle total! Lance suas despesas, diferencie Entradas de Saídas e veja o saldo real do seu negócio.",
            color: "text-red-500",
            bg: "bg-red-500/10"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🎉</span> Novidades da Versão 1.2
                    </DialogTitle>
                    <DialogDescription>
                        Confira o que preparamos para tornar seu negócio ainda mais incrível.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-6 py-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                                <div className={`p-3 rounded-xl ${feature.bg} ${feature.color} shrink-0`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground leading-none mb-1">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                        Entendi <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
