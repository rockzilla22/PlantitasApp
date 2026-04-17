import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { AppShell } from "@/components/AppShell";

export const metadata = {
  title: "PlantitasApp PRO - Gestión Botánica",
  description: "Gestión botánica profesional",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Toaster position="bottom-center" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
