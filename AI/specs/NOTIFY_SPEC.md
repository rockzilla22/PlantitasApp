# NOTIFY_SPEC.md — Sistema de Notificaciones PlantitasApp

## Estado Actual

### ✅ Lo que ya funciona:

1. **Tabla `notifications`** en Supabase con estructura:
   - `id` (uuid, PK)
   - `user_id` (recipient)
   - `type` (reply_to_post | reply_quote)
   - `source_user_id` (who triggered)
   - `source_user_name` (cached for display)
   - `post_id` (context)
   - `reply_id` (context)
   - `message` (cached text)
   - `is_read` (boolean)
   - `created_at`

2. **Store (`notificationStore.ts`)**:
   - `$notifications` — lista reactiva
   - `$unreadCount` — badge count
   - `loadNotifications(userId)`
   - `markAsRead(id)`
   - `markAllAsRead(userId)`
   - `createNotification(payload)`

3. **Triggers en forumStore.ts** (líneas 86-125):
   - Al crear `createReply()` → automático:
     - Notifica al autor del post
     - Notifica al autor citado (si aplica)

## Problemas Identificados

1. **Sin UI dedicada** — No hay página/dropdown para ver notificaciones
2. **Solo 2 tipos** — Limitado para escalar
3. **Sin timestamps formateados** — No se muestra "hace X tiempo"
4. **Sin agrupamiento** — Todo es individual
5. **No hay real-time** — Requiere refresh manual
6. **Mensaje hardcoded** — No usa templates localizados

---

## Plan Fase 1: Base Expansible

### Meta Específica
> Cuando alguien comente MI post o cite una respuesta mía → quiero ver la notificación en una UI dedicada.

### 1. Nuevas Tablas (Superabase)

```sql
-- Enum para tipos escalables
CREATE TYPE notification_type AS ENUM (
  'reply_to_post',      -- Ya existe
  'reply_quote',      -- Ya existe
  'new_comment',     -- Futuro: comentarios en plantas
  'garden_invite',   -- Futuro: invitación a jardim
  'achievement',     -- Logros desbloqueados
  'system_alert'    -- Alertas del sistema
);

-- Tabla mejorada: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  source_user_id UUID REFERENCES auth.users(id),
  source_user_name TEXT,  -- cached para display rápido
  -- Contextos (usa solo los necesarios por tipo)
  post_id UUID,
  reply_id UUID,
  plant_id UUID,
  garden_id UUID,
  achievement_id UUID,
  -- Contenido
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,  -- ruta exacta para navegar
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para queries comunes
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC);

-- Función helper: formatear tiempo relativo
CREATE OR REPLACE FUNCTION fn_time_ago(ts TIMESTAMPTZ)
RETURNS TEXT AS $$
DECLARE
  diff INTERVAL := NOW() - ts;
BEGIN
  IF diff < INTERVAL '1 minute' THEN RETURN 'ahora';
  ELSIF diff < INTERVAL '1 hour' THEN RETURN EXTRACT(MINUTE FROM diff)::TEXT || 'm';
  ELSIF diff < INTERVAL '1 day' THEN RETURN EXTRACT(HOUR FROM diff)::TEXT || 'h';
  ELSIF diff < INTERVAL '7 days' THEN RETURN (diff)::TEXT || 'd';
  ELSE RETURN TO_CHAR(ts, 'DD MMM');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 2. Trigger SQL (más robusto que client-side)

```sql
-- Trigger automático para replies
CREATE OR REPLACE FUNCTION fn_notify_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  quoted_author_id UUID;
  source_name TEXT;
