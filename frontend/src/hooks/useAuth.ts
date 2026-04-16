import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) return { data: null, error: authError }
    if (!authData.user) return { data: null, error: new Error('User creation failed') }

    // Then create the user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        display_name: displayName,
        role: 'user', // Default role
        balance: 0,
      })

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      // But Supabase doesn't allow deleting users from client-side
      console.error('Profile creation failed:', profileError)
      return { data: null, error: profileError }
    }

    return { data: authData, error: null }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isTrainer: profile?.role === 'trainer',
    isUser: profile?.role === 'user',
  }
}
