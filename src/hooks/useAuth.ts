import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export type UserRole = 'admin' | 'membro' | 'pendente';

export interface AuthState {
  session: Session | null;
  loading: boolean;
  role: UserRole | null;
  isApproved: boolean;
  isAdmin: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  suspensionEndsAt: Date | null;
  suspensionReason: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: true,
    role: null,
    isApproved: false,
    isAdmin: false,
    isRejected: false,
    isSuspended: false,
    suspensionEndsAt: null,
    suspensionReason: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserRole(session);
      } else {
        setState({ 
          session: null, 
          loading: false, 
          role: null, 
          isApproved: false, 
          isAdmin: false,
          isRejected: false,
          isSuspended: false,
          suspensionEndsAt: null,
          suspensionReason: null,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserRole(session);
      } else {
        setState({ 
          session: null, 
          loading: false, 
          role: null, 
          isApproved: false, 
          isAdmin: false,
          isRejected: false,
          isSuspended: false,
          suspensionEndsAt: null,
          suspensionReason: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(session: Session) {
    try {
      // Fetch user profile and role
      const { data: profile } = await supabase
        .from('profiles')
        .select('status_aprovacao, suspenso, data_suspensao, dias_suspensao, motivo_suspensao')
        .eq('id', session.user.id)
        .single();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = roleData?.role as UserRole || 'pendente';
      const isApproved = profile?.status_aprovacao === 'aprovado';
      const isRejected = profile?.status_aprovacao === 'rejeitado';
      const isAdmin = role === 'admin';

      // Check suspension status
      let isSuspended = false;
      let suspensionEndsAt: Date | null = null;
      
      if (profile?.suspenso && profile?.data_suspensao && profile?.dias_suspensao) {
        const suspensionEnd = new Date(profile.data_suspensao);
        suspensionEnd.setDate(suspensionEnd.getDate() + profile.dias_suspensao);
        
        if (new Date() < suspensionEnd) {
          isSuspended = true;
          suspensionEndsAt = suspensionEnd;
        } else {
          // Suspension expired, update profile
          await supabase
            .from('profiles')
            .update({ 
              suspenso: false, 
              data_suspensao: null, 
              dias_suspensao: null,
              motivo_suspensao: null 
            })
            .eq('id', session.user.id);
        }
      }

      setState({
        session,
        loading: false,
        role,
        isApproved,
        isAdmin,
        isRejected,
        isSuspended,
        suspensionEndsAt,
        suspensionReason: profile?.motivo_suspensao || null,
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setState({
        session,
        loading: false,
        role: 'pendente',
        isApproved: false,
        isAdmin: false,
        isRejected: false,
        isSuspended: false,
        suspensionEndsAt: null,
        suspensionReason: null,
      });
    }
  }

  return state;
}
