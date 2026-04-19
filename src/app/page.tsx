"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@nanostores/react";
import { $user } from "@/store/authStore";
import configProject from "@/data/configProject";
import { PricingSection } from "@/components/sections/PricingSection";

export default function LandingPage() {
  const router = useRouter();
  const user = useStore($user);

  const features = Object.values(configProject.navigation.ES)
    .filter((item) => item.href && item.label !== "Jardín")
    .map((item) => ({
      title: item.label,
      description: item.description,
      icon: item.icon || "🌱",
    }));

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Versión 1.0 — Beta 🌿</span>
          <h1>
            La app más completa <br /> que todo Plant Lover necesita.
          </h1>
          <p className="!text-[var(--text-brown)]">
            En PlantitasApp sabemos que cada hoja nueva es un logro y cada brote cuenta una historia. Esta aplicación nace para ser la
            compañera ideal en tu camino como coleccionista, brindándote el control total sobre los cuidados, riegos y necesidades
            específicas de cada una de tus joyas verdes. Organiza tu colección, registra su progreso y asegúrate de que siempre tengan
            exactamente lo que necesitan.
          </p>
        </div>
        <div className="hero-visual">
          <div className="plant-card-mockup">
            <div className="mock-header"><img src="/icons/environment/plants/monstera.svg" width={16} height={16} alt="" className="object-contain inline mr-1" />Monstera Deliciosa</div>
            <div className="mock-body">
              <p><img src="/icons/environment/sun.svg" width={13} height={13} alt="" className="object-contain inline mr-1" />Sala · Media</p>
              <div className="mock-status"><img src="/icons/environment/inventory/water_drops.svg" width={13} height={13} alt="" className="object-contain inline mr-1" />Último riego: Hoy</div>
            </div>
          </div>
          <div className="plant-card-mockup secondary">
            <div className="mock-header"><img src="/icons/environment/log/lab.svg" width={16} height={16} alt="" className="object-contain inline mr-1" />Esqueje de Pothos</div>
            <div className="mock-body">
              <p><img src="/icons/environment/inventory/water_drops.svg" width={13} height={13} alt="" className="object-contain inline mr-1" />Método: Agua</p>
              <div className="mock-status"><img src="/icons/common/stars.svg" width={13} height={13} alt="" className="object-contain inline mr-1" />Raíces visibles</div>
            </div>
          </div>
        </div>
        <div className="hero-actions-row">
          <button className="btn-primary-large" onClick={() => router.push(user ? "/plants" : "/login")}>
            Empezar mi jardín — Gratis
          </button>
          <button className="btn-secondary-large" disabled title="Próximamente">
            Ir a Premium ☁ (Próximamente)
          </button>
        </div>
      </section>

      {/* How it Works / Plans */}
      <PricingSection />

      {/* Features Grid */}
      <section className="info-section">
        <div className="section-title">
          <h2>Todo lo que necesitas</h2>
          <p>Herramientas diseñadas para el cuidado real de tus plantas.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-icon"><img src={f.icon} width={28} height={28} alt="" className="object-contain" /></div>
              <h4>{f.title}</h4>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        className="info-section bg-soft"
        style={{ textAlign: "center", maxWidth: "900px", margin: "2rem auto", padding: "4rem 4rem" }}
      >
        <div className="section-title">
          <h2>Historia del Proyecto</h2>
        </div>
        <p style={{ fontSize: "1.15rem", lineHeight: "1.8", color: "var(--text-brown)", fontStyle: "italic" }}>
          Esta app germinó como una visión de <strong className="text-[var(--primary)]">Erzu</strong> por simplificar el cuidado botánico.
          Fue cultivada tecla a tecla por{" "}
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
          max-width: 1400px;
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
          color: var(--text-brown);
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
          color: var(--text-white);
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
          color: var(--text-brown);
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
          color: var(--text-brown);
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
          color: var(--text-brown);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
