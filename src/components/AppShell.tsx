"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/layout/Header";
import { Footer } from "@/layout/Footer";
import { Modals } from "@/components/ui/Modals";
import { FeedbackSection } from "@/components/sections/FeedbackSection";

const AUTH_PATHS = ["/login", "/auth/"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p));

  if (isAuth) {
    return <div className="auth-layout">{children}</div>;
  }

  return (
    <>
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main id="app-container">{children}</main>
        <FeedbackSection />
        <Modals />
        <Footer />
    </>
  );
}
