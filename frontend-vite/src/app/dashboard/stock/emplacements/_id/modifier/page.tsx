"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EmplacementForm } from "../../nouveau/page";

export default function ModifierEmplacementPage() {
  const params = useParams<{ id: string }>();
  return <EmplacementForm id={Number(params.id)} />;
}
