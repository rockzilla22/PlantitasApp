"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      title: "🌱 Mis Plantas",
      description: "Registra cada ejemplar con su ubicación, luz y sustrato. Lleva el historial completo de riegos y cuidados.",
      icon: "🌿",
    },
    {
      title: "🧪 Propagación",
      description: "Seguimiento de esquejes y semillas. Vincula propagaciones con sus plantas madre y controla su evolución.",
      icon: "🧪",
    },
    {
      title: "📅 Temporada",
      description: "Organiza tareas por estación. Riego, poda, fertilización y siembra según el ciclo natural.",
      icon: "📅",
    },
    {
      title: "📦 Inventario",
      description: "Control de stock de tus insumos: sustratos, fertilizantes y medicamentos siempre al día.",
      icon: "📦",
    },
    {
      title: "✨ Lista de Deseos",
      description: "Tu Lista de Deseos botánicos organizada por prioridad para que no se te escape ninguna.",
      icon: "✨",
    },
    {
      title: "📝 Notas",
      description: "Espacio libre para tus observaciones rápidas, ideas o recordatorios de tu jardín.",
      icon: "📝",
    },
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Versión 1.0 — Beta 🌿</span>
          <h1>
            La app más completa <br /> que todo Plant Lover necesita.
          </h1>
          <p>
            En PlantitasApp sabemos que cada hoja nueva es un logro y cada brote cuenta una historia. Esta aplicación nace para ser la
            compañera ideal en tu camino como coleccionista, brindándote el control total sobre los cuidados, riegos y necesidades
            específicas de cada una de tus joyas verdes. Organiza tu colección, registra su progreso y asegúrate de que siempre tengan
            exactamente lo que necesitan.
          </p>
        </div>
        <div className="hero-visual">
          <div className="plant-card-mockup">
            <div className="mock-header">🌿 Monstera Deliciosa</div>
            <div className="mock-body">
              <p>📍 Sala · ☀️ Media</p>
              <div className="mock-status">💧 Último riego: Hoy</div>
            </div>
          </div>
          <div className="plant-card-mockup secondary">
            <div className="mock-header">🧪 Esqueje de Pothos</div>
            <div className="mock-body">
              <p>💧 Método: Agua</p>
              <div className="mock-status">✨ Raíces visibles</div>
            </div>
          </div>
        </div>
        <div className="hero-actions-row">
          <button className="btn-primary-large" onClick={() => router.push("/plants")}>
            Empezar mi jardín — Gratis
          </button>
          <button className="btn-secondary-large" disabled title="Próximamente">
            Ir a Premium ☁ (Próximamente)
          </button>
        </div>
      </section>

      {/* How it Works / Plans */}
      <section className="info-section bg-soft">
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
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="info-section">
        <div className="section-title">
          <h2>Todo lo que necesitas</h2>
          <p>Herramientas diseñadas para el cuidado real de tus plantas.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="info-section bg-soft" style={{ textAlign: "center", maxWidth: "900px", margin: "2rem auto", padding: "4rem 4rem" }}>
        <div className="section-title">
          <h2>Historia del Proyecto</h2>
        </div>
        <p style={{ fontSize: "1.15rem", lineHeight: "1.8", color: "var(--text-gray)", fontStyle: "italic" }}>
          Esta app germinó como una visión de <strong className="text-[var(--primary)]">Erzu</strong> por simplificar el cuidado botánico. Fue cultivada tecla a tecla por{" "}
          <a href="https://github.com/JFEspanolito" target="_blank" rel="noopener noreferrer">
            <strong className="text-[var(--primary)]">JFEspanolito</strong>
          </a>{" "}
          y{" "}
          <a href="https://github.com/rockzilla22" target="_blank" rel="noopener noreferrer">
            <strong className="text-[var(--primary)]">Alex</strong>
          </a>
          , en medio de estrategias, ataques coordinados y partidas de Dota. Mientras defendíamos el ancestro, también construíamos el
          refugio digital perfecto para tus plantas. Porque sabemos que cuidar de una selva personal requiere la misma precisión que ganar
          una partida difícil, las cuales sirvieron de inspiración para transformar una gran idea en una herramienta real.
        </p>
        <div style={{ marginTop: "2rem", fontSize: "2rem" }}>🎮🌿🛡️</div>
      </section>

      <style jsx>{`
        .landing-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          padding: 4rem 0;
        }

        @media (max-width: 900px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem 0;
          }
        }

        .hero-badge {
          display: inline-block;
          background: var(--primary-light);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          line-height: 1.1;
          color: var(--primary);
          margin-bottom: 1.5rem;
        }

        .hero-content p {
          font-size: 1.25rem;
          color: var(--text-gray);
        }

        .hero-actions-row {
          grid-column: 1 / -1;
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-top: -1rem;
        }

        @media (max-width: 900px) {
          .hero-actions-row {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        .btn-primary-large {
          background: var(--primary);
          color: white;
          border: none;
          padding: 1rem 2rem;
          min-width: 280px;
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
          min-width: 280px;
          border-radius: var(--radius);
          font-size: 1.1rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary-large:hover,
        .btn-secondary-large:hover {
          transform: translateY(-8px);
        }

        .hero-visual {
          position: relative;
          height: 300px;
        }

        .plant-card-mockup {
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: 280px;
          border: 1px solid var(--border);
        }

        .plant-card-mockup.secondary {
          position: absolute;
          bottom: 0;
          right: 0;
          transform: rotate(5deg);
        }

        .mock-header {
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--primary);
        }

        .mock-body p {
          font-size: 0.9rem;
          color: var(--text-gray);
        }

        .mock-status {
          margin-top: 1rem;
          font-size: 0.85rem;
          background: var(--background);
          padding: 0.5rem;
          border-radius: 8px;
          color: var(--primary);
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
        }

        .plan-card li {
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-item {
          padding: 2rem;
          background: var(--background);
          border-radius: var(--radius);
          transition: transform 0.2s;
        }

        .feature-item:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .feature-item h4 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .feature-item p {
          color: var(--text-gray);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
