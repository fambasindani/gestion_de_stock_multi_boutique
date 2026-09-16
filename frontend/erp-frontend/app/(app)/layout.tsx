"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/DropdownMenu";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoadingUser && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [mounted, isAuthenticated, isLoadingUser, router]);

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
          {children}
        </main>
      </div>
    </div>
  );
}