/**
 * Single GSAP entry point — plugins are registered once, here.
 *
 * GSAP 3.13+ ships SplitText and Flip under the standard "no charge" license
 * (https://gsap.com/standard-license). Check that licence if this ever becomes
 * a commercial product.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, Flip, SplitText)

/* Motion defaults for the whole app, from the design system's Standard tier. */
gsap.defaults({ ease: 'power2.out', duration: 0.4 })

export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_QUERY).matches

/**
 * Wraps animation setup so that:
 *   - everything is scoped and reverted on unmount (React 18 StrictMode
 *     double-mounts in development; without this every tween runs twice)
 *   - reduced-motion users get the final state and no tweens at all
 *
 * `setup` receives the gsap context's `self` and should register tweens.
 * Return a cleanup function from `setup` if you added your own listeners.
 */
export function motionContext(scope, setup) {
  const mm = gsap.matchMedia()

  mm.add(
    {
      motionOk: `(prefers-reduced-motion: no-preference)`,
      reduced: REDUCED_QUERY,
    },
    (context) => {
      const { motionOk } = context.conditions
      if (!motionOk) return
      return setup(context)
    },
    scope
  )

  return () => mm.revert()
}

export { gsap, ScrollTrigger, Flip, SplitText }