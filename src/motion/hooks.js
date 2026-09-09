import { useLayoutEffect, useRef } from 'react'
import { gsap, SplitText, motionContext, prefersReducedMotion } from './gsap'

/**
 * All hooks run in useLayoutEffect so GSAP writes the "from" state before the
 * browser paints — otherwise you get a flash of the finished layout that then
 * jumps back to the start.
 *
 * Nothing here is pre-hidden in CSS. If JavaScript never runs, every element
 * renders in its final state: the skill's Scroll Reveal rule about not shipping
 * invisible-by-default content.
 */

/* ------------------------------------------------------------------------
   Stagger List · Standard tier
   grid: 'auto' lets GSAP read the CSS grid and stagger in a diagonal wave.
   ------------------------------------------------------------------------ */
export function useGridStagger(deps = [], { selector = ':scope > *', each = 0.06, from = 'start' } = {}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    return motionContext(el, () => {
      const items = el.querySelectorAll(selector)
      if (!items.length) return

      gsap.from(items, {
        opacity: 0,
        scale: 0.92,
        y: 16,
        duration: 0.4,
        ease: 'back.out(1.4)',
        stagger: { each, from, grid: 'auto' },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        /* Cards carry a stretched link overlay, so while they are still
           travelling a click can land on the neighbour that just slid under
           the cursor. Suspend pointer events for the length of the entrance
           and hand them back the moment it settles. */
        onStart: () => gsap.set(el, { pointerEvents: 'none' }),
        onComplete: () => gsap.set(el, { clearProps: 'pointerEvents' }),
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

/* ------------------------------------------------------------------------
   Scroll Reveal · Standard tier
   Staggers direct children. Capped at 8 — beyond that the last item lags.
   ------------------------------------------------------------------------ */
export function useScrollReveal({ y = 24, stagger = 0.08, start = 'top 85%' } = {}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    return motionContext(el, () => {
      const children = Array.from(el.children).slice(0, 8)
      if (!children.length) return

      gsap.from(children, {
        opacity: 0,
        y,
        duration: 0.5,
        ease: 'power2.out',
        stagger,
        scrollTrigger: { trigger: el, start, once: true },
      })
    })
  }, [y, stagger, start])

  return ref
}

/* ------------------------------------------------------------------------
   Stagger List · Complex tier — SplitText headline
   Reserved for short headlines; splitting long copy explodes the DOM.
   split.revert() restores real text nodes for screen readers and copy/paste.
   ------------------------------------------------------------------------ */
export function useSplitHeadline({ delay = 0.1 } = {}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    return motionContext(el, () => {
      const split = new SplitText(el, { type: 'chars,words', charsClass: 'split-char' })

      gsap.from(split.chars, {
        opacity: 0,
        y: 20,
        rotateX: -40,
        duration: 0.6,
        ease: 'expo.out',
        stagger: 0.015,
        delay,
      })

      return () => split.revert()
    })
  }, [delay])

  return ref
}

/* ------------------------------------------------------------------------
   Parallax Scroll · Subtle tier
   scrub ties position to scroll rather than playing on a timer.
   ------------------------------------------------------------------------ */
export function useParallax({ distance = 40 } = {}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    return motionContext(el, () => {
      gsap.fromTo(
        el,
        { y: -distance / 2 },
        {
          y: distance / 2,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        }
      )
    })
  }, [distance])

  return ref
}

/* ------------------------------------------------------------------------
   Count-up — numbers tick to their value when scrolled into view.
   Reduced motion (and no JS) leaves the final value in the markup.
   ------------------------------------------------------------------------ */
export function useCountUp(value, format = (n) => Math.round(n).toString()) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof value !== 'number' || Number.isNaN(value)) return

    return motionContext(el, () => {
      const counter = { n: 0 }
      gsap.to(counter, {
        n: value,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = format(counter.n)
        },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      })
    })
  }, [value, format])

  return ref
}

/* ------------------------------------------------------------------------
   Hover Micro-interaction · Standard tier
   quickTo keeps a single reusable tween per property, and the leave tween
   always reverses the same props so a fast pointer can't strand the state.
   Transform and shadow only — never width/height/margin.
   ------------------------------------------------------------------------ */
export function useHoverLift({ y = -4, scale = 1.02 } = {}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    /* Coarse pointers have no hover; skip the listeners entirely. */
    if (window.matchMedia('(hover: none)').matches) return

    const yTo = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power2.out' })
    const scaleTo = gsap.quickTo(el, 'scale', { duration: 0.25, ease: 'power2.out' })

    const enter = () => {
      yTo(y)
      scaleTo(scale)
    }
    const leave = () => {
      yTo(0)
      scaleTo(1)
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    /* Keyboard users get the same affordance. */
    el.addEventListener('focusin', enter)
    el.addEventListener('focusout', leave)

    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('focusin', enter)
      el.removeEventListener('focusout', leave)
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [y, scale])

  return ref
}

/* ------------------------------------------------------------------------
   Hover Micro-interaction · Complex tier — magnetic button
   Listeners are removed on unmount; a stray mousemove handler on every CTA
   is exactly the leak the skill's framework note warns about.
   ------------------------------------------------------------------------ */
export function useMagnetic({ strength = 0.32, radius = 70 } = {}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    if (window.matchMedia('(hover: none)').matches) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

    const move = (e) => {
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      const distance = Math.hypot(dx, dy)
      if (distance > radius + Math.max(rect.width, rect.height) / 2) return
      xTo(dx * strength)
      yTo(dy * strength)
    }

    const reset = () => {
      xTo(0)
      yTo(0)
    }

    window.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', reset)

    return () => {
      window.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', reset)
      gsap.set(el, { clearProps: 'transform' })
    }
  }, [strength, radius])

  return ref
}

/* ------------------------------------------------------------------------
   Bars growing from their baseline — no back.out overshoot, because the
   skill is explicit that an overshoot on informational UI reads as sloppy.
   ------------------------------------------------------------------------ */
export function useBarGrow(deps = []) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    return motionContext(el, () => {
      const bars = el.querySelectorAll('[data-bar]')
      if (!bars.length) return

      gsap.from(bars, {
        scaleY: 0,
        transformOrigin: 'bottom center',
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}