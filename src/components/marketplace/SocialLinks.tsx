import { MessageCircle, Facebook } from "lucide-react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  className?: string;
  iconOnly?: boolean;
  showLabels?: boolean;
}

export const SocialLinks = ({ className, iconOnly = false, showLabels = true }: SocialLinksProps) => {
  const whatsappUrl = new URL(brand.social.whatsapp.url);
  whatsappUrl.searchParams.set("text", brand.social.whatsapp.message);

  const links = [
    {
      name: "WhatsApp",
      url: whatsappUrl.toString(),
      icon: MessageCircle,
      label: brand.social.whatsapp.number,
      aria: "Contact CloudApper on WhatsApp",
      color: "hover:text-[#25D366]",
    },
    {
      name: "Facebook",
      url: brand.social.facebook.url,
      icon: Facebook,
      label: "CloudApper",
      aria: "Visit CloudApper on Facebook",
      color: "hover:text-[#1877F2]",
    },
  ];

  if (iconOnly) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.aria}
            className={cn("text-muted-foreground transition-colors", link.color)}
          >
            <link.icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.aria}
          className={cn("flex items-center gap-3 text-sm text-muted-foreground transition-colors group", link.color)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 group-hover:bg-surface-3 transition-colors">
            <link.icon className="h-4 w-4" />
          </div>
          {showLabels && (
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{link.name}</span>
              <span className="text-xs">{link.label}</span>
            </div>
          )}
        </a>
      ))}
    </div>
  );
};
