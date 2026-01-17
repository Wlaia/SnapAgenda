import { Smartphone, Download, Share, Menu, PlusCircle, Chrome, Apple } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function InstallTutorial() {
    return (
        <section id="install-app" className="py-24 bg-gradient-to-br from-background to-muted/50 scroll-mt-16 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-full text-sm uppercase tracking-wide mb-4 inline-block">
                        WebApp
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Tenha o App no seu celular
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Instale o SnapAgenda em segundos, sem ocupar memória e com acesso direto pela tela inicial.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Tabs defaultValue="android" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl h-14">
                                <TabsTrigger value="android" className="rounded-xl h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md transition-all">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-5 w-5" /> Android
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="ios" className="rounded-xl h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-md transition-all">
                                    <div className="flex items-center gap-2">
                                        <Apple className="h-5 w-5" /> iPhone (iOS)
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Android Content */}
                        <TabsContent value="android" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                            <div className="grid md:grid-cols-3 gap-8">
                                <TutorialStep
                                    step="1"
                                    icon={<Chrome className="h-8 w-8 text-blue-500" />}
                                    title="Abra no Chrome"
                                    description="Acesse snapagenda.com.br pelo navegador Google Chrome."
                                />
                                <TutorialStep
                                    step="2"
                                    icon={<Menu className="h-8 w-8 text-foreground" />}
                                    title="Menu de Opções"
                                    description="Clique nos três pontinhos (⋮) no canto superior direito da tela."
                                />
                                <TutorialStep
                                    step="3"
                                    icon={<Download className="h-8 w-8 text-green-600" />}
                                    title="Instalar App"
                                    description="Toque em 'Instalar aplicativo' ou 'Adicionar à tela inicial'."
                                />
                            </div>

                            {/* Visual Aid Android */}
                            <div className="mt-12 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-border shadow-xl flex flex-col md:flex-row items-center gap-8 md:justify-around">
                                <div className="text-center md:text-left">
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">1</span>
                                        Navegador
                                    </h4>
                                    <p className="text-muted-foreground">Use o Google Chrome para melhor compatibilidade.</p>
                                </div>
                                <div className="h-16 w-[1px] bg-border hidden md:block"></div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">2</span>
                                        Vantagem
                                    </h4>
                                    <p className="text-muted-foreground">Funciona offline e abre em tela cheia sem barras.</p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* iOS Content */}
                        <TabsContent value="ios" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                            <div className="grid md:grid-cols-3 gap-8">
                                <TutorialStep
                                    step="1"
                                    icon={<Chrome className="h-8 w-8 text-blue-500" />}
                                    title="Abra no Navegador"
                                    description="Acesse pelo Safari ou Chrome no seu iPhone."
                                />
                                <TutorialStep
                                    step="2"
                                    icon={<Share className="h-8 w-8 text-blue-500" />}
                                    title="Compartilhar"
                                    description="Toque no ícone de compartilhamento na barra inferior (Safari) ou superior (Chrome)."
                                />
                                <TutorialStep
                                    step="3"
                                    icon={<PlusCircle className="h-8 w-8 text-foreground" />}
                                    title="Adicionar à Início"
                                    description="Role as opções e toque em 'Adicionar à Tela de Início'."
                                />
                            </div>

                            {/* Visual Aid iOS */}
                            <div className="mt-12 p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-border shadow-xl flex flex-col md:flex-row items-center gap-8 md:justify-around">
                                <div className="text-center md:text-left">
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 font-bold">1</span>
                                        Safari
                                    </h4>
                                    <p className="text-muted-foreground">Recomendamos usar o Safari para experiência nativa.</p>
                                </div>
                                <div className="h-16 w-[1px] bg-border hidden md:block"></div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 font-bold">2</span>
                                        Praticidade
                                    </h4>
                                    <p className="text-muted-foreground">O ícone ficará junto com seus outros apps.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    );
}

function TutorialStep({ step, icon, title, description }: { step: string, icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group bg-card/50 backdrop-blur-sm">
            <div className="absolute top-0 left-0 bg-primary/10 text-primary font-bold w-12 h-12 flex items-center justify-center rounded-br-2xl text-xl">
                {step}
            </div>
            <CardContent className="pt-16 pb-8 px-6 text-center flex flex-col items-center">
                <div className="mb-6 p-4 bg-background rounded-2xl shadow-sm ring-1 ring-border/50 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <h3 className="text-xl font-extrabold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
