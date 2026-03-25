"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Accessibility, Check, Contrast, Minus, Moon, Plus, RotateCcw, Sun, Type } from "lucide-react";

type ThemePreference = "system" | "dark" | "light";
type FontScale = "base" | "lg" | "xl";
type ContrastPreference = "normal" | "high";
type MotionPreference = "normal" | "reduced";
type SpacingPreference = "normal" | "comfortable";

type AccessibilityPreferences = {
  theme: ThemePreference;
  fontScale: FontScale;
  contrast: ContrastPreference;
  motion: MotionPreference;
  spacing: SpacingPreference;
};

type AccessibilityContextValue = {
  preferences: AccessibilityPreferences;
  setPreference: <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => void;
  resetPreferences: () => void;
  reduceMotion: boolean;
};

const STORAGE_KEY = "encuesta-ecp-una-accessibility";

const defaultPreferences: AccessibilityPreferences = {
  theme: "system",
  fontScale: "base",
  contrast: "normal",
  motion: "normal",
  spacing: "normal",
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function resolveTheme(theme: ThemePreference) {
  if (typeof window === "undefined") {
    return "dark";
  }

  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const { preferences, setPreference, resetPreferences } = useAccessibility();
  const fontScaleOrder: FontScale[] = ["base", "lg", "xl"];
  const fontScaleLabels: Record<FontScale, string> = {
    base: "Base",
    lg: "Grande",
    xl: "Extra grande",
  };

  const currentScaleIndex = fontScaleOrder.indexOf(preferences.fontScale);
  const decreaseScale = () => setPreference("fontScale", fontScaleOrder[Math.max(0, currentScaleIndex - 1)]);
  const increaseScale = () =>
    setPreference("fontScale", fontScaleOrder[Math.min(fontScaleOrder.length - 1, currentScaleIndex + 1)]);

  const actionClassName =
    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-borde bg-panel text-tinta transition hover:bg-panelSec";
  const toggleClassName = (active: boolean) =>
    `rounded-2xl border px-3 py-2 text-sm font-medium transition ${
      active ? "border-dorado bg-dorado/15 text-tinta" : "border-borde bg-panel text-tenue hover:bg-panelSec"
    }`;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-3">
      {open ? (
        <div className="w-[min(24rem,calc(100vw-2rem))] rounded-[28px] border border-borde bg-panel/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-dorado">Inclusion visual</p>
              <h2 className="mt-2 text-lg font-bold text-tinta">Panel de accesibilidad</h2>
              <p className="mt-2 text-sm leading-6 text-tenue">
                Ajustes rapidos para lectura, contraste y navegacion comoda.
              </p>
            </div>
            <button type="button" onClick={resetPreferences} className={actionClassName} aria-label="Restablecer ajustes">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl border border-borde bg-panelSec/70 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-tinta">
                <Sun className="h-4 w-4" />
                Tema
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setPreference("theme", "light")} className={toggleClassName(preferences.theme === "light")}>
                  Claro
                </button>
                <button type="button" onClick={() => setPreference("theme", "dark")} className={toggleClassName(preferences.theme === "dark")}>
                  Oscuro
                </button>
                <button type="button" onClick={() => setPreference("theme", "system")} className={toggleClassName(preferences.theme === "system")}>
                  Sistema
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-borde bg-panelSec/70 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-tinta">
                <Type className="h-4 w-4" />
                Tamano del texto
              </div>
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={decreaseScale} className={actionClassName} disabled={preferences.fontScale === "base"} aria-label="Reducir texto">
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1 rounded-2xl border border-borde bg-panel px-4 py-3 text-center text-sm font-medium text-tinta">
                  {fontScaleLabels[preferences.fontScale]}
                </div>
                <button type="button" onClick={increaseScale} className={actionClassName} disabled={preferences.fontScale === "xl"} aria-label="Aumentar texto">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPreference("contrast", preferences.contrast === "normal" ? "high" : "normal")}
                className="rounded-3xl border border-borde bg-panelSec/70 p-3 text-left transition hover:bg-panelSec"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-tinta">
                  <Contrast className="h-4 w-4" />
                  Alto contraste
                </div>
                <p className="mt-2 text-sm leading-6 text-tenue">
                  Mejora bordes y lectura para personas con baja vision.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-tinta">
                  {preferences.contrast === "high" ? <Check className="h-4 w-4 text-dorado" /> : null}
                  {preferences.contrast === "high" ? "Activado" : "Activar"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreference("motion", preferences.motion === "normal" ? "reduced" : "normal")}
                className="rounded-3xl border border-borde bg-panelSec/70 p-3 text-left transition hover:bg-panelSec"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-tinta">
                  <Moon className="h-4 w-4" />
                  Reducir movimiento
                </div>
                <p className="mt-2 text-sm leading-6 text-tenue">
                  Reduce animaciones para una experiencia mas estable.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-tinta">
                  {preferences.motion === "reduced" ? <Check className="h-4 w-4 text-dorado" /> : null}
                  {preferences.motion === "reduced" ? "Activado" : "Activar"}
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPreference("spacing", preferences.spacing === "normal" ? "comfortable" : "normal")}
              className="w-full rounded-3xl border border-borde bg-panelSec/70 p-3 text-left transition hover:bg-panelSec"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-tinta">Espaciado comodo</div>
                  <p className="mt-2 text-sm leading-6 text-tenue">
                    Da mas aire entre lineas para facilitar la lectura prolongada.
                  </p>
                </div>
                <div className="shrink-0 text-sm font-medium text-tinta">
                  {preferences.spacing === "comfortable" ? "Activo" : "Normal"}
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-3 rounded-full border border-borde bg-panel/95 px-4 py-3 text-sm font-semibold text-tinta shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur transition hover:bg-panelSec"
        aria-expanded={open}
        aria-label="Abrir panel de accesibilidad"
      >
        <Accessibility className="h-5 w-5 text-dorado" />
        Accesibilidad
      </button>
    </div>
  );
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      setPreferences((current) => ({ ...current, ...JSON.parse(raw) }));
    } catch (error) {
      console.warn("No se pudieron leer las preferencias de accesibilidad.", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const resolvedTheme = resolveTheme(preferences.theme);

    root.dataset.theme = resolvedTheme;
    root.dataset.fontScale = preferences.fontScale;
    root.dataset.contrast = preferences.contrast;
    root.dataset.motion = preferences.motion;
    root.dataset.spacing = preferences.spacing;
    root.style.colorScheme = resolvedTheme;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn("No se pudieron guardar las preferencias de accesibilidad.", error);
    }

    if (preferences.theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      root.dataset.theme = media.matches ? "dark" : "light";
      root.style.colorScheme = media.matches ? "dark" : "light";
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncSystemTheme);
      return () => media.removeEventListener("change", syncSystemTheme);
    }

    media.addListener(syncSystemTheme);
    return () => media.removeListener(syncSystemTheme);
  }, [preferences]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      preferences,
      setPreference: (key, value) => setPreferences((current) => ({ ...current, [key]: value })),
      resetPreferences: () => setPreferences(defaultPreferences),
      reduceMotion: preferences.motion === "reduced",
    }),
    [preferences],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <AccessibilityControls />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }

  return context;
}
