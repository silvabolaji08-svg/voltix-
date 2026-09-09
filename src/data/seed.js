/**
 * Demo accounts and seed orders.
 * Stands in for the `users` and `orders` collections until the API exists.
 */

export const demoUsers = [
  {
    id: 'u-001',
    name: 'Mobolaji Silva',
    email: 'demo@voltix.store',
    password: 'demo1234',
    role: 'customer',
  },
  {
    id: 'u-000',
    name: 'Store Admin',
    email: 'admin@voltix.store',
    password: 'admin1234',
    role: 'admin',
  },
]

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export const statusTone = {
  Pending: 'badge-warning',
  Processing: 'badge-accent',
  Shipped: 'badge-accent',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
}

/* Seed orders give the admin dashboard something real to manage on first load. */
export const seedOrders = [
  {
    id: 'VLT-24081',
    userId: 'u-002',
    customer: { name: 'Amara Eze', email: 'amara.eze@example.com' },
    date: '2026-09-02T10:24:00Z',
    status: 'Processing',
    items: [
      { productId: 'p-001', name: 'Aurora ANC Wireless Headphones', slug: 'aurora-anc-headphones', image: '/products/aurora-anc-headphones.svg', price: 349, quantity: 1, variant: 'Graphite' },
      { productId: 'p-023', name: 'Volt 140 W GaN Charger', slug: 'volt-140w-charger', image: '/products/volt-140w-charger.svg', price: 79, quantity: 1, variant: 'UK' },
    ],
    subtotal: 428,
    shipping: 0,
    tax: 32.1,
    total: 460.1,
    shippingAddress: { line1: '14 Adeola Odeku St', city: 'Lagos', state: 'Lagos', postcode: '101241', country: 'Nigeria' },
    payment: 'Card ending 4242',
  },
  {
    id: 'VLT-24080',
    userId: 'u-003',
    customer: { name: 'Daniel Kerr', email: 'd.kerr@example.com' },
    date: '2026-09-01T16:02:00Z',
    status: 'Shipped',
    items: [
      { productId: 'p-005', name: 'Helix 14 Ultrabook', slug: 'helix-14-ultrabook', image: '/products/helix-14-ultrabook.svg', price: 1499, quantity: 1, variant: '16 GB / 512 GB' },
    ],
    subtotal: 1499,
    shipping: 0,
    tax: 112.43,
    total: 1611.43,
    shippingAddress: { line1: '82 Bridge Road', city: 'Manchester', state: 'Greater Manchester', postcode: 'M3 3EB', country: 'United Kingdom' },
    payment: 'Card ending 1881',
  },
  {
    id: 'VLT-24079',
    userId: 'u-001',
    customer: { name: 'Mobolaji Silva', email: 'demo@voltix.store' },
    date: '2026-08-28T09:15:00Z',
    status: 'Delivered',
    items: [
      { productId: 'p-016', name: 'Apex Mechanical Keyboard', slug: 'apex-mech-keyboard', image: '/products/apex-mech-keyboard.svg', price: 179, quantity: 1, variant: 'Tactile' },
      { productId: 'p-018', name: 'Glide Precision Wireless Mouse', slug: 'glide-precision-mouse', image: '/products/glide-precision-mouse.svg', price: 99, quantity: 1, variant: 'Graphite' },
      { productId: 'p-003', name: 'Pulse Pro Earbuds', slug: 'pulse-pro-earbuds', image: '/products/pulse-pro-earbuds.svg', price: 199, quantity: 1, variant: 'White' },
    ],
    subtotal: 477,
    shipping: 0,
    tax: 35.78,
    total: 512.78,
    shippingAddress: { line1: '5 Herbert Macaulay Way', city: 'Yaba, Lagos', state: 'Lagos', postcode: '101245', country: 'Nigeria' },
    payment: 'Card ending 4242',
  },
  {
    id: 'VLT-24078',
    userId: 'u-004',
    customer: { name: 'Priya Raman', email: 'priya.r@example.com' },
    date: '2026-08-26T13:47:00Z',
    status: 'Delivered',
    items: [
      { productId: 'p-013', name: 'Lumen R7 Mirrorless Camera', slug: 'lumen-r7-camera', image: '/products/lumen-r7-camera.svg', price: 1899, quantity: 1, variant: 'Body only' },
      { productId: 'p-025', name: 'Vault 2 TB Portable SSD', slug: 'vault-2tb-ssd', image: '/products/vault-2tb-ssd.svg', price: 229, quantity: 2, variant: '2 TB' },
    ],
    subtotal: 2357,
    shipping: 0,
    tax: 176.78,
    total: 2533.78,
    shippingAddress: { line1: '221B Baker Street', city: 'London', state: 'Greater London', postcode: 'NW1 6XE', country: 'United Kingdom' },
    payment: 'Card ending 9021',
  },
  {
    id: 'VLT-24077',
    userId: 'u-005',
    customer: { name: 'Segun Balogun', email: 'segun.b@example.com' },
    date: '2026-08-24T08:31:00Z',
    status: 'Pending',
    items: [
      { productId: 'p-011', name: 'Resonance 360 Smart Speaker', slug: 'resonance-360-speaker', image: '/products/resonance-360-speaker.svg', price: 299, quantity: 1, variant: 'Graphite' },
    ],
    subtotal: 299,
    shipping: 12,
    tax: 22.43,
    total: 333.43,
    shippingAddress: { line1: '17 Ring Road', city: 'Ibadan', state: 'Oyo', postcode: '200255', country: 'Nigeria' },
    payment: 'Card ending 3310',
  },
  {
    id: 'VLT-24076',
    userId: 'u-006',
    customer: { name: 'Hannah Weiss', email: 'h.weiss@example.com' },
    date: '2026-08-21T19:08:00Z',
    status: 'Cancelled',
    items: [
      { productId: 'p-007', name: 'Nova X Smartphone', slug: 'nova-x-phone', image: '/products/nova-x-phone.svg', price: 999, quantity: 1, variant: '256 GB' },
    ],
    subtotal: 999,
    shipping: 0,
    tax: 74.93,
    total: 1073.93,
    shippingAddress: { line1: 'Torstraße 44', city: 'Berlin', state: 'Berlin', postcode: '10119', country: 'Germany' },
    payment: 'Card ending 7742',
  },
  {
    id: 'VLT-24075',
    userId: 'u-007',
    customer: { name: 'Kwame Mensah', email: 'kwame.m@example.com' },
    date: '2026-08-18T11:52:00Z',
    status: 'Delivered',
    items: [
      { productId: 'p-019', name: 'Vista 32" 4K Monitor', slug: 'vista-32-monitor', image: '/products/vista-32-monitor.svg', price: 749, quantity: 2, variant: 'Standard stand' },
    ],
    subtotal: 1498,
    shipping: 0,
    tax: 112.35,
    total: 1610.35,
    shippingAddress: { line1: '9 Independence Ave', city: 'Accra', state: 'Greater Accra', postcode: 'GA-107', country: 'Ghana' },
    payment: 'Card ending 5566',
  },
  {
    id: 'VLT-24074',
    userId: 'u-008',
    customer: { name: 'Lucia Ferrari', email: 'l.ferrari@example.com' },
    date: '2026-08-15T14:19:00Z',
    status: 'Delivered',
    items: [
      { productId: 'p-009', name: 'Chrono S3 Smartwatch', slug: 'chrono-s3-watch', image: '/products/chrono-s3-watch.svg', price: 379, quantity: 1, variant: '45 mm' },
      { productId: 'p-012', name: 'Resonance Mini Portable Speaker', slug: 'resonance-mini-speaker', image: '/products/resonance-mini-speaker.svg', price: 89, quantity: 1, variant: 'Sand' },
    ],
    subtotal: 468,
    shipping: 0,
    tax: 35.1,
    total: 503.1,
    shippingAddress: { line1: 'Via Roma 12', city: 'Milan', state: 'Lombardy', postcode: '20121', country: 'Italy' },
    payment: 'Card ending 2214',
  },
]

/* Six months of revenue for the admin overview chart. */
export const revenueByMonth = [
  { month: 'Apr', revenue: 18400 },
  { month: 'May', revenue: 22750 },
  { month: 'Jun', revenue: 21100 },
  { month: 'Jul', revenue: 28900 },
  { month: 'Aug', revenue: 34200 },
  { month: 'Sep', revenue: 12600 },
]