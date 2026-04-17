"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { getPlanLevel, hasPremium } from "@/libs/syncService";

function getInitials(name?: string | null, fallback?: string | null): string {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }
  return (fallback?.[0] ?? "U").toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useStore($user);
  const authLoading = useStore($authLoading);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    setSuccess(null);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
      ...(phone.trim() ? { phone: phone.trim() } : {}),
    });

    if (error) {
      setError(error.message);
    } else {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { $user: userStore } = await import("@/store/authStore");
        userStore.set(data.user);
      }
      setSuccess("Perfil actualizado correctamente.");
    }

    setBusy(false);
    submitting.current = false;
  };

  if (authLoading || !user) return null;

  const isMasterAdmin = user.app_metadata?.role === "master_admin";
  const planLevel = getPlanLevel(user);
  const isPremium = hasPremium(user);

  const initialFullName = user?.user_metadata?.full_name ?? "";
  const initialPhone = user?.phone ?? "";
  const hasChanges = fullName.trim() !== initialFullName || phone.trim() !== initialPhone;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-lg">
            {getInitials(user.user_metadata?.full_name, user.email)}
          </div>
          <div>
            <h2>{user.user_metadata?.full_name || "Sin nombre"}</h2>
            <p className="profile-email">{user.email}</p>
            {isMasterAdmin && (
              <span className="badge-admin">⭐ Master Admin</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <label>Nombre/Apodo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              disabled={busy}
            />
          </div>

          <div className="form-group">
            <label>Teléfono <span className="label-optional">(opcional)</span></label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 11 1234-5678"
              disabled={busy}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email ?? ""}
              disabled
              className="input-disabled"
            />
            <span className="input-hint">El email no se puede cambiar desde aquí.</span>
          </div>

          {error && <p className="signin-error">{error}</p>}
          {success && <p className="signin-info">{success}</p>}

          <div className="profile-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.back()}
              disabled={busy}
            >
              Volver
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={busy || !hasChanges}
            >
              {busy ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>

        <div className="profile-section">
          <h3>Plan actual</h3>
          {isPremium ? (
            <>
              <div className="plan-badge plan-premium">
                ☁ {planLevel} — Cloud sync activo
              </div>
              <p className="profile-hint">Tus datos se sincronizan automáticamente con la nube.</p>
            </>
          ) : (
            <>
              <div className="plan-badge plan-free">
                🌱 {planLevel} — Solo local
              </div>
              <p className="profile-hint">
                Tus datos se guardan en este navegador. Sin sincronización en la nube.{" "}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>Próximamente: Plan Premium.</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
