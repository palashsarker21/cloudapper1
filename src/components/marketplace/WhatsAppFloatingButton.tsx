import { MessageCircle } from "lucide-react";
import { brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export const WhatsAppFloatingButton = () => {
  const whatsappUrl = new URL(brand.social.whatsapp.url);
  whatsappUrl.searchParams.set("text", brand.social.whatsapp.message);

  return (
    <div className="fixed bottom-6 right-6 z-[60] md:bottom-8 md:right-8">
      <Button
        asChild
        size="icon"
        className="h-14 w-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:bg-[#20ba5a] hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      >
        <a
          href={whatsappUrl.toString()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact CloudApper on WhatsApp"
        >
          <MessageCircle className="h-7 w-7 fill-current" />
        </a>
      </Button>
    </div>
  );
};
