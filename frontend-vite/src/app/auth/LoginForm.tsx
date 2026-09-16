"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  
  const { 
    login, 
    isLoggingIn, 
    loginError,
    isAuthenticated 
  } = useAuth();
  
  const router = useRouter();

  // ✅ Rediriger automatiquement si authentifié
  useEffect(() => {
    console.log('🔍 LoginForm - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('✅ Redirection vers dashboard depuis LoginForm');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email invalide";
    }
    
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});
    
    if (!validate()) return;
    
    console.log('📤 Submission des credentials:', { email: email.trim(), password: '***' });
    
    login({ 
      email: email.trim(), 
      mot_de_passe: password 
    });
  };

  const getErrorMessage = () => {
    if (!loginError) return null;
    
    if (loginError && typeof loginError === 'object' && 'errors' in loginError) {
      const err = loginError as { errors: Record<string, string[]> };
      setApiErrors(err.errors);
      return "Erreur de validation";
    }
    
    if (loginError instanceof Error) {
      return loginError.message;
    }
    
    return "Identifiants incorrects. Veuillez réessayer.";
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card variant="shadow" className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-600/30 ring-4 ring-blue-500/10">
            <span className="text-xl font-bold text-white">GS</span>
          </div>
          <CardTitle className="text-2xl">GS Stock ERP</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="pierre@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={isLoggingIn}
              autoComplete="email"
            />
            
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={isLoggingIn}
              autoComplete="current-password"
            />

            {Object.keys(apiErrors).length > 0 && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-3 space-y-1">
                {Object.entries(apiErrors).map(([field, messages]) => (
                  <div key={field} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <span className="font-medium">{field}:</span> {messages.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {errorMessage && Object.keys(apiErrors).length === 0 && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                disabled={isLoggingIn}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </CardFooter>
        </form>

        <div className="px-6 pb-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Version 1.0.0 © {new Date().getFullYear()} GS Stock
        </div>
      </Card>
    </div>
  );
}