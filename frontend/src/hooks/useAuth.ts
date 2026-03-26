import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/user'

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: string;
  currency: string;
}

export const useAuth = () => {
  const { user, session, isLoading, setUser, setSession, setLoading } = useAuthStore()
  const initialized = useRef(false)
  const loadingRef = useRef(false)

  const mapUser = (supabaseUser: { id: string; email?: string; user_metadata: Record<string, string>; created_at: string }, profile?: ProfileData): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Пользователь',
    avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
    plan: (profile?.plan as User['plan']) || 'free',
    currency: profile?.currency || 'KZT',
    created_at: supabaseUser.created_at,
  })

  const fetchProfile = async (userId: string): Promise<ProfileData | null> => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return data as ProfileData | null
    } catch {
      return null
    }
  }

  const loadUser = async () => {
    if (loadingRef.current || initialized.current) return
    loadingRef.current = true

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (currentSession?.user) {
        const profile = await fetchProfile(currentSession.user.id)
        setUser(mapUser(currentSession.user, profile || undefined))
        setSession(currentSession)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (e) {
      console.warn('Auth load error:', e)
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
      initialized.current = true
      loadingRef.current = false
    }
  }

  useEffect(() => {
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (initialized.current && !loadingRef.current) {
        if (newSession?.user) {
          const profile = await fetchProfile(newSession.user.id)
          setUser(mapUser(newSession.user, profile || undefined))
          setSession(newSession)
        } else {
          setUser(null)
          setSession(null)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) console.error('Google sign in error:', error)
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      if (error.message === 'Invalid login credentials') {
        return { success: false, error: 'Неверный email или пароль' }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })
    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'Этот email уже зарегистрирован' }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const signOut = async () => {
    initialized.current = false
    loadingRef.current = false
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!session?.user) return false
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
    
    if (error) {
      console.error('Update profile error:', error)
      return false
    }
    
    setUser({
      ...user!,
      ...updates,
      name: updates.name ?? user?.name,
      avatar_url: updates.avatar_url ?? user?.avatar_url,
      currency: updates.currency ?? user?.currency,
    } as User)
    
    return true
  }

  return {
    user,
    session,
    isLoading,
    authError: null,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  }
}
