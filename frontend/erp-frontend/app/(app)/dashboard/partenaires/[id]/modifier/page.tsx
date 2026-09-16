"use client";


import { useParams } from "next/navigation";
import PartenaireForm from "../../nouveau/page";

export default function ModifierPartenairePage() {
  const params = useParams<{ id: string }>();
  return <PartenaireForm id={Number(params.id)} />;
}