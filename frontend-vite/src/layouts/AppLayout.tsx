import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/DropdownMenu";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const { isAuthenticated, isLoadingUser, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Le compte plateforme (super-admin) n'a accès qu'à la gestion des sociétés
  useEffect(() => {
    if (isSuperAdmin && location.pathname === "/dashboard") {
      navigate("/dashboard/societes", { replace: true });
    }
  }, [isSuperAdmin, location.pathname, navigate]);

  useEffect(() => {
    if (mounted && !isLoadingUser && !isAuthenticated) {
      navigate("/auth/login", { replace: true });
    }
  }, [mounted, isAuthenticated, isLoadingUser, navigate]);

  if (!mounted || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader portalTitle="GS Stock ERP" />
        <main className="flex-1 p-4 md:p-6 lg:p-8 page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
