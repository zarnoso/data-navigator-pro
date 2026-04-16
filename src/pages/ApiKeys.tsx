import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Trash2, Eye, EyeOff, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
}

const ApiKeys = () => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const generateKey = () => {
    if (!newKeyName.trim()) {
      toast({ title: "Error", description: "Ingresa un nombre para la API key", variant: "destructive" });
      return;
    }
    const key: ApiKey = {
      id: crypto.randomUUID(),
      name: newKeyName,
      key: `mpd_${Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, "0")).join("")}`,
      created: new Date().toLocaleDateString("es-CL"),
    };
    setKeys([key, ...keys]);
    setNewKeyName("");
    toast({ title: "API Key creada", description: "Guárdala en un lugar seguro." });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copiada", description: "API Key copiada al portapapeles." });
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
    toast({ title: "Eliminada", description: "API Key eliminada." });
  };

  const maskKey = (key: string) => key.slice(0, 8) + "•".repeat(32) + key.slice(-4);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">API Keys</h1>
      <p className="text-muted-foreground mb-6">Gestiona tus claves de acceso a la API</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Crear Nueva API Key</CardTitle>
          <CardDescription>Las API keys te permiten autenticarte con la API de Mapadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Nombre de la key (ej: Mi App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateKey()}
            />
            <Button onClick={generateKey}>
              <Plus className="h-4 w-4" /> Crear
            </Button>
          </div>
        </CardContent>
      </Card>

      {keys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tienes API keys aún. Crea una para empezar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <Card key={k.id}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm">{k.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {visibleKeys.has(k.id) ? k.key : maskKey(k.key)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Creada: {k.created}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="icon" variant="ghost" onClick={() => toggleVisibility(k.id)}>
                    {visibleKeys.has(k.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => copyKey(k.key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteKey(k.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
