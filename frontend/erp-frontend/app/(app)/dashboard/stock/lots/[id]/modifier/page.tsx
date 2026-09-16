"use client";

import React from "react";
import { useParams } from "next/navigation";
import { LotForm } from "../../nouveau/page";

export default function ModifierLot() {
  const params = useParams<{ id: string }>();
  return <LotForm id={Number(params.id)} />;
}
