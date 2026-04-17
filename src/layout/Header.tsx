"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { $searchQuery, $shouldFlashExport, $isDirty, setDirty, triggerExportFlash } from "@/store/uiStore";
import { $store, loadData, mergeData, setStoreData, $selectedPlantId } from "@/store/plantStore";
import { useStore } from "@nanostores/react";
import { openModal } from "@/store/modalStore";
import { $user, $authLoading, $syncStatus } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { hasPremium } from "@/libs/syncService";
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

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchQuery = useStore($searchQuery);
  const data = useStore($store);
  const shouldFlash = useStore($shouldFlashExport);
  const isDirty = useStore($isDirty);
  const user = useStore($user);
  const authLoading = useStore($authLoading);
  const syncStatus = useStore($syncStatus);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Cuando el usuario hace login y es premium → recarga desde Supabase
  // Depende de user?.id (no del objeto completo) para evitar re-disparos
  // por cambios de referencia del mismo usuario
  useEffect(() => {
    if (user && hasPremium(user)) {
      loadData();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then((res: any) => {
      if (res?.data) {
        $user.set(res.data.user);
      }
      $authLoading.set(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      $user.set(session?.user ?? null);
      $authLoading.set(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    $user.set(null);
  };

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const matches: any[] = [];

    // Buscar en Plantas
    data.plants.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)) {
        matches.push({ type: "Planta", name: p.name, icon: p.icon, id: p.id, href: "/plants", action: () => $selectedPlantId.set(p.id) });
      }
    });

    // Buscar en Propagaciones
    data.propagations.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.method.toLowerCase().includes(q)) {
        matches.push({ type: "Propagación", name: p.name, icon: "🧪", id: p.id, href: "/nursery" });
      }
    });

    // Buscar en Inventario
    Object.keys(data.inventory).forEach((key) => {
      const cat = key as keyof typeof data.inventory;
      data.inventory[cat].forEach((item) => {
        if (item.name.toLowerCase().includes(q)) {
          matches.push({ type: "Inventario", name: item.name, icon: "📦", href: "/inventory" });
        }
      });
    });

    setSearchResults(matches);
  }, [searchQuery, data]);

  const tabs = Object.entries(configProject.navigation.ES).map(([id, item]) => ({
    ...item,
    id: `tab-${id}`,
  }));

  const handleExport = () => {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
    };
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
        const exportedDate = importedData.exportedAt ? new Date(importedData.exportedAt).toLocaleString() : "fecha desconocida";

        const currentTotal = data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length;
        const importedTotal =
          (importedData.plants?.length || 0) +
          (importedData.propagations?.length || 0) +
          (importedData.wishlist?.length || 0) +
          (importedData.globalNotes?.length || 0);

        if (currentTotal === 0) {
          setStoreData(importedData);
          openModal("info", {
            title: "Importación Exitosa",
            message: `Se han importado ${importedTotal} ítems correctamente.`,
          });
          return;
        }

        const msg = `Resumen del archivo:\n- Exportado el: ${exportedDate}\n- Ítems en archivo: ${importedTotal}\n- Ítems en navegador: ${currentTotal}\n\n¿Cómo querés proceder?`;

        openModal("import-choice", {
          message: msg,
          data: importedData,
        });
      } catch (err) {
        console.error(err);
        openModal("info", {
          title: "Error de Importación",
          message: "El archivo JSON no tiene un formato válido botánico.",
        });
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be imported again
    e.target.value = "";
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <a href="/" onClick={(e) => handleNav(e, "/")} className="header-logo-link">
          <h1>🌿 PlantitasApp</h1>
        </a>

        <div className="search-container" id="global-search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              id="global-search"
              placeholder="Buscar en toda la app..."
              value={searchQuery}
              onChange={(e) => $searchQuery.set(e.target.value)}
              autoComplete="off"
            />
            <span className="search-icon">🔍</span>
          </div>
          {searchQuery && (
            <div id="search-results" className="search-results-panel active">
              {searchResults.length > 0 ? (
                searchResults.map((m, idx) => (
                  <a
                    key={idx}
                    href={m.href}
                    className="search-result-item"
                    onClick={(e) => {
                      if (m.action) m.action();
                      $searchQuery.set("");
                      handleNav(e, m.href);
                    }}
                  >
                    <span className="res-type">{m.type}</span>
                    <span className="res-title">
                      {m.icon} {m.name}
                    </span>
                  </a>
                ))
              ) : (
                <div className="search-result-item">
                  <span>No se encontraron resultados</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          <button
            type="button"
            className={`btn-backup ${shouldFlash ? "flash-active" : ""}`}
            id="btn-export"
            onClick={handleExport}
            title="Guardar copia local"
            style={isDirty ? { borderColor: "var(--secondary)", color: "var(--secondary)", fontWeight: 700 } : {}}
          >
            {isDirty ? "⚠ Cambios pendientes" : "Exportar"}
          </button>

          <div className="import-group">
            <button type="button" className="btn-backup" onClick={handleImportClick}>
              Importar JSON
            </button>
            <input ref={importInputRef} type="file" id="import-file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </div>

          <div className="auth-zone">
            {user ? (
              <div className="user-menu">
                <a href="/profile" className="user-avatar" title="Ver perfil" onClick={(e) => handleNav(e, "/profile")}>
                  {getInitials(user.user_metadata?.full_name, user.email)}
                </a>
                {user.user_metadata?.full_name && (
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)" }}>{user.user_metadata.full_name}</span>
                )}
                {hasPremium(user) ? (
                  <span className={`sync-indicator sync-${syncStatus}`} title={
                    syncStatus === "syncing" ? "Sincronizando..." :
                    syncStatus === "synced" ? "Sincronizado con la nube" :
                    syncStatus === "error" ? "Error de sincronización" :
                    "Cloud sync activo"
                  }>
                    {syncStatus === "syncing" ? "⟳" : syncStatus === "error" ? "⚠" : "☁"}
                  </span>
                ) : (
                  <span className="sync-indicator sync-none" title="Sin cloud sync — plan gratuito">
                    ☁ local
                  </span>
                )}
                <button
                  className="btn-text"
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-backup"
                onClick={(e) => handleNav(e, "/login")}
                style={{ whiteSpace: "nowrap", opacity: authLoading ? 0.6 : 1 }}
                disabled={authLoading}
              >
                {authLoading ? "Cargando..." : "Iniciar sesión"}
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="tab-menu">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.href ?? "#"}
            onClick={(e) => handleNav(e, tab.href ?? "#")}
            className={`tab-link ${pathname === tab.href ? "active" : ""}`}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
