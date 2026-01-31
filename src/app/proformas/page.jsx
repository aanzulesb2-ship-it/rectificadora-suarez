"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProformasPage() {
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const canUpload = useMemo(() => !uploading, [uploading]);

  const load = async () => {
    setError("");
    setOk("");

    const { data, error } = await supabase.storage.from("proformas").list("", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      console.error("LIST error:", error);
      setError(
        "No se pudo listar. Verifica que exista el bucket 'proformas' y que estés logueado."
      );
      setItems([]);
      return;
    }

    setItems(data || []);
  };

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
      setError("Sesión no iniciada. Vuelve a iniciar sesión.");
      return;
    }
    load();
  });
}, []);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    setOk("");

    try {
      if (file.type !== "application/pdf") {
        setError("Solo se permite PDF.");
        return;
      }

      const safeName =
        new Date().toISOString().replace(/[:.]/g, "-") +
        "_" +
        file.name.replace(/[^\w.\-() ]/g, "_");

      const { error: upErr } = await supabase.storage
        .from("proformas")
        .upload(safeName, file, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (upErr) {
        console.error("UPLOAD error:", upErr);
        setError(
          "No se pudo subir el PDF. Revisa bucket 'proformas', sesión iniciada y policies."
        );
        return;
      }

      setOk("✅ PDF subido correctamente.");
      await load();
    } finally {
      setUploading(false);
    }
  };

  const openPdf = async (name) => {
    setError("");
    setOk("");

    const { data, error } = await supabase.storage
      .from("proformas")
      .createSignedUrl(name, 60 * 10); // 10 min

    if (error) {
      console.error("SIGNED URL error:", error);
      setError("No se pudo abrir el PDF (Signed URL falló).");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h2 className="text-2xl font-black">PDFs / Proformas</h2>
          <p className="text-stone-600">
            Sube y visualiza PDFs guardados en Storage (bucket: <b>proformas</b>).
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold cursor-pointer hover:bg-red-700 transition disabled:opacity-60">
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={!canUpload}
            onChange={(e) => upload(e.target.files?.[0])}
          />
          {uploading ? "Subiendo..." : "Subir PDF"}
        </label>
      </div>

      {error ? (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      ) : null}

      {ok ? (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
          {ok}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 font-bold">Archivos</div>

        {items.length === 0 ? (
          <div className="p-6 text-stone-500">Aún no hay PDFs subidos.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {items.map((it) => (
              <div
                key={it.name}
                className="p-4 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="min-w-[240px]">
                  <div className="font-bold text-stone-900">{it.name}</div>
                  <div className="text-xs text-stone-500">
                    {it.created_at ? new Date(it.created_at).toLocaleString() : ""}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openPdf(it.name)}
                    className="px-3 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition"
                    type="button"
                  >
                    Ver
                  </button>

                  <button
                    onClick={load}
                    className="px-3 py-2 rounded-xl border border-stone-200 bg-white font-semibold hover:bg-stone-50 transition"
                    type="button"
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

