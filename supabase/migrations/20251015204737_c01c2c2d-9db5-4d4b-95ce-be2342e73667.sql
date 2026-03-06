-- ==========================================
-- FASE 1: Corrigir Políticas RLS para user_roles
-- ==========================================

-- Drop e recriar políticas de user_roles para garantir que funcionem
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;

CREATE POLICY "Admins can insert user roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- FASE 3: Criar Tabela de Gastos/Despesas
-- ==========================================

-- Criar tabela de gastos
CREATE TABLE IF NOT EXISTS public.gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('operacional', 'marketing', 'infraestrutura', 'pessoal', 'outros')),
  valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
  data_gasto DATE NOT NULL,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'cartao', 'outro')),
  comprovativo_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_gastos_user_id ON public.gastos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_data ON public.gastos(data_gasto DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON public.gastos(categoria);

-- Habilitar RLS
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para gastos
CREATE POLICY "Users can view own gastos"
  ON public.gastos FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own gastos"
  ON public.gastos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gastos"
  ON public.gastos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gastos"
  ON public.gastos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_gastos_updated_at
  BEFORE UPDATE ON public.gastos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();