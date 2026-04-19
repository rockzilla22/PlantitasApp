"use client";

import Link from "next/link";
import { PricingSection } from "@/components/sections/PricingSection";

export default function PricingPage() {
  return (
    <div className="landing-container py-12 animate-in fade-in duration-700">
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
          ← Volver al inicio
        </Link>
      </header>

      <PricingSection />

      <style jsx>{`
        .landing-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
      `}</style>
    </div>
  );
}
