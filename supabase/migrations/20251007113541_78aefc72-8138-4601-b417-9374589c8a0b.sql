-- Corrigir perfil do admin lgtecserv@gmail.com
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT;
BEGIN
  -- Get the user id for lgtecserv@gmail.com
  SELECT id, email INTO admin_user_id, admin_email 
  FROM auth.users 
  WHERE email = 'lgtecserv@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Insert or update profile (UPSERT)
    INSERT INTO public.profiles (id, nome_completo, status_aprovacao)
    VALUES (admin_user_id, admin_email, 'aprovado')
    ON CONFLICT (id) 
    DO UPDATE SET status_aprovacao = 'aprovado';
    
    -- Ensure admin role exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove pendente role if exists
    DELETE FROM public.user_roles 
    WHERE user_id = admin_user_id AND role = 'pendente';
  END IF;
END;
$$;