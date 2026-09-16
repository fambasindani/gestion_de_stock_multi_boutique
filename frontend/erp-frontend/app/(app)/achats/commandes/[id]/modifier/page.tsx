"use client";

import { useParams } from "next/navigation";
import CommandeAchatForm from "../../nouveau/page";

export default function ModifierCommandeAchatPage() {
  const params = useParams<{ id: string }>();
  return <CommandeAchatForm id={Number(params.id)} />;
}
