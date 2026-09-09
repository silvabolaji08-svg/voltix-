import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '../motion/gsap'
import { hasPendingFlip } from '../motion/flip'


export default function PageTransition({ children }) {
  const ref = useRef(null)
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const slug = pathname.startsWith('/product/') ? pathname.split('/product/')[1] : null
    if (slug && hasPendingFlip(slug)) return

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.18, ease: 'power1.inOut', clearProps: 'transform' }
    )
    return () => tween.kill()
  }, [pathname])

  return <div ref={ref}>{children}</div>
}