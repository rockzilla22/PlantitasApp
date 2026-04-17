import { createBrowserClient, createServerClient } from "@supabase/ssr";

// Las variables de entorno deben estar definidas en el entorno de Vercel/Local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * CLIENTE DE NAVEGADOR (Client Components)
 * Utilízalo exclusivamente en componentes con la directiva "use client".
 * Permite interactuar con Supabase desde el frontend respetando las políticas RLS del usuario.
 */
export const supabaseBrowser = () => createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * CLIENTE DE SERVIDOR (RSC, Server Actions, Route Handlers)
 * Este cliente es asíncrono porque accede a las cookies para validar la identidad del usuario.
 * Es la pieza fundamental para cumplir con la regla de "RSC First" del protocolo Omega.
 */
export const supabaseServer = async () => {
  // Dynamically import `next/headers` to avoid importing server-only APIs
  // from modules that may be consumed by client-side code.
  const { cookies } = await import("next/headers");
  const cookieStore: any = (cookies as any)();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The Supabase middleware manages cookie updates when this client
          // is invoked from bona fide Server Components / Route Handlers.
        }
      },
    },
  });
};

/**
 * Minimal Mongo connector stub. Kept intentionally lightweight so build
 * doesn't fail when model modules import `connectMongo`. Replace with a
 * real implementation (mongoose or mongodb) when enabling persistence.
 */
export async function connectMongo() {
  // noop for build-time. If you need real mongo connectivity, implement
  // connection logic here and add the appropriate dependency.
  return;
}
