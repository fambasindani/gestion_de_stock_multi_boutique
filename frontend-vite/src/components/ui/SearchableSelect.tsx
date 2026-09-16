import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  id: number;
  nom: string;
  sousTitre?: string;
  value?: string;
}

function getOptionValue(opt: SearchableOption): string {
  return opt.value !== undefined ? opt.value : String(opt.id);
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

let instanceCounter = 0;

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat",
  loading = false,
  error,
  className,
  triggerClassName,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownUp, setDropdownUp] = useState(false);
  const [maxHeight, setMaxHeight] = useState(240);
  const [pos, setPos] = useState({ top: 0, bottom: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceId = useRef(`ss_${++instanceCounter}`);

  const selected = options.find((o) => getOptionValue(o) === value);

  const filtered = search.trim()
    ? options.filter((o) => {
        const q = search.toLowerCase();
        return (
          o.nom.toLowerCase().includes(q) ||
          (o.sousTitre && o.sousTitre.toLowerCase().includes(q))
        );
      })
    : options;

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
    });

    const searchBarHeight = 44;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= searchBarHeight + gap + 40) {
      setDropdownUp(false);
      setMaxHeight(Math.min(spaceBelow - searchBarHeight - gap, 260));
    } else if (spaceAbove >= searchBarHeight + gap + 40) {
      setDropdownUp(true);
      setMaxHeight(Math.min(spaceAbove - searchBarHeight - gap, 260));
    } else {
      setDropdownUp(false);
      setMaxHeight(Math.max(spaceBelow - searchBarHeight - gap, 100));
    }
  }, []);

  const toggleOpen = () => {
    if (disabled) return;
    const next = !open;
    if (next) updatePosition();
    setOpen(next);
    if (!next) setSearch("");
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    document.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current || containerRef.current.contains(e.target as Node))
        return;
      const target = e.target as Node;
      const portalDropdown = document.getElementById(instanceId.current);
      if (portalDropdown && portalDropdown.contains(target)) return;
      setOpen(false);
      setSearch("");
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSelect = (opt: SearchableOption) => {
    onValueChange(getOptionValue(opt));
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        onClick={toggleOpen}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600",
          triggerClassName,
          error && "border-red-400",
          disabled && "cursor-not-allowed opacity-50",
          open && "border-blue-500 ring-4 ring-blue-500/10"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
        )}
        <span className={cn("flex-1 truncate", !selected && "text-slate-400")}>
          {selected?.sousTitre && (
            <span className="mr-1 font-mono text-xs text-slate-500">
              {selected.sousTitre}
            </span>
          )}
          {selected ? selected.nom : placeholder}
        </span>
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              open && "rotate-180"
            )}
          />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {open &&
        createPortal(
          <div
            id={instanceId.current}
            style={{
              position: "fixed",
              top: dropdownUp ? pos.top - maxHeight - 48 : pos.bottom + 4,
              left: pos.left,
              width: pos.width,
              zIndex: 99999,
            }}
            className="animate-in fade-in overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl duration-150 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="border-b border-slate-100 p-2 dark:border-slate-800">
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-400">
                  {emptyMessage}
                </div>
              ) : (
                filtered.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors",
                      getOptionValue(opt) === value
                        ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    )}
                  >
                    <span className="flex-1 truncate">{opt.nom}</span>
                    {opt.sousTitre && (
                      <span className="shrink-0 text-xs text-slate-400">
                        {opt.sousTitre}
                      </span>
                    )}
                    {getOptionValue(opt) === value && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
