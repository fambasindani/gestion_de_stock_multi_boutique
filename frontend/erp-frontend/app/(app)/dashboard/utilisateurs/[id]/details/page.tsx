"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { utilisateursService } from "@/lib/api/services/utilisateurs.service";
import { ArrowLeft, Edit, Mail, Shield, Calendar, Loader2 } from "lucide-react";
import { formatDateLong } from "@/lib/utils/format";

export default function UtilisateurDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["utilisateur", params.id],
    queryFn: async () => {
      const r = await utilisateursService.getById(Number(params.id));
      return r.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">Utilisateur introuvable</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/utilisateurs")} className="text-gray-600 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.nom || data.email}</h1>
        <Badge className={data.actif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}>
          {data.actif ? "Actif" : "Inactif"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-500">Nom</label><p className="font-medium">{data.nom || "-"}</p></div>
              <div><label className="text-sm text-gray-500">Email</label><p className="font-medium flex items-center gap-1"><Mail className="h-3 w-3" />{data.email}</p></div>
              <div><label className="text-sm text-gray-500">Rôles</label><div className="flex gap-1 flex-wrap">{data.roles?.length ? data.roles.map((r: any) => <Badge key={r.id} variant="outline"><Shield className="h-3 w-3 mr-1" />{r.nom}</Badge>) : <span className="text-gray-400">-</span>}</div></div>
              <div><label className="text-sm text-gray-500">Créé le</label><p className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateLong(data.created_at)}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => router.push(`/dashboard/utilisateurs/nouveau?id=${data.id}`)}>
              <Edit className="h-4 w-4 mr-2" /> Modifier
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
