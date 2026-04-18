"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="app-footer">
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "center" }}>
        <Link href="/pricing" className="btn-text" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
          Planes
        </Link>
        <a
          href="https://github.com/JFEspanolito/PlantitasApp"
          target="_blank"
          rel="noreferrer"
          title="Ver código en GitHub"
          className="github-link"
        >
          <Image src="/icons/github.svg" alt="GitHub" width={24} height={24} className="github-icon" />
        </a>
        <Link href="/privacy" className="btn-text" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
          Privacidad y Términos
        </Link>
      </div>
    </footer>
  );
}
