"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { $searchQuery, $shouldFlashExport, $isDirty, setDirty, triggerExportFlash } from "@/store/uiStore";
import { $store, loadData, setStoreData, $selectedPlantId, mergeData } from "@/store/plantStore";
import { useStore } from "@nanostores/react";
import { openModal } from "@/store/modalStore";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { getPlanLevel } from "@/libs/syncService";
import configProject from "@/data/configProject";
import Link from "next/link";
import Image from "next/image";

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
  const [isNotifyMenuOpen, setIsNotifyMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifyMenuRef = useRef<HTMLDivElement>(null);

  // --- Plan & Storage Logic ---
  const planLevel = getPlanLevel(user);
  const planConfig = Object.values(configProject.plans).find((p) => p.id === planLevel) ?? configProject.plans.NONE;
  const isMasterAdmin = planConfig.id === configProject.plans.MASTER.id;

  const expirationDate = user?.app_metadata?.premium_expires_at
    ? new Date(user.app_metadata.premium_expires_at).toLocaleDateString()
    : "Ilimitada";

  const maxSlots = isMasterAdmin ? Infinity : planConfig.maxSlots + (user?.app_metadata?.purchased_slots || 0);
  const maxSlotsLabel = isMasterAdmin ? "∞" : String(maxSlots);
  
  const usedSlots = useMemo(() => {
    const invCount = Object.values(data.inventory).reduce((sum, arr) => sum + arr.length, 0);
    const seasonCount = Object.values(data.seasonalTasks).reduce((sum, arr) => sum + arr.length, 0);
    return data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
  }, [data]);

  // --- Handlers & Effects ---
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifyMenuRef.current && !notifyMenuRef.current.contains(e.target as Node)) {
        setIsNotifyMenuOpen(false);
      }
    };
    if (isNotifyMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotifyMenuOpen]);

  const displayName = user?.user_metadata?.custom_name ?? user?.user_metadata?.full_name ?? user?.email;

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      const session = data?.session;
      if (session) $user.set(session.user);
      $authLoading.set(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const currentUser = $user.get();
      if (session?.user?.id !== currentUser?.id) $user.set(session?.user ?? null);
      $authLoading.set(false);
    });
    const safetyTimeout = setTimeout(() => $authLoading.set(false), 5000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    $user.set(null);
    setIsProfileMenuOpen(false);
  };

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    router.push(href);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
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

  return (
    <header className="sticky top-0 z-[1000] bg-[var(--primary)] text-[var(--text-white)] shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
      {/* Top Content */}
      <div className="h-top">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" onClick={(e) => handleNav(e, "/")} className="no-underline text-[var(--text-white)] whitespace-nowrap">
            <h1 style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", margin: 0, fontWeight: 700 }}>🌿 PlantitasApp</h1>
          </Link>
        </div>

        {/* Buscador */}
        <div className="h-search">
          {/* Exportar */}
          <button
            type="button"
            className={`btn-backup rounded-full ${shouldFlash ? "flash-active" : ""}`}
            onClick={() => {
              const exportData = { ...data, exportedAt: new Date().toISOString() };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `plantitas_${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              setDirty(false);
              triggerExportFlash();
            }}
          >
            {isDirty ? "⚠ Exportar" : "Exportar"}
          </button>

          {/* Buscador */}
          <div className="search-input-wrapper">
            <input
              type="text"
              id="global-search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => $searchQuery.set(e.target.value)}
              autoComplete="off"
              className="bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)] rounded-full"
            />
            <span className="search-icon">🔍</span>
          </div>
          {searchQuery && searchResults.length > 0 && (
            <div className="search-results-panel active bg-[var(--input-bg)] rounded-[var(--radius)] shadow-2xl">
              {searchResults.map((m, idx) => (
                <a
                  key={idx}
                  href={m.href}
                  className="search-result-item hover:bg-[var(--bg-faint)]"
                  onClick={(e) => {
                    if (m.action) m.action();
                    $searchQuery.set("");
                    handleNav(e, m.href);
                  }}
                >
                  <span className="res-type text-[var(--primary)]">{m.type}</span>
                  <span className="res-title text-[var(--text)]">
                    {m.icon} {m.name}
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* Exportar/Importar */}
          <button type="button" className="btn-backup rounded-full" onClick={() => importInputRef.current?.click()}>
            Importar
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const importedData = JSON.parse(ev.target?.result as string);
                  mergeData(importedData);
                  openModal("info", { title: "¡Sincronizado!", message: "Fusión completada." });
                } catch (err) {
                  openModal("info", { title: "Error", message: "JSON corrupto." });
                }
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />
        </div>

        {/* Right Section */}
        <div className="h-right">
          {/* Ringbell Notification */}
          <div className="relative" ref={notifyMenuRef}>
            <button
              type="button"
              className={`flex items-center gap-2 cursor-pointer transition-all border-none bg-transparent p-1 ${isNotifyMenuOpen ? "bg-[var(--input-bg)] rounded-full" : ""}`}
              onClick={() => setIsNotifyMenuOpen(!isNotifyMenuOpen)}
            >
              <Image src="/icons/common/ringbell.svg" alt="Notificaciones" width={28} height={28} className="brightness-0 invert" />
            </button>

            {isNotifyMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--input-bg)] backdrop-blur-md rounded-[1.5rem] shadow-2xl border border-[var(--border-light)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="p-4 text-center text-sm font-bold text-[var(--text)]">Notificaciones</h3>
                {user?.app_metadata?.premium_expires_at && (
                  <>
                    <div className="p-4 text-center text-sm text-[var(--text)]">Tu membresía vence el {expirationDate}</div>
                    <p className="p-4 text-center text-sm text-[var(--text)]">
                      Almacenamiento: {usedSlots} <span className="text-center text-sm text-[var(--text)]">/ {maxSlotsLabel}</span>
                    </p>
                  </>
                )}
                {!user?.app_metadata?.premium_expires_at && (
                   <p className="p-4 text-center text-sm text-[var(--text)]">
                    Almacenamiento: {usedSlots} <span className="text-center text-sm text-[var(--text)]">/ {maxSlotsLabel}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className={`flex items-center gap-2 cursor-pointer transition-all border-none bg-transparent p-1 ${isProfileMenuOpen ? "bg-[var(--input-bg)] rounded-full" : ""}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="w-9 h-9 rounded-full bg-[var(--input-bg)] text-[var(--primary)] font-bold text-sm flex items-center justify-center border-2 border-[var(--text-white)]/30 shadow-md">
                  {getInitials(displayName, user.email)}
                </div>
                <span className="hidden md:block uppercase text-[0.7rem] tracking-wide" style={{ color: planConfig.color }}>
                  {planConfig.label}
                </span>
                <span
                  className={`text-[0.5rem] transition-transform duration-200 text-[var(--text-white)] ${isProfileMenuOpen ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full w-72 bg-[var(--input-bg)] backdrop-blur-md rounded-[1.5rem] shadow-2xl border border-[var(--border-light)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Info Header */}
                  <div className="!py-2 text-center">
                    <p className="text-sm text-[var(--text)] truncate mt-1">{displayName}</p>
                    <p className="text-[0.7rem] text-[var(--text-gray)] truncate mt-0.5 opacity-80 italic">{user?.email}</p>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-2 pb-5 flex flex-col items-stretch w-full">
                    <Link
                      href="/profile"
                      onClick={(e) => handleNav(e, "/profile")}
                      className="flex items-center justify-center w-full hover:text-[var(--success)] no-underline text-[var(--text-gray)] text-sm font-bold text-center transition-colors border-none bg-transparent cursor-pointer group pb-2"
                    >
                      <span className="text-left">Perfil</span>
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={(e) => handleNav(e, "/pricing")}
                      className="flex items-center justify-center w-full hover:text-[var(--success)] no-underline text-[var(--text-gray)] text-sm font-bold text-center transition-colors border-none bg-transparent cursor-pointer group pb-2"
                    >
                      <span className="text-left">Planes</span>
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={(e) => handleNav(e, "/privacy")}
                      className="flex items-center justify-center w-full hover:text-[var(--success)] no-underline text-[var(--text-gray)] text-sm font-bold text-center transition-colors border-none bg-transparent cursor-pointer group"
                    >
                      <span className="text-left">Privacidad</span>
                    </Link>
                  </div>

                  {/*Close Session*/}
                  <div className="pb-5 flex flex-col items-stretch w-full">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full hover:text-[var(--secondary)] no-underline text-[var(--danger)] text-sm font-bold text-center transition-colors border-none bg-transparent cursor-pointer group"
                    >
                      <span className="text-center">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button type="button" className="btn-backup" onClick={(e) => handleNav(e, "/login")} disabled={authLoading}>
              {authLoading ? "..." : "Iniciar sesión"}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className={`mobile-menu-toggle h-burger lg:hidden ${isMobileMenuOpen ? " is-open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menú"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
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
          {user && (
            <button
              className="tab-link text-[var(--danger)] border-t border-[var(--text-white)]/10 mt-2 pt-4 text-left"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Navigation Content */}
      <nav className="h-nav-desktop hidden lg:flex justify-center gap-8 py-2">
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
