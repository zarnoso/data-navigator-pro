import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "¿Es legal comprar estas bases de datos?",
    answer: "Sí. Toda la información que comercializamos es de carácter público (OSINT). Las empresas publican voluntariamente sus datos en Google Maps y directorios abiertos para ser contactadas. Operamos bajo la Ley 19.628 de Protección de Datos y no recopilamos datos personales sensibles.",
  },
  {
    question: "¿En qué formato se entregan los datos?",
    answer: "Los datos se entregan en formato .CSV (Comma Separated Values), compatible con Excel, Google Sheets, HubSpot, Salesforce y cualquier CRM del mercado. Los planes avanzados también incluyen formato Excel (.xlsx).",
  },
  {
    question: "¿Cada cuánto se actualizan los datos?",
    answer: "Nuestra base de datos se actualiza diariamente con información fresca de Google Maps. Cada registro incluye una marca de verificación que indica la fecha de la última actualización.",
  },
  {
    question: "¿Qué información incluye cada empresa?",
    answer: "Cada registro incluye: nombre comercial, categoría/rubro, dirección completa, teléfono, sitio web, email (cuando está disponible), rating de Google, coordenadas GPS y redes sociales.",
  },
  {
    question: "¿Qué pasa si los datos no son correctos?",
    answer: "Ofrecemos una Garantía de Rebote: si más del 5% de los correos electrónicos rebotan, te reponemos el doble de datos sin costo adicional.",
  },
  {
    question: "¿Puedo elegir datos de otros países de Latinoamérica?",
    answer: "Sí. Además de Chile, puedes seleccionar empresas de Argentina, Perú, Colombia, México, Brasil, Ecuador, Bolivia, Paraguay, Uruguay, Panamá y Costa Rica, con subdivisión por regiones y ciudades.",
  },
  {
    question: "¿Cómo recibo los datos después de pagar?",
    answer: "Después de completar tu pago vía MercadoPago, recibirás un enlace de descarga inmediata por correo electrónico. También podrás descargar el archivo directamente desde la confirmación de compra.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Preguntas Frecuentes</h2>
          <p className="text-muted-foreground">Todo lo que necesitas saber sobre nuestro servicio.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
