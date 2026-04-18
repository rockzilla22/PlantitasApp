import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateError(err: string): string {
  const msg = err.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Credenciales inválidas. Revisá tu email y contraseña.";
  if (msg.includes("email not confirmed")) return "Email no verificado. Por favor, confirmalo en tu correo.";
  if (msg.includes("user already registered")) return "Este email ya está registrado. Intentá iniciar sesión.";
  if (msg.includes("password should be at least 6 characters")) return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("signups not allowed for this helper")) return "El registro no está permitido por este método.";
  if (msg.includes("network error") || msg.includes("failed to fetch")) return "Error de conexión. Revisá tu internet.";
  if (msg.includes("rate limit")) return "Demasiados intentos. Intentá más tarde.";
  return err; // Devuelve el original si no hay match
}