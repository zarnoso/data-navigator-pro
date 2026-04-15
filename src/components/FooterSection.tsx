import { ShieldCheck, MapPin } from "lucide-react";

const LegalSection = () => (
  <section className="py-16 bg-background">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-foreground">Compromiso Legal y Ético</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Mapadata.cl</strong> opera estrictamente bajo marcos legales de recolección
          de datos (OSINT). Toda la información comercial proveída es de carácter <strong className="text-foreground">público</strong> y
          ha sido expuesta voluntariamente por las empresas en directorios abiertos y Google Maps para ser contactadas.
          No extraemos, almacenamos ni comercializamos datos personales sensibles (RUT de personas naturales, cuentas bancarias, etc.).
          Solución 100% segura para tus estrategias de Outbound Sales en Chile.
        </p>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-10 bg-card border-t border-border">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">Mapadata<span className="text-primary">.cl</span></span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#explorador" className="hover:text-foreground transition-colors">Explorador</a>
          <a href="#soluciones" className="hover:text-foreground transition-colors">Soluciones</a>
          <a href="#precios" className="hover:text-foreground transition-colors">Precios</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2024 Mapadata.cl — Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

export { LegalSection, Footer };
