
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Wallet, Users, Smartphone, ArrowRight, MessageCircle } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/5524992777262"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                aria-label="Fale conosco no WhatsApp"
            >
                <MessageCircle className="h-8 w-8" />
            </a>

            {/* Header */}
            <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-40 transition-all duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="SnapAgenda Logo" className="h-8 w-8 rounded-full shadow-sm" />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            SnapAgenda
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost" className="hidden sm:inline-flex">Entrar</Button>
                        </Link>
                        <Link to="/auth">
                            <Button className="rounded-full shadow-md bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0">
                                Criar Conta Grátis
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-white to-white overflow-hidden relative">

                {/* Decorative blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in-up">
                        ✨ A gestão completa para o seu negócio
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent drop-shadow-sm">
                        Transforme o seu <br />
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Salão de Beleza</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Diga adeus à agenda de papel. Com o SnapAgenda, você organiza horários, controla o financeiro e fideliza clientes em uma única plataforma intuitiva.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
                        <Link to="/auth">
                            <Button size="lg" className="h-14 px-8 text-lg gap-2 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300">
                                Começar Agora <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/auth">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                                Acessar minha conta
                            </Button>
                        </Link>
                    </div>

                    {/* Mockup Image */}
                    <div className="relative mx-auto w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-500">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur opacity-30"></div>
                        <img
                            src="/app-mockup.png"
                            alt="App Interface Mockup"
                            className="relative rounded-2xl shadow-2xl border border-white/20 w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50 relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher o SnapAgenda?</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Funcionalidades pensadas para simplificar o dia a dia de profissionais da beleza.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Calendar className="h-10 w-10 text-white" />}
                            title="Agenda Inteligente"
                            description="Visualização clara de horários diários e semanais. Evite conflitos e buracos na agenda."
                            color="bg-blue-500"
                        />
                        <FeatureCard
                            icon={<Wallet className="h-10 w-10 text-white" />}
                            title="Financeiro"
                            description="Controle de caixa, comissões automáticas e relatórios de lucro em tempo real."
                            color="bg-green-500"
                        />
                        <FeatureCard
                            icon={<Users className="h-10 w-10 text-white" />}
                            title="Gestão de Clientes"
                            description="Histórico completo de atendimentos e preferências para um serviço personalizado."
                            color="bg-purple-500"
                        />
                        <FeatureCard
                            icon={<Smartphone className="h-10 w-10 text-white" />}
                            title="Web App"
                            description="Acesse pelo celular como se fosse um aplicativo nativo. Instalação rápida e fácil."
                            color="bg-pink-500"
                        />
                    </div>
                </div>
            </section>

            {/* Support / CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>

                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para modernizar seu salão?</h2>
                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                            Junte-se a centenas de profissionais que já transformaram a gestão de seus negócios.
                        </p>
                        <div className="flex flex-col items-center gap-6">
                            <Link to="/auth">
                                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl bg-primary hover:bg-primary/90">
                                    Criar Conta Grátis
                                </Button>
                            </Link>

                            <div className="mt-8 pt-8 border-t w-full max-w-md">
                                <p className="text-muted-foreground mb-2 font-medium">Precisa de ajuda ou tem dúvidas?</p>
                                <a href="https://wa.me/5524992777262" className="text-2xl font-bold flex items-center justify-center gap-2 hover:text-primary transition-colors">
                                    <MessageCircle className="h-6 w-6 text-green-500" />
                                    (24) 99277-7262
                                </a>
                                <p className="text-sm text-muted-foreground mt-2">Suporte via WhatsApp</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t bg-slate-50">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-8 w-8 grayscale opacity-70" />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-semibold">SnapAgenda</p>
                            <p>© 2026 Todos os direitos reservados.</p>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</a>
                        <a href="https://wa.me/5524992777262" className="text-sm text-muted-foreground hover:text-primary transition-colors">Fale Conosco</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`mb-6 ${color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    )
}
