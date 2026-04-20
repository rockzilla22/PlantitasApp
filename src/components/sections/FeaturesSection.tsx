"use client";

import configProject from "@/data/configProject";
import Image from "next/image";

type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export function FeatureSection() {
  const features: FeatureItem[] = Object.values(configProject.navigation.ES)
    .filter((item): item is typeof item & { icon: string } => Boolean(item.icon))
    .map((item) => ({
      title: item.label,
      description: item.description,
      icon: item.icon,
    }));

  const lastFeatureIndex = features.length - 1;
  const hasSingleLastItemOnTablet = features.length > 1 && features.length % 2 === 1;
  const hasSingleLastItemOnDesktop = features.length > 2 && features.length % 3 === 1;

  return (
    <>
      <div className="features-grid">
        {features.map((f, i) => (
          <div
            key={i}
            className={[
              "feature-item",
              hasSingleLastItemOnTablet && i === lastFeatureIndex ? "feature-item--center-tablet" : "",
              hasSingleLastItemOnDesktop && i === lastFeatureIndex ? "feature-item--center-desktop" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="feature-icon">
              <Image src={f.icon} alt="" width={28} height={28} className="object-contain" />
              <h4>{f.title}</h4>
            </div>
            <p className="text-[var(--text-brown)]">{f.description}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 700px) {
          .features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .feature-item--center-tablet {
            grid-column: 1 / -1;
            max-width: min(32rem, 100%);
            justify-self: center;
            width: 100%;
          }
        }

        @media (min-width: 1100px) {
          .features-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .feature-item--center-tablet {
            grid-column: auto;
            max-width: none;
            justify-self: stretch;
          }

          .feature-item--center-desktop {
            grid-column: 2;
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

        .feature-item h4 {
          font-size: 1.25rem;
          margin-bottom: 0;
          color: var(--primary);
        }

        .feature-item p {
          color: var(--text-brown);
          font-size: 0.95rem;
        }

        .feature-icon {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 700px) {
          .feature-item {
            padding: 1.5rem 1.25rem;
            border-radius: 1.5rem;
          }

          .feature-icon {
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}
