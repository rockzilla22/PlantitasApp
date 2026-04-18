import { createBrowserClient, createServerClient } from "@supabase/ssr";

// Las variables de entorno deben estar definidas en el entorno de Vercel/Local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * CLIENTE DE NAVEGADOR (Client Components)
 * Singleton — una sola instancia por sesión de browser.
 */
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const supabaseBrowser = () => {
  if (_browserClient) return _browserClient;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ SUPABASE ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const createMock = (): any => {
      // La función mock que se ejecuta al llamar a algo como .getUser()
      const mockFunc = () => {
        const result = { 
          data: { user: null, session: null, subscription: { unsubscribe: () => {} } }, 
          error: null 
        };
        // Devolvemos un objeto que es a la vez el resultado y una "promesa" (thenable)
        return {
          ...result,
          then: (resolve: any) => Promise.resolve(resolve ? resolve(result) : result),
          catch: (reject: any) => Promise.resolve(reject ? reject(null) : null),
          finally: (cb: any) => { if (cb) cb(); return Promise.resolve(); }
        };
      };

      return new Proxy(mockFunc, {
        get: (target, prop) => {
          if (prop === 'then') return undefined; // No es una promesa hasta que se invoca
          return createMock();
        }
      });
    };
    return createMock();
  }
  _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _browserClient;
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
