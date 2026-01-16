import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Scissors, TrendingUp, Cake, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useBirthdays } from "@/hooks/use-birthdays";

const Index = () => {
    const { birthdaysToday } = useBirthdays();

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Bem-vindo ao SnapAgenda. Aqui está o resumo de hoje.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild className="bg-gradient-to-r from-primary to-purple-600 shadow-md">
                        <Link to="/agenda?new=true">
                            Novo Agendamento
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Birthday Alert Section */}
            {birthdaysToday.length > 0 && (
                <div className="animate-in slide-in-from-top-4 duration-700">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <Cake className="h-8 w-8 text-pink-500 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-pink-700">Aniversariantes do Dia!</h3>
                                <p className="text-pink-600">
                                    Não se esqueça de parabenizar: <span className="font-semibold">{birthdaysToday.map(c => c.name).join(", ")}</span>
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-100 bg-white shadow-sm" asChild>
                            <Link to="/agenda">Ver na Agenda</Link>
                        </Button>
                    </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary" asChild>
                    <Link to="/agenda">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Ver Agenda</div>
                            <p className="text-xs text-muted-foreground">Acesse sua grade diária</p>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500" asChild>
                    <Link to="/clientes">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Gerenciar</div>
                            <p className="text-xs text-muted-foreground">Base de clientes</p>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-pink-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Serviços Populares</CardTitle>
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Corte</div>
                        <p className="text-xs text-muted-foreground">+20% este mês</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500" asChild>
                    <Link to="/financeiro">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Ver Relatório</div>
                            <p className="text-xs text-muted-foreground">Acompanhe seus ganhos</p>
                        </CardContent>
                    </Link>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle>Acesso Rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="justify-between h-auto py-4" asChild>
                            <Link to="/agenda?new=true">
                                <span className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    Novo Agendamento
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="justify-between h-auto py-4" asChild>
                            <Link to="/clientes">
                                <span className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    Cadastrar Cliente
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-1 shadow-sm bg-primary/5 border-none">
                    <CardHeader>
                        <CardTitle className="text-primary">Dica do Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Use o painel financeiro para acompanhar não apenas o que já recebeu, mas também o que tem a receber (Fiado). Manter o controle aumenta sua previsibilidade de caixa!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Index;
