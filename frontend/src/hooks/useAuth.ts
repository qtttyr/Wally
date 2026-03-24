import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, session, isLoading, setUser, setSession, setLoading } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)

  const mapUser = (supabaseUser: { id: string; email?: string; user_metadata: Record<string, string>; created_at: string }) => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Пользователь',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    plan: 'free' as const,
    created_at: supabaseUser.created_at,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(mapUser(session.user))
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        setUser(mapUser(session.user))
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setSession, setLoading])

  const signInWithGoogle = async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) setAuthError(error.message)
  }

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setAuthError('Неверный email или пароль')
      } else {
        setAuthError(error.message)
      }
      return false
    }
    return true
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setAuthError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })
    if (error) {
      if (error.message.includes('already registered')) {
        setAuthError('Этот email уже зарегистрирован')
      } else {
        setAuthError(error.message)
      }
      return false
    }
    return true
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) setAuthError(error.message)
  }

  const clearError = () => setAuthError(null)

  return {
    user,
    session,
    isLoading,
    authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
  }
}
