'use client';

import { useCallback, useEffect, useState } from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import { useFloatingUI } from '@/components/shared/FloatingUIProvider';

/**
 * HeaderWithMobileNav — Client wrapper that connects Header's hamburger
 * button to the MobileNav overlay panel.
 *
 * This component manages the open/close state and passes callbacks
 * to both Header and MobileNav.
 */
export default function HeaderWithMobileNav() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { setMobileNavOpen } = useFloatingUI();

  // Informar al contexto flotante del estado del menú (para ocultar widgets).
  useEffect(() => {
    setMobileNavOpen(isMobileNavOpen);
  }, [isMobileNavOpen, setMobileNavOpen]);

  const handleOpen = useCallback(() => setIsMobileNavOpen(true), []);
  const handleClose = useCallback(() => setIsMobileNavOpen(false), []);
  const handleToggle = useCallback(() => setIsMobileNavOpen((prev) => !prev), []);

  return (
    <>
      <Header onMobileMenuOpen={handleOpen} isMobileMenuOpen={isMobileNavOpen} />
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={handleClose}
        onToggle={handleToggle}
      />
    </>
  );
}
