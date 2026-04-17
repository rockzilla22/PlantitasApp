import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { AppShell } from "@/components/AppShell";
import { getSEOTags, renderSchemaTags } from "@/libs/seo";
import config from "@/data/configProject";

export const metadata = getSEOTags();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={config.language.split("-")[0] || "es"}>
      <body className="antialiased">
        {renderSchemaTags()}
        <Toaster position="bottom-center" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
