import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: localStorage,
        storageKey: 'hotel-auth-token'
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// Helper function to check if user has specific role
export const hasRole = async (roles) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    
    return roles.includes(profile?.role)
}

// Helper function to log audit events
export const logAudit = async (action, entityType, entityId, oldData, newData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    await supabase
        .from('audit_logs')
        .insert({
            user_id: user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_data: oldData,
            new_data: newData,
            ip_address: null, // Would need server-side to get IP
            user_agent: navigator.userAgent
        })
}