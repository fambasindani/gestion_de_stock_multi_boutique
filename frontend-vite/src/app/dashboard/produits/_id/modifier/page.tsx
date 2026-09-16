"use client";

import { useParams } from "next/navigation";
import ProduitForm from "../../nouveau/page";

export default function ModifierProduitPage() {
  const params = useParams<{ id: string }>();
  return <ProduitForm id={Number(params.id)} />;
}
