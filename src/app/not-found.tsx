import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-[70vh] flex items-center justify-center"
      style={{ backgroundColor: "var(--background)", color: "var(--text)" }}
    >
      <div className="max-w-3xl text-center px-4">
        <div className="inline-flex flex-col md:flex-row items-center gap-6">
          <h1 className="text-6xl font-extrabold" style={{ color: "var(--primary)" }}>404</h1>
          <div className="hidden md:block h-10 border-l border-[var(--border)]" aria-hidden />
          <p className="text-xl font-bold">Esta página no existe.</p>
        </div>

        <p className="mt-6 text-sm text-[var(--text-gray)]">Parece que te perdiste en el bosque. Volvé a casa.</p>

        <div className="mt-6">
          <Link href="/" className="btn-primary">
            Ir al Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
