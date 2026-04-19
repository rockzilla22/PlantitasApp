"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { $searchQuery, $shouldFlashExport, $isDirty, setDirty, triggerExportFlash } from "@/store/uiStore";
import { $store, loadData, setStoreData, $selectedPlantId, mergeData } from "@/store/plantStore";
import { useStore } from "@nanostores/react";
import { openModal } from "@/store/modalStore";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getPlanLevel, getEffectiveMaxSlots } from "@/libs/syncService";
import configProject from "@/data/configProject";
import Link from "next/link";
import NextImage from "next/image";

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
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // --- Plan & Storage Logic ---
  const planLevel = getPlanLevel(user);
  const planConfig = Object.values(configProject.plans).find((p) => p.id === planLevel) ?? configProject.plans.NONE;
  const isMasterAdmin = String(planLevel).toLowerCase() === configProject.plans.MASTER.id.toLowerCase();

  const premiumExpiresAt = user?.app_metadata?.premium_expires_at;
  const daysLeft = useMemo(() => {
    if (!premiumExpiresAt) return null;
    const expires = new Date(premiumExpiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expires.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [premiumExpiresAt]);

  const expirationDate = premiumExpiresAt ? new Date(premiumExpiresAt).toLocaleDateString() : "Ilimitada";
  const maxSlots = isMasterAdmin ? Infinity : getEffectiveMaxSlots(user);
  const maxSlotsLabel = isMasterAdmin ? "∞" : String(maxSlots);

  const usedSlots = useMemo(() => {
    const invCount = Object.values(data.inventory).reduce((sum, arr) => sum + arr.length, 0);
    const seasonCount = Object.values(data.seasonalTasks).reduce((sum, arr) => sum + arr.length, 0);
    return data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
  }, [data]);

  // --- Handlers & Effects ---
  useEffect(() => {
    // Para usuarios normales, 1 vez por día si faltan 7 días o menos
    if (daysLeft !== null && daysLeft <= 7 && daysLeft >= 0) {
      const lastSeen = localStorage.getItem("last_expiration_notif_date");
      const todayStr = new Date().toISOString().split("T")[0];
      if (lastSeen !== todayStr) {
        setHasNewNotification(true);
      }
    }
  }, [daysLeft]);

  const handleOpenNotify = () => {
    setIsNotifyMenuOpen(!isNotifyMenuOpen);
    if (!isNotifyMenuOpen && hasNewNotification) {
      // Guardamos que ya la vio hoy
      localStorage.setItem("last_expiration_notif_date", new Date().toISOString().split("T")[0]);
      setHasNewNotification(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setIsProfileMenuOpen(false);
      if (notifyMenuRef.current && !notifyMenuRef.current.contains(e.target as Node)) setIsNotifyMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.user_metadata?.custom_name ?? user?.user_metadata?.full_name ?? user?.email;

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data?.session;
      if (session) $user.set(session.user);
      $authLoading.set(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const currentUser = $user.get();
      if (session?.user?.id !== currentUser?.id) $user.set(session?.user ?? null);
      $authLoading.set(false);
    });
    return () => subscription.unsubscribe();
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
        matches.push({ type: "Propagación", name: p.name, icon: "/icons/environment/log/lab.svg", id: p.id, href: "/nursery" });
      }
    });
    setSearchResults(matches);
  }, [searchQuery, data]);

  const tabs = Object.entries(configProject.navigation.ES).map(([id, item]) => ({ ...item, id: `tab-${id}` }));

  return (
    <header className="sticky top-0 z-[1000] bg-[var(--primary)] text-[var(--text-white)] shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
      <div className="h-top">
        <div className="flex items-center">
          <Link href="/" onClick={(e) => handleNav(e, "/")} className="no-underline text-[var(--text-white)] whitespace-nowrap">
            <h1 className="m-0 inline-flex items-center gap-2 whitespace-nowrap font-bold leading-none" style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)" }}>
              <NextImage src="/icons/environment/location/greenhouse.svg" alt="Greenhouse" width={28} height={28} className="shrink-0 object-contain" />
              <span className="block leading-none">PlantitasApp</span>
            </h1>
          </Link>
        </div>

        <div className="h-search">
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
            {isDirty ? <><NextImage src="/icons/common/warning.svg" alt="" width={14} height={14} className="inline mr-1" />Exportar</> : "Exportar"}
          </button>

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
            <span className="search-icon"><NextImage src="/icons/common/search.svg" alt="Buscar" width={16} height={16} /></span>
          </div>

          <button type="button" className="btn-backup rounded-full" onClick={() => importInputRef.current?.click()}>Importar</button>
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

        <div className="h-right">
          <div className="relative" ref={notifyMenuRef}>
            <button
              type="button"
              className={`flex items-center gap-2 cursor-pointer transition-all border-none bg-transparent p-1 ${isNotifyMenuOpen ? "bg-[var(--input-bg)] rounded-full" : ""}`}
              onClick={handleOpenNotify}
            >
              <NextImage src="/icons/common/ringbell.svg" alt="Notificaciones" width={28} height={28} className="brightness-0 invert" />
              {hasNewNotification && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--primary)] animate-bounce">1</span>
              )}
            </button>

            {isNotifyMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--input-bg)] backdrop-blur-md rounded-[1.5rem] shadow-2xl border border-[var(--border-light)] overflow-hidden z-[1100] animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="p-4 text-center text-sm font-bold text-[var(--text)] border-b border-[var(--border-light)]">Notificaciones</h3>
                
                <div className="max-h-80 overflow-y-auto">
                  {/* ALERTA (Real para Premium) */}
                  {daysLeft !== null && daysLeft <= 7 && (
                    <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <div>
                          <p className="text-xs font-bold text-red-600 m-0">¡Membresía por vencer!</p>
                          <p className="text-[0.7rem] text-[var(--text)] mt-1 leading-relaxed font-medium">
                            Tu suscripción {planConfig.label} termina en <strong>{daysLeft <= 0 ? "hoy mismo" : `${daysLeft} días`}</strong>.
                          </p>
                          <Link href="/pricing" onClick={() => setIsNotifyMenuOpen(false)} className="text-[0.6rem] font-bold text-[var(--primary)] uppercase tracking-widest mt-2 block hover:underline">Renovar ahora →</Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {user && (
                    <>
                      <div className="p-4 border-b border-[var(--border-light)] opacity-95">
                        <p className="text-[0.7rem] text-[var(--text-gray)] m-0 uppercase tracking-widest font-black">Plan Actual</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-bold text-[var(--text)] m-0">{planConfig.label}</p>
                          <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-[var(--primary)] text-white font-bold uppercase tracking-tighter">Activo</span>
                        </div>
                        <p className="text-[0.7rem] text-[var(--text-gray)] mt-1 italic font-medium">
                          {premiumExpiresAt ? `Vence el ${expirationDate}` : "Vigencia: Ilimitada"}
                        </p>
                      </div>

                      <div className="p-4 bg-[var(--bg-faint)]/50">
                        <p className="text-[0.7rem] text-[var(--text-gray)] m-0 uppercase tracking-widest font-black">Almacenamiento</p>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-xl font-bold text-[var(--text)]">{usedSlots}</span>
                          <span className="text-sm text-[var(--text-gray)] opacity-60">/ {maxSlotsLabel} items</span>
                        </div>
                        <div className="w-full bg-[var(--border-light)] h-2 rounded-full mt-2 overflow-hidden border border-[var(--border-light)]">
                          <div 
                            className={`h-full transition-all duration-700 ${usedSlots >= maxSlots ? 'bg-red-500' : 'bg-[var(--primary)]'}`}
                            style={{ width: `${isMasterAdmin ? 100 : Math.min(100, (usedSlots / (maxSlots || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {!user && (
                   <div className="p-8 text-center flex flex-col items-center gap-3">
                    <NextImage src="/icons/common/lock.svg" alt="Lock" width={32} height={32} className="opacity-20" />
                    <p className="italic text-xs text-[var(--text-gray)] opacity-60 m-0 leading-relaxed">Iniciá sesión para ver tus alertas botánicas.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className={`flex items-center gap-2 cursor-pointer transition-all border-none bg-transparent p-1 ${isProfileMenuOpen ? "bg-[var(--input-bg)] rounded-full" : ""}`}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="w-9 h-9 rounded-full bg-[var(--input-bg)] text-[var(--primary)] font-bold text-sm flex items-center justify-center border-2 border-[var(--text-white)]/30 shadow-md">
                  <NextImage src="/icons/environment/animals/turtle.svg" alt="Turtle" width={24} height={24} className="object-contain" />
                </div>
                <span className="hidden md:block uppercase text-[0.7rem] tracking-wide text-[var(--text-white)] font-bold">Perfil</span>
                <span className={`text-[0.5rem] transition-transform duration-200 text-[var(--text-white)] ${isProfileMenuOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full w-72 bg-[var(--input-bg)] backdrop-blur-md rounded-[1.5rem] shadow-2xl border border-[var(--border-light)] overflow-hidden z-[1100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="!py-2 text-center border-b border-[var(--border-light)] mb-2">
                    <p className="text-sm text-[var(--text)] truncate mt-1 font-bold">{displayName}</p>
                    <p className="text-[0.7rem] text-[var(--text-gray)] truncate mt-0.5 opacity-80 italic">{user?.email}</p>
                  </div>
                  <div className="py-2 pb-4 flex flex-col items-stretch w-full px-2 gap-1">
                    <Link href="/profile" onClick={(e) => handleNav(e, "/profile")} className="tab-link-profile">Perfil</Link>
                    <Link href="/pricing" onClick={(e) => handleNav(e, "/pricing")} className="tab-link-profile">Planes</Link>
                    <Link href="/privacy" onClick={(e) => handleNav(e, "/privacy")} className="tab-link-profile">Privacidad</Link>
                  </div>
                  <div className="pb-4 flex flex-col items-stretch w-full px-2">
                    <button onClick={handleLogout} className="btn-logout-alt">Cerrar Sesión</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button type="button" className="btn-backup" onClick={(e) => handleNav(e, "/login")} disabled={authLoading}>{authLoading ? "..." : "Iniciar sesión"}</button>
          )}

          <button
            type="button"
            className={`mobile-menu-toggle h-burger lg:hidden ${isMobileMenuOpen ? " is-open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`h-panel-mobile${isMobileMenuOpen ? " open" : ""}`}>
        <nav className="flex flex-col p-4 gap-1">
          {tabs.map((tab) => (
            <a key={tab.id} href={tab.href ?? "#"} onClick={(e) => handleNav(e, tab.href ?? "#")} className={`tab-link${pathname === tab.href ? " active" : ""}`}>
              {tab.icon && <NextImage src={tab.icon} alt={tab.label} width={20} height={20} className="shrink-0 object-contain" />}
              {tab.label}
            </a>
          ))}
          {user && (
            <button className="tab-link text-[var(--danger)] border-t border-[var(--text-white)]/10 mt-2 pt-4 text-left" onClick={handleLogout}>Cerrar sesión</button>
          )}
        </nav>
      </div>

      <nav className="h-nav-desktop hidden lg:flex justify-center">
        {tabs.map((tab) => (
          <a key={tab.id} href={tab.href ?? "#"} onClick={(e) => handleNav(e, tab.href ?? "#")} className={`tab-link${pathname === tab.href ? " active" : ""} inline-flex items-center gap-2`}>
            {tab.icon && <NextImage src={tab.icon} alt={tab.label} width={20} height={20} className="shrink-0 object-contain" />}
            {tab.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
