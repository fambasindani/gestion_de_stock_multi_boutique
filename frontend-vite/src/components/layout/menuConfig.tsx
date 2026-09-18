"use client";

import {
  ShoppingCart,
  Truck,
  Package,
  ClipboardList,
  Warehouse,
  Receipt,
  Building2,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";

export interface MenuItem {
  name: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  permission?: string;
}

export interface MenuGroup {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    title: "Ventes",
    icon: ShoppingCart,
    items: [
      { name: "Vente comptoir (POS)", href: "/dashboard/pos", permission: "vendre_pos" },
      { name: "Commandes", href: "/ventes/commandes", permission: "voir_commandes" },
      { name: "Clients", href: "/partenaires?type=client", permission: "voir_partenaires" },
      { name: "Factures client", href: "/factures?type=facture_client", permission: "voir_factures" },
    ],
  },
  {
    title: "Achats",
    icon: Truck,
    items: [
      { name: "Commandes fournisseur", href: "/achats/commandes", permission: "gerer_achats" },
      { name: "Réceptions", href: "/achats/receptions", permission: "gerer_achats" },
      { name: "Fournisseurs", href: "/partenaires?type=fournisseur", permission: "voir_partenaires" },
      { name: "Rapport bons de commande", href: "/rapports/bons-commande", permission: "voir_rapports" },
    ],
  },
  {
    title: "Catalogue",
    icon: Package,
    items: [
      { name: "Produits", href: "/dashboard/produits", permission: "voir_produits" },
      { name: "Catégories", href: "/dashboard/produits/categories", permission: "voir_categories" },
      { name: "Unités de mesure", href: "/dashboard/produits/unites", permission: "voir_unites" },
    ],
  },
  {
    title: "Inventaire",
    icon: ClipboardList,
    items: [
      { name: "Sessions d'inventaire", href: "/dashboard/inventaire", permission: "voir_inventaire" },
    ],
  },
  {
    title: "Stock",
    icon: Warehouse,
    items: [
      { name: "Emplacements", href: "/dashboard/stock/emplacements", permission: "voir_emplacements" },
      { name: "Quantités", href: "/dashboard/stock/quantites", permission: "voir_stock" },
      { name: "Transferts", href: "/dashboard/stock/transferts", permission: "voir_stock" },
      { name: "Retours", href: "/dashboard/retours", permission: "voir_retours" },
      { name: "Lots / Séries", href: "/dashboard/stock/lots", permission: "voir_lots" },
    ],
  },
  {
    title: "Facturation",
    icon: Receipt,
    items: [
      { name: "Factures", href: "/factures", permission: "voir_factures" },
      { name: "Avoirs", href: "/factures/avoirs", permission: "voir_factures" },
      { name: "Paiements", href: "/factures/paiements", permission: "voir_factures" },
      { name: "Clients", href: "/partenaires?type=client", permission: "voir_partenaires" },
    ],
  },
  {
    title: "Partenaires",
    icon: Building2,
    items: [
      { name: "Clients", href: "/dashboard/partenaires?type=client", permission: "voir_partenaires" },
      { name: "Fournisseurs", href: "/dashboard/partenaires?type=fournisseur", permission: "voir_partenaires" },
      { name: "Tous les partenaires", href: "/dashboard/partenaires", permission: "voir_partenaires" },
    ],
  },
  {
    title: "Utilisateurs",
    icon: Users,
    items: [
      { name: "Utilisateurs", href: "/utilisateurs", permission: "gerer_utilisateurs" },
      { name: "Rôles", href: "/utilisateurs/roles", permission: "gerer_roles" },
      { name: "Permissions", href: "/utilisateurs/permissions", permission: "gerer_permissions" },
      { name: "Logs d'activité", href: "/rapports/logs", permission: "gerer_utilisateurs" },
    ],
  },
  {
    title: "Configuration",
    icon: Settings,
    items: [
      { name: "Paramètres (TVA)", href: "/dashboard/parametres", permission: "gerer_parametres" },
    ],
  },
  {
    title: "Rapports",
    icon: BarChart3,
    items: [
      { name: "Ventes par vendeur", href: "/rapports/ventes-vendeurs", permission: "voir_rapports" },
      { name: "Bons de commande", href: "/rapports/bons-commande", permission: "voir_rapports" },
      { name: "Rapport de stock", href: "/rapports/stock", permission: "voir_rapports" },
      { name: "Rupture de stock", href: "/rapports/rupture-stock", permission: "voir_rapports" },
      { name: "Stock bas", href: "/rapports/stock-bas", permission: "voir_rapports" },
      { name: "Variations de prix", href: "/rapports/variations-prix", permission: "voir_rapports" },
      { name: "CA par client", href: "/rapports/ca-partenaires?type=client", permission: "voir_rapports" },
      { name: "Achats par fournisseur", href: "/rapports/ca-partenaires?type=fournisseur", permission: "voir_rapports" },
      { name: "Mouvements de stock", href: "/rapports/mouvements", permission: "voir_rapports" },
      { name: "Traçabilité", href: "/rapports/tracabilite", permission: "voir_rapports" },
    ],
  },
];

function isActiveHref(href: string, pathname: string): boolean {
  const path = href.split("?")[0];
  if (path === "/dashboard") return pathname === "/dashboard";
  return pathname === path || (pathname?.startsWith(path + "/") ?? false);
}

/**
 * Libellé du menu actif (élément sélectionné), sinon du groupe.
 * Utilisé dans le header pour refléter la sélection du sidebar.
 */
export function getActiveMenuLabel(pathname: string): string | null {
  if (!pathname) return null;
  if (pathname === "/dashboard") return "Tableau de bord";
  if (pathname === "/dashboard/societes") return "Sociétés";

  for (const group of menuGroups) {
    const item = group.items.find((i) => isActiveHref(i.href, pathname));
    if (item) return item.name;
  }

  const group = menuGroups.find((g) => g.items.some((i) => isActiveHref(i.href, pathname)));
  return group?.title ?? null;
}
