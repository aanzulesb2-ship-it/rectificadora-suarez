"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

function NuevaFacturaInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const ordenId = sp.get("orden") || "";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    cliente_nombre: "",
    email: "",
    telefono: "",
    notas: "",
    subtotal: "",
    iva: "",
    total: "",
  });

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const canSave = useMemo(() => {
    if (loading) return false;
    if (!form.cliente_nombre.trim()) return false;
    if (!form.total) return false;
    const totalNum = Number(form.total);
    if (!Number.isFinite(totalNum) || totalNum <= 0) return false;
    return true;
  }, [loading, form.cliente_nombre, form.total]);

  const crearFactura = async () => {
    setErr("");
    setOk("");
    setLoading(true);

    try {
      const totalNum = Number(form.total);
      const subtotalNum = form.subtotal ? Number(form.subtotal) : null;
      const ivaNum = form.iva ? Number(form.iva) : null;

      if (!form.cliente_nombre.trim()) {
        setErr("Ingresa el nombre del cliente / a quién va dirigida.");
        return;
      }

      if (!Number.isFinite(totalNum) || totalNum <= 0) {
        setErr("Ingresa un total válido.");
        return;
      }

      if (form.subtotal && !Number.isFinite(subtotalNum)) {
        setErr("Subtotal inválido.");
        return;
      }

      if (form.iva && !Number.isFinite(ivaNum)) {
        setErr("IVA inválido.");
        return;
      }

      const payload = {
        orden_id: ordenId || null,
        cliente_nombre: form.cliente_nombre.trim(),
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        notas: form.notas.trim() || null,
        subtotal: subtotalNum,
        iva: ivaNum,
        total: totalNum,
        estado: "emitida",
        fecha: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("facturas")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        console.error("INSERT factura error:", error);
        setErr("No se pudo crear la factura (RLS o columnas faltantes).");
        return;
      }

      setOk("✅ Factura creada.");
      router.replace(`/facturacion/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h1 className="text-2xl font-black">Nueva Factura</h1>
        <Button variant="outline" onClick={() => router.push("/facturacion")} disabled={loading}>
          Volver
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
        {ordenId ? (
          <p className="text-sm text-stone-500">
            Orden asociada: <b>{ordenId}</b>
          </p>
        ) : null}

        {err ? (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
            {err}
          </div>
        ) : null}

        {ok ? (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold">
            {ok}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Cliente / Dirigida a</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={form.cliente_nombre}
              onChange={(e) => onChange("cliente_nombre", e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-xl px-3 py-2"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="cliente@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Teléfono</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={form.telefono}
              onChange={(e) => onChange("telefono", e.target.value)}
              placeholder="09..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Subtotal</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-xl px-3 py-2"
              value={form.subtotal}
              onChange={(e) => onChange("subtotal", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">IVA</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-xl px-3 py-2"
              value={form.iva}
              onChange={(e) => onChange("iva", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Total ($) *</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-xl px-3 py-2"
              value={form.total}
              onChange={(e) => onChange("total", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Notas</label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 min-h-[90px]"
              value={form.notas}
              onChange={(e) => onChange("notas", e.target.value)}
              placeholder="Detalle / Observaciones..."
            />
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button onClick={crearFactura} disabled={!canSave}>
            {loading ? "Creando..." : "Crear factura"}
          </Button>

          <Button variant="outline" onClick={() => router.push("/facturacion")} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Cargando factura…</div>}>
      <NuevaFacturaInner />
    </Suspense>
  );
}
