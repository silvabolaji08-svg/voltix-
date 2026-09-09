import { gsap, prefersReducedMotion } from './gsap'

/**
 * Add-to-bag feedback: a clone of the product image arcs into the bag icon.
 *
 * The clone is `position: fixed`, `pointer-events: none` and `aria-hidden`, so
 * it never affects layout, never intercepts a click, and is invisible to
 * assistive tech. The toast is what actually announces the change — this is
 * decoration on top of it, which is why reduced motion simply skips it.
 */
export function flyToCart(sourceEl) {
  if (!sourceEl || prefersReducedMotion()) return

  const target = document.getElementById('cart-button')
  if (!target) return

  const from = sourceEl.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  if (!from.width || !to.width) return

  const clone = sourceEl.cloneNode(true)
  clone.setAttribute('aria-hidden', 'true')
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: '0',
    objectFit: 'contain',
    pointerEvents: 'none',
    zIndex: '400',
    borderRadius: '12px',
  })
  document.body.appendChild(clone)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)

  gsap
    .timeline({ onComplete: () => clone.remove() })
    /* Lift first so the path reads as an arc rather than a straight line. */
    .to(clone, { y: dy * 0.25 - 60, x: dx * 0.35, scale: 0.7, duration: 0.32, ease: 'power2.out' })
    .to(clone, { y: dy, x: dx, scale: 0.12, opacity: 0.2, duration: 0.42, ease: 'power2.in' })
    .to(target, { scale: 1.18, duration: 0.14, ease: 'power2.out' }, '-=0.1')
    .to(target, { scale: 1, duration: 0.28, ease: 'elastic.out(1, 0.45)' })
}