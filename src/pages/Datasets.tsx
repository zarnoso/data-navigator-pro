import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Download, MapPin } from "lucide-react";

const datasets = [
  {
    id: "1",
    name: "Empresas Región Metropolitana",
    description: "Directorio completo de empresas en Santiago y comunas aledañas",
    records: "125,430",
    format: "CSV",
    category: "Empresas",
    price: "Incluido en Plan Business",
  },
  {
    id: "2",
    name: "Restaurantes Chile Completo",
    description: "Todos los restaurantes registrados en Google Maps en Chile",
    records: "48,200",
    format: "CSV",
    category: "Gastronomía",
    price: "Incluido en Plan Starter",
  },
  {
    id: "3",
    name: "Farmacias y Salud LATAM",
    description: "Farmacias, clínicas y centros médicos en Chile, Argentina y Colombia",
    records: "89,750",
    format: "CSV",
    category: "Salud",
    price: "Incluido en Plan Master",
  },
  {
    id: "4",
    name: "Hoteles y Alojamiento Chile",
    description: "Hoteles, hostales y alojamientos turísticos en todas las regiones",
    records: "15,820",
    format: "CSV",
    category: "Turismo",
    price: "Incluido en Plan Básico",
  },
];

const Datasets = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Datasets</h1>
      <p className="text-muted-foreground mb-6">Datos precargados listos para descargar</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {datasets.map((ds) => (
          <Card key={ds.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{ds.name}</CardTitle>
                  <CardDescription className="mt-1">{ds.description}</CardDescription>
                </div>
                <Badge variant="secondary">{ds.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {ds.records} registros
                  </span>
                  <span>{ds.format}</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" /> Descargar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{ds.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Datasets;
