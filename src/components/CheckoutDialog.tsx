import { useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { type PricingPlan } from "@/data/pricing";
import { formatRut, validateRut } from "@/lib/rut-validator";

interface CheckoutDialogProps {
  plan: PricingPlan | null;
  onClose: () => void;
}

const CheckoutDialog = ({ plan, onClose }: CheckoutDialogProps) => {
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [wantInvoice, setWantInvoice] = useState(false);
  const [rutError, setRutError] = useState("");

  if (!plan) return null;

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    setRut(formatted);
    if (formatted.length > 3) {
      setRutError(validateRut(formatted) ? "" : "RUT inválido");
    } else {
      setRutError("");
    }
  };

  const isValid = name.trim().length > 0 && email.includes("@") && rut.length > 3 && !rutError;

  const handlePay = () => {
    if (!isValid) return;
    window.open(plan.mercadoPagoUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 shadow-card max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Resumen de Compra</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-foreground text-lg">Plan {plan.name}</p>
              <p className="text-sm text-primary">{plan.empresas.toLocaleString("es-CL")} Empresas</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-foreground">{plan.priceFormatted}</p>
              <p className="text-xs text-muted-foreground">CLP</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre completo</label>
            <input
              type="text"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Juan Pérez"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">RUT</label>
            <input
              type="text"
              className={`w-full bg-secondary border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none ${rutError ? "border-destructive" : "border-border"}`}
              placeholder="12.345.678-9"
              value={rut}
              onChange={e => handleRutChange(e.target.value)}
              maxLength={12}
            />
            {rutError && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {rutError}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Correo electrónico</label>
            <input
              type="email"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="correo@empresa.cl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-secondary/50 rounded-lg border border-border">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              checked={wantInvoice}
              onChange={e => setWantInvoice(e.target.checked)}
            />
            <span className="text-sm text-foreground">Necesito factura</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={handlePay}
            disabled={!isValid}
            className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isValid
                ? "gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Pagar con MercadoPago
          </button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Serás redirigido a MercadoPago para completar tu pago de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDialog;
