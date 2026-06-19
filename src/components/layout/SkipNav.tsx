/**
 * SkipNav — Skip navigation link for keyboard accessibility.
 * Visually hidden by default, becomes visible on focus.
 * Allows keyboard users to skip past navigation directly to main content.
 */
export default function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-brand-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-btn focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
    >
      Ir al contenido principal
    </a>
  );
}
