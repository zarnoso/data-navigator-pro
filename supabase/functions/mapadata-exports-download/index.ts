import { handlePreflight, json } from "../_shared/cors.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  let user; try { user = await requireUser(req); } catch (r) { return r as Response; }

  const url = new URL(req.url);
  let exportId = url.searchParams.get("id") ?? url.searchParams.get("export_id");
  if (!exportId && (req.method === "POST" || req.method === "PUT")) {
    try {
      const body = await req.json();
      exportId = body?.export_id ?? body?.id ?? null;
    } catch { /* ignore */ }
  }
  if (!exportId) return json({ error: "missing_id" }, 400);

  const supa = adminClient();
  const { data: exp } = await supa
    .from("mapadata_exports")
    .select("id, user_id, storage_path, status, format, row_count")
    .eq("id", exportId)
    .maybeSingle();
  if (!exp || exp.user_id !== user.id) return json({ error: "not_found" }, 404);
  if (exp.status !== "ready" || !exp.storage_path) {
    return json({ error: "not_ready", status: exp.status }, 409);
  }

  const { data: signed, error } = await supa
    .storage
    .from("mapadata-exports")
    .createSignedUrl(exp.storage_path, 60 * 10); // 10 min
  if (error || !signed) return json({ error: error?.message ?? "sign_error" }, 500);

  return json({ url: signed.signedUrl, format: exp.format, row_count: exp.row_count });
});
