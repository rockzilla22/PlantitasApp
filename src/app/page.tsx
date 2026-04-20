"use client";

import configProject from "@/data/configProject";
import { PricingSection } from "@/components/sections/PricingSection";
import Image from "next/image";

type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export default function LandingPage() {
  const features: FeatureItem[] = Object.values(configProject.navigation.ES)
    .filter((item): item is typeof item & { href: string; icon: string } => Boolean(item.href && item.icon && item.label !== "Jardín"))
    .map((item) => ({
      title: item.label,
      description: item.description,
      icon: item.icon,
    }));

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Versión 1.0 — Beta</span>
          <h1>
            La app más completa <span className="hero-break"><br /></span> que todo Plant Lover necesita.
          </h1>
          <p className="text-[var(--text-brown)]">
            En PlantitasApp sabemos que cada hoja nueva es un logro y cada brote cuenta una historia. Esta aplicación nace para ser la
            compañera ideal en tu camino como coleccionista, brindándote el control total sobre los cuidados, riegos y necesidades
            específicas de cada una de tus joyas verdes. Organiza tu colección, registra su progreso y asegúrate de que siempre tengan
            exactamente lo que necesitan.
          </p>
        </div>
        <div className="hero-visual">
          <div className="plant-card-mockup">
            <div className="mock-header">
              <Image src="/icons/environment/plants/monstera.svg" width={16} height={16} alt="" className="object-contain inline mr-1" />
              Monstera Deliciosa
            </div>
            <div className="mock-body">
              <p className="text-[var(--text-brown)]">
                <Image src="/icons/common/map.svg" width={13} height={13} alt="" className="object-contain inline mr-1" />
                Sala · Media
              </p>
              <div className="mock-status">
                <Image
                  src="/icons/environment/inventory/water_drops.svg"
                  width={13}
                  height={13}
                  alt=""
                  className="object-contain inline mr-1"
                />
                Último riego: Hoy
              </div>
            </div>
          </div>
          <div className="plant-card-mockup secondary">
            <div className="mock-header">
              <Image src="/icons/environment/log/lab.svg" width={16} height={16} alt="" className="object-contain inline mr-1" />
              Esqueje de Pothos
            </div>
            <div className="mock-body">
              <p className="text-[var(--text-brown)]"></p>
              <p>
                <Image src="/icons/common/map.svg" width={13} height={13} alt="" className="object-contain inline mr-1" />
                Sala · Media
              </p>
              <div className="mock-status">
                <Image src="/icons/common/notes.svg" width={13} height={13} alt="" className="object-contain inline mr-1" />
                Raíces visibles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Plans */}
      <PricingSection />

      {/* Features Grid */}
      <section className="info-section">
        <div className="section-title">
          <h2>Todo lo que necesitas</h2>
          <p className="text-[var(--text-brown)]">Herramientas diseñadas para el cuidado real de tus plantas.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-icon">
                <Image src={f.icon} alt="" width={28} height={28} className="object-contain" />
                <h4>{f.title}</h4>
              </div>
              <p className="text-[var(--text-brown)]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="info-section bg-soft about-section">
        <div className="section-title">
          <h2>Historia del Proyecto</h2>
        </div>
        <p className="about-copy">
          Esta app germinó como una visión de <strong className="text-[var(--primary)]">Erzu</strong> por simplificar el cuidado botánico.
          Fue cultivada tecla a tecla por{" "}
          <a href="https://github.com/JFEspanolito" target="_blank" rel="noopener noreferrer">
            <strong className="text-[var(--primary)]">JFEspanolito </strong>
          </a>
          y
          <a href="https://github.com/rockzilla22" target="_blank" rel="noopener noreferrer">
            <strong className="text-[var(--primary)]"> Alex</strong>
          </a>
          , en medio de estrategias, ataques coordinados y partidas de Dota. Mientras defendíamos el ancestro, también construíamos el
          refugio digital perfecto para tus plantas. Porque sabemos que cuidar de una selva personal requiere la misma precisión que ganar
          una partida difícil, las cuales sirvieron de inspiración para transformar una gran idea en una herramienta real.
        </p>
      </section>

      <style jsx>{`
        .landing-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding: 2rem 1rem 3rem;
          overflow-x: clip;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-Items: center;
          padding: 4rem 0;
        }

        @media (max-width: 900px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem 0;
            gap: 2.5rem;
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
          font-size: clamp(2.5rem, 8vw, 3.5rem);
          line-height: 1.1;
          color: var(--primary);
          margin-bottom: 1.5rem;
          text-wrap: balance;
        }

        .hero-content p {
          font-size: clamp(1rem, 4vw, 1.25rem);
          color: var(--text-brown);
        }

        .hero-break {
          display: inline;
        }

        .hero-actions-row {
          grid-column: 1 / -1;
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-Items: center;
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
          min-width: 0;
        }

        .plant-card-mockup {
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: min(100%, 280px);
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
          min-width: 0;
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
          font-size: clamp(2rem, 7vw, 2.5rem);
          color: var(--primary);
          margin-bottom: 1rem;
          text-wrap: balance;
        }

        .section-title p {
          font-size: clamp(1rem, 4vw, 1.1rem);
          color: var(--text-brown);
        }

        .about-section {
          text-align: center;
          max-width: 900px;
          margin: 2rem auto;
          padding: 4rem;
        }

        .about-copy {
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-brown);
          font-style: italic;
          overflow-wrap: anywhere;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 700px) {
          .features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1100px) {
          .features-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .feature-item {
          padding: 2.5rem 2rem;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .feature-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
        }

        .feature-icon {
          display: flex;
          align-Items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .feature-item h4 {
          font-size: 1.25rem;
          margin-bottom: 0;
          color: var(--primary);
        }

        .feature-item p {
          color: var(--text-brown);
          font-size: 0.95rem;
        }

        @media (max-width: 700px) {
          .landing-container {
            padding-inline: 0.75rem;
          }

          .hero-break {
            display: none;
          }

          .hero-visual {
            height: auto;
            display: grid;
            gap: 1rem;
            justify-Items: center;
          }

          .plant-card-mockup.secondary {
            position: relative;
            right: auto;
            bottom: auto;
            transform: rotate(0deg);
          }

          .info-section {
            padding: 3rem 1.15rem;
            margin: 2.5rem 0;
            border-radius: 1.5rem;
          }

          .section-title {
            margin-bottom: 2.5rem;
          }

          .feature-item {
            padding: 1.5rem 1.25rem;
            border-radius: 1.5rem;
          }

          .feature-icon {
            align-Items: flex-start;
          }

          .about-section {
            padding: 2.5rem 1.25rem;
          }

          .about-copy {
            font-size: 1rem;
            line-height: 1.7;
          }
        }
      `}</style>
    </div>
  );
}
