"use client";

import React from "react";
import Link from "next/link";

export default function GardenPage() {
  return (
    <section id="tab-garden" className="tab-content active">
      <div className="max-w-md w-full bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl text-center">
        <br />
        <div className="text-5xl mb-10">🚧</div>
        <br />
        <h1 className="text-3xl font-black text-[var(--primary)] tracking-tight">Jardín Digital</h1>
        <br />
        <p className="text-zinc-500 font-medium leading-relaxed">
          Estamos cultivando esta terreno. Muy pronto podrás ver tu colección representada visualmente en un refugio digital interactivo.
        </p>
        <br />
        <Link
          href="/"
          className="inline-flex items-center justify-center mt-8 mb-8 bg-[var(--primary)] text-white px-16 py-6 rounded-2xl font-black text-base no-underline hover:bg-[var(--secondary)] hover:scale-105 transition-all shadow-xl active:scale-95 tracking-wider min-w-[180px]"
        >
          Regresar
        </Link>
        <br />
        <br />
      </div>
    </section>
  );
}
