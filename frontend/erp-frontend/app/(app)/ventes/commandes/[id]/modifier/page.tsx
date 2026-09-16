"use client";

import { useParams } from "next/navigation";
import CommandeVenteForm from "../../nouveau/page";

export default function ModifierCommandeVentePage() {
  const params = useParams<{ id: string }>();
  return <CommandeVenteForm id={Number(params.id)} />;
}
