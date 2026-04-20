"use client";

import Image from "next/image";
import Link from "next/link";

export default function GardenPage() {
  return (
    <section className="flex registros-center justify-center p-6 bg-[var(--background)] animate-in fade-in duration-700">
      <div className="max-w-md w-full bg-[var(--white-glass)] backdrop-blur-md rounded-[2.5rem] border border-[var(--white)] shadow-xl text-center p-12">
        <div className="mx-auto mb-6 inline-flex w-[120px] justify-center">
          <Image
            src="/icons/common/construction.svg"
            alt="Construcción"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl text-[var(--primary)] mb-4 tracking-tight">Jardín Digital</h1>
        <p className="text-[var(--text-gray)] font-medium mb-12 leading-relaxed opacity-80">
          Estamos cultivando esta sección. Muy pronto podrás ver tu colección representada visualmente.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-[var(--primary)] text-[var(--text-white)] px-12 py-5 rounded-2xl text-base no-underline hover:bg-[var(--secondary)] hover:scale-105 transition-all shadow-xl active:scale-95 tracking-wide uppercase"
        >
          VOLVER AL INICIO
        </Link>
      </div>
    </section>
  );
}
