import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Book, Calendar, Users, Briefcase, Scissors, Wallet, Settings, Smartphone } from "lucide-react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-2xl font-light flex items-center gap-2">
                        <Book className="h-6 w-6 text-primary" />
                        Manual do Usuário
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    <div className="space-y-6 pb-6">
                        <p className="text-muted-foreground">
                            Bem-vindo ao guia do SnapAgenda. Tire suas dúvidas sobre como aproveitar ao máximo o sistema.
                        </p>

                        <Accordion type="single" collapsible className="w-full">

                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors">
                                    <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> Acesso e Configuração</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p><strong>Login:</strong> Use seu e-mail e senha. Se já estiver logado, você vai direto para o Painel.</p>
                                    <p><strong>Recuperação de Senha:</strong> Clique em "Esqueceu a senha?" na tela de login para receber um link por e-mail.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors">
                                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Agenda</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p><strong>Nova Marcação:</strong> Use o botão "+" flutuante ou "Novo Agendamento".</p>
                                    <p><strong>Status:</strong> Acompanhe se está Pendente, Confirmado ou Concluído.</p>
                                    <p><strong>Filtros:</strong> Visualize por dia, semana ou mês.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors">
                                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Clientes</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p><strong>Cadastro:</strong> Adicione clientes com foto e telefone.</p>
                                    <p><strong>Histórico:</strong> Veja quanto cada cliente gastou e seus agendamentos passados.</p>
                                    <p><strong>WhatsApp:</strong> Inicie conversas com um clique direto do perfil.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors">
                                    <span className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Financeiro</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p><strong>Controle:</strong> Cada agendamento gera uma transação automática.</p>
                                    <p><strong>Lucro:</strong> Lance suas despesas (aluguel, produtos) para ver o lucro real.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors">
                                    <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> Agendamento Online</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-2">
                                    <p>Permita que seus clientes agendem sozinhos:</p>
                                    <ol className="list-decimal pl-4 space-y-1 mt-2">
                                        <li>Vá em <strong>Perfil &gt; Configurações</strong>.</li>
                                        <li>Ative o <strong>Agendamento Online</strong>.</li>
                                        <li>Copie o link e coloque na bio do Instagram.</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-6">
                                <AccordionTrigger className="text-lg font-medium hover:text-primary transition-colors">
                                    <span className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Instalar Aplicativo</span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-4">
                                    <div>
                                        <p className="font-semibold text-foreground">Android (Chrome):</p>
                                        <ol className="list-decimal pl-4 space-y-1 mt-1">
                                            <li>Abra o site no Google Chrome.</li>
                                            <li>Toque nos <strong>três pontinhos (⋮)</strong> no canto superior.</li>
                                            <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">iPhone (Safari):</p>
                                        <ol className="list-decimal pl-4 space-y-1 mt-1">
                                            <li>Abra o site no Safari.</li>
                                            <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta).</li>
                                            <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                                        </ol>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-4">
                            <h4 className="font-semibold text-primary mb-1">Precisa de mais ajuda?</h4>
                            <p className="text-sm text-muted-foreground">Entre em contato com nosso suporte via WhatsApp pelo link na tela de login.</p>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
