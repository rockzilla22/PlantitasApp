"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import configProject from "@/data/configProject";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkIsMaster() {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} }
  });
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role === configProject.plans.MASTER.id;
}

export async function getAllUsers() {
  if (!(await checkIsMaster())) throw new Error("No autorizado");
  const { data: { users }, error } = await adminClient.auth.admin.listUsers();
  if (error) throw error;

  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.custom_name || u.user_metadata?.full_name || "Sin nombre",
    role: u.app_metadata?.role || configProject.plans.FREE.id,
    giftSlots: u.app_metadata?.gift_slots || 0,
    extraSlots: u.app_metadata?.extra_slots || 0,
    premiumStartedAt: u.app_metadata?.premium_started_at,
    premiumExpiresAt: u.app_metadata?.premium_expires_at,
    lastSignIn: u.last_sign_in_at
  }));
}

export async function updateUserStatus(userId: string, updates: {
  role?: string,
  action?: "gift_premium" | "gift_pro" | "reset_free",
  slotsToGift?: number,
  amount?: string,
  unit?: "days" | "months",
}) {
  if (!(await checkIsMaster())) throw new Error("No autorizado");

  const { data: { user }, error } = await adminClient.auth.admin.getUserById(userId);
  if (error || !user) throw new Error("Usuario no encontrado");

  const currentRole = user.app_metadata?.role || configProject.plans.FREE.id;
  let role = currentRole;
  let giftSlots: number = user.app_metadata?.gift_slots || 0;
  const extraSlots: number = user.app_metadata?.extra_slots || 0;
  let premiumStartedAt: string | null = user.app_metadata?.premium_started_at || null;
  let premiumExpiresAt: string | null = user.app_metadata?.premium_expires_at || null;

  if (updates.action === "gift_premium") {
    const val = parseInt(updates.amount || "0");
    const base = premiumExpiresAt && new Date(premiumExpiresAt) > new Date()
      ? new Date(premiumExpiresAt)
      : new Date();
    if (!premiumStartedAt) premiumStartedAt = new Date().toISOString();
    if (updates.unit === "months") base.setMonth(base.getMonth() + val);
    else base.setDate(base.getDate() + val);
    premiumExpiresAt = base.toISOString();
    role = configProject.plans.PREMIUM.id;
  } else if (updates.action === "gift_pro") {
    giftSlots += updates.slotsToGift || 0;
    if (role !== configProject.plans.PREMIUM.id && role !== configProject.plans.MASTER.id) {
      role = configProject.plans.PRO.id;
    }
  } else if (updates.action === "reset_free") {
    if (role === configProject.plans.MASTER.id) throw new Error("No se puede resetear un Master");
    role = configProject.plans.FREE.id;
    giftSlots = 0;
    premiumStartedAt = null;
    premiumExpiresAt = null;
  } else if (updates.role !== undefined) {
    // Solo para gestión de Master
    role = updates.role;
  }

  const newAppMetadata = {
    ...user.app_metadata,
    role,
    gift_slots: Math.max(0, giftSlots),
    extra_slots: Math.max(0, extraSlots),
    premium_started_at: premiumStartedAt,
    premium_expires_at: premiumExpiresAt,
  };

  // Limpiar campos legacy
  delete newAppMetadata.has_access;
  delete newAppMetadata.is_pro;
  delete newAppMetadata.purchased_slots;

  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: newAppMetadata
  });

  if (updateError) throw updateError;
  return { success: true };
}

export async function getAllFeedback() {
  if (!(await checkIsMaster())) throw new Error("No autorizado");
  
  // 1. Traemos todo el feedback
  const { data: feedbackData, error: fbError } = await adminClient
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (fbError) throw fbError;

  // 2. Traemos todos los usuarios para cruzar la info (ya que no se puede hacer join directo a auth.users via PostgREST)
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();
  
  if (usersError) {
    console.error("Error fetching users for feedback enrichment:", usersError);
    // Si fallan los usuarios, devolvemos el feedback con placeholders
    return feedbackData.map((f: any) => ({
      ...f,
      user_name: "Desconocido",
      user_email: "N/A"
    }));
  }

  // 3. Mapeamos y enriquecemos
  return feedbackData.map((f: any) => {
    const user = users.find(u => u.id === f.user_id);
    return {
      ...f,
      user_name: user?.user_metadata?.custom_name || user?.user_metadata?.full_name || "Desconocido",
      user_email: user?.email || "N/A"
    };
  });
}

export async function updateFeedbackStatus(id: string, updates: {
  status?: string,
  priority?: string,
  admin_notes?: string
}) {
  if (!(await checkIsMaster())) throw new Error("No autorizado");

  const { error } = await adminClient
    .from("feedback")
    .update({ 
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}
