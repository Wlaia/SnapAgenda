

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Wallet, Users, Smartphone, ArrowRight, MessageCircle, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Landing() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for active session and redirect to dashboard if found
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate("/dashboard");
            }
        });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">

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
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-40 transition-all duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="SnapAgenda Logo" className="h-8 w-8 rounded-full shadow-sm" />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            SnapAgenda
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a>
                        <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Depoimentos</a>
                        <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Planos</a>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/auth">
                            <Button variant="ghost" className="hidden sm:inline-flex">Entrar</Button>
                        </Link>
                        <Link to="/auth">
                            <Button className="rounded-full shadow-md bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0">
                                Testar Grátis
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-muted-foreground hover:text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                        <a href="#features" className="p-2 text-lg font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Funcionalidades</a>
                        <a href="#testimonials" className="p-2 text-lg font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Depoimentos</a>
                        <a href="#pricing" className="p-2 text-lg font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Planos</a>
                        <div className="flex flex-col gap-2 mt-2 pt-4 border-t">
                            <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">Entrar</Button>
                            </Link>
                            <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full bg-gradient-to-r from-primary to-purple-600 border-0">
                                    Testar Grátis
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </header>


            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-900/20 dark:via-background dark:to-background overflow-hidden relative">

                {/* Decorative blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in-up">
                        ✨ Teste grátis por 45 dias
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">
                        Transforme o seu <br />
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Salão de Beleza</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
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
                            src="/hero-mockup.png"
                            alt="SnapAgenda Interface Mockup"
                            className="relative rounded-2xl shadow-2xl border border-white/20 w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/30 relative scroll-mt-16">
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

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-background scroll-mt-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Quem usa, recomenda ❤️</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Veja o que donos de salões estão falando sobre o SnapAgenda.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard
                            name="Ana Clara"
                            role="Proprietária do Studio Bella"
                            text="Desde que comecei a usar, nunca mais tive problemas com horários duplicados. E o financeiro é perfeito!"
                        />
                        <TestimonialCard
                            name="Ricardo Gomes"
                            role="Barbearia do Ricardo"
                            text="Meus clientes adoram o lembrete de agendamento. O número de faltas caiu drasticamente."
                        />
                        <TestimonialCard
                            name="Juliana Alves"
                            role="Manicure e Pedicure"
                            text="Simples de usar e muito bonito. Consigo controlar tudo pelo celular entre um atendimento e outro."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/10 dark:to-background scroll-mt-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos que cabem no seu bolso</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Comece grátis e evolua seu negócio com um investimento mínimo.</p>
                    </div>

                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                        {/* Free Trial Card */}
                        <div className="bg-white dark:bg-card p-8 rounded-3xl border border-border/50 shadow-lg hover:shadow-xl transition-all">
                            <div className="mb-4">
                                <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                    45 Dias Grátis
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Teste Completo</h3>
                            <p className="text-muted-foreground mb-6">Acesso total a todas as funcionalidades para você se apaixonar.</p>
                            <div className="text-4xl font-bold mb-6">R$ 0<span className="text-lg font-normal text-muted-foreground">/45 dias</span></div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div> Agenda Ilimitada</li>
                                <li className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div> Gestão Financeira</li>
                                <li className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</div> Cadastro de Clientes</li>
                            </ul>
                            <Link to="/auth">
                                <Button className="w-full h-12 rounded-xl font-semibold" variant="outline">
                                    Começar Teste
                                </Button>
                            </Link>
                        </div>

                        {/* Pro Plan Card */}
                        <div className="bg-gradient-to-br from-primary to-purple-800 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden transform md:scale-105">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl">MAIS POPULAR</div>
                            <h3 className="text-2xl font-bold mb-2">Plano Pro</h3>
                            <p className="text-purple-100 mb-6">Tudo o que você precisa para crescer sem limites.</p>
                            <div className="text-5xl font-bold mb-6">R$ 21,90<span className="text-lg font-normal opacity-80">/mês</span></div>
                            <ul className="space-y-3 mb-8 text-purple-50">
                                <li className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">✓</div> Tudo do teste grátis</li>
                                <li className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">✓</div> Lembretes automáticos</li>
                                <li className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">✓</div> Suporte prioritário</li>
                                <li className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">✓</div> Múltiplos profissionais</li>
                            </ul>
                            <Link to="/auth">
                                <Button className="w-full h-12 rounded-xl font-bold bg-white text-primary hover:bg-white/90">
                                    Assinar Agora
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* Support / CTA Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="bg-primary/5 rounded-3xl p-8 md:p-16 text-center border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>

                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para modernizar seu salão?</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
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
                                <a href="https://wa.me/5524992777262" target="_blank" rel="noreferrer" className="text-2xl font-bold flex items-center justify-center gap-2 hover:text-primary transition-colors">
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
            <footer className="py-12 border-t bg-muted/20">
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
        <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className={`mb-6 ${color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    )
}

function TestimonialCard({ name, role, text }: { name: string, role: string, text: string }) {
    return (
        <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold">{name}</h4>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
            <p className="text-muted-foreground italic">"{text}"</p>
            <div className="flex gap-1 mt-4 text-yellow-400">
                {'★'.repeat(5)}
            </div>
        </div>
    )
}
