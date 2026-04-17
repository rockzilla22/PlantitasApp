import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Iniciar sesión — PlantitasApp" };

export default function LoginPage() {
  return (
    <main className="auth-page">
      <SignInForm redirectTo="/" />
    </main>
  );
}
