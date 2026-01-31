"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";

const CHECK_ITEMS = [
  "Cigueñal",
  "Bielas",
  "Pistones",
  "Aros",
  "Árbol de levas",
  "Culata / Cabezote",
  "Válvulas",
  "Resortes",
  "Taqués",
  "Bomba de aceite",
  "Bomba de agua",
  "Tapa válvulas",
  "Carter",
  "Multiple admisión",
  "Multiple escape",
  "Turbo",
  "Inyectores",
  "Sensor / Eléctrico",
  "Radiador / Enfriador",
  "Volante",
  "Polea",
];

export default function NuevaTarea() {
  const { role } = useAuth();

  const isAdmin = useMemo(() => role === "admin", [role]);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    motor: "",
    cliente: "",
    mecanico_dueno: "",
    cedula_dueno: "",
    serie_motor: "",
    tipo_motor: "gasolina",
    prioridad: "media",
    fecha_estimada: "",
    observaciones: "",
    precio: "",
  });

  const [datosVino, setDatosVino] = useState(() => {
    const base = {};
    for (const k of CHECK_ITEMS) base[k] = false;
    return base;
  });

  // Fotos: por ahora solo seleccionamos (en el siguiente sprint subimos a Storage)
  const [fotosBlock, setFotosBlock] = useState([]);
  const [fotosCabezote, setFotosCabezote] = useState([]);

  const onToggleDato = (k) => {
    setDatosVino((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Validaciones pro mínimas
    if (!form.motor.trim()) return alert("Falta: Motor");
    if (!form.cliente.trim()) return alert("Falta: Cliente");
    if (!form.mecanico_dueno.trim()) return alert("Falta: Mecánico/Dueño");

    setSaving(true);

    try {
      const payload = {
        motor: form.motor.trim(),
        cliente: form.cliente.trim(),
        mecanico_dueno: form.mecanico_dueno.trim(),
        cedula_dueno: form.cedula_dueno.trim() || null,
        serie_motor: form.serie_motor.trim() || null,
        tipo_motor: form.tipo_motor || null,
        prioridad: form.prioridad || "media",
        fecha_estimada: form.fecha_estimada || null,
        observaciones: form.observaciones.trim() || null,
        datos_vino: datosVino,
        // Por ahora guardamos nombres (subida a Storage la hacemos después)
        fotos_block: fotosBlock?.length ? fotosBlock.map((f) => ({ name: f.name, size: f.size, type: f.type })) : [],
        fotos_cabezote: fotosCabezote?.length ? fotosCabezote.map((f) => ({ name: f.name, size: f.size, type: f.type })) : [],
        // Precio solo admin
        precio: isAdmin ? (form.precio ? Number(form.precio) : null) : null,
        estado: "pendiente",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("ordenes").insert([payload]);
      if (error) throw error;

      alert("✅ Orden creada correctamente");

      // Reset
      setForm({
        motor: "",
        cliente: "",
        mecanico_dueno: "",
        cedula_dueno: "",
        serie_motor: "",
        tipo_motor: "gasolina",
        prioridad: "media",
        fecha_estimada: "",
        observaciones: "",
        precio: "",
      });
      const base = {};
      for (const k of CHECK_ITEMS) base[k] = false;
      setDatosVino(base);
      setFotosBlock([]);
      setFotosCabezote([]);
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo crear la orden.\n\nDetalle: " + (err?.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">Ingreso de Orden</div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Crear <span className="text-red-600">Orden de Trabajo</span>
          </h2>
        </div>
        <div className="text-xs text-stone-500">
          Rol: <span className="font-bold">{role || "—"}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Motor (ej: Hilux 2KD / Corolla 1NZ)"
            value={form.motor}
            onChange={(e) => setForm({ ...form, motor: e.target.value })}
          />
          <input
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Cliente"
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
          />
          <input
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Mecánico/Dueño"
            value={form.mecanico_dueno}
            onChange={(e) => setForm({ ...form, mecanico_dueno: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Cédula/DNI"
            value={form.cedula_dueno}
            onChange={(e) => setForm({ ...form, cedula_dueno: e.target.value })}
          />
          <input
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="N° Serie Motor"
            value={form.serie_motor}
            onChange={(e) => setForm({ ...form, serie_motor: e.target.value })}
          />
          <select
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={form.tipo_motor}
            onChange={(e) => setForm({ ...form, tipo_motor: e.target.value })}
          >
            <option value="gasolina">Gasolina</option>
            <option value="diesel">Diésel</option>
            <option value="industrial">Industrial</option>
          </select>
          <select
            className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={form.prioridad}
            onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
          >
            <option value="baja">Prioridad: baja</option>
            <option value="media">Prioridad: media</option>
            <option value="alta">Prioridad: alta</option>
            <option value="urgente">Prioridad: urgente</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-1">Fecha estimada</div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={form.fecha_estimada}
              onChange={(e) => setForm({ ...form, fecha_estimada: e.target.value })}
            />
          </div>

          <div>
            <div className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-1">Precio (solo admin)</div>
            <input
              type="number"
              step="0.01"
              disabled={!isAdmin}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
              placeholder={isAdmin ? "Ej: 120.00" : "Bloqueado para técnico"}
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />
          </div>
        </div>

        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Observaciones (daños previos, notas de recepción, etc.)"
          value={form.observaciones}
          onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
        />

        <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">Datos</div>
              <div className="font-black text-stone-800">¿Qué vino con el motor?</div>
            </div>
            <div className="text-xs text-stone-500">Marca casillas (proceso técnico)</div>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CHECK_ITEMS.map((k) => (
              <label key={k} className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
                <input
                  type="checkbox"
                  checked={!!datosVino[k]}
                  onChange={() => onToggleDato(k)}
                  className="h-4 w-4"
                />
                <span className="text-xs font-semibold text-stone-700">{k}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stone-200 p-4">
            <div className="font-black text-stone-800">Fotos Block (máx 12)</div>
            <div className="text-xs text-stone-500 mb-2">Cilindros, bancada, cigüeñal, etc.</div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 12) return alert("Máximo 12 fotos para Block");
                setFotosBlock(files);
              }}
              className="w-full"
            />
            {fotosBlock.length ? (
              <div className="text-xs text-stone-500 mt-2">{fotosBlock.length} seleccionada(s)</div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-stone-200 p-4">
            <div className="font-black text-stone-800">Fotos Cabezote (máx 12)</div>
            <div className="text-xs text-stone-500 mb-2">Culata, válvulas, asientos, guías…</div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 12) return alert("Máximo 12 fotos para Cabezote");
                setFotosCabezote(files);
              }}
              className="w-full"
            />
            {fotosCabezote.length ? (
              <div className="text-xs text-stone-500 mt-2">{fotosCabezote.length} seleccionada(s)</div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-black shadow hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? "Creando..." : "Crear orden"}
          </button>
        </div>
      </form>
    </div>
  );
}
