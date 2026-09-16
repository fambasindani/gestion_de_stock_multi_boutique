import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import App from "./App";
import "./globals.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <QueryProvider>
      <App />
      <Toaster position="top-right" richColors />
    </QueryProvider>
  </StrictMode>
);
