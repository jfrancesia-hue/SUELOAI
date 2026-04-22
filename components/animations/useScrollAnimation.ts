'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;
function ensureRegistered() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/**
 * Hook para animar un contador numérico cuando entra al viewport.
 */
export function useCounterAnimation(targetValue: number, options?: { duration?: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ensureRegistered();
    if (!ref.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const el = ref.current;
    const decimals = options?.decimals ?? 0;

    if (prefersReduced) {
      el.textContent = targetValue.toLocaleString('es-AR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return;
    }

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: targetValue,
      duration: options?.duration ?? 1.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = obj.val.toLocaleString('es-AR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [targetValue, options?.duration, options?.decimals]);

  return ref;
}

/**
 * Hook que hace un tilt 3D al mouse sobre el elemento.
 */
export function useTilt3D(options?: { max?: number; scale?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const max = options?.max ?? 6;
    const scale = options?.scale ?? 1.02;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotateX: -y * max,
        rotateY: x * max,
        scale,
        transformPerspective: 1000,
        duration: 0.6,
        ease: 'power2.out',
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [options?.max, options?.scale]);

  return ref;
}

/**
 * Hook que hace scramble de texto al entrar en viewport.
 * Implementación manual (sin plugin premium).
 */
export function useScrambleOnView(finalText: string, options?: { duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ensureRegistered();
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      el.textContent = finalText;
      return;
    }

    const chars = '0123456789abcdef';
    const duration = options?.duration ?? 1200;
    let rafId: number;
    let startTime = 0;
    let started = false;

    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const revealedCount = Math.floor(progress * finalText.length);
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        if (i < revealedCount) {
          out += finalText[i];
        } else if (finalText[i] === ' ' || finalText[i] === '.') {
          out += finalText[i];
        } else {
          out += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = out;
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        el.textContent = finalText;
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        if (!started) {
          started = true;
          rafId = requestAnimationFrame(animate);
        }
      },
    });

    return () => {
      trigger.kill();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [finalText, options?.duration]);

  return ref;
}
