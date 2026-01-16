
import { Button } from "@/components/ui/button";
import { Lock, MessageCircle } from "lucide-react";

export default function PaymentRequired() {
    const whatsappNumber = "5511999999999"; // Replace with owner's number later if needed, or make dynamic
    const whatsappMessage = encodeURIComponent("Olá! Meu período de teste no SnapAgenda acabou e gostaria de ativar meu plano.");

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-10 h-10 text-red-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Período de Teste Finalizado</h1>
                    <p className="text-gray-500">
                        Esperamos que você tenha aproveitado os 45 dias gratuitos do SnapAgenda!
                    </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                    Para continuar usando o sistema e gerenciando seu salão, é necessário ativar sua assinatura.
                </div>

                <div className="space-y-3 pt-4">
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-lg shadow-md transition-all hover:scale-[1.02]"
                        onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')}
                    >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Falar com Suporte (Ativar)
                    </Button>

                    <p className="text-xs text-gray-400 mt-4">
                        Após o pagamento, seu acesso será liberado imediatamente.
                    </p>
                </div>
            </div>
        </div>
    );
}
