import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de Seguridad (Omega Protocol)
 * Gestiona el refresco de sesión y la protección de rutas /dashboard y /admin.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Inicialización del cliente de Supabase para Middleware
  // Requerido para sincronizar cookies entre el cliente y el servidor en cada request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verificación de identidad segura (getUser es más confiable que getSession en Middleware)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isAuthCallback = pathname.startsWith("/auth/");

  // Páginas de la app que requieren login
  const isAppPage =
    pathname === "/" ||
    pathname.startsWith("/nursery") ||
    pathname.startsWith("/season") ||
    pathname.startsWith("/wishlist") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/notes");

  // Sin sesión + intentando acceder a la app → al login
  if (!user && isAppPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Con sesión + intentando ir al login → al inicio
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/nursery/:path*", "/season/:path*", "/wishlist/:path*", "/inventory/:path*", "/notes/:path*", "/login", "/auth/:path*"],
};