"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllUsers, updateUserStatus, getAllFeedback, updateFeedbackStatus, deleteFeedback } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user } from "@/store/authStore";
import { openModal } from "@/store/modalStore";
import { translateError } from "@/libs/utils";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import configProject from "@/data/configProject";

const ROOT_MASTER_ID = "b6e25459-0e4a-42d2-a9bc-a2ca51653ce7";

function getPlanConfig(u: any) {
  const plans = configProject.plans;
  if (u.role === plans.MASTER.id) return plans.MASTER;
  if (u.role === plans.PREMIUM.id) {
    const expires = u.premium_expires_at;
    if (expires && new Date() > new Date(expires)) return plans.FREE;
    return plans.PREMIUM;
  }
  if (u.role === plans.PRO.id) return plans.PRO;
  return plans.FREE;
}

type AdminTab = "users" | "feedback";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const currentUser = useStore($user);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // Feedback filters
  const [fbSearch, setFbSearch] = useState("");
  const [fbStatusFilter, setFbStatusFilter] = useState("all");

  useEffect(() => {
    if (currentUser?.app_metadata?.role !== configProject.plans.MASTER.id) {
      router.push("/");
      return;
    }
    loadData();
  }, [currentUser, router, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const data = await getAllUsers();
        setUsers(data);
      } else {
        const data = await getAllFeedback();
        setFeedback(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = loadData; // Alias for backward compatibility if needed

  const executeUpdate = async (userId: string, updates: any) => {
    setBusyId(userId);
    try {
      await updateUserStatus(userId, updates);
      await loadData();
      openModal("info", { title: "¡Operación Exitosa!", message: "El sistema ha sido actualizado correctamente." });
    } catch (err: any) {
      openModal("info", { title: "Error de Sistema", message: translateError(err.message || String(err)) });
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateFeedback = async (id: string, updates: any) => {
    setBusyId(id);
    try {
      await updateFeedbackStatus(id, updates);
      const updated = await getAllFeedback();
      setFeedback(updated);
      toast.success("Feedback actualizado");
    } catch (err: any) {
      openModal("info", { title: "Error", message: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveFeedback = (id: string) => {
    openModal("confirm", {
      title: "¿Eliminar reporte?",
      message: "Esta acción borrará el feedback de forma permanente. No se puede deshacer.",
      onConfirm: async () => {
        setBusyId(id);
        try {
          await deleteFeedback(id);
          const updated = await getAllFeedback();
          setFeedback(updated);
          toast.success("Feedback eliminado");
        } catch (err: any) {
          openModal("info", { title: "Error", message: err.message });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleManageMaster = (u: any) => {
    if (u.id === ROOT_MASTER_ID) {
      openModal("info", { title: "Acceso Denegado", message: "El Master Raíz es inamovible." });
      return;
    }
    openModal("admin-master", {
      userName: u.name,
      currentRole: u.role,
      onConfirm: (updates: any) => executeUpdate(u.id, updates),
    });
  };

  const handleManagePremium = (u: any) => {
    // IMPORTANTE: Le pasamos los datos TAL CUAL vienen del app_metadata para que el modal sepa el estado real
    openModal("admin-premium", {
      userName: u.name || u.email,
      currentRole: u.role,
      giftSlots: u.gift_slots || 0,
      extraSlots: u.extra_slots || 0,
      premiumExpiresAt: u.premium_expires_at || null,
      onConfirm: (data: any) => {
        // Aquí permitimos que el admin mande valores negativos o fechas anteriores para "reducir"
        executeUpdate(u.id, {
          role: data.role,
          gift_slots: data.gift_slots,
          extra_slots: data.extra_slots,
          premium_expires_at: data.premium_expires_at
        });
      },
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = (u.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || emailMatch || idMatch;
      const isMasterRole = u.role === configProject.plans.MASTER.id;
      const matchesRole = roleFilter === "all" || (roleFilter === configProject.plans.MASTER.id ? isMasterRole : !isMasterRole);
      const userPlan = getPlanConfig(u).id;
      const matchesPlan = planFilter === "all" || planFilter === userPlan;
      return matchesSearch && matchesRole && matchesPlan;
    });
  }, [users, searchTerm, roleFilter, planFilter]);

  const filteredFeedback = useMemo(() => {
    return feedback.filter((f) => {
      const matchesSearch =
        f.title.toLowerCase().includes(fbSearch.toLowerCase()) ||
        f.description.toLowerCase().includes(fbSearch.toLowerCase()) ||
        f.user_email.toLowerCase().includes(fbSearch.toLowerCase());
      const matchesStatus = fbStatusFilter === "all" || f.status === fbStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [feedback, fbSearch, fbStatusFilter]);

  const totalMasters = users.filter((u) => getPlanConfig(u).id === configProject.plans.MASTER.id).length;
  const totalPremium = users.filter((u) => getPlanConfig(u).id === configProject.plans.PREMIUM.id).length;
  const totalPro = users.filter((u) => getPlanConfig(u).id === configProject.plans.PRO.id).length;
  const totalUsers = users.filter((u) => getPlanConfig(u).id === configProject.plans.FREE.id).length;

  const totalBug = feedback.filter((f) => f.type === Object.keys(configProject.feedback.types)[0]).length; // Bug
  const totalIdea = feedback.filter((f) => f.type === Object.keys(configProject.feedback.types)[1]).length; // Idea
  const totalComentario = feedback.filter((f) => f.type === Object.keys(configProject.feedback.types)[2]).length; // Comentario

  if (!currentUser || currentUser.app_metadata?.role !== configProject.plans.MASTER.id) return null;

  if (loading && users.length === 0 && feedback.length === 0)
    return (
      <div className="min-h-screen flex registros-center justify-center">
        <p className="text-[var(--primary)] animate-pulse uppercase tracking-[0.3em] text-sm">Cargando sistema...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4">
          <Link
            href="/profile"
            className="self-start no-underline text-[var(--text)] text-x uppercase tracking-widest hover:text-[var(--primary)] transition-colors flex registros-center gap-1"
          >
            <Image src="/icons/common/arrow_up.svg" alt="" width={12} height={12} className="rotate-[-90deg] object-contain" />
            <span>Perfil</span>
          </Link>
          <div className="flex flex-col md:flex-row md:Items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] leading-none">Panel de control</h1>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="flex gap-1 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
              activeTab === "users"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text)]hover:opacity-100"
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold border-b-2 -mb-px transition-all cursor-pointer ${
              activeTab === "feedback"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text)]hover:opacity-100"
            }`}
          >
            Feedback{" "}
            {feedback.length > 0 && (
              <span className="bg-[var(--primary)] text-white px-2 py-0.5 rounded-full text-[10px] ml-1">
                {feedback.filter((f) => f.status === "nuevo").length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "users" && (
          <>
            {/* Stats chips */}
            <div className="flex gap-3 flex-wrap registros-center justify-center">
              <div className="flex registros-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--text)]">{users.length}</span>
                <span className="text-xs text-[var(--text)] uppercase tracking-wider">Total</span>
              </div>
              <div className="flex registros-center gap-2 bg-[var(--info-bg)] border border-[var(--info)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--info-dark)]">{totalUsers}</span>
                <span className="text-xs text-[var(--info-dark)]uppercase tracking-wider">Usuarios</span>
              </div>
              <div className="flex registros-center gap-2 bg-[var(--success-bg)] border border-[var(--primary-light)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--primary)]">{totalPro}</span>
                <span className="text-xs text-[var(--primary)] uppercase tracking-wider">Pro</span>
              </div>
              <div className="flex registros-center gap-2 bg-[var(--info-bg)] border border-[var(--info)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--info-dark)]">{totalPremium}</span>
                <span className="text-xs text-[var(--info-dark)] uppercase tracking-wider">Premium</span>
              </div>
              <div className="flex registros-center gap-2 bg-[var(--warning-bg)] border border-[var(--secondary)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--warning-dark)]">{totalMasters}</span>
                <span className="text-xs text-[var(--warning-dark)]uppercase tracking-wider">Masters</span>
              </div>
            </div>

            {/* FILTERS */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row gap-4 registros-end shadow-sm">
              <div className="flex-1 min-w-0">
                <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] mb-1.5 block">Buscar</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Nombre, email o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] mb-1.5 block">Rol</label>
                  <select
                    className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs outline-none cursor-pointer focus:border-[var(--primary)] transition-colors"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value={configProject.plans.MASTER.id}>{configProject.plans.MASTER.label}</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] mb-1.5 block">Plan</label>
                  <select
                    className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs outline-none cursor-pointer focus:border-[var(--primary)] transition-colors"
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    {Object.values(configProject.plans).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex registros-end">
                  <button
                    title="Recargar"
                    onClick={loadData}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all disabled: cursor-pointer"
                  >
                    <Image
                      src="/icons/common/refresh.svg"
                      alt="Recargar"
                      width={14}
                      height={14}
                      className={`object-contain ${loading ? "animate-spin" : "rotate-45"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <div className="max-h-[700px] overflow-y-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold">
                          Usuario
                        </th>
                        <th className="px-6 py-4 text-left text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold">
                          Rol
                        </th>
                        <th className="px-6 py-4 text-left text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold">
                          Plan
                        </th>
                        <th className="px-6 py-4 text-right text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold pr-8">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr
                          key={u.id}
                          style={{ opacity: busyId === u.id ? 0.4 : 1 }}
                          className={`border-b border-[var(--border-light)] hover:bg-[var(--background)] transition-colors ${i % 2 === 0 ? "" : "bg-[var(--bg-faint)]/40"}`}
                        >
                          {/* Usuario */}
                          <td className="px-6 py-4">
                            <div className="flex registros-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--text-white)] text-xs font-bold flex registros-center justify-center shrink-0">
                                {(u.name || u.email || "?")[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-[var(--text)] truncate">{u.name || "Sin nombre"}</div>
                                <div className="text-xs text-[var(--text)] truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Rol */}
                          <td className="px-6 py-4">
                            <span className={`badge ${u.role === configProject.plans.MASTER.id ? "badge-danger" : "badge-warning"}`}>
                              {u.role === configProject.plans.MASTER.id ? configProject.plans.MASTER.label : configProject.plans.FREE.label}
                            </span>
                          </td>

                          {/* Plan */}
                          <td className="px-6 py-4">
                            {(() => {
                              const plan = getPlanConfig(u);
                              const gSlots = u.gift_slots || 0;
                              const eSlots = u.extra_slots || 0;
                              const exp = u.premium_expires_at;
                              const start = u.premium_started_at;
                              
                              return (
                                <div className="flex flex-col gap-2">
                                  <div className="flex registros-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                      plan.id === configProject.plans.MASTER.id ? "bg-[var(--danger)] text-white" :
                                      plan.id === configProject.plans.PREMIUM.id ? "bg-[var(--primary)] text-white" :
                                      plan.id === configProject.plans.PRO.id ? "bg-[var(--secondary)] text-white" :
                                      "bg-[var(--border)] text-[var(--text)]"
                                    }`}>
                                      {plan.label}
                                    </span>
                                  </div>

                                  {/* INFO EXTRA */}
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] uppercase font-bold text-[var(--text-gray)] opacity-60">Regalo</span>
                                      <span className="text-xs font-bold text-[var(--text)]">+{gSlots} slots</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] uppercase font-bold text-[var(--text-gray)] opacity-60">Extra</span>
                                      <span className="text-xs font-bold text-[var(--text)]">+{eSlots} slots</span>
                                    </div>
                                  </div>

                                  {exp && (
                                    <div className="flex flex-col border-t border-[var(--border-light)] pt-1">
                                      {(() => {
                                        const isExpired = new Date() > new Date(exp);
                                        return (
                                          <>
                                            <span className={`text-[9px] uppercase font-bold opacity-80 ${isExpired ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}>
                                              {isExpired ? "Membresía Vencida" : "Membresía Premium"}
                                            </span>
                                            <span className={`text-xs font-bold ${isExpired ? "text-[var(--danger)]" : "text-[var(--text)]"}`}>
                                              {isExpired ? "Venció: " : "Vence: "} {new Date(exp).toLocaleDateString()}
                                            </span>
                                          </>
                                        );
                                      })()}
                                      {start && <span className="text-[8px] text-[var(--text-gray)]">Inicio: {new Date(start).toLocaleDateString()}</span>}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4 pr-8">
                            <div className="flex registros-center justify-end gap-2">
                              <button
                                disabled={busyId === u.id || u.id === ROOT_MASTER_ID}
                                onClick={() => handleManageMaster(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                  u.role === configProject.plans.MASTER.id
                                    ? "bg-[var(--warning-bg)] text-[var(--warning-dark)] border-[var(--secondary)]/40"
                                    : "bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--warning-bg)] hover:text-[var(--warning-dark)] hover:border-[var(--secondary)]/40"
                                }`}
                              >
                                {u.role === configProject.plans.MASTER.id
                                  ? configProject.plans.MASTER.label
                                  : `Gestionar ${configProject.plans.MASTER.label}`}
                              </button>
                              <button
                                disabled={busyId === u.id}
                                onClick={() => handleManagePremium(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                  u.role === configProject.plans.PREMIUM.id || u.role === configProject.plans.PRO.id
                                    ? "bg-[var(--primary)] text-[var(--text-white)] border-[var(--primary)]"
                                    : "bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--text-white)] hover:border-[var(--primary)]"
                                }`}
                              >
                                {u.role === configProject.plans.PREMIUM.id || u.role === configProject.plans.PRO.id
                                  ? "Gestionar Plan"
                                  : "Activar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-[var(--text)]italic text-sm">
                            No se encontraron usuarios.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "feedback" && (
          <>
            {/* Stats chips */}
            <div className="flex gap-3 flex-wrap registros-center justify-center">
              <div className="flex registros-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--text)]">{feedback.length}</span>
                <span className="text-xs text-[var(--text)] uppercase tracking-wider">Total</span>
              </div>
              <div className="flex registros-center gap-2 bg-[var(--info-bg)] border border-[var(--info)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--info-dark)]">{totalBug}</span>
                <span className="text-xs text-[var(--info-dark)]uppercase tracking-wider">Bugs</span>
              </div>
              <div className="flex registros-center gap-2 bg-[var(--success-bg)] border border-[var(--primary-light)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--primary)]">{totalIdea}</span>
                <span className="text-xs text-[var(--primary)] uppercase tracking-wider">Propuestas</span>
              </div>
              <div className="flex registros-center gap-2 bg-[var(--info-bg)] border border-[var(--info)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--info-dark)]">{totalComentario}</span>
                <span className="text-xs text-[var(--info-dark)] uppercase tracking-wider">Comentarios</span>
              </div>
            </div>

            {/* FILTERS FEEDBACK */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row gap-4 registros-end shadow-sm">
              <div className="flex-1 min-w-0">
                <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] mb-1.5 block">Buscar Reporte</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Título, email o descripción..."
                  value={fbSearch}
                  onChange={(e) => setFbSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] mb-1.5 block">Estado</label>
                  <select
                    className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs outline-none cursor-pointer focus:border-[var(--primary)] transition-colors"
                    value={fbStatusFilter}
                    onChange={(e) => setFbStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="en_revision">En Revisión</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
                <div className="flex registros-end">
                  <button
                    title="Recargar"
                    onClick={loadData}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all disabled: cursor-pointer"
                  >
                    <Image
                      src="/icons/common/refresh.svg"
                      alt="Recargar"
                      width={14}
                      height={14}
                      className={`object-contain ${loading ? "animate-spin" : "rotate-45"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* FEEDBACK TABLE */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <div className="max-h-[700px] overflow-y-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold">
                          Reporte
                        </th>
                        <th className="px-6 py-4 text-left text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold">
                          Ubicación / Metadata
                        </th>
                        <th className="px-6 py-4 text-left text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold">
                          Estado y Prioridad
                        </th>
                        <th className="w-[260px] max-w-[260px] px-6 py-4 text-left text-[0.7rem] text-[var(--text)] uppercase tracking-widest font-semibold">
                          Notas Admin
                        </th>
                        <th className="w-[44px] max-w-[44px] px-0 py-4 text-center text-[0.65rem] text-[var(--text)] uppercase font-semibold align-middle whitespace-nowrap overflow-hidden">
                          Acc.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedback.map((f, i) => (
                        <tr
                          key={f.id}
                          className={`border-b border-[var(--border-light)] hover:bg-[var(--background)] transition-colors ${
                            i % 2 === 0 ? "" : "bg-[var(--bg-faint)]/40"
                          }`}
                        >
                          <td className="px-6 py-4 align-top w-[300px]">
                            <div className="flex flex-col gap-1">
                              {(() => {
                                const typeCfg =
                                  configProject.feedback.types[f.type as keyof typeof configProject.feedback.types] ||
                                  configProject.feedback.types.Comentario;
                                return (
                                  <span
                                    className="text-[10px] font-black uppercase tracking-tighter w-fit px-2 py-1 rounded flex registros-center gap-1.5"
                                    style={{ backgroundColor: typeCfg.bgColor, color: typeCfg.color }}
                                  >
                                    <Image src={typeCfg.icon} alt={typeCfg.label} width={12} height={12} className="object-contain" />
                                    {typeCfg.label}
                                  </span>
                                );
                              })()}
                              <div className="font-bold text-[var(--text)]">{f.title}</div>
                              <p className="text-xs text-[var(--text)] line-clamp-3 mb-2">{f.description}</p>
                              <div className="text-[10px]">
                                {f.user_name} ({f.user_email})
                              </div>
                              <div className="flex registros-center gap-1 text-[10px] italic">
                                <Image src="/icons/common/calendar.svg" width={11} height={11} alt="" className="object-contain" />
                                <span>{new Date(f.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top w-[250px]">
                            <div className="flex flex-col gap-2">
                              <a
                                href={f.attachment_url}
                                target="_blank"
                                className="text-[10px] text-[var(--primary)] hover:underline truncate block"
                              >
                                <span className="inline-flex registros-center gap-1">
                                  <Image src="/icons/common/map.svg" width={11} height={11} alt="" className="object-contain" />
                                  <span>{f.attachment_url}</span>
                                </span>
                              </a>
                              <button
                                onClick={() =>
                                  openModal("info", { title: "Metadata Técnica", message: JSON.stringify(f.metadata, null, 2) })
                                }
                                className="btn-text p-0 text-[10px] text-left hover:text-[var(--primary)]"
                              >
                                <span className="inline-flex registros-center gap-1">
                                  <Image src="/icons/common/search.svg" width={11} height={11} alt="" className="object-contain" />
                                  <span>Ver Metadata JSON</span>
                                </span>
                              </button>
                              {f.metadata?.browser && (
                                <div className="text-[9px] bg-[var(--bg-faint)] p-2 rounded-lg border border-[var(--border-light)]">
                                  {f.metadata.browser.slice(0, 100)}...
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black uppercase">Estado</label>
                                <select
                                  className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs outline-none font-bold"
                                  style={{
                                    color: (configProject.feedback.statuses as any)[f.status]?.color,
                                    backgroundColor: (configProject.feedback.statuses as any)[f.status]?.bgColor,
                                  }}
                                  value={f.status}
                                  onChange={(e) => handleUpdateFeedback(f.id, { status: e.target.value })}
                                >
                                  {Object.entries(configProject.feedback.statuses).map(([val, cfg]) => (
                                    <option key={val} value={val}>
                                      {cfg.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black uppercase">Prioridad</label>
                                <select
                                  className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs outline-none font-bold"
                                  style={{
                                    color: (configProject.feedback.priorities as any)[f.priority]?.color,
                                    backgroundColor: (configProject.feedback.priorities as any)[f.priority]?.bgColor,
                                  }}
                                  value={f.priority}
                                  onChange={(e) => handleUpdateFeedback(f.id, { priority: e.target.value })}
                                >
                                  {Object.entries(configProject.feedback.priorities).map(([val, cfg]) => (
                                    <option key={val} value={val}>
                                      {cfg.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>

                          <td className="w-[260px] max-w-[260px] px-6 py-4 align-top">
                            <textarea
                              className="block w-full max-w-[260px] bg-[var(--bg-faint)] border border-[var(--border-light)] rounded-xl p-3 text-xs outline-none min-h-[100px] focus:border-[var(--primary)]"
                              placeholder="Escribir notas internas..."
                              defaultValue={f.admin_notes || ""}
                              onBlur={(e) => {
                                if (e.target.value !== (f.admin_notes || "")) {
                                  handleUpdateFeedback(f.id, { admin_notes: e.target.value });
                                }
                              }}
                            />
                          </td>

                          {/* Acciones Feedback */}
                          <td className="w-[44px] max-w-[44px] px-0 py-4 text-center align-middle">
                            <button
                              onClick={() => handleRemoveFeedback(f.id)}
                              disabled={busyId === f.id}
                              className="mx-auto flex h-10 w-10 registros-center justify-center rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)] shadow-sm transition-all hover:bg-[var(--danger)] hover:text-white disabled:opacity-40"
                              title="Eliminar permanentemente"
                            >
                              <div className="w-5 h-5 flex registros-center justify-center shrink-0">
                                <Image src="/icons/common/trash.svg" alt="Eliminar" width={20} height={20} className="object-contain" />
                              </div>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredFeedback.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-[var(--text)] italic text-sm">
                            No hay reportes de feedback.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
