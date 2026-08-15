import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Loader2, X, Clock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { getSearchSuggestions } from "@/lib/products.functions";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce"; // Assumed existing

export const MarketplaceSearchBar = ({ className }: { className?: string }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useServerFn(getSearchSuggestions);
  
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => fetchSuggestions({ q: debouncedQuery }),
    enabled: debouncedQuery.length >= 2,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate({ to: '/search', search: { q: query } });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      <form onSubmit={handleSubmit} className="relative group">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="Search CloudApper products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="pl-9 pr-24 bg-surface-2 border-2 border-transparent focus-visible:border-primary/30 h-10 transition-all rounded-full"
        />
        <Button 
          type="submit" 
          size="sm" 
          className="absolute right-1 top-1 h-8 rounded-full px-4"
        >
          Search
        </Button>
      </form>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-1 border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suggestions</div>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left px-4 py-2 hover:bg-surface-2 transition-colors flex items-center gap-3"
                  onClick={() => {
                    setIsOpen(false);
                    navigate({ to: '/product/$productId', params: { productId: s.id } });
                  }}
                >
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-sm font-medium">{s.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No products found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};
