"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllUsers, updateUserStatus } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user } from "@/store/authStore";
import { openModal } from "@/store/modalStore";
import { translateError } from "@/libs/utils";
import Link from "next/link";

const ROOT_MASTER_ID = "b6e25459-0e4a-42d2-a9bc-a2ca51653ce7";

type AdminTab = "users" | "data";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const currentUser = useStore($user);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");

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
      const nameMatch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = (u.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSearch = nameMatch || emailMatch || idMatch;
      const matchesRole = roleFilter === "all" || (roleFilter === "master" ? u.role === "master_admin" : u.role !== "master_admin");
      const matchesPlan = planFilter === "all" || (planFilter === "premium" ? u.hasPremium : !u.hasPremium);
      return matchesSearch && matchesRole && matchesPlan;
    });
  }, [users, searchTerm, roleFilter, planFilter]);

  if (loading && users.length === 0) return <div className="p-20 text-center text-[var(--primary)] font-black animate-pulse uppercase tracking-[0.3em]">Accediendo al Sistema...</div>;

  return (
    <div className="admin-page animate-in fade-in duration-700" style={{ padding: "3rem 2rem", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
      <header style={{ marginBottom: "3rem" }}>
         <Link href="/profile" className="no-underline text-[var(--primary)] font-black text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
          ← Volver al Perfil
        </Link>
        <h1 style={{ marginTop: "1rem", color: "var(--primary)", fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.05em" }}>Estación de Mando</h1>
      </header>

      {/* TABS SELECTOR */}
      <div className="flex gap-4 mb-8 border-b border-[var(--border-light)]">
        <button 
          onClick={() => setActiveTab("users")}
          className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-4 ${activeTab === 'users' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-gray)] opacity-50 hover:opacity-100'}`}
        >
          Gestión de Usuarios
        </button>
      </div>

      {activeTab === "users" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="admin-filters bg-[var(--muted-bg)] border border-[var(--border-light)] shadow-sm p-6 rounded-2xl flex items-center gap-4 flex-wrap mb-8">
            <input
              type="text"
              className="admin-search-input bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] focus:border-[var(--primary)] outline-none flex-1 min-w-[300px] p-3 rounded-xl shadow-inner text-sm"
              placeholder="Buscar por nombre, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="admin-select bg-[var(--card-bg)] border-[var(--border)] p-3 rounded-xl text-sm font-bold min-w-[160px]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Todos los roles</option>
              <option value="master">Maestro</option>
              <option value="user">Usuario</option>
            </select>
            <select className="admin-select bg-[var(--card-bg)] border-[var(--border)] p-3 rounded-xl text-sm font-bold min-w-[160px]" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="all">Todos los planes</option>
              <option value="premium">Premium</option>
              <option value="free">Gratis</option>
            </select>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
              <span className="text-[var(--text-gray)] text-[0.7rem] font-black uppercase tracking-widest opacity-60">{filteredUsers.length} Registros</span>
              <button 
                title="Refrescar lista"
                onClick={loadUsers} 
                disabled={loading}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--primary)] hover:border-[var(--primary)] transition-all active:scale-90 disabled:opacity-50 shadow-md group"
              >
                <span className={`text-xl ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}>⟳</span>
              </button>
            </div>
          </div>

          <div className="admin-table-card bg-[var(--card-bg)] border border-[var(--border-light)] shadow-2xl rounded-[2rem] overflow-hidden">
            <div style={{ overflowX: "auto" }}>
              <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
                <table className="admin-table w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--muted-bg)] shadow-sm">
                    <tr>
                      <th className="p-6 text-left text-[0.65rem] font-black text-[var(--text-gray)] uppercase tracking-widest border-b border-[var(--border-light)]">USUARIO / IDENTIFICADOR</th>
                      <th className="p-6 text-left text-[0.65rem] font-black text-[var(--text-gray)] uppercase tracking-widest border-b border-[var(--border-light)]">ESTADO ACTUAL</th>
                      <th className="p-6 text-left text-[0.65rem] font-black text-[var(--text-gray)] uppercase tracking-widest border-b border-[var(--border-light)]">CRONOLOGÍA PREMIUM</th>
                      <th className="p-6 text-right text-[0.65rem] font-black text-[var(--text-gray)] uppercase tracking-widest border-b border-[var(--border-light)] pr-10">ACCIONES MAESTRAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ opacity: busyId === u.id ? 0.5 : 1 }} className="border-b border-[var(--border-light)] hover:bg-[var(--muted-bg)]/30 transition-colors group">
                        <td className="p-6">
                          <div className="font-black text-[var(--text)] text-base leading-tight group-hover:text-[var(--primary)] transition-colors">{u.name || "Invitado"}</div>
                          <div className="text-xs text-[var(--text-gray)] mt-1 font-bold opacity-60">{u.email}</div>
                          <div className="text-[0.6rem] text-[var(--text-gray)] font-mono mt-2 opacity-30 tracking-tighter uppercase">ID: {u.id}</div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`badge !px-3 !py-1 !rounded-full !text-[0.65rem] !font-black ${u.role === "master_admin" ? "badge-danger" : u.hasPremium ? "badge-success" : "badge-warning"}`}
                          >
                            {u.role === "master_admin" ? "MASTER" : u.hasPremium ? "PREMIUM" : "USUARIO"}
                          </span>
                        </td>
                        <td className="p-6 text-xs text-[var(--text-gray)] font-medium">
                          {u.hasPremium ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2"><span className="opacity-40 uppercase font-black text-[0.6rem]">Inicio:</span> <span className="font-bold text-[var(--text)]">{u.premiumStartedAt ? new Date(u.premiumStartedAt).toLocaleDateString() : '---'}</span></div>
                              <div className="flex items-center gap-2 text-[var(--primary)] font-black">
                                <span className="opacity-40 uppercase font-black text-[0.6rem]">Vence:</span> <span className="bg-[var(--success-bg)] px-2 py-0.5 rounded-lg">{u.premiumExpiresAt ? new Date(u.premiumExpiresAt).toLocaleDateString() : 'Nunca'}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="opacity-30 italic text-[0.7rem]">Sin suscripción activa</span>
                          )}
                        </td>
                        <td className="p-6 text-right pr-10">
                          <div className="admin-actions flex justify-end gap-3">
                              <button
                                className={`admin-action px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-wider transition-all shadow-sm ${u.role === "master_admin" ? "bg-[var(--gold)] text-[var(--brown-dark)]" : "bg-[var(--muted-bg)] text-[var(--text-gray)] hover:bg-[var(--gold)] hover:text-[var(--brown-dark)]"}`}
                                disabled={busyId === u.id || u.id === ROOT_MASTER_ID}
                                onClick={() => handleManageMaster(u)}
                              >
                                {u.role === "master_admin" ? "★ Rango Master" : "Subir a Master"}
                              </button>
                              <button
                                className={`admin-action px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-wider transition-all shadow-sm ${u.hasPremium ? "bg-[var(--primary)] text-white" : "bg-[var(--muted-bg)] text-[var(--text-gray)] hover:bg-[var(--primary)] hover:text-white"}`}
                                disabled={busyId === u.id}
                                onClick={() => handleManagePremium(u)}
                              >
                                {u.hasPremium ? "⚡ Gestionar Tiempo" : "Activar Premium"}
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
