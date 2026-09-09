import { Flip, gsap, prefersReducedMotion } from './gsap'

/**
 * Page Transition · Complex tier — shared element morph.
 *
 * The product image on a card and the hero image on the product page are two
 * different elements in two different routes. Flip matches them by
 * `data-flip-id`, so we capture the card's geometry just before navigating and
 * replay it against whatever element carries the same id on the next screen.
 *
 * Deliberately one pair per navigation: compounding Flips are near-impossible
 * to time, which is the skill's warning on this preset.
 */

let pending = null

export function captureFlip(el, id) {
  if (!el || prefersReducedMotion()) return
  pending = { id, state: Flip.getState(el), at: performance.now() }
}

export function hasPendingFlip(id) {
  return Boolean(pending && pending.id === id && performance.now() - pending.at < 900)
}

/**
 * Returns the captured state once, or null if there isn't one, it's for a
 * different product, or the navigation took too long (a slow route shouldn't
 * fire a morph the user has stopped expecting).
 */
export function consumeFlip(id) {
  if (!pending) return null
  const match = pending.id === id && performance.now() - pending.at < 900
  const state = pending.state
  pending = null
  return match ? state : null
}

export function playFlip(state, target) {
  if (!state || !target) return
  return Flip.from(state, {
    targets: target,
    duration: 0.6,
    ease: 'expo.inOut',
    absolute: true,
    zIndex: 100,
    scale: true,
    onComplete: () => gsap.set(target, { clearProps: 'zIndex' }),
  })
}