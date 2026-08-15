import { MessageCircle } from "lucide-react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  className?: string;
  iconOnly?: boolean;
  showLabels?: boolean;
}

const FacebookIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978 1.602 0 2.703.096 2.703.096v3.316h-1.617c-1.91 0-2.303 1.17-2.303 2.387v1.759h3.628l-.527 3.667H13.74v7.98h-4.639z" />
  </svg>
);

export const SocialLinks = ({ className, iconOnly = false, showLabels = true }: SocialLinksProps) => {
  const whatsappUrl = new URL("https://wa.me/8801557749217");
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
      icon: FacebookIcon,
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
