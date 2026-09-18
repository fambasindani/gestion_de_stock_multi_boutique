"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/lib/api/services/auth.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!password) newErrors.password = "Le mot de passe est requis";
    else if (password.length < 8) newErrors.password = "Au moins 8 caractères";
    if (password !== confirm) newErrors.confirm = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email,
        token,
        mot_de_passe: password,
        mot_de_passe_confirmation: confirm,
      });
      if (res.success === false) {
        toast.error(res.message || "Lien invalide ou expiré.");
        return;
      }
      setDone(true);
      toast.success("Mot de passe réinitialisé");
      setTimeout(() => router.replace("/auth/login"), 2000);
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const lienInvalide = !token || !email;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-5 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/30">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-600/30">
            GS
          </div>
          <div>
            <p className="text-lg font-bold leading-tight text-slate-900 dark:text-white">GS Stock</p>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Gestion de stock</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
          <div className="mb-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
              <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Nouveau mot de passe
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Définissez un nouveau mot de passe pour <strong>{email || "votre compte"}</strong>.
            </p>
          </div>

          {lienInvalide ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>Lien invalide. Refaites une demande de réinitialisation.</span>
              </div>
              <Link href="/auth/login">
                <Button variant="outline" fullWidth>Retour à la connexion</Button>
              </Link>
            </div>
          ) : done ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>Mot de passe modifié. Redirection vers la connexion…</span>
              </div>
              <Link href="/auth/login">
                <Button fullWidth className="bg-blue-600 hover:bg-blue-700">
                  Se connecter
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  label="Nouveau mot de passe"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-[40px] text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label="Afficher / masquer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Input
                label="Confirmer le mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={errors.confirm}
                disabled={loading}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Lock className="h-3.5 w-3.5" /> Lien sécurisé — GS Stock
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
