import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/utils/format";

type StatColor =
  | "blue"
  | "indigo"
  | "violet"
  | "amber"
  | "emerald"
  | "rose"
  | "sky"
  | "cyan";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: StatColor;
  hint?: string;
  onClick?: () => void;
}

const colorVariants: Record<
  StatColor,
  { bar: string; badge: string; glow: string }
> = {
  blue: {
    bar: "from-blue-400 to-blue-600",
    badge: "bg-gradient-to-br from-blue-500 to-blue-700",
    glow: "shadow-blue-600/30",
  },
  indigo: {
    bar: "from-indigo-400 to-indigo-600",
    badge: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    glow: "shadow-indigo-600/30",
  },
  violet: {
    bar: "from-violet-400 to-violet-600",
    badge: "bg-gradient-to-br from-violet-500 to-violet-700",
    glow: "shadow-violet-600/30",
  },
  amber: {
    bar: "from-amber-400 to-orange-500",
    badge: "bg-gradient-to-br from-amber-500 to-orange-600",
    glow: "shadow-orange-600/30",
  },
  emerald: {
    bar: "from-emerald-400 to-green-600",
    badge: "bg-gradient-to-br from-emerald-500 to-green-700",
    glow: "shadow-green-600/30",
  },
  rose: {
    bar: "from-rose-400 to-red-600",
    badge: "bg-gradient-to-br from-rose-500 to-red-700",
    glow: "shadow-red-600/30",
  },
  sky: {
    bar: "from-sky-400 to-sky-600",
    badge: "bg-gradient-to-br from-sky-500 to-sky-700",
    glow: "shadow-sky-600/30",
  },
  cyan: {
    bar: "from-cyan-400 to-cyan-600",
    badge: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    glow: "shadow-cyan-600/30",
  },
};

export function StatCard({
  title,
  value,
  icon,
  color = "blue",
  hint,
  onClick,
}: StatCardProps) {
  const colors = colorVariants[color];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        onClick && "cursor-pointer"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          colors.bar
        )}
      />
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p className="mt-1.5 text-3xl font-extrabold leading-none text-slate-900 dark:text-white">
              {typeof value === "number" ? formatCompact(value) : value}
            </p>
            {hint && (
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {hint}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
              colors.badge,
              colors.glow
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
