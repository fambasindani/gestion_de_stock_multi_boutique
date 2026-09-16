"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Power,
  PowerOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// ============================================
// TYPES
// ============================================

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hidden?: boolean | "sm" | "md" | "lg" | "xl";
  sortable?: boolean;
}

export interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  className?: string;
  show?: (item: T) => boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  pagination?: PaginationProps;
  selectable?: boolean;
  selectedIds?: number[];
  onSelect?: (id: number) => void;
  onSelectAll?: () => void;
  rowKey?: keyof T;
  className?: string;
}

// Type pour la valeur d'une propriété imbriquée
type NestedValue<T> = T[keyof T] | undefined;

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function DataTable<T extends { [key: string]: any }>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "Aucune donnée trouvée",
  emptyIcon,
  searchable = false,
  searchPlaceholder = "Rechercher...",
  onSearch,
  searchValue = "",
  pagination,
  selectable = false,
  selectedIds = [],
  onSelect,
  onSelectAll,
  rowKey = "id" as keyof T,
  className = "",
}: DataTableProps<T>) {
  // Fonction pour obtenir la valeur d'une colonne (supporte les objets imbriqués)
  const getValue = (item: T, key: string): unknown => {
    const keys = key.split(".");
    let value: unknown = item;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return value;
  };

  // Fonction pour obtenir les classes de visibilité responsive
  const getResponsiveClass = (hidden?: boolean | string): string => {
    if (!hidden) return "";
    if (typeof hidden === "string") {
      const classes: Record<string, string> = {
        sm: "hidden sm:table-cell",
        md: "hidden md:table-cell",
        lg: "hidden lg:table-cell",
        xl: "hidden xl:table-cell",
      };
      return classes[hidden] || "";
    }
    return "";
  };

  // Fonction pour obtenir la clé d'un élément
  const getRowKey = (item: T): string => {
    const key = rowKey as string;
    const value = getValue(item, key);
    return String(value ?? "");
  };

  // Vérifier si toutes les lignes sont sélectionnées
  const allSelected =
    data.length > 0 &&
    data.every((item) => {
      const id = getValue(item, String(rowKey));
      return typeof id === "number" && selectedIds.includes(id);
    });

  // Composant de chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-sm text-gray-500">Chargement...</p>
      </div>
    );
  }

  // Composant vide
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon ? (
          <div className="h-12 w-12 text-gray-300">{emptyIcon}</div>
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {emptyMessage}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aucun élément à afficher.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search */}
      {searchable && onSearch && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {pagination && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">
                Total: {pagination.totalItems}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
              {selectable && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={`font-semibold ${getResponsiveClass(col.hidden)} ${
                    col.className || ""
                  }`}
                >
                  {col.label}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="text-right font-semibold">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const rowId = getRowKey(item);
              const itemId = getValue(item, String(rowKey));
              const isSelected = typeof itemId === "number" && selectedIds.includes(itemId);

              return (
                <TableRow
                  key={rowId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {selectable && onSelect && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (typeof itemId === "number") {
                            onSelect(itemId);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => {
                    const value = getValue(item, String(col.key));
                    return (
                      <TableCell
                        key={String(col.key)}
                        className={`${getResponsiveClass(col.hidden)} ${
                          col.className || ""
                        }`}
                      >
                        {col.render ? col.render(item) : 
                          value !== undefined && value !== null ? String(value) : "-"}
                      </TableCell>
                    );
                  })}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, index) => {
                          const shouldShow = action.show ? action.show(item) : true;
                          if (!shouldShow) return null;
                          return (
                            <Button
                              key={index}
                              variant={action.variant || "ghost"}
                              size="sm"
                              className={`h-9 w-9 p-0 ${
                                action.className || ""
                              }`}
                              onClick={() => action.onClick(item)}
                              title={action.label}
                            >
                              {action.icon || (
                                <span className="text-xs">{action.label}</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-500">
            Affichage de{" "}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.perPage + 1}
            </span>{" "}
            à{" "}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.totalItems
              )}
            </span>{" "}
            sur{" "}
            <span className="font-medium">{pagination.totalItems}</span> résultats
          </div>
          <div className="flex items-center gap-4">
            {pagination.onPerPageChange && pagination.perPageOptions && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Afficher</span>
                <Select
                  value={String(pagination.perPage)}
                  onValueChange={(value) =>
                    pagination.onPerPageChange?.(Number(value))
                  }
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pagination.perPageOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">par page</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage <= 1}
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage - 1)
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={
                        pagination.currentPage === page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => pagination.onPageChange(page)}
                      className={
                        pagination.currentPage === page
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  );
                }
              )}
              {pagination.totalPages > 5 && (
                <>
                  <Button variant="outline" size="sm" disabled>
                    ...
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      pagination.onPageChange(pagination.totalPages)
                    }
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage + 1)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPOSANT BADGE POUR DATATABLE
// ============================================

export const DataTableBadge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}> = ({ children, variant = "default" }) => {
  const variants: Record<string, string> = {
    default: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    outline: "bg-transparent border-gray-300 dark:border-gray-700",
  };

  return (
    <Badge variant="outline" className={variants[variant]}>
      {children}
    </Badge>
  );
};

// ============================================
// COMPOSANTS D'ACTIONS PRÉDÉFINIS (AVEC ICÔNES AGRANDIES)
// ============================================

export const createViewAction = <T extends Record<string, unknown>>(
  onClick: (item: T) => void,
  label: string = "Voir"
): Action<T> => ({
  label,
  icon: <Eye className="h-5 w-5" />,
  onClick,
  variant: "ghost",
  className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30",
});

export const createEditAction = <T extends Record<string, unknown>>(
  onClick: (item: T) => void,
  label: string = "Modifier"
): Action<T> => ({
  label,
  icon: <Pencil className="h-5 w-5" />,
  onClick,
  variant: "ghost",
  className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30",
});

export const createDeleteAction = <T extends Record<string, unknown>>(
  onClick: (item: T) => void,
  label: string = "Supprimer"
): Action<T> => ({
  label,
  icon: <Trash2 className="h-5 w-5" />,
  onClick,
  variant: "ghost",
  className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
});

// ✅ NOUVELLES ACTIONS POUR ACTIVER/DÉSACTIVER
export const createActiverAction = <T extends { actif?: number }>(
  onClick: (item: T) => void,
  label: string = "Activer"
): Action<T> => ({
  label,
  icon: <Power className="h-5 w-5" />,
  onClick,
  variant: "ghost",
  className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
  show: (item: T) => item.actif === 0,
});

export const createDesactiverAction = <T extends { actif?: number }>(
  onClick: (item: T) => void,
  label: string = "Désactiver"
): Action<T> => ({
  label,
  icon: <PowerOff className="h-5 w-5" />,
  onClick,
  variant: "ghost",
  className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
  show: (item: T) => item.actif === 1,
});