"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { $searchQuery, $shouldFlashExport, $isDirty, setDirty, triggerExportFlash } from "@/store/uiStore";
import { $store, loadData, setStoreData, $selectedPlantId, mergeData } from "@/store/plantStore";
import { useStore } from "@nanostores/react";
import { openModal } from "@/store/modalStore";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { hasPremium, getPlanLevel } from "@/libs/syncService";
import configProject from "@/data/configProject";
import Link from "next/link";

function getInitials(name?: string | null, fallback?: string | null): string {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }
  return (fallback?.[0] ?? "U").toUpperCase();
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchQuery = useStore($searchQuery);
  const data = useStore($store);
  const shouldFlash = useStore($shouldFlashExport);
  const isDirty = useStore($isDirty);
  const user = useStore($user);
  const authLoading = useStore($authLoading);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Click outside para cerrar profile menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  const displayName = user?.user_metadata?.custom_name ?? user?.user_metadata?.full_name ?? user?.email;
  const planLevel = getPlanLevel(user);

  // Un solo effect: localStorage en mount (user=null), Supabase cuando user cambia
  useEffect(() => { loadData(); }, [user?.id]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      const session = data?.session;
      if (session) $user.set(session.user);
      $authLoading.set(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const currentUser = $user.get();
      if (session?.user?.id !== currentUser?.id) $user.set(session?.user ?? null);
      $authLoading.set(false);
    });
    const safetyTimeout = setTimeout(() => $authLoading.set(false), 5000);
    return () => { subscription.unsubscribe(); clearTimeout(safetyTimeout); };
  }, []);

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    $user.set(null);
  };

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const matches: any[] = [];
    data.plants.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)) {
        matches.push({ type: "Planta", name: p.name, icon: p.icon, id: p.id, href: "/plants", action: () => $selectedPlantId.set(p.id) });
      }
    });
    data.propagations.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.method.toLowerCase().includes(q)) {
        matches.push({ type: "Propagación", name: p.name, icon: "🧪", id: p.id, href: "/nursery" });
      }
    });
    setSearchResults(matches);
  }, [searchQuery, data]);

  const tabs = Object.entries(configProject.navigation.ES).map(([id, item]) => ({ ...item, id: `tab-${id}` }));

  const handleExport = () => {
    const exportData = { ...data, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `plantitas_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    setDirty(false);
    triggerExportFlash();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const importedData = JSON.parse(ev.target?.result as string);

        // Merge automático e inmediato
        mergeData(importedData);

        openModal("info", { 
          title: "¡Datos Sincronizados!", 
          message: "El archivo se ha fusionado correctamente con tu colección actual. No se perdió nada." 
        });
      } catch (err) {
        openModal("info", { title: "Error", message: "El archivo JSON es inválido o está corrupto." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[var(--primary)] text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]">

      {/* ── BARRA SUPERIOR ──────────────────────────────────── */}
      <div className="h-top">

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" onClick={(e) => handleNav(e, "/")} className="no-underline text-white whitespace-nowrap">
            <h1 style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", margin: 0, fontWeight: 700 }}>
              🌿 PlantitasApp
            </h1>
          </Link>
        </div>

        {/* Buscador — solo desktop */}
        <div className="h-search">
          <div className="search-container" id="global-search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                id="global-search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => $searchQuery.set(e.target.value)}
                autoComplete="off"
              />
              <span className="search-icon">🔍</span>
            </div>
            {searchQuery && (
              <div className="search-results-panel active">
                {searchResults.length > 0 ? (
                  searchResults.map((m, idx) => (
                    <a
                      key={idx}
                      href={m.href}
                      className="search-result-item"
                      onClick={(e) => { if (m.action) m.action(); $searchQuery.set(""); handleNav(e, m.href); }}
                    >
                      <span className="res-type">{m.type}</span>
                      <span className="res-title">{m.icon} {m.name}</span>
                    </a>
                  ))
                ) : (
                  <div className="search-result-item"><span>No hay resultados</span></div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Derecha: Actions + Auth + Hamburguesa */}
        <div className="h-right">

          {/* Export / Import — solo desktop */}
          <div className="h-actions">
            <button
              type="button"
              className={`btn-backup ${shouldFlash ? "flash-active" : ""}`}
              onClick={handleExport}
              title="Exportar"
              style={isDirty ? { borderColor: "var(--secondary)", color: "var(--secondary)", fontWeight: 700 } : {}}
            >
              {isDirty ? "⚠ Exportar" : "Exportar"}
            </button>
            <button type="button" className="btn-backup" onClick={() => importInputRef.current?.click()}>
              Importar JSON
            </button>
            <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </div>

          {/* Auth con Dropdown */}
          {user ? (
            <div 
              className="relative" 
              ref={profileMenuRef}
            >
              <div 
                className={`flex items-center gap-2 cursor-pointer p-1 rounded-full transition-all ${isProfileMenuOpen ? 'bg-white/10' : ''}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="user-avatar">
                  {getInitials(displayName, user.email)}
                </div>
                <span className="h-display-name" style={{ 
                  fontSize: "0.8rem", 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  color: planLevel === 'Master Admin' ? '#ffcd03' : planLevel === 'Premium' ? '#a3e635' : 'rgba(255,255,255,0.7)'
                }}>
                  {planLevel === 'Master Admin' ? 'Master' : planLevel}
                </span>
                <span className={`text-[0.6rem] transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User info header */}
                  <div className="px-4 py-3 bg-zinc-50/50 border-b border-zinc-100">
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Cuenta</p>
                    <p className="text-sm text-zinc-800 font-semibold truncate mt-0.5">{displayName}</p>
                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                  </div>
                  
                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link 
                      href="/profile" 
                      onClick={(e) => handleNav(e, "/profile")} 
                      className="flex items-center gap-3 px-4 py-2.5 mx-1.5 rounded-xl hover:bg-primary/5 no-underline text-zinc-700 text-sm font-medium transition-all group"
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-md bg-zinc-100 group-hover:bg-primary/10 text-zinc-500 group-hover:text-primary text-xs transition-colors">👤</span>
                      Mi Perfil
                      <span className="ml-auto text-zinc-300 group-hover:text-primary">→</span>
                    </Link>
                    
                    <Link 
                      href="/pricing" 
                      onClick={(e) => handleNav(e, "/pricing")} 
                      className="flex items-center gap-3 px-4 py-2.5 mx-1.5 rounded-xl hover:bg-primary/5 no-underline text-zinc-700 text-sm font-medium transition-all group"
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-md bg-zinc-100 group-hover:bg-primary/10 text-zinc-500 group-hover:text-primary text-xs transition-colors">💎</span>
                      Planes
                      <span className="ml-auto text-zinc-300 group-hover:text-primary">→</span>
                    </Link>
                    
                    <Link 
                      href="/privacy" 
                      onClick={(e) => handleNav(e, "/privacy")} 
                      className="flex items-center gap-3 px-4 py-2.5 mx-1.5 rounded-xl hover:bg-primary/5 no-underline text-zinc-700 text-sm font-medium transition-all group"
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-md bg-zinc-100 group-hover:bg-primary/10 text-zinc-500 group-hover:text-primary text-xs transition-colors">📜</span>
                      Privacidad
                      <span className="ml-auto text-zinc-300 group-hover:text-primary">→</span>
                    </Link>
                  </div>
                  
                  {/* Divider */}
                  <div className="mx-4 my-1 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                  
                  {/* Logout */}
                  <div className="py-1.5 pb-2">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 mx-1.5 w-[calc(100%-12px)] rounded-xl hover:bg-red-50 no-underline text-red-600 text-sm font-medium transition-all text-left border-none bg-transparent cursor-pointer"
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-md bg-red-50 text-red-500 text-xs">🚪</span>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn-backup"
              onClick={(e) => handleNav(e, "/login")}
              disabled={authLoading}
            >
              {authLoading ? "..." : "Iniciar sesión"}
            </button>
          )}

          {/* Hamburguesa — solo mobile */}
          <button
            type="button"
            className={`mobile-menu-toggle h-burger${isMobileMenuOpen ? " is-open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menú"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── PANEL MÓVIL ─────────────────────────────────────── */}
      <div className={`h-panel-mobile${isMobileMenuOpen ? " open" : ""}`}>
        <nav className="flex flex-col p-4 gap-1">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.href ?? "#"}
              onClick={(e) => handleNav(e, tab.href ?? "#")}
              className={`tab-link${pathname === tab.href ? " active" : ""}`}
            >
              {tab.label}
            </a>
          ))}

          {/* Export / Import en mobile */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", padding: "1rem 0.95rem 0", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "0.5rem" }}>
            <button
              type="button"
              className={`btn-backup${shouldFlash ? " flash-active" : ""}`}
              onClick={() => { handleExport(); setIsMobileMenuOpen(false); }}
              style={isDirty ? { borderColor: "var(--secondary)", color: "var(--secondary)", fontWeight: 700 } : {}}
            >
              {isDirty ? "⚠ Exportar" : "Exportar"}
            </button>
            <button
              type="button"
              className="btn-backup"
              onClick={() => { importInputRef.current?.click(); setIsMobileMenuOpen(false); }}
            >
              Importar JSON
            </button>
          </div>

          {user && (
            <button
              className="tab-link"
              onClick={handleLogout}
              style={{ color: "var(--danger)", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "0.5rem", paddingTop: "1rem", textAlign: "left" }}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>

      {/* ── NAVEGACIÓN DESKTOP ──────────────────────────────── */}
      <nav className="h-nav-desktop">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.href ?? "#"}
            onClick={(e) => handleNav(e, tab.href ?? "#")}
            className={`tab-link${pathname === tab.href ? " active" : ""}`}
          >
            {tab.label}
          </a>
        ))}
      </nav>

    </header>
  );
}
