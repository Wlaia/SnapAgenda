import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Scissors } from "lucide-react";

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
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
            toast.success("Login realizado com sucesso!");
            navigate("/dashboard");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
            <Card className="w-full max-w-md shadow-2xl border-white/20 backdrop-blur-sm bg-white/80 dark:bg-zinc-950/80">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Scissors className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            SnapAgenda
                        </CardTitle>
                        <CardDescription className="text-base">
                            Gerencie seu negócio com elegância
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="signin">Entrar</TabsTrigger>
                            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="space-y-4">
                            <form onSubmit={handleSignIn} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                                <Button type="submit" className="w-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading}>
                                    {loading ? "Entrando..." : "Acessar Sistema"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">Nome do Estabelecimento / Profissional</Label>
                                    <Input
                                        id="displayName"
                                        type="text"
                                        placeholder="Ex: Studio Vip"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        required
                                        className="bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Senha</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                                <Button type="submit" className="w-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading}>
                                    {loading ? "Criando..." : "Criar Conta Grátis"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
