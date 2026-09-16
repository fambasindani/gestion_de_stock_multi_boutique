"use client";

import { Bell, LogOut, User, Settings, Menu as MenuIcon, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  portalTitle: string;
  onMenuToggle?: () => void;
}

export function AppHeader({ portalTitle, onMenuToggle }: AppHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ Récupérer les données de l'utilisateur et la fonction de déconnexion
  const { currentUser, logout, isLoggingOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
        <h2 className="font-semibold text-gray-700 text-lg hidden sm:block">
          {portalTitle}
        </h2>
        <div className="hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48 lg:w-64 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white"
            />
          </form>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

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