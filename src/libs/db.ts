import { createBrowserClient, createServerClient } from "@supabase/ssr";

// Las variables de entorno deben estar definidas en el entorno de Vercel/Local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * CLIENTE DE NAVEGADOR (Client Components)
 */
export const supabaseBrowser = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Proxy recursivo para manejar supabase.auth.getUser(), supabase.auth.onAuthStateChange(), etc.
    const createMock = (): any => {
      const mock: any = () => ({ data: { user: null, subscription: { unsubscribe: () => {} } }, error: null });
      return new Proxy(mock, {
        get: (target, prop) => {
          if (prop === 'then') return undefined;
          return createMock();
        }
      });
    };
    return createMock();
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

/**
 * CLIENTE DE SERVIDOR (RSC, Server Actions, Route Handlers)
 */
export const supabaseServer = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {} as ReturnType<typeof createServerClient>;
  }

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
          // Ignorado en componentes de servidor
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
