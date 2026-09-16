import { Link } from "lucide-react"; // Ou import { Link } from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  href: string;
  isActive: boolean;
  icon: LucideIcon;
  label: string;
}

export function SidebarNavItem({ href, isActive, icon: Icon, label }: SidebarNavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-white/10 text-white" 
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}

// Pour SidebarNavCollapsible et SubItem, vous pouvez utiliser les composants 
// "Collapsible" de shadcn installés précédemment.