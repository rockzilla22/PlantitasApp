import { SignInForm } from "@/components/auth/SignInForm";
import Link from "next/link";

export const metadata = { title: "Iniciar sesión — PlantitasApp" };

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div style={{ position: "absolute", top: "2rem", left: "2rem" }}>
        <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ← Volver al inicio
        </Link>
      </div>
      <SignInForm redirectTo="/" />
    </main>
  );
}
