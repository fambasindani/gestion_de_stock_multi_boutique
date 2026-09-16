import type { ReactElement } from "react";

/**
 * Génère un PDF à partir d'un document @react-pdf/renderer et déclenche le téléchargement.
 */
/**
 * Génère un PDF (@react-pdf/renderer) et ouvre la boîte d'impression du navigateur.
 * Utile pour imprimer un ticket sur une imprimante matricielle.
 */
export async function printElementAsPdf(element: ReactElement): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(element as any).toBlob();
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
  });
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // ignore
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 60000);
  };
  document.body.appendChild(iframe);
}

export async function saveElementAsPdf(
  element: ReactElement,
  filename: string
): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(element as any).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
