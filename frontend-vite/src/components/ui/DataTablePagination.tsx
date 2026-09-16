import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  currentPage,
  lastPage,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps) {
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(lastPage - 1, currentPage + 1);
        i++
      )
        pages.push(i);
      if (currentPage < lastPage - 2) pages.push("...");
      pages.push(lastPage);
    }
    return pages;
  };

  const btnBase =
    "inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-4 sm:flex-row dark:border-slate-800">
      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
        <span>
          <strong>{from}</strong> à <strong>{to}</strong> sur <strong>{total}</strong>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>Lignes</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className={cn(
            btnBase,
            "px-2",
            currentPage <= 1
              ? "text-slate-300 dark:text-slate-600"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          )}
          aria-label="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            btnBase,
            "px-2",
            currentPage <= 1
              ? "text-slate-300 dark:text-slate-600"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          )}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span
              key={`e${i}`}
              className="flex h-9 w-9 items-center justify-center text-slate-400"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              type="button"
              key={`p${page}`}
              onClick={() => onPageChange(page as number)}
              className={cn(
                btnBase,
                "w-9",
                page === currentPage
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-950/30"
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className={cn(
            btnBase,
            "px-2",
            currentPage >= lastPage
              ? "text-slate-300 dark:text-slate-600"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          )}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(lastPage)}
          disabled={currentPage >= lastPage}
          className={cn(
            btnBase,
            "px-2",
            currentPage >= lastPage
              ? "text-slate-300 dark:text-slate-600"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          )}
          aria-label="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