BEGIN
  -- Obtener nombre del autor
  source_name := NEW.author_name;

  -- 1. Notificar al autor del post
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  IF post_author_id IS NOT NULL AND post_author_id != NEW.author_id THEN
    INSERT INTO notifications(
      user_id, type, source_user_id, source_user_name,
      post_id, reply_id, title, message, link_url
    ) VALUES (
      post_author_id,
      'reply_to_post',
      NEW.author_id,
      source_name,
      NEW.post_id,
      NEW.id,
      'Nueva respuesta en tu post',
      source_name || ' respondió: "' || LEFT(NEW.content, 80) || '..."',
      '/forum?post=' || NEW.post_id
    );
  END IF;

  -- 2. Notificar al autor citado
  IF NEW.quoted_reply_id IS NOT NULL THEN
    SELECT author_id INTO quoted_author_id FROM replies WHERE id = NEW.quoted_reply_id;
    IF quoted_author_id IS NOT NULL AND quoted_author_id != NEW.author_id THEN
      INSERT INTO notifications(
        user_id, type, source_user_id, source_user_name,
        post_id, reply_id, title, message, link_url
      ) VALUES (
        quoted_author_id,
        'reply_quote',
        NEW.author_id,
        source_name,
        NEW.post_id,
        NEW.id,
        'Te citaron en una respuesta',
        source_name || ' te mencionó en su respuesta',
        '/forum?post=' || NEW.post_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER notify_on_reply
  AFTER INSERT ON replies
  FOR EACH ROW EXECUTE FUNCTION fn_notify_on_reply();
```

### 3. Store Mejorado (`src/store/notificationStore.ts`)

```typescript
// Tipos expandidos
export type NotificationType =
  | "reply_to_post"
  | "reply_quote"
  | "new_comment"
  | "garden_invite"
  | "achievement"
  | "system_alert";

// Interfaz mejorada
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  source_user_id: string | null;
  source_user_name?: string;
  // Contextos opcionales
  post_id?: string;
  reply_id?: string;
  plant_id?: string;
  garden_id?: string;
  achievement_id?: string;
  // Contenido
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

// Iconos por tipo
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  reply_to_post: "chat.svg",
  reply_quote: "quote.svg",
  new_comment: "comment.svg",
  garden_invite: "garden.svg",
  achievement: "trophy.svg",
  system_alert: "bell.svg",
};

// Helper: formatear tiempo relativo (client-side)
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}
```

### 4. Componente Bell (Header Icon)

```typescript
// src/components/ui/NotificationBell.tsx
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $notifications, $unreadCount, loadNotifications, markAsRead, markAllAsRead, NOTIFICATION_ICONS, timeAgo } from "@/store/notificationStore";
import { $user } from "@/store/authStore";
import Image from "next/image";

export function NotificationBell() {
  const user = useStore($user);
  const notifications = useStore($notifications);
  const unreadCount = useStore($unreadCount);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user?.id) loadNotifications(user.id);
  }, [user?.id]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && user?.id) markAllAsRead(user.id);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-[var(--primary)]/10 transition-all"
      >
        <Image
          src="/icons/common/bell.svg"
          alt="Notificaciones"
          width={22}
          height={22}
          className={unreadCount > 0 ? "animate-bounce" : ""}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--danger)] text-white text-[0.65rem] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-auto bg-[var(--white)] rounded-2xl shadow-2xl border border-[var(--border-light)] z-50">
          <div className="p-4 border-b border-[var(--border-light)]">
            <h3 className="font-black text-[var(--primary)]">Notificaciones</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-gray)] italic">
              Sin notificaciones 🌱
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link_url || "#"}
                  className={`flex items-start gap-3 p-4 border-b border-[var(--border-light)] hover:bg-[var(--primary)]/5 transition-all ${
                    !n.is_read ? "bg-[var(--primary)]/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                    <Image
                      src={`/icons/common/${NOTIFICATION_ICONS[n.type]}`}
                      alt=""
                      width={18}
                      height={18}
                      className="opacity-70"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--text-brown)] truncate">
                      {n.title}
                    </p>
                    <p className="text-xs text-[var(--text-gray)] truncate">
                      {n.message}
                    </p>
                    <span className="text-[0.6rem] text-[var(--primary)] font-medium">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-2" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Tareas Fase 1

- [ ] 1. Ejecutar SQL de nueva tabla + indices en Supabase
- [ ] 2. Migrar datos existentes si es necesario
- [ ] 3. Mejorar `notificationStore.ts` con nuevos tipos
- [ ] 4. Crear componente `NotificationBell.tsx`
- [ ] 5. Integrar Bell en Header de la app
- [ ] 6. Testear: crear reply → ver notificación

---

## Fase 2 (Futuro — No implementar ahora)

- [ ] Notificaciones push (FCM/WebPush)
- [ ] Agrupación por tema (3+ del mismo tipo → 1)
- [ ] Settings por tipo (silenciar/activar)
- [ ] Email digest (diario/semanal)
- [ ] Real-time (Supabase Realtime)
- [ ] UI dedicada en página `/notifications`

---

## Notas de Diseño

1. **Trigger en DB > Client-side** — Funciona aunque el usuario esté offline
2. **Link en cada notificación** — Navegación directa al contexto
3. **Iconos por tipo** — Reconocimiento visual rápido
4. **Cache en source_user_name** — Evitar joins innecesarios
5. **时间 relativo** — "ahora", "5m", "2h", "ayer"