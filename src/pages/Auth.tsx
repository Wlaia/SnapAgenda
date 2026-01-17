
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, User, Phone, ArrowRight, HelpCircle } from "lucide-react";

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [resetMode, setResetMode] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName
                }
            }
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Conta criada com sucesso! Verifique seu email.");
        }
        setLoading(false);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Bem-vindo de volta!");
            navigate("/dashboard");
        }
        setLoading(false);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Digite seu email para recuperar a senha.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/update-password',
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
            setResetMode(false);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-zinc-950">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/20 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[100px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[80px] animate-pulse delay-2000" />
            </div>

            <div className="w-full max-w-md p-4 z-10">
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex justify-center mb-6">
                        <img
                            src="/logo.png"
                            alt="SnapAgenda"
                            className="w-24 h-24 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        SnapAgenda
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                        A plataforma completa para gerenciar seu negócio de beleza.
                    </p>
                </div>

                <Card className="border-0 shadow-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl ring-1 ring-white/50 dark:ring-white/10">
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-2xl text-center font-bold">
                            {resetMode ? "Recuperar Senha" : "Acessar Sistema"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {resetMode
                                ? "Digite seu email para receber o link de redefinição."
                                : "Faça login ou crie sua conta para começar."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {resetMode ? (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            className="pl-9 bg-white/50 dark:bg-black/20"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md" disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                                    {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setResetMode(false)}
                                >
                                    Voltar para Login
                                </Button>
                            </form>
                        ) : (
                            <Tabs defaultValue="signin" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl">
                                    <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                                    <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Cadastro</TabsTrigger>
                                </TabsList>

                                <TabsContent value="signin" className="space-y-4">
                                    <form onSubmit={handleSignIn} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                    className="pl-9 bg-white/50 dark:bg-black/20 transition-all focus:bg-white dark:focus:bg-black/40"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password">Senha</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => setResetMode(true)}
                                                    className="text-xs font-medium text-violet-600 hover:text-violet-500 hover:underline"
                                                >
                                                    Esqueceu a senha?
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                    className="pl-9 bg-white/50 dark:bg-black/20 transition-all focus:bg-white dark:focus:bg-black/40"
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-violet-500/25 transition-all duration-300" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                                <span className="flex items-center gap-2">
                                                    Entrar no Sistema <ArrowRight className="h-4 w-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="signup" className="space-y-4">
                                    <form onSubmit={handleSignUp} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName">Nome do Negócio</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="displayName"
                                                    type="text"
                                                    placeholder="Ex: Studio Vip"
                                                    value={displayName}
                                                    onChange={e => setDisplayName(e.target.value)}
                                                    required
                                                    className="pl-9 bg-white/50 dark:bg-black/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="signup-email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                    className="pl-9 bg-white/50 dark:bg-black/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password">Senha</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="pl-9 bg-white/50 dark:bg-black/20"
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-violet-500/25 transition-all duration-300" disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar Minha Conta Grátis"}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>

                    {/* Support Footer */}
                    <CardFooter className="flex flex-col items-center pt-2 pb-6">
                        <a
                            href="https://wa.me/5524992777262"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-muted/50"
                        >
                            <HelpCircle className="h-4 w-4" />
                            Precisa de ajuda? Fale com o Suporte
                        </a>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-muted-foreground/60 mt-8">
                    &copy; 2024 SnapAgenda. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
