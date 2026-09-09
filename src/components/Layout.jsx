import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import PageTransition from './PageTransition'
import { Toasts, ScrollToTop } from './ui'

export default function Layout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <ScrollToTop />
      <Header />
      <main className="app-main" id="main" tabIndex={-1}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <Toasts />
    </div>
  )
}