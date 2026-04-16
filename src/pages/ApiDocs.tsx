import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const endpoints = [
  {
    id: "businesses",
    name: "Empresas Google Maps",
    method: "GET",
    path: "/api/v1/maps/businesses",
    description: "Busca empresas en Google Maps por categoría, ubicación y filtros avanzados.",
    params: [
      { name: "query", type: "string", required: true, desc: "Término de búsqueda (ej: 'restaurantes en Santiago')" },
      { name: "region", type: "string", required: false, desc: "Código de región (ej: 'metropolitana')" },
      { name: "limit", type: "number", required: false, desc: "Máximo de resultados (default: 20, max: 500)" },
      { name: "language", type: "string", required: false, desc: "Idioma de resultados (default: 'es')" },
    ],
    response: `{
  "status": "ok",
  "count": 20,
  "data": [
    {
      "name": "Restaurante El Chileno",
      "address": "Av. Providencia 1234, Santiago",
      "phone": "+56 2 1234 5678",
      "rating": 4.5,
      "reviews_count": 342,
      "category": "Restaurante",
      "website": "https://elchileno.cl",
      "lat": -33.4289,
      "lng": -70.6093
    }
  ]
}`,
    snippets: {
      curl: `curl -X GET "https://api.mapadata.cl/v1/maps/businesses?query=restaurantes+en+Santiago&limit=20" \\
  -H "Authorization: Bearer mpd_YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "https://api.mapadata.cl/v1/maps/businesses",
    params={"query": "restaurantes en Santiago", "limit": 20},
    headers={"Authorization": "Bearer mpd_YOUR_API_KEY"}
)
data = response.json()
print(f"Encontradas {data['count']} empresas")`,
      javascript: `const response = await fetch(
  "https://api.mapadata.cl/v1/maps/businesses?query=restaurantes+en+Santiago&limit=20",
  { headers: { "Authorization": "Bearer mpd_YOUR_API_KEY" } }
);
const data = await response.json();
console.log(\`Encontradas \${data.count} empresas\`);`,
    },
  },
  {
    id: "reviews",
    name: "Reviews Google Maps",
    method: "GET",
    path: "/api/v1/maps/reviews",
    description: "Obtén las reseñas de cualquier negocio en Google Maps.",
    params: [
      { name: "place_id", type: "string", required: true, desc: "ID de Google Maps del negocio" },
      { name: "sort", type: "string", required: false, desc: "Ordenar por: 'newest', 'highest', 'lowest'" },
      { name: "limit", type: "number", required: false, desc: "Máximo de reseñas (default: 50)" },
    ],
    response: `{
  "status": "ok",
  "place_name": "Restaurante El Chileno",
  "average_rating": 4.5,
  "total_reviews": 342,
  "data": [
    {
      "author": "Juan Pérez",
      "rating": 5,
      "text": "Excelente comida y atención...",
      "date": "2024-01-15",
      "language": "es"
    }
  ]
}`,
    snippets: {
      curl: `curl -X GET "https://api.mapadata.cl/v1/maps/reviews?place_id=ChIJ_example&limit=50" \\
  -H "Authorization: Bearer mpd_YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "https://api.mapadata.cl/v1/maps/reviews",
    params={"place_id": "ChIJ_example", "limit": 50},
    headers={"Authorization": "Bearer mpd_YOUR_API_KEY"}
)
reviews = response.json()`,
      javascript: `const response = await fetch(
  "https://api.mapadata.cl/v1/maps/reviews?place_id=ChIJ_example&limit=50",
  { headers: { "Authorization": "Bearer mpd_YOUR_API_KEY" } }
);
const reviews = await response.json();`,
    },
  },
  {
    id: "photos",
    name: "Fotos Google Maps",
    method: "GET",
    path: "/api/v1/maps/photos",
    description: "Descarga las fotos asociadas a un negocio en Google Maps.",
    params: [
      { name: "place_id", type: "string", required: true, desc: "ID de Google Maps del negocio" },
      { name: "limit", type: "number", required: false, desc: "Máximo de fotos (default: 10, max: 100)" },
    ],
    response: `{
  "status": "ok",
  "place_name": "Restaurante El Chileno",
  "data": [
    {
      "url": "https://cdn.mapadata.cl/photos/abc123.jpg",
      "width": 1200,
      "height": 800,
      "author": "Juan Pérez",
      "date": "2024-01-10"
    }
  ]
}`,
    snippets: {
      curl: `curl -X GET "https://api.mapadata.cl/v1/maps/photos?place_id=ChIJ_example&limit=10" \\
  -H "Authorization: Bearer mpd_YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "https://api.mapadata.cl/v1/maps/photos",
    params={"place_id": "ChIJ_example", "limit": 10},
    headers={"Authorization": "Bearer mpd_YOUR_API_KEY"}
)
photos = response.json()`,
      javascript: `const response = await fetch(
  "https://api.mapadata.cl/v1/maps/photos?place_id=ChIJ_example&limit=10",
  { headers: { "Authorization": "Bearer mpd_YOUR_API_KEY" } }
);
const photos = await response.json();`,
    },
  },
  {
    id: "search",
    name: "Búsqueda de Empresas Chile",
    method: "GET",
    path: "/api/v1/businesses/search",
    description: "Busca empresas chilenas por RUT, nombre, rubro o región.",
    params: [
      { name: "q", type: "string", required: true, desc: "Búsqueda por nombre o RUT" },
      { name: "region", type: "string", required: false, desc: "Filtrar por región" },
      { name: "rubro", type: "string", required: false, desc: "Filtrar por rubro/categoría" },
      { name: "limit", type: "number", required: false, desc: "Máximo resultados (default: 20)" },
    ],
    response: `{
  "status": "ok",
  "count": 15,
  "data": [
    {
      "rut": "76.XXX.XXX-X",
      "razon_social": "Empresa Ejemplo SpA",
      "nombre_fantasia": "Ejemplo",
      "rubro": "Servicios Informáticos",
      "region": "Metropolitana",
      "comuna": "Providencia",
      "email": "contacto@ejemplo.cl",
      "telefono": "+56 2 1234 5678"
    }
  ]
}`,
    snippets: {
      curl: `curl -X GET "https://api.mapadata.cl/v1/businesses/search?q=servicios+informaticos&region=metropolitana" \\
  -H "Authorization: Bearer mpd_YOUR_API_KEY"`,
      python: `import requests

response = requests.get(
    "https://api.mapadata.cl/v1/businesses/search",
    params={"q": "servicios informaticos", "region": "metropolitana"},
    headers={"Authorization": "Bearer mpd_YOUR_API_KEY"}
)
empresas = response.json()`,
      javascript: `const response = await fetch(
  "https://api.mapadata.cl/v1/businesses/search?q=servicios+informaticos&region=metropolitana",
  { headers: { "Authorization": "Bearer mpd_YOUR_API_KEY" } }
);
const empresas = await response.json();`,
    },
  },
];

