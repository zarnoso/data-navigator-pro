import { Download, CheckCircle, Sparkles } from "lucide-react";

const sampleData = [
  { name: "Constructora Eje Sur SpA", category: "Construcción", phone: "+56 9 8765 4321", web: "ejesur.cl", rating: 4.8, verified: true },
  { name: "Ingeniería y Proyectos Andes", category: "Ferretería Industrial", phone: "+56 2 2345 6789", web: "proyectosandes.cl", rating: 4.5, verified: true },
  { name: "Maquinarias Biobío Ltda.", category: "Arriendo Equipos", phone: "+56 41 222 3344", web: "No disponible", rating: 4.2, verified: true },
  { name: "Empresa Oculta S.A.", category: "Construcción", phone: "+56 9 0000 0000", web: "oculta.cl", rating: 5.0, verified: false },
  { name: "Otra Empresa SpA", category: "Ferretería", phone: "+56 2 1111 2222", web: "otra.cl", rating: 4.1, verified: false },
];

const SkeletonRow = () => (
  <tr>
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-muted rounded skeleton-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
      </td>
    ))}
  </tr>
);

interface DataExplorerProps {
  loading: boolean;
}

const DataExplorer = ({ loading }: DataExplorerProps) => {
  return (
    <section id="explorador" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Explorador de Datos en Vivo</h2>
          <p className="text-muted-foreground">Previsualiza la calidad de nuestra información antes de descargar tu .CSV.</p>
        </div>

        <div className="max-w-5xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Mostrando resultados de prueba</span>
            </div>
            <button className="flex items-center gap-2 bg-secondary hover:bg-muted text-foreground text-sm px-4 py-2 rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              Descargar .CSV Completo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nombre de Empresa</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Categoría</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Teléfono</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Sitio Web</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rating</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : (
                  sampleData.map((row, i) => (
                    <tr key={i} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i >= 3 ? "blur-data" : ""}`}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {row.name}
                          {row.verified && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              Verificado hoy
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.phone}</td>
                      <td className="px-4 py-3 text-primary">{row.web}</td>
                      <td className="px-4 py-3">
                        <span className="text-yellow-400">★</span> {row.rating}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 text-center border-t border-border">
            <a href="#precios" className="text-primary hover:underline text-sm font-medium">
              Desbloquea 3,450 resultados más →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataExplorer;
