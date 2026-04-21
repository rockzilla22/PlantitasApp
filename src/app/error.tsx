"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error?.message || String(error));
  }, [error]);

  return (
    <main
      className="min-h-[70vh] flex items-center justify-center"
      style={{ backgroundColor: "var(--background)", color: "var(--text)" }}
    >
      <div className="max-w-3xl text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Algo salió mal</h1>
        <p className="mt-4 text-sm text-[var(--text-gray)]">Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.</p>

        <div className="mt-6 flex justify-center gap-4">
          <button onClick={() => reset()} className="btn-primary">
            Intentar de nuevo
          </button>
          <Link href="/" className="btn-backup">
            Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
