import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phone = "56944383542";
  const message = encodeURIComponent("Hola, me interesa obtener más información sobre las bases de datos de Mapadata.cl");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-whatsapp hover:scale-110 transition-transform text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg animate-float"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
