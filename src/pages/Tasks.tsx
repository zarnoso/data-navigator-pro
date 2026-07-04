import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Download, RefreshCw, ListTodo } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Run {
  id: string;
  industry_slug: string;
  comuna_slug: string;
  requested_limit: number;
  status: string;
  progress_pct: number | null;
  leads_found: number | null;
  leads_unique: number | null;
  error_message: string | null;
  created_at: string;
}

interface ExportRow {
  id: string;
  run_id: string;
  format: string;
  status: string;
  row_count: number | null;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  running: "secondary",
  completed: "default",
  failed: "destructive",
};

const Tasks = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [exports_, setExports] = useState<ExportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [industry, setIndustry] = useState("");
  const [comuna, setComuna] = useState("");
  const [region, setRegion] = useState("");
  const [limitN, setLimitN] = useState(100);

  const loadRuns = async () => {
    const { data, error } = await supabase.functions.invoke("mapadata-runs-list", { method: "GET" });
    if (error) {
      toast({ title: "Error al cargar tareas", description: error.message, variant: "destructive" });
      return;
    }
    setRuns((data?.runs ?? []) as Run[]);
    const { data: exps } = await supabase.functions.invoke("mapadata-exports-list", { method: "GET" });
    setExports((exps?.exports ?? []) as ExportRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRuns();
    const t = setInterval(() => {
      if (runs.some((r) => r.status === "pending" || r.status === "running")) loadRuns();
    }, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs.map((r) => `${r.id}:${r.status}`).join(",")]);

  const createRun = async () => {
    if (!industry.trim() || !comuna.trim()) {
      toast({ title: "Faltan datos", description: "Ingresa rubro y comuna/ciudad.", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("mapadata-runs-create", {
      body: {
        industry: industry.trim(),
        comuna: comuna.trim(),
        region: region.trim() || undefined,
        limit: limitN,
        formats: ["xlsx", "csv"],
        name: `${limitN} ${industry.trim()} · ${comuna.trim()}`,
      },
    });
    setCreating(false);
    if (error) {
      toast({ title: "No se pudo crear la tarea", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tarea creada", description: `Run ID: ${data?.run_id?.slice(0, 8)}…` });
    loadRuns();
  };

  const download = async (exportId: string) => {
    const { data, error } = await supabase.functions.invoke("mapadata-exports-download", {
      body: { export_id: exportId },
    });
    if (error || !data?.url) {
      toast({ title: "Error al descargar", description: error?.message ?? "sin URL", variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Tareas</h1>
          <p className="text-muted-foreground">Runs del Lead Builder. Se procesan asincrónicamente en el worker.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadRuns}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refrescar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const { data, error } = await supabase.functions.invoke("mapadata-dev-grant-credits", {
                body: { amount: 500 },
              });
              if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
              else toast({ title: "Créditos otorgados", description: `+${data?.entitlement?.leads_available} leads` });
            }}
          >
            +500 créditos (dev)
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nueva búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <Label htmlFor="industry">Rubro / keyword</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="ej: restaurantes, dentistas, ferretería" />
            </div>
            <div>
              <Label htmlFor="comuna">Comuna / ciudad</Label>
              <Input id="comuna" value={comuna} onChange={(e) => setComuna(e.target.value)} placeholder="ej: Providencia" />
            </div>
            <div>
              <Label htmlFor="region">Región (opcional)</Label>
              <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="ej: Metropolitana" />
            </div>
            <div>
              <Label htmlFor="limit">Cantidad</Label>
              <Input id="limit" type="number" min={1} max={5000} value={limitN} onChange={(e) => setLimitN(parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={createRun} disabled={creating} size="sm">
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Generar búsqueda
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></CardContent></Card>
      ) : runs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Sin tareas todavía</p>
            <p className="text-sm text-muted-foreground">Crea la primera con el botón de arriba.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((r) => {
            const runExports = exports_.filter((e) => e.run_id === r.id && e.status === "ready");
            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="text-base">
                      {r.industry_slug} · {r.comuna_slug} · {r.requested_limit} leads
                    </CardTitle>
                    <Badge variant={statusVariant[r.status] ?? "outline"}>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div className="flex flex-wrap gap-4">
                    <span>Progreso: <span className="text-foreground font-medium">{r.progress_pct ?? 0}%</span></span>
                    <span>Resultados: <span className="text-foreground font-medium">{r.leads_unique ?? r.leads_found ?? 0}</span></span>
                    <span className="text-xs">{new Date(r.created_at).toLocaleString("es-CL")}</span>
                  </div>
                  {r.status === "running" && (
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${r.progress_pct ?? 0}%` }} />
                    </div>
                  )}
                  {r.error_message && <p className="text-destructive text-xs">{r.error_message}</p>}
                  {runExports.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {runExports.map((e) => (
                        <Button key={e.id} size="sm" variant="outline" onClick={() => download(e.id)}>
                          <Download className="h-3 w-3 mr-1.5" /> {e.format.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;
