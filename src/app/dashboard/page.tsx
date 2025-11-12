'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { DashboardMetrics } from '@/lib/types'
import { 
  Building2, 
  Calendar, 
  TrendingUp, 
  Users, 
  MapPin, 
  LogOut,
  Plus,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    visitsThisWeek: 0,
    conversionRate: 0,
    estimatedRevenue: 0,
    clientsWithoutVisit: 0,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()
    loadMetrics()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    setUser(user)
    setLoading(false)
  }

  const loadMetrics = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get visits this week
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { data: visits } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', user.id)
      .gte('visit_date', startOfWeek.toISOString())

    const visitsThisWeek = visits?.length || 0
    const successfulVisits = visits?.filter(v => v.result === 'comprou').length || 0
    const conversionRate = visitsThisWeek > 0 ? (successfulVisits / visitsThisWeek) * 100 : 0
    const estimatedRevenue = visits?.reduce((sum, v) => sum + (v.price || 0), 0) || 0

    // Get clients without visit in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)

    let clientsWithoutVisit = 0
    if (clients) {
      for (const client of clients) {
        const { data: recentVisits } = await supabase
          .from('visits')
          .select('id')
          .eq('client_id', client.id)
          .gte('visit_date', thirtyDaysAgo.toISOString())
          .limit(1)

        if (!recentVisits || recentVisits.length === 0) {
          clientsWithoutVisit++
        }
      }
    }

    setMetrics({
      visitsThisWeek,
      conversionRate: Math.round(conversionRate),
      estimatedRevenue,
      clientsWithoutVisit,
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">RepRoute CRM</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Gestão de Vendas</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="gap-2" onClick={() => window.location.href = '/dashboard'}>
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="gap-2" onClick={() => window.location.href = '/clients'}>
                <Users className="w-4 h-4" />
                Clientes
              </Button>
              <Button variant="ghost" className="gap-2" onClick={() => window.location.href = '/schedule'}>
                <Calendar className="w-4 h-4" />
                Agenda
              </Button>
              <Button variant="ghost" className="gap-2" onClick={() => window.location.href = '/route'}>
                <MapPin className="w-4 h-4" />
                Roteiro
              </Button>
              <Button variant="ghost" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.location.href = '/dashboard'}>
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.location.href = '/clients'}>
                <Users className="w-4 h-4" />
                Clientes
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.location.href = '/schedule'}>
                <Calendar className="w-4 h-4" />
                Agenda
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => window.location.href = '/route'}>
                <MapPin className="w-4 h-4" />
                Roteiro
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Olá, {user?.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-slate-600">Aqui está o resumo das suas atividades</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Visitas esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{metrics.visitsThisWeek}</div>
              <p className="text-xs text-slate-500 mt-1">Total de visitas realizadas</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{metrics.conversionRate}%</div>
              <p className="text-xs text-slate-500 mt-1">Clientes que compraram</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Faturamento Estimado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                R$ {metrics.estimatedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total da semana</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Clientes Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{metrics.clientsWithoutVisit}</div>
              <p className="text-xs text-slate-500 mt-1">Sem visita há +30 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/clients/new'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Novo Cliente</h3>
                  <p className="text-sm text-slate-600">Cadastrar cliente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/clients'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Ver Clientes</h3>
                  <p className="text-sm text-slate-600">Lista completa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/schedule'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Planejar Semana</h3>
                  <p className="text-sm text-slate-600">Agendar visitas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
