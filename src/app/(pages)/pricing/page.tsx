"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user } from "@/store/authStore";

export default function PricingPage() {
  const router = useRouter();
  const user = useStore($user);

  return (
    <div className="landing-container py-12">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
         <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
          ← Volver al inicio
        </Link>
      </header>

      {/* How it Works / Plans (Literal de la Home) */}
      <section className="info-section bg-soft" style={{ margin: '0 auto', maxWidth: '1000px' }}>
        <div className="section-title">
          <h2>Privacidad por diseño</h2>
          <p>Tus datos son tuyos. Elige cómo guardarlos.</p>
        </div>

        <div className="plans-grid">
          <div className="plan-card">
            <h3>Plan Gratuito 🌱</h3>
            <p className="plan-subtitle">100% Local y Privado</p>
            <ul>
              <li>✅ Todas las funciones incluidas</li>
              <li>✅ Datos en tu navegador (almacenamiento local)</li>
              <li>✅ Respaldo e Importación manual</li>
              <li>✅ Sin necesidad de crear cuenta</li>
            </ul>
            <button 
              className="btn-primary-large" 
              style={{ marginTop: '2rem', width: '100%', minWidth: 'unset' }}
              onClick={() => router.push(user ? "/plants" : "/login")}
            >
              Empezar mi jardín
            </button>
          </div>

          <div className="plan-card premium">
            <div className="premium-badge">RECOMENDADO</div>
            <h3>Plan Premium ☁</h3>
            <p className="plan-subtitle">Sincronización en la Nube</p>
            <ul>
              <li>✅ Todo lo del plan gratuito</li>
              <li>✅ Respaldo automático en la nube</li>
              <li>✅ Acceso multi-dispositivo</li>
              <li>✅ Papelera de registros recuperable</li>
            </ul>
            <button 
              className="btn-secondary-large" 
              disabled 
              style={{ marginTop: '2rem', width: '100%', minWidth: 'unset', opacity: 0.6 }}
            >
              Próximamente
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .info-section {
          padding: 6rem 2rem;
          border-radius: 2rem;
          margin: 4rem 0;
        }

        .bg-soft {
          background: white;
          border: 1px solid var(--border);
        }

        .section-title {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title h2 {
          font-size: 2.5rem;
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .section-title p {
          font-size: 1.1rem;
          color: var(--text-gray);
        }

        .plans-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }

        .plan-card {
          padding: 3rem;
          background: var(--background);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .plan-card.premium {
          background: white;
          border: 2px solid var(--secondary);
          box-shadow: 0 10px 30px rgba(255, 160, 0, 0.1);
        }

        .premium-badge {
          position: absolute;
          top: -12px;
          right: 20px;
          background: var(--secondary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .plan-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .plan-subtitle {
          color: var(--text-gray);
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .plan-card ul {
          list-style: none;
          flex: 1;
        }

        .plan-card li {
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .btn-primary-large {
          background: var(--primary);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: var(--radius);
          font-size: 1.1rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-secondary-large {
          background: white;
          color: var(--secondary);
          border: 2px solid var(--secondary);
          padding: 1rem 2rem;
          border-radius: var(--radius);
          font-size: 1.1rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary-large:hover:not(:disabled) {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}
