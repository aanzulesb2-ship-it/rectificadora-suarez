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

function getOrdenIdFromUrl(reqUrl) {
  try {
    const u = new URL(reqUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const fotosIdx = parts.lastIndexOf("fotos");
    if (fotosIdx > 0) return parts[fotosIdx - 1] || null;
    return null;
  } catch {
    return null;
  }
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
    //  Next 16: ctx.params puede venir como Promise
    let ordenId = null;

    if (ctx?.params) {
      const p = await ctx.params;
      if (p?.id) ordenId = String(p.id);
    }

    // fallback por URL si params no vino
    if (!ordenId) ordenId = getOrdenIdFromUrl(req.url);

    if (!ordenId) {
      return Response.json({ error: "Falta id" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const sb = supabaseAdmin();

    const debug = {
      ordenId,
      triedOrdenFotos: false,
      ordenFotosError: null,
      usedFallbackOrdenes: false,
      totalFound: 0,
      totalSigned: 0,
    };

    let fotos = [];

    // 1) Intentar tabla orden_fotos (si existe)
    debug.triedOrdenFotos = true;
    const { data: ofData, error: ofErr } = await sb
      .from("orden_fotos")
      .select("bucket,path,categoria,created_at")
      .eq("orden_id", ordenId)
      .order("created_at", { ascending: true });

    if (ofErr) {
      debug.ordenFotosError = ofErr.message || String(ofErr);
    } else if (Array.isArray(ofData) && ofData.length) {
      fotos = ofData;
    }

    // 2) Fallback: JSON en ordenes
    if (!fotos.length) {
      debug.usedFallbackOrdenes = true;

      const { data: orden, error: ordErr } = await sb
        .from("ordenes")
        .select("fotos_block,fotos_cabezote")
        .eq("id", ordenId)
        .single();

      if (ordErr) {
        return Response.json(
          { error: "No se pudo leer la orden", detail: ordErr.message, debug },
          { status: 500, headers: { "Cache-Control": "no-store" } }
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

      fotos = [...block, ...cabezote].filter((x) => x.bucket && x.path);
    }

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