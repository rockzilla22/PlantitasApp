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

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  // 1. Redirección por falta de sesión
  if (!user && (isDashboardPage || isAdminPage)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login"; // Ajustar según tu ruta de entrada
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // 2. Protección de rutas administrativas
  // Nota: El rol 'admin' debe estar configurado en app_metadata o en tu tabla de perfiles
  if (isAdminPage) {
    if (user?.app_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Redirección si ya está autenticado e intenta ir al login
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};