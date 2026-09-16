"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RapportsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/rapports/mouvements"); }, [router]);
  return null;
}
