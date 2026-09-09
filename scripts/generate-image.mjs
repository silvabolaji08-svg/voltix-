/**
 * Generates product artwork as flat SVG illustrations.
 * Keeps the repo self-contained: no external image hosts, no binary assets,
 * and every product renders identically offline.
 *
 * Run:  node scripts/generate-images.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/products')
mkdirSync(OUT, { recursive: true })

/* Colourways — body, body-dark (shading), detail, glass/screen */
const FINISH = {
  graphite: { body: '#3f3f46', dark: '#27272a', detail: '#71717a', glass: '#18181b' },
  silver: { body: '#d4d4d8', dark: '#a1a1aa', detail: '#71717a', glass: '#27272a' },
  midnight: { body: '#1e293b', dark: '#0f172a', detail: '#475569', glass: '#020617' },
  sand: { body: '#e7e0d5', dark: '#c9bfae', detail: '#8a7f6d', glass: '#3f3a32' },
  blue: { body: '#2563eb', dark: '#1d4ed8', detail: '#93c5fd', glass: '#0b1a3a' },
  white: { body: '#fafafa', dark: '#e4e4e7', detail: '#a1a1aa', glass: '#3f3f46' },
}

const shapes = {
  headphones: (c) => `
    <path d="M92 214v-26a108 108 0 0 1 216 0v26" fill="none" stroke="${c.body}" stroke-width="18" stroke-linecap="round"/>
    <rect x="60" y="196" width="66" height="118" rx="30" fill="${c.body}"/>
    <rect x="274" y="196" width="66" height="118" rx="30" fill="${c.body}"/>
    <rect x="74" y="212" width="38" height="86" rx="19" fill="${c.dark}"/>
    <rect x="288" y="212" width="38" height="86" rx="19" fill="${c.dark}"/>
    <circle cx="93" cy="255" r="8" fill="${c.detail}"/>`,
  earbuds: (c) => `
    <rect x="112" y="150" width="176" height="132" rx="34" fill="${c.body}"/>
    <path d="M112 214h176" stroke="${c.dark}" stroke-width="5"/>
    <circle cx="200" cy="248" r="10" fill="${c.detail}"/>
    <g transform="translate(126 66)">
      <circle cx="30" cy="30" r="27" fill="${c.body}"/>
      <rect x="20" y="46" width="20" height="46" rx="10" fill="${c.body}"/>
      <circle cx="30" cy="30" r="11" fill="${c.glass}"/>
    </g>
    <g transform="translate(216 66)">
      <circle cx="30" cy="30" r="27" fill="${c.body}"/>
      <rect x="20" y="46" width="20" height="46" rx="10" fill="${c.body}"/>
      <circle cx="30" cy="30" r="11" fill="${c.glass}"/>
    </g>`,
  laptop: (c) => `
    <rect x="78" y="96" width="244" height="158" rx="12" fill="${c.body}"/>
    <rect x="92" y="110" width="216" height="130" rx="6" fill="${c.glass}"/>
    <rect x="112" y="132" width="120" height="9" rx="4.5" fill="${c.detail}" opacity=".85"/>
    <rect x="112" y="152" width="176" height="7" rx="3.5" fill="${c.detail}" opacity=".45"/>
    <rect x="112" y="168" width="150" height="7" rx="3.5" fill="${c.detail}" opacity=".45"/>
    <rect x="112" y="196" width="72" height="24" rx="12" fill="#2563eb"/>
    <path d="M52 254h296l22 40a10 10 0 0 1-9 15H39a10 10 0 0 1-9-15Z" fill="${c.dark}"/>
    <rect x="160" y="272" width="80" height="8" rx="4" fill="${c.detail}"/>`,
  phone: (c) => `
    <rect x="132" y="48" width="136" height="288" rx="34" fill="${c.body}"/>
    <rect x="144" y="60" width="112" height="264" rx="26" fill="${c.glass}"/>
    <rect x="176" y="70" width="48" height="10" rx="5" fill="${c.body}"/>
    <rect x="160" y="108" width="80" height="8" rx="4" fill="${c.detail}" opacity=".7"/>
    <rect x="160" y="128" width="56" height="8" rx="4" fill="${c.detail}" opacity=".4"/>
    <rect x="160" y="164" width="80" height="80" rx="14" fill="#2563eb" opacity=".9"/>
    <rect x="160" y="260" width="80" height="8" rx="4" fill="${c.detail}" opacity=".4"/>
    <rect x="274" y="120" width="6" height="40" rx="3" fill="${c.dark}"/>`,
  watch: (c) => `
    <rect x="152" y="44" width="96" height="86" rx="26" fill="${c.dark}"/>
    <rect x="152" y="270" width="96" height="86" rx="26" fill="${c.dark}"/>
    <rect x="130" y="112" width="140" height="176" rx="42" fill="${c.body}"/>
    <rect x="144" y="126" width="112" height="148" rx="32" fill="${c.glass}"/>
    <circle cx="200" cy="186" r="30" fill="none" stroke="#2563eb" stroke-width="8" stroke-linecap="round" stroke-dasharray="150 40" transform="rotate(-90 200 186)"/>
    <rect x="170" y="228" width="60" height="8" rx="4" fill="${c.detail}" opacity=".7"/>
    <rect x="272" y="168" width="10" height="30" rx="5" fill="${c.detail}"/>`,
  speaker: (c) => `
    <rect x="128" y="60" width="144" height="280" rx="56" fill="${c.body}"/>
    <rect x="144" y="76" width="112" height="180" rx="44" fill="${c.dark}"/>
    <g fill="${c.detail}" opacity=".55">
      ${Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 5 }, (_, i) => `<circle cx="${164 + i * 18}" cy="${104 + r * 26}" r="3.4"/>`).join('')
      ).join('')}
    </g>
    <rect x="168" y="292" width="64" height="8" rx="4" fill="${c.detail}" opacity=".7"/>
    <circle cx="200" cy="318" r="7" fill="#2563eb"/>`,
  camera: (c) => `
    <rect x="56" y="122" width="288" height="176" rx="26" fill="${c.body}"/>
    <path d="M146 122l20-30h68l20 30Z" fill="${c.dark}"/>
    <circle cx="200" cy="210" r="70" fill="${c.dark}"/>
    <circle cx="200" cy="210" r="52" fill="${c.glass}"/>
    <circle cx="200" cy="210" r="30" fill="${c.body}" opacity=".25"/>
    <circle cx="182" cy="192" r="11" fill="#2563eb" opacity=".8"/>
    <rect x="286" y="150" width="34" height="12" rx="6" fill="${c.detail}"/>
    <circle cx="96" cy="156" r="9" fill="${c.detail}"/>`,
  drone: (c) => `
    <g stroke="${c.dark}" stroke-width="14" stroke-linecap="round">
      <path d="M132 132 92 92M268 132l40-40M132 268l-40 40M268 268l40 40"/>
    </g>
    <g fill="none" stroke="${c.detail}" stroke-width="8">
      <circle cx="80" cy="80" r="42"/><circle cx="320" cy="80" r="42"/>
      <circle cx="80" cy="320" r="42"/><circle cx="320" cy="320" r="42"/>
    </g>
    <rect x="136" y="146" width="128" height="108" rx="30" fill="${c.body}"/>
    <circle cx="200" cy="268" r="34" fill="${c.dark}"/>
    <circle cx="200" cy="268" r="18" fill="${c.glass}"/>
    <rect x="164" y="176" width="72" height="10" rx="5" fill="${c.detail}" opacity=".6"/>
    <circle cx="248" cy="176" r="7" fill="#2563eb"/>`,
  keyboard: (c) => `
    <rect x="40" y="128" width="320" height="150" rx="20" fill="${c.body}"/>
    <rect x="40" y="128" width="320" height="150" rx="20" fill="none" stroke="${c.dark}" stroke-width="4"/>
    <g fill="${c.dark}">
      ${Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 12 }, (_, i) =>
          `<rect x="${58 + i * 24}" y="${146 + r * 28}" width="19" height="21" rx="5"/>`
        ).join('')
      ).join('')}
    </g>
    <rect x="130" y="258" width="140" height="12" rx="6" fill="${c.dark}"/>
    <rect x="58" y="146" width="19" height="21" rx="5" fill="#2563eb"/>`,
  mouse: (c) => `
    <path d="M200 60c56 0 92 44 92 104v72c0 60-36 104-92 104s-92-44-92-104v-72C108 104 144 60 200 60Z" fill="${c.body}"/>
    <path d="M200 60c-56 0-92 44-92 104v10h92Z" fill="${c.dark}" opacity=".55"/>
    <rect x="192" y="104" width="16" height="46" rx="8" fill="${c.detail}"/>
    <path d="M200 60v114" stroke="${c.dark}" stroke-width="4"/>
    <circle cx="200" cy="300" r="10" fill="#2563eb" opacity=".85"/>`,
  monitor: (c) => `
    <rect x="40" y="70" width="320" height="200" rx="16" fill="${c.body}"/>
    <rect x="54" y="84" width="292" height="164" rx="8" fill="${c.glass}"/>
    <rect x="76" y="106" width="110" height="10" rx="5" fill="${c.detail}" opacity=".8"/>
    <rect x="76" y="128" width="180" height="8" rx="4" fill="${c.detail}" opacity=".4"/>
    <rect x="76" y="148" width="150" height="8" rx="4" fill="${c.detail}" opacity=".4"/>
    <rect x="76" y="180" width="90" height="28" rx="14" fill="#2563eb"/>
    <rect x="176" y="270" width="48" height="46" fill="${c.dark}"/>
    <rect x="126" y="312" width="148" height="16" rx="8" fill="${c.dark}"/>`,
  tablet: (c) => `
    <rect x="96" y="52" width="208" height="292" rx="26" fill="${c.body}"/>
    <rect x="110" y="66" width="180" height="264" rx="16" fill="${c.glass}"/>
    <rect x="132" y="92" width="90" height="10" rx="5" fill="${c.detail}" opacity=".8"/>
    <g fill="#2563eb" opacity=".9">
      <rect x="132" y="122" width="60" height="60" rx="14"/>
      <rect x="208" y="122" width="60" height="60" rx="14" opacity=".55"/>
      <rect x="132" y="198" width="60" height="60" rx="14" opacity=".55"/>
      <rect x="208" y="198" width="60" height="60" rx="14" opacity=".3"/>
    </g>
    <rect x="152" y="288" width="96" height="8" rx="4" fill="${c.detail}" opacity=".5"/>`,
  vr: (c) => `
    <path d="M74 132h252a34 34 0 0 1 34 34v62a52 52 0 0 1-52 52h-38a30 30 0 0 1-24-12l-22-30a30 30 0 0 0-48 0l-22 30a30 30 0 0 1-24 12H92a52 52 0 0 1-52-52v-62a34 34 0 0 1 34-34Z" fill="${c.body}"/>
    <rect x="76" y="164" width="102" height="58" rx="24" fill="${c.glass}"/>
    <rect x="222" y="164" width="102" height="58" rx="24" fill="${c.glass}"/>
    <path d="M40 168 20 150M360 168l20-18" stroke="${c.dark}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="200" cy="150" r="7" fill="#2563eb"/>`,
  charger: (c) => `
    <rect x="112" y="96" width="176" height="208" rx="30" fill="${c.body}"/>
    <rect x="130" y="114" width="140" height="112" rx="16" fill="${c.glass}"/>
    <path d="M206 132l-32 50h24l-8 38 34-52h-24Z" fill="#2563eb"/>
    <g fill="${c.detail}" opacity=".6">
      <rect x="140" y="248" width="120" height="8" rx="4"/>
      <rect x="140" y="268" width="76" height="8" rx="4"/>
    </g>
    <rect x="176" y="66" width="48" height="30" rx="10" fill="${c.dark}"/>`,
  ssd: (c) => `
    <rect x="86" y="130" width="228" height="140" rx="20" fill="${c.body}"/>
    <rect x="86" y="130" width="228" height="140" rx="20" fill="none" stroke="${c.dark}" stroke-width="4"/>
    <rect x="110" y="154" width="96" height="12" rx="6" fill="${c.detail}" opacity=".8"/>
    <rect x="110" y="178" width="64" height="10" rx="5" fill="${c.detail}" opacity=".45"/>
    <rect x="240" y="154" width="52" height="52" rx="12" fill="#2563eb" opacity=".9"/>
    <g fill="${c.dark}">
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${112 + i * 22}" y="232" width="14" height="20" rx="3"/>`).join('')}
    </g>`,
}

/* product slug → [shape, finish] */
const CATALOG = {
  'aurora-anc-headphones': ['headphones', 'graphite'],
  'aurora-studio-headphones': ['headphones', 'sand'],
  'pulse-pro-earbuds': ['earbuds', 'white'],
  'pulse-sport-earbuds': ['earbuds', 'blue'],
  'helix-14-ultrabook': ['laptop', 'silver'],
  'helix-16-creator': ['laptop', 'midnight'],
  'nova-x-phone': ['phone', 'midnight'],
  'nova-lite-phone': ['phone', 'blue'],
  'chrono-s3-watch': ['watch', 'graphite'],
  'chrono-active-watch': ['watch', 'blue'],
  'resonance-360-speaker': ['speaker', 'graphite'],
  'resonance-mini-speaker': ['speaker', 'sand'],
  'lumen-r7-camera': ['camera', 'graphite'],
  'lumen-pocket-camera': ['camera', 'silver'],
  'skyline-4k-drone': ['drone', 'white'],
  'apex-mech-keyboard': ['keyboard', 'graphite'],
  'apex-low-profile-keyboard': ['keyboard', 'white'],
  'glide-precision-mouse': ['mouse', 'graphite'],
  'vista-32-monitor': ['monitor', 'silver'],
  'vista-27-monitor': ['monitor', 'graphite'],
  'slate-11-tablet': ['tablet', 'silver'],
  'horizon-vr-headset': ['vr', 'white'],
  'volt-140w-charger': ['charger', 'white'],
  'volt-powerbank': ['charger', 'midnight'],
  'vault-2tb-ssd': ['ssd', 'graphite'],
  'vault-1tb-ssd': ['ssd', 'blue'],
}

/* Category thumbnails reuse the same shapes */
const CATEGORIES = {
  'cat-audio': ['headphones', 'graphite'],
  'cat-computing': ['laptop', 'silver'],
  'cat-mobile': ['phone', 'midnight'],
  'cat-wearables': ['watch', 'blue'],
  'cat-photo': ['camera', 'graphite'],
  'cat-accessories': ['keyboard', 'white'],
}

function svg(shape, finishName) {
  const c = FINISH[finishName]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-hidden="true">
  <g>${shapes[shape](c)}</g>
</svg>
`
}

let n = 0
for (const [slug, [shape, finish]] of Object.entries({ ...CATALOG, ...CATEGORIES })) {
  writeFileSync(resolve(OUT, `${slug}.svg`), svg(shape, finish))
  n++
}

/* Brand favicon */
writeFileSync(
  resolve(OUT, '../favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#18181b"/>
  <path d="M17.6 6 9 18h5.2L12.8 26l9.2-13h-5.4Z" fill="#fafafa"/>
</svg>
`
)

console.log(`Generated ${n} product/category illustrations + favicon`)