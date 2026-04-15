import { Building2, Home, Truck, Monitor, ShoppingCart } from "lucide-react";

const industryItems = [
  { icon: Home, label: "Inmobiliarias" },
  { icon: Monitor, label: "Software" },
  { icon: Truck, label: "Distribuidoras" },
  { icon: Building2, label: "Constructoras" },
  { icon: ShoppingCart, label: "Retail" },
];

const IndustryStrip = () => {
  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">
          Ideal para
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {industryItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                <item.icon className="h-7 w-7 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustryStrip;
