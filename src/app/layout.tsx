import "@/styles/globals.css";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/layout/Footer";
import { Header } from "@/layout/Header";
import { Modals } from "@/components/ui/Modals";

export const metadata = {
  title: "PlantitasApp PRO - Gestión Botánica",
  description: "Gestión botánica profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Toaster position="bottom-center" />
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main id="app-container">{children}</main>
        <Modals />
        <Footer />
      </body>
    </html>
  );
}
