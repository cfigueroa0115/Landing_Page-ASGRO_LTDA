'use client';

import { useState, useCallback } from 'react';
import Header from './Header';
import MobileNav from './MobileNav';

/**
 * HeaderWithMobileNav — Client wrapper that connects Header's hamburger
 * button to the MobileNav overlay panel.
 *
 * This component manages the open/close state and passes callbacks
 * to both Header and MobileNav.
 */
export default function HeaderWithMobileNav() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleOpen = useCallback(() => setIsMobileNavOpen(true), []);
  const handleClose = useCallback(() => setIsMobileNavOpen(false), []);
  const handleToggle = useCallback(() => setIsMobileNavOpen((prev) => !prev), []);

  return (
    <>
      <Header onMobileMenuOpen={handleOpen} />
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={handleClose}
        onToggle={handleToggle}
      />
    </>
  );
}
