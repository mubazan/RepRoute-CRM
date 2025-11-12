'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Client } from '@/lib/types'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

export default function NewVisitPage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    result: 'nao_comprou' as 'comprou' | 'nao_comprou',
    product: '',
    price: '',
    comments: '',
  })

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      window.location.href = '/clients'
      return
    }

    setClient(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const { error } = await supabase.from('visits').insert({
        client_id: clientId,
        user_id: user.id,
        visit_date: formData.visit_date,
        result: formData.result,
        product: formData.product || null,
        price: formData.price ? parseFloat(formData.price) : null,
        comments: formData.comments || null,
        attachments: null,
      })

      if (error) throw error

      toast.success('Visita registrada com sucesso!')
      setTimeout(() => {
        window.location.href = `/clients/${clientId}`
      }, 1000)
    } catch (error) {
      console.error('Error creating visit:', error)
      toast.error('Erro ao registrar visita')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!client) {
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
              <button
                onClick={() => window.location.href = `/clients/${clientId}`}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Nova Visita</h1>
                <p className="text-xs text-slate-500 line-clamp-1">{client.company_name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informações da Visita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="visit_date">Data da Visita *</Label>
                <Input
                  id="visit_date"
                  name="visit_date"
                  type="date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label className="mb-3 block">Resultado da Visita *</Label>
                <RadioGroup
                  value={formData.result}
                  onValueChange={(value) => setFormData({ ...formData, result: value as 'comprou' | 'nao_comprou' })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 border border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="comprou" id="comprou" />
                    <Label htmlFor="comprou" className="cursor-pointer flex-1">
                      <span className="font-semibold text-green-600">Comprou</span>
                      <p className="text-xs text-slate-500">Cliente realizou compra</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-slate-200 rounded-lg p-4 flex-1 cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="nao_comprou" id="nao_comprou" />
                    <Label htmlFor="nao_comprou" className="cursor-pointer flex-1">
                      <span className="font-semibold text-red-600">Não Comprou</span>
                      <p className="text-xs text-slate-500">Cliente não comprou</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product">Produto Cotado</Label>
                  <Input
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    placeholder="Ex: Produto XYZ"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço Praticado (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Comentários</Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Observações sobre a visita..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => window.location.href = `/clients/${clientId}`}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Registrar Visita
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
