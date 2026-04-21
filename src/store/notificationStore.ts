import { atom } from "nanostores";
import { supabaseBrowser } from "@/libs/db";

export type NotificationType =
  | "reply_to_post"
  | "reply_quote"
  | "new_comment"
  | "garden_invite"
  | "achievement"
  | "system_alert";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  source_user_id: string | null;
  source_user_name?: string;
  post_id?: string;
  reply_id?: string;
  plant_id?: string;
  garden_id?: string;
  achievement_id?: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  reply_to_post: "chat.svg",
  reply_quote: "quote.svg",
  new_comment: "comment.svg",
  garden_invite: "garden.svg",
  achievement: "trophy.svg",
  system_alert: "bell.svg",
};

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

// State
export const $notifications = atom<Notification[]>([]);
export const $unreadCount = atom<number>(0);
export const $notificationsLoading = atom<boolean>(false);

export async function loadNotifications(userId: string) {
  $notificationsLoading.set(true);
  const sb = supabaseBrowser();

  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error loading notifications:", error);
    $notificationsLoading.set(false);
    return;
  }

  if (data) {
    const notifications = data as Notification[];
    $notifications.set(notifications);
    $unreadCount.set(notifications.filter((notification) => !notification.is_read).length);
  }
  $notificationsLoading.set(false);
}

export async function markAsRead(notificationId: string) {
  const sb = supabaseBrowser();
  const { error } = await sb
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (!error) {
    $notifications.set(
      $notifications.get().map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    const current = $unreadCount.get();
    if (current > 0) $unreadCount.set(current - 1);
  }
}

export async function markAllAsRead(userId: string) {
  const sb = supabaseBrowser();
  const unreadIds = $notifications
    .get()
    .filter((n) => !n.is_read)
    .map((n) => n.id);

  if (unreadIds.length === 0) return;

  const { error } = await sb
    .from("notifications")
    .update({ is_read: true })
    .in("id", unreadIds);

  if (!error) {
    $notifications.set(
      $notifications.get().map((n) => ({ ...n, is_read: true }))
    );
    $unreadCount.set(0);
  }
}
