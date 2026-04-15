import { Check, Star } from "lucide-react";
import { pricingPlans, type PricingPlan } from "@/data/pricing";

interface PricingSectionProps {
  onBuy: (plan: PricingPlan) => void;
}

const PricingSection = ({ onBuy }: PricingSectionProps) => {
  return (
    <section id="precios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Paga solo por la data que necesitas</h2>
          <p className="text-muted-foreground">1 Empresa = Toda su información pública disponible. Sin suscripciones forzadas.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card border rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-glow ${
                plan.popular ? "border-primary shadow-glow" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Más Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-1">Plan {plan.name}</h3>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-foreground">{plan.priceFormatted}</span>
                <span className="text-sm text-muted-foreground ml-1">CLP</span>
              </div>

              <p className="text-primary font-semibold mb-4 text-lg">{plan.empresas.toLocaleString("es-CL")} Empresas</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onBuy(plan)}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                  plan.popular
                    ? "gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                Comprar Pack
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
