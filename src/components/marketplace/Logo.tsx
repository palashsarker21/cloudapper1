import { brand } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'wordmark';
  theme?: 'light' | 'dark' | 'auto';
  onClick?: () => void;
}

export function Logo({ className, variant = 'full', theme = 'auto', onClick }: LogoProps) {
  return (
    <div 
      className={cn("flex items-center cursor-pointer select-none", className)}
      onClick={onClick}
    >
      {(variant === 'full' || variant === 'icon') && (
        <img 
          src={brand.logo} 
          alt={brand.name} 
          width={variant === 'full' ? 32 : 40}
          height={variant === 'full' ? 32 : 40}
          className={cn(
            "object-contain transition-transform hover:scale-105",
            variant === 'full' ? "h-8 w-auto mr-2" : (variant === 'icon' ? (className?.includes('h-24') ? "h-24 w-24" : "h-10 w-10") : "h-10 w-10")
          )}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      {(variant === 'full' || variant === 'wordmark') && (
        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-[var(--brand-gradient)]">
          {brand.name}
        </span>
      )}
    </div>
  );
}
