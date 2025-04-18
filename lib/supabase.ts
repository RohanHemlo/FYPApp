import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://dhuzvodtxghoizagykep.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXp2b2R0eGdob2l6YWd5a2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODY4NTQsImV4cCI6MjA1ODA2Mjg1NH0.iZ8NPGNjkNgHGHUtjlRMGMfyDnapErJFrHe3VEpppnE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, 
  {auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {schema: 'app_schema'}
})