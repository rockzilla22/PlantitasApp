"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/libs/db";
import { translateError } from "@/libs/utils";

type Props = {
  redirectTo?: string;
};

export function SignInForm({ redirectTo = "/" }: Props) {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const submitting = useRef(false);

  const handleOAuth = async (provider: "google" | "discord") => {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        queryParams: {
          prompt: provider === "discord" ? "none" : "select_account",
          access_type: "offline",
        },
      },
    });
    if (error) setError(translateError(error.message));
    setBusy(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    setInfo(null);
    setBusy(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
          data: { full_name: name.trim() },
        },
      });
      if (error) {
        setError(translateError(error.message));
      } else {
        setInfo("Revisá tu correo para confirmar el registro.");
        setTimeout(() => router.push("/login"), 3000);
      }
    }

    setBusy(false);
    submitting.current = false;
  };

  return (
    <div className="signin-card">
      <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, display: "inline-block", marginBottom: "1.5rem" }}>
        ← Volver al inicio
      </Link>

      <div className="signin-header">
        <span className="signin-logo"><img src="/icons/environment/plants/generic.svg" width={32} height={32} alt="PlantitasApp" className="object-contain" /></span>
        <h2>PlantitasApp</h2>
        <p>Tu jardín personal, en cualquier dispositivo</p>
      </div>

      <div className="signin-oauth">
        <button
          type="button"
          className="btn-oauth btn-google"
          onClick={() => handleOAuth("google")}
          disabled={busy}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="var(--google-blue)"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="var(--google-green)"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="var(--google-yellow)"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="var(--google-red)"/>
          </svg>
          Google
        </button>

        <button
          type="button"
          className="btn-oauth btn-discord"
          onClick={() => handleOAuth("discord")}
          disabled={busy}
          style={{ background: "var(--discord-blurple)", color: "var(--text-white)", border: "none" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "8px" }}>
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
          </svg>
          Discord
        </button>
      </div>

      <div className="signin-divider">
        <span>o</span>
      </div>

      <form onSubmit={handleEmailSubmit} className="signin-form">
        {mode === "signup" && (
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              disabled={busy}
            />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={busy}
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={busy}
            minLength={6}
          />
        </div>

        {error && <p className="signin-error">{error}</p>}
        {info && <p className="signin-info">{info}</p>}

        <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Cargando..." : mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>

      <p className="signin-toggle">
        {mode === "signin" ? (
          <>¿No tenés cuenta?{" "}<button type="button" onClick={() => { setMode("signup"); setError(null); }}>Crear cuenta</button></>
        ) : (
          <>¿Ya tenés cuenta?{" "}<button type="button" onClick={() => { setMode("signin"); setError(null); }}>Iniciar sesión</button></>
        )}
      </p>
    </div>
  );
}
