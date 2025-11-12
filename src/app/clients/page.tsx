'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Client } from '@/lib/types'
import { Building2, Search, Plus, MapPin, Phone, Mail, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkAuthAndLoadClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [searchTerm, clients])

  const checkAuthAndLoadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }
    await loadClients(user.id)
  }

  const loadClients = async (userId: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('company_name', { ascending: true })

    if (error) {
      console.error('Error loading clients:', error)
      setLoading(false)
      return
    }

    setClients(data || [])
    setFilteredClients(data || [])
    setLoading(false)
  }

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = clients.filter(client =>
      client.company_name.toLowerCase().includes(term) ||
      client.city.toLowerCase().includes(term) ||
      client.contact_person.toLowerCase().includes(term) ||
      client.cnpj.includes(term)
    )
    setFilteredClients(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando clientes...</p>
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
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <Building2 className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Clientes</h1>
                <p className="text-xs text-slate-500">{clients.length} cadastrados</p>
              </div>
            </div>

            <Button
              onClick={() => window.location.href = '/clients/new'}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Cliente</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por empresa, cidade, contato ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm
                  ? 'Tente buscar com outros termos'
                  : 'Comece cadastrando seu primeiro cliente'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => window.location.href = '/clients/new'}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                        {client.company_name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">{client.contact_person}</p>
                      <Badge variant="outline" className="text-xs">
                        {client.cnpj}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="line-clamp-1">{client.city}, {client.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="line-clamp-1">{client.email}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => window.location.href = `/clients/${client.id}`}
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => window.location.href = `/clients/${client.id}/edit`}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
