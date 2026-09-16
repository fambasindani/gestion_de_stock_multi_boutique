import { cn } from "@/lib/utils";
import { LucideIcon, ChevronDown } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

interface SidebarNavCollapsibleProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function SidebarNavCollapsible({ 
  label, 
  icon: Icon, 
  isActive, 
  open, 
  onOpenChange, 
  children 
}: SidebarNavCollapsibleProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all",
        isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
      )}>
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 mt-1 space-y-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface SidebarNavSubItemProps {
  href: string;
  isActive: boolean;
  icon: LucideIcon;
  label: string;
}

export function SidebarNavSubItem({ href, isActive, icon: Icon, label }: SidebarNavSubItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive 
          ? "bg-white/20 text-white" 
          : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}