const ApiDocs = () => {
  const { toast } = useToast();
  const [codeTab, setCodeTab] = useState("curl");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copiado", description: "Código copiado al portapapeles." });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">API Documentation</h1>
      <p className="text-muted-foreground mb-6">Documentación completa de la API REST de Mapadata</p>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Base URL:</span>
            <code className="bg-muted px-2 py-1 rounded text-foreground font-mono text-xs">
              https://api.mapadata.cl/v1
            </code>
          </div>
          <div className="flex items-center gap-3 text-sm mt-2">
            <span className="text-muted-foreground">Autenticación:</span>
            <code className="bg-muted px-2 py-1 rounded text-foreground font-mono text-xs">
              Authorization: Bearer mpd_YOUR_API_KEY
            </code>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="businesses">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {endpoints.map((ep) => (
            <TabsTrigger key={ep.id} value={ep.id} className="text-xs">
              {ep.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {endpoints.map((ep) => (
          <TabsContent key={ep.id} value={ep.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{ep.method}</Badge>
                  <code className="text-sm font-mono text-foreground">{ep.path}</code>
                </div>
                <CardDescription className="mt-2">{ep.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parameters */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Parámetros</h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-2 text-muted-foreground font-medium">Nombre</th>
                          <th className="text-left px-4 py-2 text-muted-foreground font-medium">Tipo</th>
                          <th className="text-left px-4 py-2 text-muted-foreground font-medium">Requerido</th>
                          <th className="text-left px-4 py-2 text-muted-foreground font-medium">Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ep.params.map((p) => (
                          <tr key={p.name} className="border-t border-border">
                            <td className="px-4 py-2 font-mono text-xs text-foreground">{p.name}</td>
                            <td className="px-4 py-2 text-muted-foreground">{p.type}</td>
                            <td className="px-4 py-2">
                              {p.required ? (
                                <Badge variant="destructive" className="text-xs">Sí</Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">No</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Code Snippets */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Ejemplo de Código</h3>
                  <Tabs value={codeTab} onValueChange={setCodeTab}>
                    <TabsList className="h-8">
                      <TabsTrigger value="curl" className="text-xs h-7">cURL</TabsTrigger>
                      <TabsTrigger value="python" className="text-xs h-7">Python</TabsTrigger>
                      <TabsTrigger value="javascript" className="text-xs h-7">JavaScript</TabsTrigger>
                    </TabsList>
                    {(["curl", "python", "javascript"] as const).map((lang) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <pre className="bg-muted rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
                            {ep.snippets[lang]}
                          </pre>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => copyCode(ep.snippets[lang])}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Respuesta Ejemplo</h3>
                  <pre className="bg-muted rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
                    {ep.response}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ApiDocs;
