import { Users, BarChart3, Code } from "lucide-react";

const solutions = [
  {
    icon: Users,
    title: "Equipos de Ventas B2B",
    description: "El 60% del tiempo comercial se pierde prospectando. Llena tu CRM (HubSpot, Salesforce) con leads estructurados y aumenta tus tasas de conversión contactando empresas reales.",
  },
  {
    icon: BarChart3,
    title: "Analistas e Investigadores",
    description: "Data geoespacial precisa. Coordenadas, ratings y categorías perfectas para estudios de mercado, análisis de la competencia y decisiones de expansión territorial en Chile.",
  },
  {
    icon: Code,
    title: "Desarrolladores",
    description: "Ahorra semanas de desarrollo y problemas de baneos de IP. Entregamos la data parseada y limpia en .CSV para que alimentes tu aplicación o plataforma al instante.",
  },
];

const SolutionsSection = () => {
  return (
    <section id="soluciones" className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Diseñado para quienes necesitan resultados</h2>
          <p className="text-muted-foreground">No vendemos listas obsoletas. Extraemos inteligencia comercial en tiempo real.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {solutions.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-glow transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
