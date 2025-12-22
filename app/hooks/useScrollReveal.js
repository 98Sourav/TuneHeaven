import {useEffect, useRef} from 'react';

/**
 * Adds a reveal-on-scroll animation to any section.
 * Returns a ref that should be applied to the element you want to animate.
 *
 * @param {Object} options
 * @param {number} [options.threshold=0.2]
 * @param {string} [options.rootMargin='0px 0px -10% 0px']
 * @param {boolean} [options.once=true]
 */
export function useScrollReveal({threshold = 0.2, rootMargin = '0px 0px -10% 0px', once = true} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      node.classList.add('scroll-visible');
      return undefined;
    }

    node.classList.add('scroll-init');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible');
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove('scroll-visible');
          }
        });
      },
      {threshold, rootMargin},
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
