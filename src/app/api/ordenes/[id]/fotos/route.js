import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function normalizeArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [];
}

function pickCategoria(it, fallback) {
  const c = it?.categoria || it?.tipo || it?.group;
  return (c ? String(c) : fallback) || null;
}

async function signMany(sb, items, expiresIn = 60 * 60) {
  const out = [];
  for (const it of items) {
    const bucket = it?.bucket;
    const path = it?.path;
    const categoria = pickCategoria(it, null);

    if (!bucket || !path) continue;

    const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, expiresIn);

    if (data?.signedUrl) {
      out.push({ bucket, path, categoria, url: data.signedUrl, error: null });
    } else {
      out.push({ bucket, path, categoria, url: null, error: error?.message || "No se pudo firmar URL" });
    }
  }
  return out.filter((x) => !!x.url);
}

export async function GET(req, ctx) {
  try {
    let ordenId = null;

    if (ctx?.params) {
      const p = await ctx.params; // Next 16: params puede ser Promise
      if (p?.id) ordenId = String(p.id);
    }

    if (!ordenId) {
      return Response.json({ error: "Falta id" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const sb = supabaseAdmin();

    const debug = {
      ordenId,
      usedOrdenes: true,
      totalFound: 0,
      totalSigned: 0,
      note: "Solo lee ordenes.fotos_block / fotos_cabezote. No usa orden_fotos.",
    };

    // OJO: NO usamos .single() para evitar 'Cannot coerce...'
    const { data: rows, error: ordErr } = await sb
      .from("ordenes")
      .select("id,fotos_block,fotos_cabezote")
      .eq("id", ordenId)
      .limit(1);

    if (ordErr) {
      return Response.json(
        { error: "No se pudo leer la orden", detail: ordErr.message, debug },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const orden = rows?.[0] || null;

    if (!orden) {
      return Response.json(
        { error: "Orden no encontrada (0 filas)", debug: { ...debug, rowsFound: rows?.length || 0 } },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const block = normalizeArray(orden?.fotos_block).map((x) => ({
      bucket: x?.bucket || "ordenes-fotos-block",
      path: x?.path,
      categoria: pickCategoria(x, "block"),
    }));

    const cabezote = normalizeArray(orden?.fotos_cabezote).map((x) => ({
      bucket: x?.bucket || "ordenes-fotos-cabezote",
      path: x?.path,
      categoria: pickCategoria(x, "cabezote"),
    }));

    const fotos = [...block, ...cabezote].filter((x) => x.bucket && x.path);

    debug.totalFound = fotos.length;

    const signed = await signMany(sb, fotos, 60 * 60);
    debug.totalSigned = signed.length;

    return Response.json(
      { orden_id: ordenId, fotos: signed, debug },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return Response.json(
      { error: e?.message || "Error inesperado" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}