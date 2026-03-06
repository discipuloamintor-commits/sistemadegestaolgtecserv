import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verificar se usuário é admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    
    if (!user) {
      throw new Error('Não autenticado')
    }

    // Verificar se é admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!userRole) {
      throw new Error('Sem permissão')
    }

    // Obter ID do usuário a ser deletado
    const { userId } = await req.json()

    console.log('Deletando usuário:', userId)

    // Deletar relações primeiro (ordem importa para evitar conflitos de FK)
    await supabaseClient.from('services').delete().eq('user_id', userId)
    await supabaseClient.from('clients').delete().eq('user_id', userId)
    await supabaseClient.from('gastos').delete().eq('user_id', userId)
    await supabaseClient.from('companies').delete().eq('user_id', userId)
    await supabaseClient.from('user_roles').delete().eq('user_id', userId)
    await supabaseClient.from('profiles').delete().eq('id', userId)

    // Deletar usuário de auth.users
    const { error } = await supabaseClient.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Erro ao deletar usuário do auth:', error)
      throw error
    }

    console.log('Usuário deletado com sucesso:', userId)

    return new Response(
      JSON.stringify({ success: true, message: 'Usuário eliminado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na edge function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
