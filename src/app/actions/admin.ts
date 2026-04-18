"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  return user?.app_metadata?.role === "master_admin";
}

export async function getAllUsers() {
  if (!(await checkIsMaster())) throw new Error("No autorizado");
  const { data: { users }, error } = await adminClient.auth.admin.listUsers();
  if (error) throw error;
  
  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.custom_name || u.user_metadata?.full_name || "Sin nombre",
    role: u.app_metadata?.role || "user",
    hasPremium: !!u.app_metadata?.has_access,
    premiumStartedAt: u.app_metadata?.premium_started_at,
    premiumExpiresAt: u.app_metadata?.premium_expires_at,
    lastSignIn: u.last_sign_in_at
  }));
}

export async function updateUserStatus(userId: string, updates: { 
  role?: string, 
  hasPremium?: boolean, 
  amount?: string, 
  unit?: "days" | "months",
  action?: "add" | "remove" | "clear"
}) {
  if (!(await checkIsMaster())) throw new Error("No autorizado");

  const { data: { user }, error } = await adminClient.auth.admin.getUserById(userId);
  if (error || !user) throw new Error("Usuario no encontrado");

  let expiresAt = user.app_metadata?.premium_expires_at ? new Date(user.app_metadata.premium_expires_at) : new Date();
  let startedAt = user.app_metadata?.premium_started_at || null;

  if (updates.hasPremium === true) {
    // Si no tenia premium o ya venció, reiniciamos la fecha de inicio a HOY
    if (!user.app_metadata?.has_access || (user.app_metadata?.premium_expires_at && new Date(user.app_metadata.premium_expires_at) < new Date())) {
      startedAt = new Date().toISOString();
      expiresAt = new Date();
    }

    const val = parseInt(updates.amount || "0");
    if (updates.unit === "months") expiresAt.setMonth(expiresAt.getMonth() + val);
    else expiresAt.setDate(expiresAt.getDate() + val);
  } 
  
  if (updates.action === "remove") {
    const val = parseInt(updates.amount || "0");
    if (updates.unit === "months") expiresAt.setMonth(expiresAt.getMonth() - val);
    else expiresAt.setDate(expiresAt.getDate() - val);
  }

  const finalHasAccess = updates.action === "clear" ? false : (updates.hasPremium ?? !!user.app_metadata?.has_access);
  const finalExpiresAt = updates.action === "clear" ? null : expiresAt.toISOString();
  const finalStartedAt = updates.action === "clear" ? null : startedAt;

  const newAppMetadata = {
    ...user.app_metadata,
    ...(updates.role !== undefined && { role: updates.role }),
    has_access: finalHasAccess,
    premium_started_at: finalStartedAt,
    premium_expires_at: finalExpiresAt
  };

  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: newAppMetadata
  });

  if (updateError) throw updateError;
  return { success: true };
}
