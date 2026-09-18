"use client";

import { Bell, LogOut, User, Settings, Menu as MenuIcon, HelpCircle, TriangleAlert, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { isDark, toggleTheme } from "@/lib/utils/theme";
import { societesService } from "@/lib/api/services/societes.service";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getActiveMenuLabel } from "./menuConfig";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { notificationsService } from "@/lib/api/services/notifications.service";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeMenuLabel = getActiveMenuLabel(pathname);
  const [dark, setDark] = useState(false);
  const [selectedSociete, setSelectedSociete] = useState("");

  useEffect(() => {
    setDark(isDark());
    if (typeof window !== "undefined") {
      setSelectedSociete(localStorage.getItem("selected_societe") || "");
    }
  }, []);
  
  // ✅ Récupérer les données de l'utilisateur et la fonction de déconnexion
  const { currentUser, logout, isLoggingOut, societe, isSuperAdmin } = useAuth();

  // ✅ Alerte abonnement : expiration dans 5 jours ou moins
  const joursRestants = useMemo(() => {
    const expiration = (societe as { date_expiration?: string | null } | null)?.date_expiration;
    if (!expiration) return null;
    const exp = new Date(expiration);
    if (Number.isNaN(exp.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  }, [societe]);

  const { data: notificationsRes } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => notificationsService.getAll(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
  const notifications = notificationsRes?.data ?? [];

  const { data: societes } = useQuery({
    queryKey: ["societes-header"],
    queryFn: async () => {
      const res = await societesService.getAll({ per_page: 100 });
      const items = (res as unknown as { data?: unknown })?.data;
      return Array.isArray(items) ? (items as { id: number; nom: string }[]) : [];
    },
    enabled: isSuperAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const abonnementAlerte = joursRestants !== null && joursRestants <= 5;
  const abonnementExpire = joursRestants !== null && joursRestants < 0;

  const messageAbo = abonnementExpire
    ? "Votre abonnement a expiré. Contactez l'administrateur."
    : `Votre abonnement expire dans ${joursRestants} jour(s).`;

  // ✅ Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      !!localStorage.getItem("auth_token")
      // La redirection est déjà gérée dans le hook useAuth
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // ✅ Récupérer les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!currentUser?.nom) return "U";
    return currentUser.nom
      .split(" ")
      .map((word: string) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ Récupérer le nom complet
  const getFullName = () => {
    return currentUser?.nom || "Utilisateur";
  };

  // ✅ Récupérer l'email
  const getEmail = () => {
    return currentUser?.email || "email@exemple.com";
  };

  // ✅ Récupérer le rôle principal
  const getPrimaryRole = () => {
    if (currentUser?.roles && currentUser.roles.length > 0) {
      return currentUser.roles[0].nom || "Utilisateur";
    }
    return "Utilisateur";
  };

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-gray-500 hover:text-gray-700"
          onClick={onMenuToggle}
        >
          <MenuIcon size={20} />
        </Button>
        {activeMenuLabel && (
          <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-200">
            {activeMenuLabel}
          </h2>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {isSuperAdmin && (
          <select
            value={selectedSociete}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedSociete(v);
              if (v) localStorage.setItem("selected_societe", v);
              else localStorage.removeItem("selected_societe");
              window.location.reload();
            }}
            title="Société ciblée"
            className="hidden h-9 max-w-[180px] rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 sm:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">Toutes les sociétés</option>
            {(societes ?? []).map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.nom}
              </option>
            ))}
          </select>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(toggleTheme())}
          className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
          title="Thème clair / sombre"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        {abonnementAlerte && (
          <Button
            variant="ghost"
            size="icon"
            title={messageAbo}
            onClick={() => toast.warning(messageAbo)}
            className={`relative ${
              abonnementExpire
                ? "text-red-600 hover:text-red-700"
                : "text-amber-500 hover:text-amber-600"
            }`}
          >
            <TriangleAlert size={20} />
            <span
              className={`absolute top-1 right-1 h-2 w-2 rounded-full ${
                abonnementExpire ? "bg-red-500" : "bg-amber-500"
              }`}
            />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 hover:text-gray-700"
              title="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Aucune notification
              </div>
            ) : (
              notifications.map((n, i) => (
                <DropdownMenuItem
                  key={`${n.type}-${i}`}
                  onSelect={() => router.push(n.link)}
                  className="cursor-pointer items-start gap-2 py-2"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.level === "danger"
                        ? "bg-red-500"
                        : n.level === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-xs text-muted-foreground">{n.message}</span>
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hidden sm:flex">
          <HelpCircle size={20} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-gray-200 hover:bg-gray-50">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs shadow-sm shadow-blue-600/30">
                {getUserInitials()}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700">
                {getFullName()}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getFullName()}</p>
                <p className="text-xs leading-none text-muted-foreground">{getEmail()}</p>
                <p className="text-xs leading-none text-blue-600 font-medium mt-1">
                  {getPrimaryRole()}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => router.push("/dashboard/profil")}
            >
              <User className="mr-2 h-4 w-4" /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => router.push("/dashboard/parametres")}
            >
              <Settings className="mr-2 h-4 w-4" /> Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              onSelect={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" /> 
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}