"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import {
  getPlanLevel,
  hasPremium,
  getEffectiveMaxSlots,
  loadTrashFromSupabase,
  restoreTrashItem,
  deleteTrashItemPermanently,
  emptyTrashPermanently,
  type TrashItem,
} from "@/libs/syncService";
import { $store, $trashCount } from "@/store/plantStore";
import { translateError } from "@/libs/utils";
import configProject from "@/data/configProject";

function getInitials(name?: string | null, fallback?: string | null): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return (fallback?.[0] ?? "U").toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useStore($user);
  const authLoading = useStore($authLoading);
  const data = useStore($store);

  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const [showTrash, setShowTrash] = useState(false);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [linkingProvider, setLinkingProvider] = useState<"google" | "discord" | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) setFullName(user.user_metadata?.custom_name ?? user.user_metadata?.full_name ?? "");
  }, [user]);

  const handleToggleTrash = async () => {
    if (!showTrash && trashItems.length === 0) {
      setTrashLoading(true);
      const items = await loadTrashFromSupabase(user!.id, planConfig.trashRetentionDays);
      setTrashItems(items);
      $trashCount.set(items.length);
      setTrashLoading(false);
    }
    setShowTrash((v) => !v);
  };

  const handleEmptyTrash = async () => {
    if (!confirm("¿Vaciar papelera permanentemente? Esta acción no se puede deshacer y liberará espacio en tu plan.")) return;
    setTrashLoading(true);
    try {
      await emptyTrashPermanently(user!.id);
      setTrashItems([]);
      $trashCount.set(0);
    } catch (err) {
      console.error(err);
    } finally {
      setTrashLoading(false);
    }
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

  const handleDeletePermanent = async (item: TrashItem) => {
    if (!confirm("¿Eliminar permanentemente? Esta acción no se puede deshacer.")) return;
    setDeletingId(item.id);
    try {
      await deleteTrashItemPermanently(item.table, item.id, user!.id);
      setTrashItems((prev) => {
        const updated = prev.filter((i) => i.id !== item.id);
        $trashCount.set(updated.length);
        return updated;
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeletingId(null);
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
    const { error } = await supabaseBrowser().auth.updateUser({
      data: { custom_name: fullName.trim(), full_name: fullName.trim() },
    });
    if (error) {
      setError(translateError(error.message));
    } else {
      const { data } = await supabaseBrowser().auth.getUser();
      if (data.user) $user.set(data.user);
      setSuccess("¡Perfil actualizado!");
    }
    setBusy(false);
    submitting.current = false;
  };

  if (authLoading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--primary)] animate-pulse uppercase tracking-[0.3em] text-sm">Sincronizando...</p>
      </div>
    );

  const planLevel = getPlanLevel(user);
  const planConfig = Object.values(configProject.plans).find((p) => p.id === planLevel) ?? configProject.plans.NONE;
  const isMasterAdmin = planConfig.id === configProject.plans.MASTER.id;
  const isPremium = hasPremium(user);

  const usedSlots = useMemo(() => {
    const invCount = Object.values(data.inventory).reduce((sum, arr) => sum + arr.length, 0);
    const seasonCount = Object.values(data.seasonalTasks).reduce((sum, arr) => sum + arr.length, 0);
    return data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
  }, [data]);

  const maxSlots = isMasterAdmin ? Infinity : getEffectiveMaxSlots(user);
  const maxSlotsLabel = isMasterAdmin ? "∞" : String(maxSlots);
  const usagePercent = isMasterAdmin ? 100 : Math.min(100, (usedSlots / (maxSlots as number)) * 100);

  const expirationDate = user.app_metadata?.premium_expires_at
    ? new Date(user.app_metadata.premium_expires_at).toLocaleDateString()
    : "Ilimitada";
  const currentName = user.user_metadata?.custom_name ?? user.user_metadata?.full_name ?? "";
  const hasChanges = fullName.trim() !== currentName;
  const linkedProviders = new Set((user.identities ?? []).map((i) => i.provider));
  const canUnlink = (user.identities ?? []).length > 1;

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-[900px] mx-auto w-full flex flex-col gap-6">
        {/* NAV */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="no-underline text-[var(--text-brown)] text-xs uppercase tracking-widest hover:text-[var(--primary)] transition-colors flex items-center gap-1"
          >
            ← Inicio
          </Link>
          {isMasterAdmin && (
            <Link
              href="/admin"
              className="no-underline text-xs font-semibold text-[var(--text-white)] bg-[var(--warning-dark)] px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Admin
            </Link>
          )}
        </div>

        {/* HEADER */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[var(--primary)] text-[var(--text-white)] text-xl font-bold flex items-center justify-center shrink-0 shadow-md">
            {getInitials(currentName, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-[var(--text)] m-0 truncate">{currentName || "Sin nombre"}</h1>
            <p className="text-sm text-[var(--text-brown)] m-0 truncate">{user.email}</p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COL 1: Editar perfil + Cuentas vinculadas */}
          <div className="flex flex-col gap-6">
            {/* Editar nombre */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h2 className="text-sm font-bold text-[var(--text)] m-0">Editar perfil</h2>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text-brown)]">Nombre</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-40"
                    placeholder="Tu nombre..."
                    disabled={busy}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text-brown)]">Email</label>
                  <input
                    type="email"
                    value={user.email ?? ""}
                    disabled
                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm cursor-not-allowed"
                  />
                </div>

                {error && (
                  <p className="px-4 py-3 bg-[var(--danger-bg)] text-[var(--danger)] rounded-xl text-xs font-semibold border border-[var(--danger-border)] m-0">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="px-4 py-3 bg-[var(--success-bg)] text-[var(--success)] rounded-xl text-xs font-semibold border border-[var(--primary-light)]/30 m-0">
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || !hasChanges}
                  className="btn-primary w-full py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-40"
                >
                  {busy ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </div>

            {/* Cuentas vinculadas */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] m-0">Cuentas vinculadas</h2>
                <p className="text-xs text-[var(--text-brown)] mt-0.5">Métodos de acceso a tu cuenta</p>
              </div>
              <div className="flex flex-col gap-3">
                {(["google", "discord"] as const).map((pid) => {
                  const isLinked = linkedProviders.has(pid);
                  const label = pid === "google" ? "Google" : "Discord";
                  const iconBg = pid === "google" ? "var(--white)" : "var(--discord-blurple)";
                  const iconColor = pid === "google" ? "var(--google-blue)" : "var(--white)";
                  return (
                    <div
                      key={pid}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                          style={{ background: iconBg, color: iconColor }}
                        >
                          {label[0]}
                        </div>
                        <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
                        {isLinked && <span className="badge badge-success">Vinculado</span>}
                      </div>
                      {isLinked ? (
                        <button
                          onClick={() => handleUnlink(pid)}
                          disabled={!canUnlink}
                          className="text-xs text-[var(--danger)] font-semibold hover:underline disabled:opacity-30 cursor-pointer bg-transparent border-none"
                        >
                          Quitar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLink(pid)}
                          disabled={linkingProvider !== null}
                          className="btn-primary py-1 px-3 text-xs disabled:opacity-40"
                        >
                          Vincular
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {unlinkError && <p className="text-[var(--danger)] text-xs font-semibold m-0">{unlinkError}</p>}
            </div>
          </div>

          {/* COL 2: Plan + Papelera */}
          <div className="flex flex-col gap-6">
            {/* Plan */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <h2 className="text-sm font-bold text-[var(--text)] m-0">Estado de la cuenta</h2>

              {/* Plan badge */}
              <div className="flex items-center justify-between bg-[var(--background)] rounded-xl px-4 py-3 border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--text)]">{planConfig.label}</span>
                </div>
                {user.app_metadata?.premium_expires_at && (
                  <span className={`text-xs font-bold ${new Date() > new Date(user.app_metadata.premium_expires_at) ? "text-[var(--danger)]" : "text-[var(--text-brown)]"}`}>
                    {new Date() > new Date(user.app_metadata.premium_expires_at) ? "Venció: " : "Vence: "} {expirationDate}
                  </span>
                )}
              </div>

              {/* Slots */}
              <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-widest text-[var(--text-brown)] m-0 mb-0.5">Almacenamiento</p>
                    <p className="text-2xl font-bold text-[var(--text)] m-0 leading-none">
                      {usedSlots} <span className="text-base text-[var(--text-brown)] font-normal">/ {maxSlotsLabel}</span>
                    </p>
                  </div>
                  {!isPremium && !isMasterAdmin && (
                    <Link href="/pricing" className="btn-primary no-underline py-1.5 px-3 text-xs">
                      Ampliar
                    </Link>
                  )}
                </div>
                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-700"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                {!isMasterAdmin && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-brown)]">Base: {planConfig.maxSlots}</span>
                    {user.app_metadata?.gift_slots > 0 && (
                      <span className="text-[10px] uppercase font-bold text-[var(--primary)]">
                        🎁 Regalo: +{user.app_metadata.gift_slots}
                      </span>
                    )}
                    {user.app_metadata?.extra_slots > 0 && (
                      <span className="text-[10px] uppercase font-bold text-[var(--secondary)]">
                        ⭐ Extra: +{user.app_metadata.extra_slots}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Papelera */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={handleToggleTrash}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--background)] transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <NextImage src="/icons/common/trash.svg" alt="Papelera" width={20} height={20} className="object-contain" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)]">Papelera</span>
                  {trashItems.length > 0 && !showTrash && <span className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" />}
                </div>
                <span className="text-xs text-[var(--text-brown)] ">{showTrash ? "▲" : "▼"}</span>
              </button>

              {showTrash && (
                <div className="border-t border-[var(--border)] px-6 py-4 bg-[var(--background)] flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--warning-bg)]/50 p-3 rounded-xl border border-[var(--border-light)]">
                    <p className="text-[10px] text-[var(--text-brown)] italic m-0 flex-1">
                      💡 Los elementos en la papelera cuentan hacia tu límite de almacenamiento. 
                      Se eliminan automáticamente según tu plan ({planConfig.trashRetentionDays} días).
                    </p>
                    {trashItems.length > 0 && (
                      <button 
                        onClick={handleEmptyTrash}
                        className="btn-danger py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest shrink-0"
                      >
                        Vaciar Papelera
                      </button>
                    )}
                  </div>
                  {trashLoading ? (
                    <p className="text-center py-6 text-xs text-[var(--text-brown)] animate-pulse">Cargando...</p>
                  ) : trashItems.length === 0 ? (
                    <p className="text-center py-6 text-sm text-[var(--text-brown)] italic">Papelera vacía</p>
                  ) : (
                    (() => {
                      const groups: Record<string, { label: string; img: string; items: TrashItem[] }> = {
                        plants: { label: "Plantas", img: "/icons/environment/plants/alocasia.svg", items: [] },
                        propagations: { label: "Propagaciones", img: "/icons/environment/plants/layering.svg", items: [] },
                        global_notes: { label: "Notas", img: "/icons/common/notes.svg", items: [] },
                        wishlist: { label: "Deseos", img: "/icons/common/wishlist.svg", items: [] },
                      };
                      trashItems.forEach((i) => groups[i.table]?.items.push(i));
                      return Object.entries(groups).map(([k, g]) =>
                        g.items.length === 0 ? null : (
                          <div key={k} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <NextImage src={g.img} alt={g.label} width={14} height={14} className="object-contain" />
                              <p className="text-[0.7rem] uppercase tracking-widest text-[var(--text-brown)] m-0 font-semibold">
                                {g.label}
                              </p>
                            </div>
                            {g.items.map((i) => (
                              <div
                                key={i.id}
                                className="flex items-center justify-between bg-[var(--card-bg)] px-4 py-3 rounded-xl border border-[var(--border)]"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[var(--text)] m-0 truncate">{i.label}</p>
                                  <div className="flex flex-wrap gap-2 items-center mt-0.5">
                                    {i.meta && <span className="text-[10px] text-[var(--text-brown)] truncate">{i.meta}</span>}
                                    <span className={`text-[10px] font-bold ${i.days_left <= 5 ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}>
                                      Vence en: {i.days_left} {i.days_left === 1 ? "día" : "días"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-3 shrink-0">
                                  <button
                                    onClick={() => handleRestore(i)}
                                    disabled={restoringId === i.id || deletingId === i.id}
                                    className="btn-primary py-1 px-3 text-[10px] disabled:opacity-40"
                                  >
                                    {restoringId === i.id ? "..." : "Restaurar"}
                                  </button>
                                  <button
                                    onClick={() => handleDeletePermanent(i)}
                                    disabled={restoringId === i.id || deletingId === i.id}
                                    className="btn-danger py-1 px-3 text-[10px] disabled:opacity-40"
                                  >
                                    {deletingId === i.id ? "..." : "Borrar"}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ),
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
