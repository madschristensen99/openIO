'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const setupScrollReveal = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
      );

      document.querySelectorAll('.scroll-text').forEach((el) => {
        observer.observe(el);
      });
    };

    // Delay to ensure DOM is ready
    setTimeout(setupScrollReveal, 100);
  }, []);

  return null;
}

