import { useState, useMemo } from "react";
import { Search, MapPin, Building2 } from "lucide-react";
import { regionsChile, latinAmericaCountries, industries, getMonthName } from "@/data/regions";

interface HeroSectionProps {
  onSearch: (region: string, comuna: string, industry: string, country: string) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [selectedCountry, setSelectedCountry] = useState("chile");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [includeLATAM, setIncludeLATAM] = useState(false);
  const [selectedLATAMCountry, setSelectedLATAMCountry] = useState("");
  const [selectedLATAMRegion, setSelectedLATAMRegion] = useState("");

  const currentRegions = useMemo(() => {
    if (selectedCountry === "chile") return regionsChile;
    const country = latinAmericaCountries.find(c => c.name === selectedCountry);
    return country?.regions || [];
  }, [selectedCountry]);

  const currentComunas = useMemo(() => {
    const region = currentRegions.find(r => r.name === selectedRegion);
    return region?.comunas || [];
  }, [currentRegions, selectedRegion]);

  const latamRegions = useMemo(() => {
    const country = latinAmericaCountries.find(c => c.name === selectedLATAMCountry);
    return country?.regions || [];
  }, [selectedLATAMCountry]);

  const estimatedCount = useMemo(() => {
    let base = 45000;
    if (selectedRegion) base = Math.floor(base * 0.15 + Math.random() * 2000);
    if (selectedComuna) base = Math.floor(base * 0.3);
    if (selectedIndustry) base = Math.floor(base * 0.2);
    return Math.max(120, base);
  }, [selectedRegion, selectedComuna, selectedIndustry]);

  const handleSearch = () => {
    onSearch(selectedRegion, selectedComuna, selectedIndustry, selectedCountry);
    document.getElementById("explorador")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="gradient-hero pt-28 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[128px]" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary rounded-full blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Base de datos de Chile actualizada hoy</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Convierte Google Maps en tu{" "}
            <span className="text-primary">Motor de Ventas B2B</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            Deja de buscar manualmente. Descarga al instante listas de empresas verificadas
            por industria y región. Archivos .CSV listos para tu CRM, sin riesgos y 100% legales.
          </p>

          <p className="text-primary font-semibold text-lg mt-4">
            Más de 45,000 empresas actualizadas al {getMonthName()} 2024
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                <MapPin className="inline h-3 w-3 mr-1" />Región
              </label>
              <select
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                value={selectedRegion}
                onChange={(e) => { setSelectedRegion(e.target.value); setSelectedComuna(""); }}
              >
                <option value="">Todo Chile</option>
                {regionsChile.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                <MapPin className="inline h-3 w-3 mr-1" />Comuna
              </label>
              <select
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                value={selectedComuna}
                onChange={(e) => setSelectedComuna(e.target.value)}
                disabled={!selectedRegion}
              >
                <option value="">Todas las comunas</option>
                {currentComunas.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                <Building2 className="inline h-3 w-3 mr-1" />Industria / Rubro
              </label>
              <select
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                <option value="">Todos los rubros</option>
                {industries.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* LATAM Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                checked={includeLATAM}
                onChange={(e) => { setIncludeLATAM(e.target.checked); setSelectedLATAMCountry(""); setSelectedLATAMRegion(""); }}
              />
              <span className="text-sm text-muted-foreground">Incluir otros países de Latinoamérica</span>
            </label>
          </div>

          {includeLATAM && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-secondary/50 rounded-lg border border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">País</label>
                <select
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                  value={selectedLATAMCountry}
                  onChange={(e) => { setSelectedLATAMCountry(e.target.value); setSelectedLATAMRegion(""); }}
                >
                  <option value="">Seleccionar país</option>
                  {latinAmericaCountries.map(c => (
                    <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Región / Estado</label>
                <select
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                  value={selectedLATAMRegion}
                  onChange={(e) => setSelectedLATAMRegion(e.target.value)}
                  disabled={!selectedLATAMCountry}
                >
                  <option value="">Todas las regiones</option>
                  {latamRegions.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto gradient-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-glow"
            >
              <Search className="h-4 w-4" />
              Buscar Leads
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary animate-count-up">{estimatedCount.toLocaleString("es-CL")}</span>
              <span className="text-sm text-muted-foreground">empresas encontradas</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            No se requiere tarjeta de crédito para buscar.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
