-- Adiciona a coluna categoria se não existir
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS category text;

-- Garante que a coluna 'type' suporte 'expense' (remove restrição antiga e cria nova)
ALTER TABLE public.financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_type_check;
ALTER TABLE public.financial_transactions ADD CONSTRAINT financial_transactions_type_check CHECK (type IN ('income', 'expense'));

-- Garante que a coluna 'type' exista (caso a tabela seja muito antiga)
-- ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS type text DEFAULT 'income';

-- Atualiza permissões (caso necessário)
GRANT ALL ON public.financial_transactions TO authenticated;
GRANT ALL ON public.financial_transactions TO service_role;
