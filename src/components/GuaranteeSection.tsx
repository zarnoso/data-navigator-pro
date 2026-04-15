import { ShieldCheck } from "lucide-react";

const GuaranteeSection = () => {
  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-card border border-primary/20 rounded-2xl p-8 text-center shadow-glow">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3 text-foreground">Garantía de Rebote</h3>
          <p className="text-muted-foreground leading-relaxed">
            Si más del <span className="text-primary font-bold">5%</span> de los correos electrónicos rebotan,
            te reponemos el <span className="text-primary font-bold">doble</span> de datos. Sin preguntas, sin letra chica.
            Tu inversión está protegida.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
