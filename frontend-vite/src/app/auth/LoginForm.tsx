"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/api/services/auth.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Mode = "login" | "forgot";

const FEATURES = [
  { icon: ShoppingCart, title: "Vente comptoir (POS)", text: "Encaissez et imprimez le ticket en un clic." },
  { icon: Boxes, title: "Stock multi-boutique", text: "Produits, lots, transferts et inventaires cloisonnés." },
  { icon: BarChart3, title: "Rapports & exports", text: "Chiffre d'affaires, stock bas, PDF et Excel." },
  { icon: ShieldCheck, title: "Rôles & permissions", text: "Chaque boutique gère ses utilisateurs." },
];

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const validateEmail = () => {
    if (!email) {
      setErrors((e) => ({ ...e, email: "L'email est requis" }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((e) => ({ ...e, email: "Email invalide" }));
      return false;
    }
    return true;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email invalide";
    if (!password) newErrors.password = "Le mot de passe est requis";
    else if (password.length < 8) newErrors.password = "Au moins 8 caractères";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    login({ email: email.trim(), mot_de_passe: password });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateEmail()) return;

    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.success === false) {
        toast.error(res.message || "Impossible d'envoyer le lien.");
        return;
      }
      setForgotSent(true);
      toast.success("Lien de réinitialisation envoyé (vérifiez vos emails).");
    } catch {
      toast.error("Une erreur est survenue.");
    } finally {
      setForgotLoading(false);
    }
  };

  const getErrorMessage = () => {
    if (!loginError) return null;
    if (loginError && typeof loginError === "object" && "errors" in loginError) {
      const err = loginError as { errors: Record<string, string[]> };
      setApiErrors(err.errors);
      return "Erreur de validation";
    }
    if (loginError instanceof Error) return loginError.message;
    return "Identifiants incorrects. Veuillez réessayer.";
  };
  const errorMessage = getErrorMessage();

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setApiErrors({});
    setForgotSent(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Panneau marque */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#111827] via-[#1e293b] to-[#1d4ed8] lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-10 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/20 backdrop-blur">
              GS
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">GS Stock</p>
              <p className="text-xs uppercase tracking-widest text-blue-200/80">
                Gestion de stock multi-boutique
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Pilotez votre boutique en toute simplicité.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-blue-100/80">
              Ventes, stock, inventaires, factures et utilisateurs — une seule
              plateforme, cloisonnée par boutique.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <f.icon className="h-5 w-5 text-blue-300" />
                  <p className="mt-3 text-sm font-semibold">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-100/70">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-blue-100/60">
            © {new Date().getFullYear()} GS Stock — Tous droits réservés
          </p>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="flex w-full items-center justify-center p-5 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-600/30">
              GS
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-slate-900 dark:text-white">GS Stock</p>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Gestion de stock
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            {mode === "login" ? (
              <>
                  <div className="mb-7 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Connexion
                    </h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Saisissez vos identifiants pour accéder à votre espace.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="relative">
                    <Input
                      label="Adresse email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                      disabled={isLoggingIn}
                      autoComplete="email"
                    />
                    <Mail className="pointer-events-none absolute right-3.5 top-[42px] h-4 w-4 text-slate-300" />
                  </div>

                  <div className="relative">
                    <Input
                      label="Mot de passe"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      disabled={isLoggingIn}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-[40px] text-slate-400 transition-colors hover:text-slate-600"
                      tabIndex={-1}
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {Object.keys(apiErrors).length > 0 && (
                    <div className="space-y-1 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                      {Object.entries(apiErrors).map(([field, messages]) => (
                        <div key={field} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>
                            <span className="font-medium">{field}:</span> {messages.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {errorMessage && Object.keys(apiErrors).length === 0 && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      disabled={isLoggingIn}
                      className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isLoggingIn}
                    disabled={isLoggingIn}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoggingIn ? (
                      "Connexion en cours..."
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Se connecter <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" /> Retour à la connexion
                </button>

                <div className="mb-7 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
                    <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Mot de passe oublié
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Saisissez votre email : nous vous enverrons un lien pour définir
                    un nouveau mot de passe.
                  </p>
                </div>

                {forgotSent ? (
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <span>
                        Si un compte existe pour <strong>{email}</strong>, un lien de
                        réinitialisation vient d'être envoyé. Pensez à vérifier vos
                        spams.
                      </span>
                    </div>
                    <Button variant="outline" fullWidth onClick={() => switchMode("login")}>
                      Retour à la connexion
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-5">
                    <div className="relative">
                      <Input
                        label="Adresse email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        disabled={forgotLoading}
                        autoComplete="email"
                      />
                      <Mail className="pointer-events-none absolute right-3.5 top-[42px] h-4 w-4 text-slate-300" />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      loading={forgotLoading}
                      disabled={forgotLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {forgotLoading ? "Envoi en cours..." : "Envoyer le lien"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Connexion sécurisée — GS Stock v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
