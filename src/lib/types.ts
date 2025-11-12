export interface Client {
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

export interface Visit {
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

export interface WeeklySchedule {
  id: string
  user_id: string
  week_start: string
  cities: string[]
  created_at: string
}

export interface DashboardMetrics {
  visitsThisWeek: number
  conversionRate: number
  estimatedRevenue: number
  clientsWithoutVisit: number
}
