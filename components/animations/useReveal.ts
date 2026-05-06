'use client';

/**
 * Hook reutilizable de animaciones GSAP para Suelo.
 *
 * - useReveal: anima al montar (Hero, páginas de destino)
 * - useRevealOnScroll: anima cuando entra al viewport (cards, features)
 *
 * Ambos respetan `prefers-reduced-motion: reduce` — si el usuario lo activa,
 * los elementos aparecen inmediatamente sin animación.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useReveal(options?: { stagger?: number; duration?: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const targets = ref.current.querySelectorAll<HTMLElement>('[data-reveal]');
    if (targets.length === 0) return;

    if (prefersReduced) {
      targets.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.7,
          ease: 'power3.out',
          stagger: options?.stagger ?? 0.08,
          delay: options?.delay ?? 0.1,
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [options?.stagger, options?.duration, options?.delay]);

  return ref;
}

export function useRevealOnScroll(options?: {
  stagger?: number;
  duration?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = ref.current.querySelectorAll<HTMLElement>('[data-reveal]');
    if (targets.length === 0) return;

    if (prefersReduced) {
      targets.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Estado inicial
    gsap.set(Array.from(targets), { opacity: 0, y: 24 });

    const animated = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisible = entries.filter(
          (e) => e.isIntersecting && !animated.has(e.target)
        );
        if (newlyVisible.length === 0) return;

        newlyVisible.forEach((e) => animated.add(e.target));

        gsap.to(
          newlyVisible.map((e) => e.target),
          {
            opacity: 1,
            y: 0,
            duration: options?.duration ?? 0.6,
            ease: 'power3.out',
            stagger: options?.stagger ?? 0.08,
          }
        );
      },
      { threshold: options?.threshold ?? 0.2, rootMargin: '0px 0px -80px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [options?.stagger, options?.duration, options?.threshold]);

  return ref;
}
