"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, Scan } from "lucide-react";

interface BarcodeScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (value: string) => void;
}

export function BarcodeScannerModal({ open, onOpenChange, onScan }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const scanningRef = useRef(false);
  const [status, setStatus] = useState<"init" | "scanning" | "error" | "unsupported">("init");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) {
      stopCamera();
      setStatus("init");
      return;
    }
    startCamera();
    return () => { stopCamera(); };
  }, [open]);

  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    if (!("BarcodeDetector" in window)) {
      setStatus("unsupported");
      return;
    }
    try {
      detectorRef.current = new BarcodeDetector({ formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "codabar", "upc_a", "upc_e", "itf", "data_matrix", "aztec", "pdf417"] });
    } catch {
      setStatus("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("scanning");
        startDetection();
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Impossible d'accéder à la caméra");
    }
  };

  const startDetection = () => {
    scanningRef.current = true;
    const detectLoop = async () => {
      if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        for (const b of barcodes) {
          if (b.rawValue) {
            scanningRef.current = false;
            stopCamera();
            onScan(b.rawValue);
            onOpenChange(false);
            return;
          }
        }
      } catch { }
      if (scanningRef.current) requestAnimationFrame(detectLoop);
    };
    requestAnimationFrame(detectLoop);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" /> Scanner un code-barres
          </DialogTitle>
        </DialogHeader>
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: 300 }}>
          {status === "init" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-white">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm text-gray-400">Initialisation de la caméra...</p>
            </div>
          )}
          {status === "scanning" && (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-48 border-2 border-white/70 rounded-xl" />
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80 bg-black/50 py-2 mx-4 rounded-lg">
                Placez le code-barres dans le cadre
              </p>
            </>
          )}
          {status === "unsupported" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-white p-6 text-center">
              <CameraOff className="h-12 w-12 mb-3 text-gray-500" />
              <p className="font-medium mb-1">Scanner non disponible</p>
              <p className="text-sm text-gray-400 mb-4">
                Votre navigateur ne supporte pas le scan natif. Utilisez Chrome ou Edge sur Android.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-white p-6 text-center">
              <CameraOff className="h-12 w-12 mb-3 text-red-400" />
              <p className="font-medium mb-1">Erreur d'accès à la caméra</p>
              <p className="text-sm text-gray-400 mb-4">{errorMsg}</p>
              <Button variant="outline" onClick={() => { setStatus("init"); startCamera(); }}>
                <Camera className="h-4 w-4 mr-2" /> Réessayer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
