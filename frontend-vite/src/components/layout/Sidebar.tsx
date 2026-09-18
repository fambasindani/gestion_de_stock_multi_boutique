"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { resolveLogoUrl } from "@/lib/utils/assets";

import { menuGroups, type MenuGroup } from "./menuConfig";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, permissions, isSuperAdmin, societe } = useAuth();
  const canManageSocietes = isSuperAdmin || permissions.includes("gerer_societes");
  const logoUrl = resolveLogoUrl(societe);
  const societeNom = societe?.nom || "GS Stock";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname === path || (pathname?.startsWith(path + "/") ?? false);
  };

  // Menu filtré par permissions de l'utilisateur
  const visibleGroups = useMemo(
    () =>
      menuGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => !i.permission || permissions.includes(i.permission)),
        }))
        .filter((g) => g.items.length > 0),
    [permissions]
  );

  const groupActive = (group: MenuGroup) => group.items.some((i) => isActive(i.href));
  const activeGroup = visibleGroups.find(groupActive)?.title ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);

  useEffect(() => {
    setOpenGroup(activeGroup);
  }, [activeGroup]);

  const initials = currentUser?.nom
    ? currentUser.nom
        .split(" ")
        .map((w: string) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";
  const fullName = currentUser?.nom || "Administrateur";
  const email = currentUser?.email || "admin@exemple.com";

  return (
    <aside
      className={cn(
        "relative flex min-h-screen flex-col border-r border-white/5 bg-gradient-to-b from-[#1b1e23] to-[#15181d] text-slate-300 transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/5",
          isCollapsed ? "justify-center px-2" : "px-4"
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90",
            isCollapsed && "justify-center"
          )}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={societeNom}
              className={cn(
                "shrink-0 object-contain",
                isCollapsed ? "h-9 w-9" : "h-10 w-auto max-w-[160px]"
              )}
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/40">
              {isCollapsed ? "G" : "GS"}
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold tracking-tight text-white">{societeNom}</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Gestion de stock
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {/* Direct link (masqué pour le compte plateforme) */}
        {!isSuperAdmin && (
        <Link
          href="/dashboard"
          title={isCollapsed ? "Tableau de bord" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
            isCollapsed && "justify-center px-0",
            isActive("/dashboard")
              ? "bg-gradient-to-r from-blue-500/20 to-transparent text-white ring-1 ring-inset ring-blue-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}
        >
          <LayoutDashboard size={18} className="shrink-0" />
          {!isCollapsed && <span>Tableau de bord</span>}
        </Link>
        )}

        {canManageSocietes && (
          <Link
            href="/dashboard/societes"
            title={isCollapsed ? "Sociétés & abonnements" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
              isCollapsed && "justify-center px-0",
              isActive("/dashboard/societes")
                ? "bg-gradient-to-r from-blue-500/20 to-transparent text-white ring-1 ring-inset ring-blue-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Building2 size={18} className="shrink-0" />
            {!isCollapsed && <span>Sociétés</span>}
          </Link>
        )}

        {!isSuperAdmin && visibleGroups.map((group) => {
          const active = groupActive(group);
          const open = openGroup === group.title;

          if (isCollapsed) {
            return (
              <button
                key={group.title}
                type="button"
                title={group.title}
                onClick={() => router.push(group.items[0].href)}
                className={cn(
                  "flex w-full items-center justify-center rounded-xl px-0 py-2.5 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <group.icon size={18} className="shrink-0" />
              </button>
            );
          }

          return (
            <Collapsible
              key={group.title}
              open={open}
              onOpenChange={(o) => setOpenGroup(o ? group.title : null)}
            >
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                  open || active
                    ? "text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                  open && "bg-white/5"
                )}
              >
                <group.icon
                  size={18}
                  className={cn("shrink-0", active && "text-blue-400")}
                />
                <span className="flex-1 text-left">{group.title}</span>
                <ChevronDown
                  size={15}
                  className={cn(
                    "shrink-0 text-slate-500 transition-transform duration-200",
                    open && "rotate-180 text-slate-300"
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden">
                <div className="ml-[22px] mt-1 space-y-0.5 border-l border-white/[0.07] pl-3">
                  {group.items.map((item) => {
                    const itemActive = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "relative flex items-center justify-between rounded-lg py-2 pl-3 pr-2 text-[12.5px] transition-all duration-150",
                          itemActive
                            ? "bg-gradient-to-r from-blue-500/20 to-transparent font-medium text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                        )}
                      >
                        {itemActive && (
                          <span className="absolute -left-[13px] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_8px] shadow-blue-500/60" />
                        )}
                        <span className="flex items-center gap-2 truncate">
                          <ChevronRight
                            size={12}
                            className={cn(
                              "shrink-0 transition-opacity",
                              itemActive ? "text-blue-400 opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{item.name}</span>
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px]",
                              item.badgeColor || "bg-blue-600 text-white"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* Utilisateur */}
      <div className={cn("border-t border-white/5 p-3", isCollapsed && "px-2")}>
        <Link
          href="/dashboard/profil"
          title="Mon profil"
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-600/30">
            {initials}
          </div>
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white">{fullName}</p>
                <p className="truncate text-[11px] text-slate-500">{email}</p>
              </div>
              <Settings size={15} className="shrink-0 text-slate-500" />
            </>
          )}
        </Link>
      </div>

      {/* Bouton replier */}
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#2a2e35] text-slate-300 shadow-md transition-colors hover:bg-[#343943] hover:text-white"
        aria-label={isCollapsed ? "Déplier" : "Replier"}
      >
        <ArrowLeftRight size={12} className={cn("transition-transform", isCollapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
