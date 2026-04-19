import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="privacy-container">
      <header className="privacy-header">
        <Link href="/" className="btn-back">
          ← Volver al inicio
        </Link>
        <h1>Términos de Servicio y Política de Privacidad</h1>
        <p className="last-update">Última actualización: Abril 2024</p>
      </header>

      <main className="privacy-content">
        <section className="privacy-section">
          <h2>1. Gestión de Identidad</h2>
          <p>
            PlantitasApp utiliza <strong>Google OAuth 2.0</strong> y <strong>Supabase Auth</strong> como proveedores de identidad. Al
            iniciar sesión, solo recibimos y almacenamos los metadatos básicos proporcionados por Google (nombre, correo electrónico y foto
            de perfil) para crear tu perfil de usuario único y garantizar una experiencia personalizada.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Uso de Datos (Cero Comercialización)</h2>
          <p>Nuestra política es estricta y transparente:</p>
          <ul>
            <li>
              <strong>Validación:</strong> Los datos se utilizan exclusivamente para validar tu identidad y permitir el acceso a tu gestión
              de plantas, inventario y notas.
            </li>
            <li>
              <strong>No Spam:</strong> No utilizamos tu correo para campañas de marketing, listas de difusión ni publicidad intrusiva.
            </li>
            <li>
              <strong>No Venta:</strong> No vendemos, intercambiamos ni distribuimos tus datos personales a terceros bajo ninguna
              circunstancia.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Almacenamiento y Seguridad</h2>
          <p>Toda la persistencia de datos se realiza en infraestructuras de clase mundial para garantizar tu tranquilidad:</p>
          <ul>
            <li>
              <strong>Autenticación:</strong> Gestionada de forma segura por los servidores de Google y Supabase.
            </li>
            <li>
              <strong>Base de Datos:</strong> Tus registros se almacenan en instancias cifradas de Supabase, protegidos por políticas de
              seguridad a nivel de fila (Row Level Security - RLS), asegurando que solo vos puedas ver tu información.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Control del Usuario</h2>
          <p>
            En cumplimiento con los estándares internacionales de privacidad, tenés el control total. Podés solicitar la eliminación total
            de tu cuenta y todos los datos asociados en cualquier momento desde la configuración de tu perfil o contactándonos directamente.
          </p>
        </section>

        <footer className="privacy-footer">
          <p>
            Al utilizar PlantitasApp, aceptas estos términos. <br />
            Cultivando privacidad, bit a bit.
          </p>
        </footer>
      </main>
    </div>
  );
}
