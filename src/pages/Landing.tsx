
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Wallet, Users, Smartphone, Check, ArrowRight } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="SnapAgenda Logo" className="h-8 w-8 rounded-full" />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            SnapAgenda
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost">Entrar</Button>
                        </Link>
                        <Link to="/auth">
                            <Button>Criar Conta</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-primary/5 to-transparent">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
                    A Revolução na Gestão do <span className="text-primary">Seu Salão</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mb-10">
                    Agendamento simples, financeiro organizado e clientes fiéis.
                    Tudo o que você precisa para crescer, em um só lugar.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
                    <Link to="/auth">
                        <Button size="lg" className="h-12 px-8 text-lg gap-2">
                            Começar Grátis <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/auth">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                            Já tenho conta
                        </Button>
                    </Link>
                </div>

                {/* Mockup / Image Placeholder */}
                <div className="relative w-full max-w-5xl aspect-video rounded-xl bg-muted/50 border shadow-2xl overflow-hidden mb-20 flex items-center justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
                    <p className="z-20 text-muted-foreground font-medium flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Interface Mobile e Desktop
                    </p>
                    {/* You can allow user to replace this div with a real screenshot later */}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Tudo para o seu sucesso</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Calendar className="h-8 w-8 text-primary" />}
                            title="Agenda Inteligente"
                            description="Organize seus horários com facilidade e evite conflitos. Visualização semanal e diária."
                        />
                        <FeatureCard
                            icon={<Wallet className="h-8 w-8 text-primary" />}
                            title="Financeiro Completo"
                            description="Controle entradas, saídas e comissões automaticamente. Saiba exatamente quanto você lucra."
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8 text-primary" />}
                            title="Gestão de Clientes"
                            description="Histórico de visitas, preferências e contatos. Fidelize seus clientes com um atendimento premium."
                        />
                        <FeatureCard
                            icon={<Smartphone className="h-8 w-8 text-primary" />}
                            title="App Instalável"
                            description="Acesse de qualquer lugar. Instale direto no seu celular sem precisar de lojas de aplicativos."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t bg-background">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-6 w-6 grayscale opacity-50" />
                        <span className="text-sm text-muted-foreground">© 2026 SnapAgenda. Todos os direitos reservados.</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary">Termos</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacidade</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary">Suporte</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-background p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 bg-primary/10 w-fit p-3 rounded-lg">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}
