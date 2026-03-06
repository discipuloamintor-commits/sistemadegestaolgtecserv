-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'membro', 'pendente');

-- Create payment_status enum
CREATE TYPE public.payment_status AS ENUM ('pago', 'pendente', 'devendo', 'parcial');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  avatar_url TEXT,
  status_aprovacao TEXT DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: users see their own, admins see all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  logotipo_url TEXT,
  contato TEXT,
  endereco TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies RLS: users manage their own, admins see all
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company"
  ON public.companies FOR DELETE
  USING (auth.uid() = user_id);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  foto_url TEXT,
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients RLS: users see their own, admins see all
CREATE POLICY "Users can view own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  nome_servico TEXT NOT NULL,
  data_servico DATE NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL CHECK (valor_total >= 0),
  tem_investimento BOOLEAN DEFAULT false NOT NULL,
  valor_investimento DECIMAL(15,2) DEFAULT 0 CHECK (valor_investimento >= 0),
  valor_lucro DECIMAL(15,2) GENERATED ALWAYS AS (valor_total - valor_investimento) STORED,
  status_pagamento public.payment_status DEFAULT 'pendente' NOT NULL,
  observacoes TEXT,
  comprovativo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services RLS: users see their own, admins see all
CREATE POLICY "Users can view own services"
  ON public.services FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services"
  ON public.services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services"
  ON public.services FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, nome_completo, status_aprovacao)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    'pendente'
  );
  
  -- Insert default role as 'pendente'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pendente');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make lgtecserv@gmail.com admin
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user id for lgtecserv@gmail.com
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'lgtecserv@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Update profile status to approved
    UPDATE public.profiles 
    SET status_aprovacao = 'aprovado' 
    WHERE id = admin_user_id;
    
    -- Remove pendente role if exists
    DELETE FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'pendente';
    
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;