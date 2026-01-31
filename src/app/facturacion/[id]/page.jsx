"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function DetalleFactura() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    if (!id) return;

    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando factura:", error);
      setErr(error.message || "No se pudo cargar la factura");
      setFactura(null);
    } else {
      setFactura(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const eliminar = async () => {
    if (!id) return;
    const ok = confirm("¿Seguro que deseas ELIMINAR esta factura?");
    if (!ok) return;

    setDeleting(true);
    setErr(null);
    try {
      const { error } = await supabase.from("facturas").delete().eq("id", id);
      if (error) {
        console.error("DELETE factura:", error);
        setErr("No se pudo eliminar (revisa RLS/policies).");
        return;
      }
      router.replace("/facturacion");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-stone-600">Cargando factura...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
          <div className="font-black">Error</div>
          <div className="text-sm mt-1">{err}</div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button onClick={() => router.back()}>Volver</Button>
            <div className="flex gap-2 flex-wrap">
  <Link href="/facturacion" className="underline text-sm text-blue-600">
              Ir a Facturación
            </Link>

  <button
    type="button"
    onClick={openWhatsApp}
    className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
    title="Enviar por WhatsApp"
  >
    WhatsApp
  </button>

  <button
    type="button"
    onClick={printFactura}
    className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition"
    title="Imprimir factura"
  >
    Imprimir
  </button>
</div>
          </div>
        </div>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 rounded-2xl border border-stone-200 bg-white">
          <div className="font-black">Factura no encontrada</div>
          <div className="text-sm text-stone-500 mt-1">
            Puede que no exista en la tabla <code>facturas</code> o que no se haya guardado.
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button onClick={() => router.back()}>Volver</Button>
            <div className="flex gap-2 flex-wrap">
  <Link href="/facturacion" className="underline text-sm text-blue-600">
              Ir a Facturación
            </Link>

  <button
    type="button"
    onClick={openWhatsApp}
    className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
    title="Enviar por WhatsApp"
  >
    WhatsApp
  </button>

  <button
    type="button"
    onClick={printFactura}
    className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition"
    title="Imprimir factura"
  >
    Imprimir
  </button>
</div>
          </div>
        </div>
      </div>
    );
  }

  const fecha = factura.fecha ? new Date(factura.fecha).toLocaleDateString() : "—";

  const openWhatsApp = () => {
  const telRaw = (factura?.telefono || "").toString();
  const tel = telRaw.replace(/[^\d]/g, ""); // solo números

  if (!tel) {
    alert("Esta factura no tiene teléfono. Agrega el teléfono para enviar por WhatsApp.");
    return;
  }

  const nombre = (factura?.cliente_nombre || "").toString().trim();
  const total = (factura?.total ?? "—").toString();
  const fechaTxt = factura?.fecha ? new Date(factura.fecha).toLocaleDateString() : "—";
  const idShort = String(factura?.id || "").slice(0, 8);

  const texto =
    "Hola" +
    (nombre ? " " + nombre : "") +
    ", te envío tu factura #" +
    idShort +
    ". Fecha: " +
    fechaTxt +
    ". Total: $" +
    total +
    ".";

  const msg = encodeURIComponent(texto);
  const url = "https://wa.me/" + tel + "?text=" + msg;

  window.open(url, "_blank", "noopener,noreferrer");
};

  const printFactura = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-black">
          Factura #{String(factura.id).slice(0, 8)}
        </h1>

        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
  <Link
            href="/facturacion"
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white font-semibold hover:bg-stone-50"
          >
            Volver
          </Link>

  <button
    type="button"
    onClick={openWhatsApp}
    className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
    title="Enviar por WhatsApp"
  >
    WhatsApp
  </button>

  <button
    type="button"
    onClick={printFactura}
    className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition"
    title="Imprimir factura"
  >
    Imprimir
  </button>
</div>

          <button
            onClick={eliminar}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60"
            type="button"
            title="Eliminar factura"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 space-y-2">
        <div className="text-sm text-stone-500">Cliente / Dirigida a</div>
        <div className="font-bold">{factura.cliente_nombre ?? "—"}</div>

        <div className="mt-4 text-sm text-stone-500">Fecha</div>
        <div className="font-bold">{fecha}</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl border border-stone-200">
            <div className="text-xs uppercase tracking-widest text-stone-500 font-black">Subtotal</div>
            <div className="text-lg font-black">{factura.subtotal ?? "—"}</div>
          </div>
          <div className="p-3 rounded-xl border border-stone-200">
            <div className="text-xs uppercase tracking-widest text-stone-500 font-black">IVA</div>
            <div className="text-lg font-black">{factura.iva ?? "—"}</div>
          </div>
          <div className="p-3 rounded-xl border border-stone-200">
            <div className="text-xs uppercase tracking-widest text-stone-500 font-black">Total</div>
            <div className="text-lg font-black text-green-700">{factura.total ?? "—"}</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-stone-700">
          <div><span className="font-bold">Email:</span> {factura.email ?? "—"}</div>
          <div><span className="font-bold">Teléfono:</span> {factura.telefono ?? "—"}</div>
          <div className="mt-2"><span className="font-bold">Notas:</span> {factura.notas ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}



