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

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="user-avatar" title="Ver perfil" onClick={(e) => handleNav(e, "/profile")}>
                {getInitials(displayName, user.email)}
              </Link>
              <Link href="/profile" className="h-display-name" style={{ 
                fontSize: "0.8rem", 
                fontWeight: 800, 
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                color: planLevel === 'Master Admin' ? '#ffcd03' : planLevel === 'Premium' ? '#a3e635' : 'rgba(255,255,255,0.7)'
              }}>
                {planLevel === 'Master Admin' ? 'Master' : planLevel}
              </Link>
              <button className="h-logout" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }} onClick={handleLogout}>Salir</button>
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
