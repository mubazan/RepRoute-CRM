import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          company_name: string
          cnpj: string
          contact_person: string
          phone: string
          email: string
          address: string
          city: string
          state: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      visits: {
        Row: {
          id: string
          client_id: string
          user_id: string
          visit_date: string
          result: 'comprou' | 'nao_comprou'
          product: string | null
          price: number | null
          comments: string | null
          attachments: string[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['visits']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['visits']['Insert']>
      }
      weekly_schedule: {
        Row: {
          id: string
          user_id: string
          week_start: string
          cities: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['weekly_schedule']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['weekly_schedule']['Insert']>
      }
    }
  }
}
