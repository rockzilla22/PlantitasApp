"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllUsers, updateUserStatus } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user } from "@/store/authStore";
import { openModal } from "@/store/modalStore";
import { translateError } from "@/libs/utils";
import Link from "next/link";
import configProject from "@/data/configProject";

const ROOT_MASTER_ID = "b6e25459-0e4a-42d2-a9bc-a2ca51653ce7";

function getPlanConfig(u: any) {
  if (u.role === "master_admin") return configProject.plans.MASTER;
  if (u.hasPremium) return configProject.plans.PREMIUM;
  if (u.isPro) return configProject.plans.PRO;
  return configProject.plans.FREE;
}

type AdminTab = "users";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const currentUser = useStore($user);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    if (currentUser?.app_metadata?.role !== "master_admin") {
      router.push("/");
      return;
    }
    loadUsers();
  }, [currentUser, router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeUpdate = async (userId: string, updates: any) => {
    setBusyId(userId);
    try {
      await updateUserStatus(userId, updates);
      await loadUsers();
      openModal("info", { title: "¡Operación Exitosa!", message: "El sistema ha sido actualizado correctamente." });
    } catch (err: any) {
      openModal("info", { title: "Error de Sistema", message: translateError(err.message || String(err)) });
    } finally {
      setBusyId(null);
    }
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
    openModal("admin-premium", {
      userName: u.name,
      onConfirm: (data: any) => executeUpdate(u.id, data),
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = (u.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || emailMatch || idMatch;
      const matchesRole = roleFilter === "all" || (roleFilter === "Master" ? u.role === "master_admin" : u.role !== "master_admin");
      const userPlan = getPlanConfig(u).id;
      const matchesPlan = planFilter === "all" || planFilter === userPlan;
      return matchesSearch && matchesRole && matchesPlan;
    });
  }, [users, searchTerm, roleFilter, planFilter]);

  const totalMasters = users.filter((u) => u.role === "master_admin").length;
  const totalPremium = users.filter((u) => u.hasPremium).length;
  const totalPro = users.filter((u) => u.isPro && !u.hasPremium && u.role !== "master_admin").length;
  const totalUsers = users.filter((u) => u.role !== "master_admin" && !u.hasPremium && !u.isPro).length;

  if (!currentUser || currentUser.app_metadata?.role !== "master_admin") return null;

  if (loading && users.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            className="self-start no-underline text-[var(--text)] text-x uppercase tracking-widest hover:text-[var(--primary)] transition-colors flex items-center gap-1"
          >
            ← Perfil
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] leading-none">Panel de control</h1>
            </div>
            {/* Stats chips */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--text)]">{users.length}</span>
                <span className="text-xs text-[var(--text)] opacity-80 uppercase tracking-wider">Total</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--info-bg)] border border-[var(--info)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--info-dark)]">{totalUsers}</span>
                <span className="text-xs text-[var(--info-dark)]  uppercase tracking-wider">Usuarios</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--warning-bg)] border border-[var(--secondary)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--warning-dark)]">{totalMasters}</span>
                <span className="text-xs text-[var(--warning-dark)]  uppercase tracking-wider">Masters</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--success-bg)] border border-[var(--primary-light)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--primary)]">{totalPro}</span>
                <span className="text-xs text-[var(--primary)] uppercase tracking-wider">Pro</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--info-bg)] border border-[var(--info)]/30 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-lg font-bold text-[var(--info-dark)]">{totalPremium}</span>
                <span className="text-xs text-[var(--info-dark)] uppercase tracking-wider">Premium</span>
              </div>
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
                : "border-transparent text-[var(--text)]  hover:opacity-100"
            }`}
          >
            Usuarios
          </button>
          {/* Futuras tabs aquí */}
        </div>

        {activeTab === "users" && (
          <>
            {/* FILTERS */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
              <div className="flex-1 min-w-0">
                <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] opacity-80 mb-1.5 block">Buscar</label>
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
                  <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] opacity-80 mb-1.5 block">Rol</label>
                  <select
                    className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs outline-none cursor-pointer focus:border-[var(--primary)] transition-colors"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="Master">Master</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-widest text-[var(--text)] opacity-80 mb-1.5 block">Plan</label>
                  <select
                    className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-xs outline-none cursor-pointer focus:border-[var(--primary)] transition-colors"
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    {Object.values(configProject.plans).map((p) => (
                      <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    title="Recargar"
                    onClick={loadUsers}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all disabled: cursor-pointer"
                  >
                    <span className={loading ? "inline-block animate-spin" : ""}>⟳</span>
                  </button>
                </div>
              </div>
              <div className="sm:ml-auto text-right self-end pb-0.5">
                <span className="text-2xl font-bold text-[var(--primary)]">{filteredUsers.length}</span>
                <span className="text-xs text-[var(--text)]  ml-1.5 uppercase tracking-wider">resultados</span>
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
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--text-white)] text-xs font-bold flex items-center justify-center shrink-0">
                                {(u.name || u.email || "?")[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-[var(--text)] truncate">{u.name || "Sin nombre"}</div>
                                <div className="text-xs text-[var(--text)] opacity-80 truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Rol */}
                          <td className="px-6 py-4">
                            <span className={`badge ${u.role === "master_admin" ? "badge-danger" : "badge-warning"}`}>
                              {u.role === "master_admin" ? "Master" : "Usuario"}
                            </span>
                          </td>

                          {/* Plan */}
                          <td className="px-6 py-4">
                            {(() => {
                              const plan = getPlanConfig(u);
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base">{plan.icon}</span>
                                    <span className="text-xs font-semibold text-[var(--text)]">{plan.label}</span>
                                  </div>
                                  {u.hasPremium && u.premiumExpiresAt && (
                                    <span className="text-[0.7rem] text-[var(--text-gray)] opacity-60">
                                      Vence {new Date(u.premiumExpiresAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4 pr-8">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={busyId === u.id || u.id === ROOT_MASTER_ID}
                                onClick={() => handleManageMaster(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                  u.role === "master_admin"
                                    ? "bg-[var(--warning-bg)] text-[var(--warning-dark)] border-[var(--secondary)]/40"
                                    : "bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--warning-bg)] hover:text-[var(--warning-dark)] hover:border-[var(--secondary)]/40"
                                }`}
                              >
                                {u.role === "master_admin" ? "Master" : "Gestionar Master"}
                              </button>
                              <button
                                disabled={busyId === u.id}
                                onClick={() => handleManagePremium(u)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                  u.hasPremium
                                    ? "bg-[var(--primary)] text-[var(--text-white)] border-[var(--primary)]"
                                    : "bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--primary)] hover:text-[var(--text-white)] hover:border-[var(--primary)]"
                                }`}
                              >
                                {u.hasPremium ? "Gestionar Plan" : "Activar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-[var(--text)]  italic text-sm">
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
      </div>
    </div>
  );
}
