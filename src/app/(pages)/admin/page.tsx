"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllUsers, updateUserStatus } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user } from "@/store/authStore";
import { openModal } from "@/store/modalStore";
import Link from "next/link";

const ROOT_MASTER_ID = "b6e25459-0e4a-42d2-a9bc-a2ca51653ce7";

type AdminTab = "users" | "data"; // Preparado para el futuro

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const currentUser = useStore($user);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  // Estados de filtrado para Usuarios
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    if (currentUser?.app_metadata?.role !== "master_admin") {
      router.push("/");
      return;
    }
    loadUsers();
  }, [currentUser]);

  const loadUsers = async () => {
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
      openModal("info", { title: "Éxito", message: "Sistema actualizado correctamente." });
    } catch (err) {
      openModal("info", { title: "Error", message: "No se pudo actualizar el registro." });
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
      onConfirm: (updates: any) => executeUpdate(u.id, updates)
    });
  };

  const handleManagePremium = (u: any) => {
    openModal("admin-premium", {
      userName: u.name,
      onConfirm: (data: any) => executeUpdate(u.id, data)
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || (roleFilter === "master" ? u.role === "master_admin" : u.role !== "master_admin");
      const matchesPlan = planFilter === "all" || (planFilter === "premium" ? u.hasPremium : !u.hasPremium);
      return matchesSearch && matchesRole && matchesPlan;
    });
  }, [users, searchTerm, roleFilter, planFilter]);

  if (loading) return <div className="p-10 text-center">Infiltrandose...</div>;

  return (
    <div className="admin-page" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <Link href="/profile" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
          ← Volver al Perfil
        </Link>
        <h1 style={{ marginTop: "0.5rem", color: "var(--primary)", fontSize: "1.8rem" }}>Estación de Mando</h1>
      </header>

      {/* TABS SELECTOR */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
        <button 
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'users' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-gray)] hover:text-[var(--primary)]'}`}
        >
          Gestión de Usuarios
        </button>
        {/* Futuros tabs aquí */}
      </div>

      {activeTab === "users" && (
        <div className="animate-in fade-in duration-300">
          <div className="admin-filters">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Buscar por nombre, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Todos los roles</option>
              <option value="master">Maestro</option>
              <option value="user">Usuario</option>
            </select>
            <select className="admin-select" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="all">Todos los planes</option>
              <option value="premium">Premium</option>
              <option value="free">Gratis</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-gray)", whiteSpace: "nowrap" }}>{filteredUsers.length} registros</span>
              <button 
                title="Refrescar lista"
                onClick={loadUsers} 
                disabled={loading}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--background)] transition-all active:scale-95 disabled:opacity-50"
              >
                <span className={loading ? "animate-spin" : ""}>⟳</span>
              </button>
            </div>
          </div>

          <div className="admin-table-card">
            <div style={{ overflowX: "auto" }}>
              <div className="max-h-[460px] overflow-y-auto">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead className="sticky top-0 z-10 bg-[var(--background)]">
                    <tr>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Usuario / ID</th>
                      <th style={{ textAlign: "left" }}>Estado Actual</th>
                      <th style={{ textAlign: "left" }}>Cronología Premium</th>
                      <th style={{ textAlign: "right", paddingRight: "1rem" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderTop: "1px solid var(--border)", opacity: busyId === u.id ? 0.5 : 1 }}>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{u.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-gray)" }}>{u.email}</div>
                          <div style={{ fontSize: "0.7rem", color: "#999", fontFamily: "monospace", marginTop: "4px" }}>{u.id}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${u.role === "master_admin" ? "badge-danger" : u.hasPremium ? "badge-success" : "badge-warning"}`}
                          >
                            {u.role === "master_admin" ? "MASTER" : u.hasPremium ? "PREMIUM" : "USUARIO"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-gray)" }}>
                          {u.hasPremium ? (
                            <>
                              <div>Inicio: {u.premiumStartedAt ? new Date(u.premiumStartedAt).toLocaleDateString() : '---'}</div>
                              <div style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                                Vence: {u.premiumExpiresAt ? new Date(u.premiumExpiresAt).toLocaleDateString() : 'Nunca'}
                              </div>
                            </>
                          ) : (
                            <span style={{ opacity: 0.5 }}>Sin suscripción activa</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "1rem" }}>
                          <div className="admin-actions">
                              <button
                                className={`admin-action admin-action-master ${u.role === "master_admin" ? "is-active" : ""}`}
                                disabled={busyId === u.id || u.id === ROOT_MASTER_ID}
                                onClick={() => handleManageMaster(u)}
                              >
                                Gestionar Master
                              </button>
                              <button
                                className={`admin-action admin-action-premium ${u.hasPremium ? "is-active" : ""}`}
                                disabled={busyId === u.id}
                                onClick={() => handleManagePremium(u)}
                              >
                                Gestionar Premium
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
