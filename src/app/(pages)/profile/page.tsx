"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { getPlanLevel, hasPremium, loadTrashFromSupabase, restoreTrashItem, type TrashItem } from "@/libs/syncService";
import { loadData, $store } from "@/store/plantStore";
import { translateError } from "@/libs/utils";
import configProject from "@/data/configProject";
import { useMemo } from "react";

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
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const [showTrash, setShowTrash] = useState(false);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [linkingProvider, setLinkingProvider] = useState<"google" | "discord" | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.custom_name ?? user.user_metadata?.full_name ?? "");
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
    try {
      await restoreTrashItem(item.table, item.id, user!.id);
      setTrashItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err: any) {
      console.error(err);
    } finally {
      setRestoringId(null);
    }
  };

  const handleLink = async (provider: "google" | "discord") => {
    setLinkingProvider(provider);
    setUnlinkError(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
    if (error) {
      setUnlinkError(translateError(error.message));
      setLinkingProvider(null);
    }
  };

  const handleUnlink = async (provider: "google" | "discord") => {
    const identity = user!.identities?.find((i) => i.provider === provider);
    if (!identity) return;
    setUnlinkError(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.unlinkIdentity(identity);
    if (error) {
      setUnlinkError(translateError(error.message));
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
      data: { 
        custom_name: fullName.trim(),
        full_name: fullName.trim()
      }
    });

    if (error) {
      setError(translateError(error.message));
    } else {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        $user.set(data.user);
      }
      setSuccess("¡Perfil actualizado con éxito!");
    }

    setBusy(false);
    submitting.current = false;
  };

  if (authLoading || !user) return <div className="p-20 text-center animate-pulse text-[var(--primary)] font-black uppercase tracking-widest">Cargando Identidad...</div>;

  const isMasterAdmin = user.app_metadata?.role === "master_admin";
  const planLevel = getPlanLevel(user);
  const isPremium = hasPremium(user);
  const planConfig = Object.values(configProject.plans).find(p => p.id === planLevel) ?? configProject.plans.NONE;

  const data = useStore($store);
  
  const usedSlots = useMemo(() => {
    const invCount = Object.values(data.inventory).reduce((sum, arr) => sum + arr.length, 0);
    const seasonCount = Object.values(data.seasonalTasks).reduce((sum, arr) => sum + arr.length, 0);
    return data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
  }, [data]);

  const maxSlots = isMasterAdmin ? 'Ilimitado' : (50 + (user.app_metadata?.purchased_slots || 0));

  const expirationDate = user.app_metadata?.premium_expires_at 
    ? new Date(user.app_metadata.premium_expires_at).toLocaleDateString()
    : 'No activa';

  const currentName = user.user_metadata?.custom_name ?? user.user_metadata?.full_name ?? "";
  const hasChanges = fullName.trim() !== currentName;

  const linkedProviders = new Set((user.identities ?? []).map((i) => i.provider));
  const canUnlink = (user.identities ?? []).length > 1;

  const oauthProviders = [
    { id: "google"   as const, label: "Google",   iconBg: "var(--white)",     iconColor: "var(--google-blue)", iconText: "G",  border: "1px solid var(--border)" },
    { id: "discord"  as const, label: "Discord",  iconBg: "var(--discord-blurple)",  iconColor: "var(--white)",    iconText: "D",  border: "none" },
  ];

  return (
    <div className="profile-page animate-in fade-in duration-700 mx-auto w-full max-w-[1400px]">
      <div className="profile-card shadow-2xl rounded-[2.5rem] border border-[var(--border-light)] overflow-hidden">
        <Link href="/" className="no-underline text-[var(--primary)] font-black text-xs uppercase tracking-widest hover:opacity-70 transition-opacity mb-8 inline-block px-8">
          ← Volver al Laboratorio
        </Link>
        
        <div className="profile-header bg-[var(--muted-bg)] p-10 mb-8 border-b border-[var(--border-light)] flex items-center gap-6">
          <div className="profile-avatar-lg shadow-xl ring-4 ring-[var(--white)]">
            {getInitials(currentName, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-2xl text-[var(--text)] truncate leading-tight">{currentName || "Invitado"}</h2>
            <p className="profile-email text-[var(--text-gray)] font-medium opacity-60 truncate">{user.email}</p>
            {isMasterAdmin && (
              <div className="flex items-center gap-4 mt-3">
                <span className="badge-admin">★ MAESTRO</span>
                <Link href="/admin" className="text-[0.65rem] font-black text-[var(--primary)] uppercase tracking-widest no-underline hover:underline">
                  [ Estación de Mando ]
                </Link>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form px-10 pb-10">
          <div className="form-group">
            <label className="uppercase text-[0.65rem] font-black tracking-widest text-[var(--text-gray)] opacity-60 mb-2 block">Identidad Botánica</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre o apodo"
              className="bg-[var(--card-bg)] border-[var(--border)] p-3 rounded-xl font-bold focus:border-[var(--primary)] outline-none transition-all w-full"
              disabled={busy}
            />
          </div>

          <div className="form-group mt-6">
            <label className="uppercase text-[0.65rem] font-black tracking-widest text-[var(--text-gray)] opacity-60 mb-2 block">Correo Electrónico</label>
            <input
              type="email"
              value={user.email ?? ""}
              disabled
              className="bg-[var(--muted-bg)] border-[var(--border-light)] p-3 rounded-xl font-bold opacity-50 cursor-not-allowed w-full"
            />
            <span className="text-[0.65rem] text-[var(--text-gray)] italic mt-2 block opacity-50">El email está vinculado a tu cuenta y no puede cambiarse.</span>
          </div>

          {error && <p className="signin-error mt-4">{error}</p>}
          {success && <p className="signin-info mt-4">{success}</p>}

          <div className="profile-actions mt-10">
            <button
              type="submit"
              className="btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
              disabled={busy || !hasChanges}
            >
              {busy ? "Procesando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>

        <div className="profile-section px-10 pb-10 border-t border-[var(--border-light)] pt-10">
          <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text)] mb-6 text-center">Nivel de Acceso</h3>
          <div className="flex justify-center">
            {isPremium ? (
              <div className="flex flex-col items-center gap-4">
                <div className="plan-badge plan-premium !px-8 !py-4 shadow-xl !text-lg">
                  ☁ {planLevel}
                </div>
                <p className="profile-hint text-center font-bold text-[var(--primary)]">Sincronización Cloud Activa ✨</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="plan-badge plan-free !px-8 !py-4 shadow-md !text-lg">
                  🌱 {planLevel}
                </div>
                <p className="profile-hint text-center max-w-sm mx-auto italic">
                  Tus datos residen localmente en este dispositivo.
                </p>
                <Link href="/pricing" className="text-xs font-black text-[var(--primary)] uppercase tracking-widest no-underline border-b-2 border-[var(--primary)] pb-1 hover:opacity-70 transition-all">
                  Mejorar Plan ahora
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="linked-accounts-section px-10 pb-10 border-t border-[var(--border-light)] pt-10">
          <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text)] mb-2">Métodos de Acceso</h3>
          <p className="profile-hint text-xs mb-8 opacity-60">
            Gestioná tus conexiones con Google o Discord para mayor seguridad.
          </p>
          {unlinkError && <p className="signin-error mb-6">{unlinkError}</p>}
          <div className="flex flex-col gap-4">
            {oauthProviders.map((p) => {
              const isLinked = linkedProviders.has(p.id);
              return (
                <div key={p.id} className="identity-row flex items-center justify-between bg-[var(--muted-bg)] p-4 rounded-2xl border border-[var(--border-light)]">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black shadow-inner border border-[var(--white)]/20"
                      style={{ background: p.iconBg, color: p.iconColor }}
                    >
                      {p.iconText}
                    </div>
                    <span className="font-black text-sm text-[var(--text)]">{p.label}</span>
                  </div>
                  {isLinked ? (
                    <div className="flex items-center gap-4">
                      <span className="text-[var(--success)] text-xs font-black uppercase tracking-widest opacity-80">✓ Vinculado</span>
                      <button
                        className="btn-text !p-2 !min-h-0 text-[var(--danger)] text-[0.65rem] font-black uppercase tracking-widest hover:bg-[var(--danger-bg-light)] rounded-lg transition-all"
                        disabled={!canUnlink}
                        title={!canUnlink ? "Necesitás al menos 2 métodos para desvincular" : `Desvincular ${p.label}`}
                        onClick={() => handleUnlink(p.id)}
                      >
                        [ Desvincular ]
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-primary !py-2 !px-4 !min-h-0 text-[0.65rem] font-black uppercase tracking-widest shadow-md hover:scale-105 transition-all"
                      disabled={linkingProvider !== null}
                      onClick={() => handleLink(p.id)}
                    >
                      {linkingProvider === p.id ? "Conectando..." : `Vincular`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isPremium && (
          <div className="trash-section px-10 pb-10 border-t-4 border-dashed border-[var(--muted-bg)] pt-10">
            <button 
              className="w-full flex items-center justify-between bg-[var(--dark-surface)] text-[var(--text-white)] p-6 rounded-3xl shadow-xl hover:bg-[var(--black)] transition-all group border-none cursor-pointer"
              onClick={handleToggleTrash}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl group-hover:rotate-12 transition-transform">🗑️</span>
                <span className="font-black uppercase tracking-[0.2em] text-sm">Caja de Recuperación</span>
              </div>
              <div className="flex items-center gap-3">
                {trashItems.length > 0 && !showTrash && (
                  <span className="bg-[var(--danger)] text-[var(--white)] text-[0.65rem] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                    {trashItems.length} ITEMS
                  </span>
                )}
                <span className="text-xl opacity-40">{showTrash ? "▲" : "▼"}</span>
              </div>
            </button>

            {showTrash && (
              <div className="trash-list animate-in slide-in-from-top-4 duration-500 mt-6 bg-[var(--muted-bg)] rounded-3xl p-6 border border-[var(--border-light)] shadow-inner">
                {trashLoading ? (
                  <p className="trash-empty text-center py-10 font-black animate-pulse uppercase tracking-widest text-[var(--text-gray)]">Escaneando Papelera...</p>
                ) : trashItems.length === 0 ? (
                  <p className="trash-empty text-center py-10 italic text-[var(--text-gray)]">La papelera está vacía.</p>
                ) : (
                  (() => {
                    const groups: Record<string, { label: string; items: TrashItem[] }> = {
                      plants:      { label: "🌿 Plantas", items: [] },
                      propagations:{ label: "🧪 Propagaciones", items: [] },
                      global_notes:{ label: "📝 Notas", items: [] },
                      wishlist:    { label: "✨ Lista de Deseos", items: [] },
                    };
                    trashItems.forEach((item) => groups[item.table]?.items.push(item));
                    return Object.entries(groups).map(([key, group]) =>
                      group.items.length === 0 ? null : (
                        <div key={key} className="mb-8 last:mb-0">
                          <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-4 opacity-70 flex items-center gap-2">
                            <span className="w-8 h-px bg-[var(--primary)] opacity-30"></span>
                            {group.label}
                          </p>
                          <div className="flex flex-col gap-2">
                            {group.items.map((item) => (
                              <div key={item.id} className="trash-item flex items-center justify-between bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm hover:shadow-md transition-all">
                                <div className="trash-item-info flex flex-col min-w-0">
                                  <span className="trash-item-name font-black text-sm text-[var(--text)] truncate">{item.label}</span>
                                  {item.meta && <span className="trash-item-meta text-[0.65rem] font-bold text-[var(--text-gray)] opacity-40 uppercase tracking-tighter mt-0.5">{item.meta}</span>}
                                </div>
                                <button
                                  className="btn-primary !min-h-0 !py-2 !px-5 !text-[0.65rem] !font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                                  disabled={restoringId === item.id}
                                  onClick={() => handleRestore(item)}
                                >
                                  {restoringId === item.id ? "..." : "Restaurar"}
                                </button>
                              </div>
                            ))}
                          </div>
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
