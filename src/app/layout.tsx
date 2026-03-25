import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AccessibilityProvider } from "@/components/AccessibilityPanel";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagnostico Institucional | ECP UNA",
  description: "Sistema publico de caracterizacion institucional para la Escuela de Ciencias Politicas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

const accessibilityBootstrap = `
  (() => {
    try {
      const raw = localStorage.getItem("encuesta-ecp-una-accessibility");
      const prefs = raw ? JSON.parse(raw) : {};
      const root = document.documentElement;
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const theme = prefs.theme === "dark" || prefs.theme === "light" ? prefs.theme : systemTheme;
      root.dataset.theme = theme;
      root.dataset.fontScale = prefs.fontScale || "base";
      root.dataset.contrast = prefs.contrast || "normal";
      root.dataset.motion = prefs.motion || "normal";
      root.dataset.spacing = prefs.spacing || "normal";
      root.style.colorScheme = theme;
    } catch (error) {
      console.warn("No se pudieron cargar las preferencias de accesibilidad.", error);
    }
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Script id="accessibility-bootstrap" strategy="beforeInteractive">
          {accessibilityBootstrap}
        </Script>
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
