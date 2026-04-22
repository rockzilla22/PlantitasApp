import { SignInForm } from "@/components/auth/SignInForm";
import configProject from "@/data/configProject";
import Link from "next/link";

export const metadata = { title: `Iniciar sesión — ${configProject.appName}` };

export default function LoginPage() {
  return (
    <main className="auth-page">
      <SignInForm redirectTo="/" />
    </main>
  );
}
