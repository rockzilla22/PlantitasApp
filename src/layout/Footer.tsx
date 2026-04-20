"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="app-footer">
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "center" }}>
        <Link href="/pricing" className="btn-text !bg-transparent" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
          Planes
        </Link>
        <Link href="/privacy" className="btn-text !bg-transparent" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
          Privacidad y Términos
        </Link>
      </div>
    </footer>
  );
}
