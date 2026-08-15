import { BrandConfig } from "./types-guide";

export const brand = {
  name: "CloudApper",
  url: "https://cloudapper.online",
  logo: "/brand/cloudapper-logo.png",
  colors: {
    primary: "oklch(0.65 0.25 240)", 
    primaryHover: "oklch(0.7 0.2 245)",
    primaryActive: "oklch(0.6 0.3 235)",
    secondary: "oklch(0.2 0.1 260)",
    accent: "oklch(0.55 0.3 320)",
    surface: "oklch(0.15 0.05 260)",
    success: "oklch(0.7 0.2 150)",
    warning: "oklch(0.8 0.15 80)",
    error: "oklch(0.6 0.25 25)",
    info: "oklch(0.7 0.15 220)",
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
  },
  social: {
    ogImage: "https://cloudapper.online/brand/og-image.png",
    whatsapp: {
      number: "+8801557749217",
      url: "https://wa.me/8801557749217",
      message: "Hello CloudApper, I need help with your products.",
    },
    facebook: {
      url: "https://www.facebook.com/cloudapper",
      handle: "cloudapper",
    },
  },
  products: {
    primary: {
      id: "lovable-unlimited-credits", // Slug-based reference
      name: "Lovable Unlimited Credits Extension",
      category: "Extensions",
    }
  }
};
