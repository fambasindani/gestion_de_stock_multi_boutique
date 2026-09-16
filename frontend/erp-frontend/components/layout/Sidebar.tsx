"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  Package, 
  Building2, 
  Receipt, 
  Settings, 
  Users, 
  BarChart3,
  Box,
  Tag,
  Scale,
  Warehouse,
  ClipboardList,
  FileText,
  UserCog,
  Shield,
  Key,
  ArrowLeftRight,
  Store,
  Calendar,
  DollarSign,
  Home,
  Layers,
  Boxes
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface MenuGroup {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { name: "Vue d'ensemble", href: "/dashboard" },
    ]
  },
  {
    title: "Ventes",
    icon: ShoppingCart,
    defaultOpen: false,
    items: [
      { name: "Commandes", href: "/ventes/commandes" },
      { name: "Clients", href: "/partenaires?type=client" },
      { name: "Factures client", href: "/factures?type=facture_client" },
    ]
  },
  {
    title: "Achats",
    icon: Truck,
    defaultOpen: false,
    items: [
      { name: "Commandes fournisseur", href: "/achats/commandes" },
      { name: "Réceptions", href: "/achats/receptions" },
      { name: "Fournisseurs", href: "/partenaires?type=fournisseur" },
      { name: "Factures fournisseur", href: "/factures?type=facture_fournisseur" },
    ]
  },
  {
    title: "Inventaire",
    icon: Package,
    defaultOpen: false,
    items: [
      { name: "Produits", href: "/dashboard/produits" },
      { name: "Catégories", href: "/dashboard/produits/categories" },
      { name: "Unités de mesure", href: "/dashboard/produits/unites" },
    ]
  },
  {
    title: "Stock",
    icon: Warehouse,
    defaultOpen: false,
    items: [
      { name: "Emplacements", href: "/dashboard/stock/emplacements" },
      { name: "Quantités", href: "/dashboard/stock/quantites" },
      { name: "Transferts", href: "/dashboard/stock/transferts" },
      { name: "Lots / Séries", href: "/dashboard/stock/lots" },
    ]
  },
  {
    title: "Facturation",
    icon: Receipt,
    defaultOpen: false,
    items: [
      { name: "Factures", href: "/factures" },
      { name: "Avoirs", href: "/factures/avoirs" },
      { name: "Paiements", href: "/factures/paiements" },
      { name: "Clients", href: "/partenaires?type=client" },
    ]
  },
  {
    title: "Partenaires",
    icon: Building2,
    defaultOpen: false,
    items: [
      { name: "Clients", href: "/dashboard/partenaires?type=client" },
      { name: "Fournisseurs", href: "/dashboard/partenaires?type=fournisseur" },
      { name: "Tous les partenaires", href: "/dashboard/partenaires" },
    ]
  },
  {
    title: "Utilisateurs",
    icon: Users,
    defaultOpen: false,
    items: [
      { name: "Utilisateurs", href: "/utilisateurs" },
      { name: "Rôles", href: "/utilisateurs/roles" },
      { name: "Permissions", href: "/utilisateurs/permissions" },
      { name: "Logs d'activité", href: "/rapports/logs" },
    ]
  },
  {
    title: "Rapports",
    icon: BarChart3,
    defaultOpen: false,
    items: [
      { name: "Mouvements de stock", href: "/rapports/mouvements" },
      { name: "Traçabilité", href: "/rapports/tracabilite" },
    ]
  },

];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fonction pour vérifier si un lien est actif
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <aside className={cn(
      "flex flex-col min-h-screen bg-[#1a1d21] text-gray-300 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      "border-r border-[#2d3136]"
    )}>
      {/* Logo / Header */}
      <div className={cn(
        "h-14 flex items-center border-b border-[#2d3136] bg-[#1e2125]",
        isCollapsed ? "justify-center px-2" : "px-4"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white font-bold text-sm">
            {isCollapsed ? "E" : "ERP"}
          </div>
          {!isCollapsed && (
            <span className="font-bold text-white text-base tracking-tight">
              <span className="text-blue-400">GS</span> Stock
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2d3136] scrollbar-track-transparent",
        isCollapsed ? "px-2" : "px-2"
      )}>
        {menuGroups.map((group) => (
          <Collapsible key={group.title} defaultOpen={group.defaultOpen}>
            <CollapsibleTrigger className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all",
              "hover:bg-[#2d3136] hover:text-white",
              "data-[state=open]:bg-[#2d3136] data-[state=open]:text-white",
              isCollapsed && "justify-center px-2"
            )}>
              <div className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}>
                <group.icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span>{group.title}</span>}
              </div>
              {!isCollapsed && <ChevronDown size={14} className="transition-transform data-[state=open]:rotate-180" />}
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent className="pl-9 mt-0.5 space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block py-1.5 px-2 text-xs rounded-md transition-all",
                      "text-gray-400 hover:text-white hover:bg-[#2d3136]",
                      isActive(item.href) && "text-white bg-[#2d3136] font-medium"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full",
                          item.badgeColor || "bg-blue-600 text-white"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </CollapsibleContent>
            )}
          </Collapsible>
        ))}
      </nav>

      {/* Footer / User */}
      <div className={cn(
        "border-t border-[#2d3136] p-2",
        isCollapsed ? "flex justify-center" : "px-3 py-3"
      )}>
        <div className={cn(
          "flex items-center gap-3 rounded-md p-2 transition-all",
          "hover:bg-[#2d3136] cursor-pointer"
        )}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">admin@exemple.com</p>
            </div>
          )}
          {!isCollapsed && (
            <Settings size={16} className="text-gray-400 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Bouton de collapse */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute bottom-4 right-[-12px] w-6 h-6 rounded-full bg-[#2d3136] border border-[#3d4148]",
          "flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#3d4148]",
          "transition-all duration-300"
        )}
      >
        <ArrowLeftRight size={12} className={cn(
          "transition-transform",
          isCollapsed && "rotate-180"
        )} />
      </button>
    </aside>
  );
}