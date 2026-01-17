
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, ArrowRight, HelpCircle } from "lucide-react";

export default function UpdatePassword() {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Verify session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If accessed directly without a recovery link, redirect to auth
                // But gives a small delay/check in case the hash is being processed
                const hash = window.location.hash;
                if (!hash || !hash.includes('access_token')) {
                    // Optional: redirect to auth or let them stay if they are already logged in from before
                    // For now, we assume they came from the link
                }
            }
        });
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Senha atualizada com sucesso! Você já pode entrar.");
            navigate("/dashboard");
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
                </div>

                <Card className="border-0 shadow-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl ring-1 ring-white/50 dark:ring-white/10">
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-2xl text-center font-bold">
                            Nova Senha
                        </CardTitle>
                        <CardDescription className="text-center">
                            Digite sua nova senha abaixo para recuperar o acesso.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="pl-9 bg-white/50 dark:bg-black/20 transition-all focus:bg-white dark:focus:bg-black/40"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="pl-9 bg-white/50 dark:bg-black/20 transition-all focus:bg-white dark:focus:bg-black/40"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-violet-500/25 transition-all duration-300" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Salvar Nova Senha <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
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
                            Precisa de ajuda?
                        </a>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
