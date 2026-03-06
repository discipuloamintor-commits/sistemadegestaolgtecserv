-- ==========================================
-- FASE 1: Corrigir Políticas RLS para user_roles
-- ==========================================

-- Permitir que admins gerenciem roles (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- FASE 2: Adicionar Sistema de Suspensão
-- ==========================================

-- Adicionar campos de suspensão na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS suspenso BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_suspensao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dias_suspensao INTEGER,
ADD COLUMN IF NOT EXISTS motivo_suspensao TEXT;

-- Adicionar novo status 'suspenso' ao check constraint se existir
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'profiles' AND column_name = 'status_aprovacao'
  ) THEN
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_status_aprovacao_check;
  END IF;
END $$;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_aprovacao_check 
CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado', 'suspenso'));

-- ==========================================
-- FASE 3: Ajustar Tabela de Clientes
-- ==========================================

-- Tornar telefone obrigatório
ALTER TABLE public.clients 
ALTER COLUMN telefone SET NOT NULL;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_nome ON public.clients(nome);

-- ==========================================
-- FASE 4: Ajustar Tabela de Serviços
-- ==========================================

-- Adicionar campo tipo_pagamento
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS tipo_pagamento TEXT DEFAULT 'fixo' 
CHECK (tipo_pagamento IN ('fixo', 'com_investimento'));

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_client_id ON public.services(client_id);
CREATE INDEX IF NOT EXISTS idx_services_data ON public.services(data_servico DESC);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status_pagamento);

-- ==========================================
-- FASE 4.1: Criar Storage Buckets
-- ==========================================

-- Bucket para fotos de clientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-photos', 'client-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para comprovativos de serviços (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovativos', 'comprovativos', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- RLS Policies para Storage - Client Photos
-- ==========================================

CREATE POLICY "Users can upload own client photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'client-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own client photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'client-photos' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Users can update own client photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'client-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own client photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'client-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==========================================
-- RLS Policies para Storage - Comprovativos
-- ==========================================

CREATE POLICY "Users can upload own comprovativos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'comprovativos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own comprovativos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'comprovativos' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Users can update own comprovativos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'comprovativos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own comprovativos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'comprovativos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );