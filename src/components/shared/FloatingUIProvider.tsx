'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * FloatingUIProvider — Coordinación limpia entre los elementos flotantes.
 *
 * Un único widget flotante puede estar abierto a la vez (asistente IA o
 * WhatsApp): abrir uno cierra el otro. Además expone el estado del menú móvil
 * para que los widgets se oculten mientras el menú está abierto (evita que se
 * superpongan por encima del overlay del menú).
 *
 * Es un contexto local montado en el layout (sin estado global ni hacks).
 */

export type FloatingWidget = 'assistant' | 'whatsapp' | null;

interface FloatingUIContextValue {
  /** Widget flotante abierto actualmente (o null). */
  openWidget: FloatingWidget;
  /** true si el menú de navegación móvil está abierto. */
  isMobileNavOpen: boolean;
  /** Abre un widget (cierra el otro automáticamente). */
  openFloating: (widget: Exclude<FloatingWidget, null>) => void;
  /** Cierra cualquier widget flotante abierto. */
  closeFloating: () => void;
  /** Alterna un widget concreto. */
  toggleFloating: (widget: Exclude<FloatingWidget, null>) => void;
  /** Notifica el estado del menú móvil. */
  setMobileNavOpen: (open: boolean) => void;
}

const FloatingUIContext = createContext<FloatingUIContextValue | null>(null);

export function FloatingUIProvider({ children }: { children: ReactNode }) {
  const [openWidget, setOpenWidget] = useState<FloatingWidget>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const openFloating = useCallback((widget: Exclude<FloatingWidget, null>) => {
    setOpenWidget(widget);
  }, []);

  const closeFloating = useCallback(() => {
    setOpenWidget(null);
  }, []);

  const toggleFloating = useCallback((widget: Exclude<FloatingWidget, null>) => {
    setOpenWidget((current) => (current === widget ? null : widget));
  }, []);

  const setMobileNavOpen = useCallback((open: boolean) => {
    setIsMobileNavOpen(open);
    // Al abrir el menú móvil, cerrar cualquier widget flotante.
    if (open) setOpenWidget(null);
  }, []);

  const value = useMemo<FloatingUIContextValue>(
    () => ({
      openWidget,
      isMobileNavOpen,
      openFloating,
      closeFloating,
      toggleFloating,
      setMobileNavOpen,
    }),
    [openWidget, isMobileNavOpen, openFloating, closeFloating, toggleFloating, setMobileNavOpen]
  );

  return <FloatingUIContext.Provider value={value}>{children}</FloatingUIContext.Provider>;
}

/**
 * Hook de acceso al contexto. Devuelve un fallback seguro (no-op) si se usa
 * fuera del provider, de modo que los componentes puedan renderizarse en
 * aislamiento (p. ej. en tests) sin envolverlos obligatoriamente.
 */
export function useFloatingUI(): FloatingUIContextValue {
  const ctx = useContext(FloatingUIContext);
  if (ctx) return ctx;
  return {
    openWidget: null,
    isMobileNavOpen: false,
    openFloating: () => {},
    closeFloating: () => {},
    toggleFloating: () => {},
    setMobileNavOpen: () => {},
  };
}
