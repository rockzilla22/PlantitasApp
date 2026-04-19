"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { $searchQuery, $shouldFlashExport, $isDirty, setDirty, triggerExportFlash } from "@/store/uiStore";
import { $store, loadData, setStoreData, $selectedPlantId, mergeData } from "@/store/plantStore";
import { useStore } from "@nanostores/react";
import { openModal } from "@/store/modalStore";
import { $user, $authLoading } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { getPlanLevel, getEffectiveMaxSlots } from "@/libs/syncService";
import configProject from "@/data/configProject";
import Link from "next/link";
import Image from "next/image";

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
  const isMasterAdmin = planConfig.id === configProject.plans.MASTER.id;

  const premiumExpiresAt = user?.app_metadata?.premium_expires_at;
  const daysLeft = useMemo(() => {
    if (!premiumExpiresAt) return null;
    const expires = new Date(premiumExpiresAt);
    const today = new Date();
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
    // Lógica para mostrar el badge de notificación (1 vez por día)
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
      setHasNewNotification(false);
      localStorage.setItem("last_expiration_notif_date", new Date().toISOString().split("T")[0]);
    }
  };

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
        matches.push({ type: "Propagación", name: p.name, icon: "/icons/environment/log/lab.svg", id: p.id, href: "/nursery" });
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
            <h1
              className="m-0 inline-flex items-center gap-2 whitespace-nowrap font-bold leading-none"
              style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)" }}
            >
              <Image
                src="/icons/environment/location/greenhouse.svg"
                alt="Greenhouse"
                width={28}
                height={28}
                className="shrink-0 object-contain"
              />
              <span className="block leading-none">PlantitasApp</span>
            </h1>
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
            {isDirty ? (
              <>
                <Image src="/icons/common/warning.svg" alt="" width={14} height={14} className="inline mr-1" />
                Exportar
              </>
            ) : (
              "Exportar"
            )}
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
            <span className="search-icon">
              <Image src="/icons/common/search.svg" alt="Buscar" width={16} height={16} />
            </span>
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
                  <span className="res-title text-[var(--text)] flex items-center gap-1">
                    {m.icon?.startsWith("/") ? <Image src={m.icon} alt="" width={16} height={16} className="object-contain" /> : m.icon}{" "}
                    {m.name}
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
              onClick={handleOpenNotify}
            >
              <Image src="/icons/common/ringbell.svg" alt="Notificaciones" width={28} height={28} className="brightness-0 invert" />
              {hasNewNotification && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--primary)]">
                  1
                </span>
              )}
            </button>

            {isNotifyMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--input-bg)] backdrop-blur-md rounded-[1.5rem] shadow-2xl border border-[var(--border-light)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="p-4 text-center text-sm font-bold text-[var(--text)] border-b border-[var(--border-light)]">
                  Notificaciones
                </h3>

                <div className="max-h-80 overflow-y-auto">
                  {/* Alerta de Vencimiento */}
                  {daysLeft !== null && daysLeft <= 7 && (
                    <div className="p-4 bg-[var(--danger-bg-light)]/20 border-b border-[var(--border-light)]">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <div>
                          <p className="text-xs font-bold text-[var(--danger)] m-0">¡Membresía por vencer!</p>
                          <p className="text-[0.7rem] text-[var(--text)] mt-1 leading-relaxed">
                            Tu suscripción {planConfig.label} termina en{" "}
                            <strong>
                              {daysLeft} {daysLeft === 1 ? "día" : "días"}
                            </strong>
                            . Renová para no perder tus beneficios.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info de Membresía (Siempre visible) */}
                  {user?.app_metadata?.premium_expires_at && (
                    <div className="p-4 border-b border-[var(--border-light)] opacity-80">
                      <p className="text-[0.7rem] text-[var(--text-gray)] m-0 uppercase tracking-widest font-black">Plan Actual</p>
                      <p className="text-sm font-bold text-[var(--text)] mt-1">{planConfig.label}</p>
                      <p className="text-[0.7rem] text-[var(--text-gray)] mt-0.5 italic">Vence el {expirationDate}</p>
                    </div>
                  )}

                  {/* Info de Almacenamiento */}
                  <div className="p-4 bg-[var(--bg-faint)]/50">
                    <p className="text-[0.7rem] text-[var(--text-gray)] m-0 uppercase tracking-widest font-black">Almacenamiento</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[var(--text)]">{usedSlots}</span>
                      <span className="text-sm text-[var(--text-gray)] opacity-60">/ {maxSlotsLabel} items</span>
                    </div>
                    <div className="w-full bg-[var(--border-light)] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${usedSlots >= maxSlots ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                        style={{ width: `${isMasterAdmin ? 100 : Math.min(100, (usedSlots / maxSlots) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="p-6 text-center italic text-xs text-[var(--text-gray)] opacity-60">
                    Iniciá sesión para ver tus alertas personalizadas.
                  </div>
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
                  <Image src="/icons/environment/animals/turtle.svg" alt="Turtle" width={24} height={24} className="object-contain" />
                </div>
                <span className="hidden md:block uppercase text-[0.7rem] tracking-wide text-[var(--text-white)] font-bold">Perfil</span>
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
      <nav className="h-nav-desktop hidden lg:flex justify-center">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.href ?? "#"}
            onClick={(e) => handleNav(e, tab.href ?? "#")}
            className={`tab-link${pathname === tab.href ? " active" : ""} inline-flex items-center gap-2`}
          >
            {tab.icon ? <Image src={tab.icon} alt={tab.label} width={20} height={20} className="shrink-0 object-contain" /> : null}
            {tab.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
