"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { btn } from "@/components/buttons/buttonStyles";
import { supabaseBrowser } from "@/libs/db";

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export function SignInForm({ open = true, onClose }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = supabaseBrowser();
  
  const [message, setMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState(false);

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  if (!open) return null;

  /**
   * Manejo de autenticación OAuth (Google, GitHub, etc.)
   */
  const handleProviderSignIn = async (providerId: any) => {
    setMessage(null);
    setBusy(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerId,
        options: {
          // La URL de redirección debe estar configurada en el Dashboard de Supabase
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) throw error;
      
      // El navegador se redirigirá automáticamente al proveedor
    } catch (error: any) {
      console.error(`[DEV] OAuth Error (${providerId}):`, error.message);
      toast.error(t("errorSigningIn"));
    } finally {
      setBusy(false);
    }
  };

  /**
   * Manejo de inicio de sesión con Email y Contraseña
   */
  const emailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsErrorMessage(false);
    setEmailError(false);
    setPasswordError(false);

    if (!email.trim() || !password) {
      setEmailError(!email.trim());
      setPasswordError(!password);
      setIsErrorMessage(true);
      setMessage(t("pleaseEnterEmailPassword"));
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsErrorMessage(true);
        setMessage(error.message);
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success(t("welcomeBack"));
        router.push("/dashboard");
        router.refresh(); // Forzar actualización de Server Components
        onClose?.();
      }
    } catch (error: any) {
      toast.error(t("errorSigningIn"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={() => onClose?.()} />

      <div
        role="dialog"
        className="relative w-full max-w-md mx-4 bg-[var(--bg-2)] text-[var(--foreground)] rounded-lg shadow-lg ring-1 ring-[var(--border-dim)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-dim)]">
          <h3 className="text-lg font-semibold">{t("signIn")}</h3>
          <button onClick={() => onClose?.()} className={`${btn("primary")} p-2`}>✕</button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={emailPasswordSignIn} className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="email">{t("email")}</label>
              <input
                id="email"
                type="email"
                className={`w-full rounded-md border ${emailError ? "border-red-500" : "border-[var(--border-dim)]"} bg-transparent px-3 py-2 text-sm outline-none`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                disabled={busy}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="password">{t("password")}</label>
              <input
                id="password"
                type="password"
                className={`w-full rounded-md border ${passwordError ? "border-red-500" : "border-[var(--border-dim)]"} bg-transparent px-3 py-2 text-sm outline-none`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={busy}
              />
            </div>

            <button type="submit" className={`${btn("primary")} w-full`} disabled={busy}>
              {busy ? t("signingIn") : t("continueWithEmail")}
            </button>
          </form>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-[var(--border-dim)]" />
            <div className="text-xs text-[var(--text-muted)]">{t("or")}</div>
            <div className="h-px flex-1 bg-[var(--border-dim)]" />
          </div>

          <div className="flex flex-col gap-3">
            {["google", "github"].map((provider) => (
              <button 
                key={provider} 
                className={`${btn("outline")} w-full capitalize`} 
                onClick={() => handleProviderSignIn(provider)} 
                disabled={busy}
              >
                {t("continueWith")} {provider}
              </button>
            ))}
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-md ${isErrorMessage ? "bg-red-500/10 text-red-500 border border-red-500/20" : "text-[var(--text-muted)]"}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SignInModalButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={btn("outline")} onClick={() => setOpen(true)}>
        {label || "Sign in"}
      </button>
      {open && <SignInForm open={open} onClose={() => setOpen(false)} />}
    </>
  );
}