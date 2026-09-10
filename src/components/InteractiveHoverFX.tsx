'use client';

import { useEffect } from 'react';

/**
 * InteractiveHoverFX:
 * Global listener providing a 3D float-up, tilt, and cursor-following parallax
 * on any white box or card across the entire application without shifting layout.
 */
export default function InteractiveHoverFX() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only enable on devices with precise pointer (mice, trackpads)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    let activeCard: HTMLElement | null = null;
    let cleanupTimeout: NodeJS.Timeout | null = null;

    // Helper to identify whether an element is an eligible white box or card
    const findEligibleCard = (target: HTMLElement | null): HTMLElement | null => {
      if (!target) return null;

      // Look up hierarchy for explicit tilt target or white card
      const candidate = target.closest<HTMLElement>(
        '[data-hover-tilt], .interactive-card, .hover-tilt, div[class*="bg-white"], section[class*="bg-white"], article[class*="bg-white"], div[class*="bg-[#ffffff]"]'
      );

      if (!candidate) return null;

      // Filter out root/nav wrappers and explicit opt-outs
      const tag = candidate.tagName.toUpperCase();
      if (tag === 'BODY' || tag === 'HTML' || tag === 'MAIN' || tag === 'NAV' || tag === 'HEADER') return null;
      if (candidate.classList.contains('no-tilt') || candidate.hasAttribute('data-no-tilt')) return null;

      // Ignore if it is an input/textarea/select or simple tiny badge
      if (['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(tag)) return null;

      // Check dimensions: should be at least card-sized, but not full screen
      const rect = candidate.getBoundingClientRect();
      if (rect.width < 120 || rect.height < 50) return null;
      if (rect.width >= window.innerWidth * 0.96 && rect.height >= window.innerHeight * 0.96) return null;

      return candidate;
    };

    const resetCardState = (card: HTMLElement) => {
      card.style.transition = 'transform 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.15), box-shadow 0.45s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)';
      card.style.boxShadow = '';
      card.classList.remove('is-floating-card');

      if (cleanupTimeout) clearTimeout(cleanupTimeout);
      cleanupTimeout = setTimeout(() => {
        if (card !== activeCard) {
          card.style.transform = '';
          card.style.transition = '';
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
        }
      }, 460);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const card = findEligibleCard(target);

      if (activeCard && activeCard !== card) {
        resetCardState(activeCard);
        activeCard = null;
      }

      if (!card) return;

      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
        cleanupTimeout = null;
      }

      activeCard = card;
      const rect = card.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      // Normalize offsets between -1 and 1
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      const normX = Math.max(-1, Math.min(1, (relX - halfW) / halfW));
      const normY = Math.max(-1, Math.min(1, (relY - halfH) / halfH));

      // Dynamic 3D tilt & magnetic cursor pull
      const maxTilt = 4.5; // degrees
      const rotX = -normY * maxTilt;
      const rotY = normX * maxTilt;

      // Float upward (-8px) and slightly track cursor (±4px)
      const transX = normX * 4;
      const transY = -8 + normY * 3.5;

      // Set CSS variables for optional spotlight reflection
      card.style.setProperty('--mouse-x', `${relX}px`);
      card.style.setProperty('--mouse-y', `${relY}px`);

      // Fast responsive transition for tracking
      card.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease';
      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 12px) scale3d(1.014, 1.014, 1.014)`;
      card.style.boxShadow = '0 24px 44px -12px rgba(20, 46, 39, 0.17), 0 10px 22px -6px rgba(62, 95, 224, 0.13)';
      card.classList.add('is-floating-card');
    };

    const handlePointerLeave = () => {
      if (activeCard) {
        resetCardState(activeCard);
        activeCard = null;
      }
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      if (activeCard) {
        resetCardState(activeCard);
      }
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
    };
  }, []);

  return null;
}
