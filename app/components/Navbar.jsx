import React, {useState, useEffect} from 'react';

/**
 * A reusable, layout-only navbar component.
 * It expects you to pass in brand, nav (main navigation), and ctas content.
 * Visual styling is driven by the existing `.header` and related classes in app/styles/app.css.
 *
 * @param {{
 *   hamburger?: React.ReactNode;
 *   brand: React.ReactNode;
 *   nav?: React.ReactNode;
 *   ctas?: React.ReactNode;
 * }} NavbarProps
 */
export function Navbar({hamburger, brand, nav, ctas}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`navbar-header sticky top-0 z-20 flex h-16 items-center gap-3 px-4 md:h-20 md:px-6 text-slate-50 transition-all duration-300 ${
        isScrolled ? 'navbar-scrolled' : 'navbar-top'
      }`}
    >
      {hamburger}
      {brand}
      {nav}
      <div className="ml-auto flex items-center gap-3">
        {ctas}
      </div>
    </header>
  );
}
