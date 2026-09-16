"use client";

import React from "react";
import { useParams } from "next/navigation";
import { FactureForm } from "../../nouveau/page";

export default function ModifierFacturePage() {
  const params = useParams<{ id: string }>();
  return <FactureForm id={Number(params.id)} />;
}
