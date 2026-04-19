"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user } from "@/store/authStore";
import { getPlanLevel } from "@/libs/syncService";
import configProject from "@/data/configProject";

export function PricingSection() {
  const router = useRouter();
  const user = useStore($user);
  const p = configProject.plans;
  const currentPlanId = getPlanLevel(user);

  return (
    <>
      <section className="info-section bg-soft" style={{ margin: "0 auto", maxWidth: "1400px" }}>
        <div className="section-title">
          <h2>Cultiva sin límites</h2>
          <p>Tus datos son tuyos. Elige el nivel de expansión que necesitas.</p>
        </div>

        <div className="plans-grid">
          {/* MODO INVITADO (SIN CUENTA) */}
          <div className={`plan-card guest ${currentPlanId === p.NONE.id ? "current-plan" : ""}`}>
            {currentPlanId === p.NONE.id && <div className="current-badge">TU NIVEL ACTUAL</div>}
            <h3>{p.NONE.label}</h3>
            <p className="plan-subtitle">Uso Efímero</p>
            <ul>
              <li><img src="/icons/common/fail.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Sin registro / perfil</li>
              <li><img src="/icons/common/fail.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Sin respaldo real</li>
              <li><img src="/icons/common/warning.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Límite: {p.NONE.maxSlots} items</li>
              <li><img src="/icons/common/warning.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Riesgo de pérdida al borrar cache</li>
            </ul>
            <button
              className="btn-primary-large"
              style={{ marginTop: "2rem", width: "100%", background: "var(--text-gray)", opacity: 0.8 }}
              onClick={() => router.push("/plants")}
            >
              {currentPlanId === p.NONE.id ? "Seguir Probando" : "Modo Invitado"}
            </button>
          </div>

          {/* PLAN GRATUITO (CON CUENTA) */}
          <div className={`plan-card ${currentPlanId === p.FREE.id ? "current-plan" : ""}`}>
            {currentPlanId === p.FREE.id && <div className="current-badge">TU NIVEL ACTUAL</div>}
            <h3>{p.FREE.label}</h3>
            <p className="plan-subtitle">Identidad Botánica</p>
            <ul>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Tu perfil guardado</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Límite: {p.FREE.maxSlots} items</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Historial de acciones</li>
              <li><img src="/icons/common/fail.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Sin sincronización nube</li>
            </ul>
            <button
              className="btn-primary-large"
              style={{ marginTop: "2rem", width: "100%" }}
              onClick={() => router.push(user ? "/plants" : "/login")}
            >
              {user ? "Ir a mis plantas" : "Crear Cuenta"}
            </button>
          </div>

          {/* PLAN PREMIUM */}
          <div className={`plan-card premium ${currentPlanId === p.PREMIUM.id ? "current-plan" : ""}`}>
            {currentPlanId === p.PREMIUM.id && <div className="current-badge">TU NIVEL ACTUAL</div>}
            {currentPlanId !== p.PREMIUM.id && <div className="premium-badge">RECOMENDADO</div>}
            <h3>{p.PREMIUM.label}</h3>
            <p className="plan-subtitle">Sincronización en la Nube</p>
            <ul>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Todo lo del plan gratuito</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Items ILIMITADOS</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Respaldo automático Cloud</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Acceso multi-dispositivo</li>
            </ul>
            <button className="btn-secondary-large" disabled style={{ marginTop: "2rem", width: "100%", opacity: 0.6 }}>
              Próximamente
            </button>
          </div>

          {/* PLAN PRO */}
          <div className={`plan-card pro ${currentPlanId === p.PRO.id ? "current-plan" : ""}`}>
            {currentPlanId === p.PRO.id && <div className="current-badge">TU NIVEL ACTUAL</div>}
            <h3>{p.PRO.label}</h3>
            <p className="plan-subtitle">Expansión Permanente</p>
            <ul>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Pago único vitalicio</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> +{p.PRO.maxSlots} slots adicionales</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Sin suscripciones</li>
              <li><img src="/icons/common/success.svg" width={13} height={13} alt="" className="object-contain inline mr-1" /> Sincronización Cloud</li>
            </ul>
            <button
              className="btn-secondary-large"
              disabled
              style={{ marginTop: "2rem", width: "100%", opacity: 0.6, borderColor: "var(--secondary)", color: "var(--secondary)" }}
            >
              Próximamente
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
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
          font-weight: 900;
        }

        .section-title p {
          font-size: 1.1rem;
          color: var(--text-gray);
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (min-width: 1200px) {
          .plans-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .plan-card {
          padding: 2.5rem 2rem;
          background: var(--background);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          position: relative;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
        }

        .plan-card.current-plan {
          border: 3px solid var(--primary);
          background: var(--bg-faint);
        }

        .plan-card:hover {
          transform: translateY(-5px);
        }

        .plan-card.premium {
          background: white;
          border: 2px solid var(--secondary);
          box-shadow: 0 10px 40px rgba(255, 160, 0, 0.15);
        }

        .plan-card.pro {
          background: white;
          border: 1px solid var(--border);
        }

        .premium-badge,
        .current-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--secondary);
          color: white;
          padding: 0.35rem 1rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 1px;
          white-space: nowrap;
          z-index: 10;
        }

        .current-badge {
          background: var(--primary);
        }

        .plan-card h3 {
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
          font-weight: 900;
        }

        .plan-subtitle {
          color: var(--text-gray);
          margin-bottom: 2.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.7;
        }

        .plan-card ul {
          list-style: none;
          flex: 1;
          padding: 0;
          margin: 0;
        }

        .plan-card li {
          margin-bottom: 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-gray);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary-large {
          background: var(--primary);
          color: white;
          border: none;
          padding: 1.2rem 2rem;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-secondary-large {
          background: white;
          color: var(--secondary);
          border: 2px solid var(--secondary);
          padding: 1.2rem 2rem;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-primary-large:hover:not(:disabled) {
          background: var(--secondary);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}
