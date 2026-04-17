"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { getPlanLevel, hasPremium, loadTrashFromSupabase, restoreTrashItem, type TrashItem } from "@/libs/syncService";
import { loadData } from "@/store/plantStore";

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

  const [showTrash, setShowTrash] = useState(false);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [linkingProvider, setLinkingProvider] = useState<"google" | "facebook" | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

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

  const handleToggleTrash = async () => {
    if (!showTrash && trashItems.length === 0) {
      setTrashLoading(true);
      const items = await loadTrashFromSupabase(user!.id);
      setTrashItems(items);
      setTrashLoading(false);
    }
    setShowTrash((v) => !v);
  };

  const handleRestore = async (item: TrashItem) => {
    setRestoringId(item.id);
    await restoreTrashItem(item.table, item.id, user!.id);
    setTrashItems((prev) => prev.filter((i) => i.id !== item.id));
    await loadData();
    setRestoringId(null);
  };

  const handleLink = async (provider: "google" | "facebook") => {
    setLinkingProvider(provider);
    setUnlinkError(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
    if (error) {
      setUnlinkError(error.message);
      setLinkingProvider(null);
    }
    // On success Supabase redirects to provider → no setState needed
  };

  const handleUnlink = async (provider: "google" | "facebook") => {
    const identity = user!.identities?.find((i) => i.provider === provider);
    if (!identity) return;
    setUnlinkError(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.unlinkIdentity(identity);
    if (error) {
      setUnlinkError(error.message);
    } else {
      const { data } = await sb.auth.getUser();
      if (data.user) $user.set(data.user);
    }
  };

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
      phone: phone.trim() || "", // Ahora sí mandamos el vacío si hace falta
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

  const initialFullName = user?.user_metadata?.full_name || "";
  const initialPhone = user?.phone || "";
  const hasChanges = fullName.trim() !== initialFullName || phone.trim() !== initialPhone;

  const linkedProviders = new Set((user.identities ?? []).map((i) => i.provider));
  const canUnlink = (user.identities ?? []).length > 1;

  const oauthProviders = [
    { id: "google"   as const, label: "Google",   iconBg: "#fff",     iconColor: "#4285F4", iconText: "G",  border: "1px solid #dadce0" },
    { id: "facebook" as const, label: "Facebook",  iconBg: "#1877F2",  iconColor: "#fff",    iconText: "f",  border: "none" },
  ];

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

        <div className="linked-accounts-section">
          <h3>Cuentas vinculadas</h3>
          <p className="profile-hint" style={{ marginBottom: "0.75rem" }}>
            Vinculá tu cuenta con Google o Facebook para iniciar sesión con cualquiera de ellos.
          </p>
          {unlinkError && <p className="signin-error" style={{ marginBottom: "0.75rem" }}>{unlinkError}</p>}
          {oauthProviders.map((p) => {
            const isLinked = linkedProviders.has(p.id);
            return (
              <div key={p.id} className="identity-row">
                <div
                  className="identity-provider-icon"
                  style={{ background: p.iconBg, color: p.iconColor, border: p.border }}
                >
                  {p.iconText}
                </div>
                <span className="identity-provider-name">{p.label}</span>
                {isLinked ? (
                  <>
                    <span className="badge-linked">✓ Vinculado</span>
                    <button
                      className="btn-unlink-provider"
                      disabled={!canUnlink}
                      title={!canUnlink ? "Necesitás al menos 2 métodos de acceso para desvincular" : `Desvincular ${p.label}`}
                      onClick={() => handleUnlink(p.id)}
                    >
                      Desvincular
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-link-provider"
                    disabled={linkingProvider !== null}
                    onClick={() => handleLink(p.id)}
                  >
                    {linkingProvider === p.id ? "Redirigiendo..." : `Vincular con ${p.label}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {isPremium && (
          <div className="trash-section">
            <button className="trash-toggle" onClick={handleToggleTrash}>
              🗑 {showTrash ? "Ocultar papelera" : "Ver papelera"}
              {trashItems.length > 0 && !showTrash && (
                <span style={{ background: "#ef5350", color: "#fff", borderRadius: "10px", padding: "0 6px", fontSize: "0.72rem" }}>
                  {trashItems.length}
                </span>
              )}
            </button>

            {showTrash && (
              <div className="trash-list">
                {trashLoading ? (
                  <p className="trash-empty">Cargando...</p>
                ) : trashItems.length === 0 ? (
                  <p className="trash-empty">La papelera está vacía.</p>
                ) : (
                  (() => {
                    const groups: Record<string, { label: string; items: TrashItem[] }> = {
                      plants:      { label: "🌿 Plantas", items: [] },
                      propagations:{ label: "🧪 Propagaciones", items: [] },
                      global_notes:{ label: "📝 Notas", items: [] },
                      wishlist:    { label: "✨ Wishlist", items: [] },
                    };
                    trashItems.forEach((item) => groups[item.table]?.items.push(item));
                    return Object.entries(groups).map(([key, group]) =>
                      group.items.length === 0 ? null : (
                        <div key={key}>
                          <p className="trash-group-title">{group.label}</p>
                          {group.items.map((item) => (
                            <div key={item.id} className="trash-item">
                              <div className="trash-item-info">
                                <span className="trash-item-name">{item.label}</span>
                                {item.meta && <span className="trash-item-meta">{item.meta}</span>}
                              </div>
                              <button
                                className="btn-restore"
                                disabled={restoringId === item.id}
                                onClick={() => handleRestore(item)}
                              >
                                {restoringId === item.id ? "..." : "Restaurar"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    );
                  })()
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
