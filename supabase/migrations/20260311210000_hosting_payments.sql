-- ==========================================
-- Tabela de Pagamentos de Domínio/Hospedagem
-- ==========================================

CREATE TABLE IF NOT EXISTS public.hosting_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dominio', 'hospedagem', 'ambos')),
  nome_dominio TEXT,
  valor_dominio DECIMAL(15,2) DEFAULT 0 CHECK (valor_dominio >= 0),
  valor_hospedagem DECIMAL(15,2) DEFAULT 0 CHECK (valor_hospedagem >= 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  periodo_renovacao TEXT DEFAULT 'anual' CHECK (periodo_renovacao IN ('anual', 'semestral', 'mensal')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_hosting_payments_user_id ON public.hosting_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_payments_client_id ON public.hosting_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_hosting_payments_status ON public.hosting_payments(status);
CREATE INDEX IF NOT EXISTS idx_hosting_payments_vencimento ON public.hosting_payments(data_vencimento);

-- RLS
ALTER TABLE public.hosting_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hosting_payments"
  ON public.hosting_payments FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own hosting_payments"
  ON public.hosting_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hosting_payments"
  ON public.hosting_payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hosting_payments"
  ON public.hosting_payments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_hosting_payments_updated_at
  BEFORE UPDATE ON public.hosting_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
