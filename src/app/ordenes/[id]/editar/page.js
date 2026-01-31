'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/components/AuthContext';

export default function EditarOrden() {
  const router = useRouter()
  const params = useParams()
  const { role } = useAuth()
  const [orden, setOrden] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    cliente: '',
    descripcion: '',
    estado: 'Pendiente',
    precio: '',
    fecha_entrega: '',
    fotos: [],
    tarea_titulo: '',
    tarea_descripcion: '',
    tarea_prioridad: '',
    tarea_tiempo_estimado: '',
    tarea_pasos: []
  })

  useEffect(() => {
    const fetchOrden = async () => {
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error(error)
        alert('Error al cargar la orden')
        return
      }

      setOrden(data)
      setFormData({
        cliente: data.cliente || '',
        descripcion: data.descripcion || '',
        estado: data.estado || 'Pendiente',
        precio: data.precio || '',
        fecha_entrega: data.fecha_entrega || '',
        fotos: data.fotos || [],
        tarea_titulo: data.tarea_titulo || '',
        tarea_descripcion: data.tarea_descripcion || '',
        tarea_prioridad: data.tarea_prioridad || '',
        tarea_tiempo_estimado: data.tarea_tiempo_estimado || '',
        tarea_pasos: data.tarea_pasos || []
      })
      setLoading(false)
    }

    if (params.id) {
      fetchOrden()
    }
  }, [params.id])

  const loadOrden = async () => {
    const { data, error } = await supabase
      .from('ordenes')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error(error)
      alert('Error al cargar la orden')
      return
    }

    setOrden(data)
    setFormData({
      cliente: data.cliente || '',
      descripcion: data.descripcion || '',
      estado: data.estado || 'Pendiente',
      precio: data.precio || '',
      fecha_entrega: data.fecha_entrega || '',
      fotos: data.fotos || [],
      tarea_titulo: data.tarea_titulo || '',
      tarea_descripcion: data.tarea_descripcion || '',
      tarea_prioridad: data.tarea_prioridad || '',
      tarea_tiempo_estimado: data.tarea_tiempo_estimado || '',
      tarea_pasos: data.tarea_pasos || []
    })
    setLoading(false)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 8) {
      alert('Máximo 8 fotos permitidas');
      return;
    }
    setFormData({...formData, fotos: files});
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('ordenes')
      .update({
        cliente: formData.cliente,
        descripcion: formData.descripcion,
        estado: formData.estado,
        precio: parseFloat(formData.precio) || null,
        fecha_entrega: formData.fecha_entrega || null,
        fotos: formData.fotos.map(f => f.name) || null,
        tarea_titulo: formData.tarea_titulo || null,
        tarea_descripcion: formData.tarea_descripcion || null,
        tarea_prioridad: formData.tarea_prioridad || null,
        tarea_tiempo_estimado: parseInt(formData.tarea_tiempo_estimado) || null,
        tarea_pasos: formData.tarea_pasos || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error(error)
      alert('Error al actualizar la orden')
    } else {
      alert('Orden actualizada correctamente')
      router.push('/ordenes')
    }

    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  if (!orden) {
    return <div className="flex justify-center items-center min-h-screen">Orden no encontrada</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Atrás
        </button>
        <h1 className="text-2xl font-bold text-stone-800">Editar Orden #{orden.id}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Cliente
              </label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Fecha de Entrega
              </label>
              <input
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({...formData, fecha_entrega: e.target.value})}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Fotos de Evidencia (máx. 8)
            </label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
            {formData.fotos.length > 0 && (
              <p className="text-xs text-stone-500 mt-1">{formData.fotos.length} foto(s) seleccionada(s)</p>
            )}
          </div>

          {/* Sección de Tarea Generada por Gemini */}
          {formData.tarea_titulo && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-800 mb-4">Tarea Generada por Gemini</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.tarea_titulo}
                    onChange={(e) => setFormData({...formData, tarea_titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Prioridad</label>
                  <select
                    value={formData.tarea_prioridad}
                    onChange={(e) => setFormData({...formData, tarea_prioridad: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción de la Tarea</label>
                <textarea
                  value={formData.tarea_descripcion}
                  onChange={(e) => setFormData({...formData, tarea_descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">Tiempo Estimado (horas)</label>
                <input
                  type="number"
                  value={formData.tarea_tiempo_estimado}
                  onChange={(e) => setFormData({...formData, tarea_tiempo_estimado: e.target.value})}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {formData.tarea_pasos && formData.tarea_pasos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Pasos</label>
                  <ol className="list-decimal list-inside space-y-1">
                    {formData.tarea_pasos.map((step, index) => (
                      <li key={index} className="text-sm text-stone-600">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

