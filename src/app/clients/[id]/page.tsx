'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Client, Visit } from '@/lib/types'
import { 
  Building2, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClientData()
  }, [clientId])

  const loadClientData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    // Load client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single()

    if (clientError || !clientData) {
      console.error('Error loading client:', clientError)
      window.location.href = '/clients'
      return
    }

    setClient(clientData)

    // Load visits
    const { data: visitsData } = await supabase
      .from('visits')
      .select('*')
      .eq('client_id', clientId)
      .order('visit_date', { ascending: false })

    setVisits(visitsData || [])
    setLoading(false)
  }

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const totalRevenue = visits
    .filter(v => v.result === 'comprou')
    .reduce((sum, v) => sum + (v.price || 0), 0)

  const successRate = visits.length > 0
    ? (visits.filter(v => v.result === 'comprou').length / visits.length) * 100
    : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/clients'}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 line-clamp-1">{client.company_name}</h1>
                <p className="text-xs text-slate-500">Detalhes do cliente</p>
              </div>
            </div>

            <Button
              onClick={() => window.location.href = `/clients/${clientId}/edit`}
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Empresa</p>
                  <p className="font-semibold text-slate-800">{client.company_name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">CNPJ</p>
                  <p className="font-mono text-slate-800">{client.cnpj}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Contato</p>
                  <p className="text-slate-800">{client.contact_person}</p>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{client.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="break-all">{client.email}</span>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p>{client.address}</p>
                    <p>{client.city}, {client.state}</p>
                  </div>
                </div>

                {client.notes && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Observações</p>
                    <p className="text-slate-700 text-sm">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total de Visitas</p>
                  <p className="text-2xl font-bold text-slate-800">{visits.length}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-green-600">{successRate.toFixed(0)}%</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Faturamento Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visits History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Histórico de Visitas
                  </CardTitle>
                  <Button
                    onClick={() => window.location.href = `/clients/${clientId}/visit/new`}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Visita
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Nenhuma visita registrada
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Registre a primeira visita a este cliente
                    </p>
                    <Button
                      onClick={() => window.location.href = `/clients/${clientId}/visit/new`}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Registrar Visita
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div
                        key={visit.id}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              visit.result === 'comprou' 
                                ? 'bg-green-100' 
                                : 'bg-red-100'
                            }`}>
                              {visit.result === 'comprou' ? (
                                <TrendingUp className="w-5 h-5 text-green-600" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {format(new Date(visit.visit_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </p>
                              <Badge
                                variant={visit.result === 'comprou' ? 'default' : 'secondary'}
                                className={visit.result === 'comprou' ? 'bg-green-500' : 'bg-red-500'}
                              >
                                {visit.result === 'comprou' ? 'Comprou' : 'Não Comprou'}
                              </Badge>
                            </div>
                          </div>

                          {visit.price && visit.result === 'comprou' && (
                            <div className="text-right">
                              <p className="text-sm text-slate-500">Valor</p>
                              <p className="font-bold text-green-600 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                R$ {visit.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          )}
                        </div>

                        {visit.product && (
                          <div className="mb-2">
                            <p className="text-sm text-slate-500">Produto</p>
                            <p className="text-slate-800">{visit.product}</p>
                          </div>
                        )}

                        {visit.comments && (
                          <div>
                            <p className="text-sm text-slate-500">Comentários</p>
                            <p className="text-slate-700 text-sm">{visit.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
