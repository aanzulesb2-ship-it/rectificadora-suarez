'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthContext'

const VINO_ITEMS = [
  // Bloque / base
  'Block', 'Base', 'Cárter', 'Tapa válvulas', 'Tornillería',
  'Pernos block', 'Pernos cabezote',

  // Tren rotativo
  'Cigüeñal', 'Bielas', 'Pistones', 'Camisas',
  'Cojinetes bancada', 'Cojinetes biela', 'Metales empuje',

  // Tren de distribución
  'Árbol de levas', 'Taqués', 'Balancines',
  'Cadena/correa', 'Tensor', 'Polea', 'Damper', 'Volante',

  // Cabezote / culata
  'Culata/Cabezote', 'Válvulas', 'Resortes', 'Guías válvula', 'Sellos válvula',

  // Bombas / auxiliares
  'Bomba de aceite', 'Bomba de agua',

  // Empaques y otros
  'Empaques', 'Retenes'
]

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function safeExt(name) {
  const ext = (String(name || '').split('.').pop() || 'jpg').toLowerCase()
  const clean = ext.replace(/[^a-z0-9]/g, '')
  return clean || 'jpg'
}

async function uploadMany({ bucket, ordenId, files }) {
  const uploaded = []
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const ext = safeExt(f?.name)
    // path único: incluye i + timestamp + random
    const path = `${ordenId}/${Date.now()}_${i}_${Math.random().toString(16).slice(2)}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(path, f, {
      cacheControl: '3600',
      upsert: false,
      contentType: f?.type || 'image/jpeg',
    })

    if (error) throw error
    uploaded.push(path)
  }
  return uploaded
}

function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || null
}

export default function NuevaOrdenPage() {
  const router = useRouter()
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const [form, setForm] = useState({
    cliente: '',
    mecanico_dueno: '',
    cedula_dueno: '',
    motor: '',
    serie_motor: '',
    tipo_motor: '',
    prioridad: 'media',
    fecha_estimada: '',
    observaciones: '',
    precio: '',

    datos_vino: {},
    datos_vino_detalle: '',
  })

  const [blockFiles, setBlockFiles] = useState([])
  const [cabezoteFiles, setCabezoteFiles] = useState([])

  const vinoCols = useMemo(() => chunk(VINO_ITEMS, 5), [])

  useEffect(() => {
    setForm((p) => {
      if (Object.keys(p.datos_vino || {}).length) return p
      const base = {}
      for (const it of VINO_ITEMS) base[it] = false
      return { ...p, datos_vino: base }
    })
  }, [])

  const onPick = (setter, max) => (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > max) {
      alert(`Máximo ${max} fotos permitidas`)
      return
    }
    setter(files)
  }

  const toggleVino = (item) => {
    setForm((p) => ({
      ...p,
      datos_vino: { ...(p.datos_vino || {}), [item]: !p.datos_vino?.[item] }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)

    try {
      const insertPayload = {
        cliente: form.cliente || null,
        mecanico_dueno: form.mecanico_dueno || null,
        cedula_dueno: form.cedula_dueno || null,
        motor: form.motor || null,
        serie_motor: form.serie_motor || null,
        tipo_motor: form.tipo_motor || null,
        prioridad: form.prioridad || 'media',
        fecha_estimada: form.fecha_estimada || null,
        observaciones: form.observaciones || null,

        datos_vino: form.datos_vino || {},
        datos_vino_detalle: form.datos_vino_detalle || null,

        estado: 'pendiente',
      }

      if (isAdmin) insertPayload.precio = form.precio ? Number(form.precio) : null

      const { data: created, error: insErr } = await supabase
        .from('ordenes')
        .insert([insertPayload])
        .select('id')
        .single()

      if (insErr) throw insErr
      const ordenId = created.id

      // subir fotos
      let fotosBlockPaths = []
      let fotosCabezotePaths = []

      if (blockFiles.length) {
        fotosBlockPaths = await uploadMany({
          bucket: 'ordenes-fotos-block',
          ordenId,
          files: blockFiles,
        })
      }

      if (cabezoteFiles.length) {
        fotosCabezotePaths = await uploadMany({
          bucket: 'ordenes-fotos-cabezote',
          ordenId,
          files: cabezoteFiles,
        })
      }

      const fotos_block = fotosBlockPaths.map((p) => ({
        bucket: 'ordenes-fotos-block',
        path: p,
        url: getPublicUrl('ordenes-fotos-block', p),
      }))

      const fotos_cabezote = fotosCabezotePaths.map((p) => ({
        bucket: 'ordenes-fotos-cabezote',
        path: p,
        url: getPublicUrl('ordenes-fotos-cabezote', p),
      }))

      if (fotos_block.length || fotos_cabezote.length) {
        const { error: upErr } = await supabase
          .from('ordenes')
          .update({ fotos_block, fotos_cabezote })
          .eq('id', ordenId)

        if (upErr) throw upErr
      }

      alert('✅ Orden creada correctamente')
      router.replace(`/gestor/${ordenId}`)
    } catch (ex) {
      console.error(ex)
      setErr(ex?.message || 'Error creando la orden (revisa si existe la columna datos_vino_detalle y los buckets).')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute requiredRole={['admin', 'tecnico']}>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Nuevo Ingreso <span className="text-red-600">Rojo Potencia</span>
            </h1>
            <p className="text-stone-500 text-sm">
              Crea la orden con datos, checklist de recepción y fotos.
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow transition font-semibold"
          >
            Volver
          </button>
        </div>

        {err ? (
          <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
            <div className="font-black">Error</div>
            <div className="text-sm mt-1">{err}</div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos principales */}
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Cliente</label>
                <input
                  value={form.cliente}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nombre / Taller"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Mecánico / Dueño</label>
                <input
                  value={form.mecanico_dueno}
                  onChange={(e) => setForm({ ...form, mecanico_dueno: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Cédula</label>
                <input
                  value={form.cedula_dueno}
                  onChange={(e) => setForm({ ...form, cedula_dueno: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0102030405"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Motor</label>
                <input
                  value={form.motor}
                  onChange={(e) => setForm({ ...form, motor: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ej: Toyota 1NZ / Isuzu 4JB1..."
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Serie del motor</label>
                <input
                  value={form.serie_motor}
                  onChange={(e) => setForm({ ...form, serie_motor: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Serie / VIN motor"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Tipo</label>
                <input
                  value={form.tipo_motor}
                  onChange={(e) => setForm({ ...form, tipo_motor: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Gasolina / Diésel / Industrial"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Prioridad</label>
                <select
                  value={form.prioridad}
                  onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Fecha estimada</label>
                <input
                  type="date"
                  value={form.fecha_estimada}
                  onChange={(e) => setForm({ ...form, fecha_estimada: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500">Precio (solo Admin)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  disabled={!isAdmin}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-60"
                  placeholder={isAdmin ? '0.00' : 'Restringido'}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs font-black uppercase tracking-widest text-stone-500">Observaciones</label>
              <textarea
                rows={4}
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Daños previos / notas de recepción..."
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6">
            <div className="mb-4">
              <div className="text-lg font-black text-stone-900">Datos de recepción</div>
              <div className="text-sm text-stone-500">
                Marca lo que vino con el motor. Abajo escribe novedades (dañado, incompleto, faltantes, etc.).
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {vinoCols.map((col, idx) => (
                <div key={idx} className="space-y-2">
                  {col.map((it) => (
                    <label
                      key={it}
                      className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!form.datos_vino?.[it]}
                        onChange={() => toggleVino(it)}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="text-sm text-stone-700">{it}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label className="text-xs font-black uppercase tracking-widest text-stone-500">
                Detalle / novedades de piezas (si aplica)
              </label>
              <textarea
                rows={4}
                value={form.datos_vino_detalle}
                onChange={(e) => setForm({ ...form, datos_vino_detalle: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ej: Bielas: una fundida. Cigüeñal rayado. Faltan pernos cabezote..."
              />
            </div>
          </div>

          {/* Fotos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6">
              <div className="font-black text-stone-900">Fotos Block (máx. 12)</div>
              <div className="text-sm text-stone-500 mb-3">Block, cigüeñal, bielas, pistones, etc.</div>
              <input type="file" accept="image/*" multiple onChange={onPick(setBlockFiles, 12)} className="w-full" />
              {blockFiles.length ? (
                <div className="text-xs text-stone-500 mt-2">{blockFiles.length} foto(s) seleccionada(s)</div>
              ) : null}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6">
              <div className="font-black text-stone-900">Fotos Cabezote (máx. 12)</div>
              <div className="text-sm text-stone-500 mb-3">Culata, válvulas, asientos, guías, etc.</div>
              <input type="file" accept="image/*" multiple onChange={onPick(setCabezoteFiles, 12)} className="w-full" />
              {cabezoteFiles.length ? (
                <div className="text-xs text-stone-500 mt-2">{cabezoteFiles.length} foto(s) seleccionada(s)</div>
              ) : null}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow transition font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}


