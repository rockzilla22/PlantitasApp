import { SignInForm } from "@/components/auth/SignInForm";
import Link from "next/link";

export const metadata = { title: "Iniciar sesión — PlantitasApp" };

export default function LoginPage() {
  return (
    <main className="auth-page">
      <SignInForm redirectTo="/" />
    </main>
  );
}
