/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    borderRadius: {
      'none':  '0',
      DEFAULT: '0',
      'sm':    '0',
      'md':    '0',
      'lg':    '0',
      'xl':    '0',
      '2xl':   '0',
      '3xl':   '0',
      '4xl':   '0',
      'full':  '9999px', // kept only for live-dot
    },
    extend: {
      colors: {
        psl: {
          dark:           '#030d06',
          darker:         '#010804',
          card:           '#091810',
          'card-hover':   '#0e2418',
          green:          '#1a6b3c',
          'green-light':  '#25924f',
          'green-muted':  '#112e1a',
          gold:           '#c9a84c',
          'gold-light':   '#e0bb6a',
          'gold-dim':     '#6b5320',
          muted:          '#3d6b4a',
          border:         '#162e1e',
          'border-bright':'#1e4028',
        },
        tier: {
          common: '#6b7280',
          rare:   '#3b82f6',
          epic:   '#a855f7',
          legend: '#f59e0b',
          icon:   '#ef4444',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'Arial Black', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"Space Mono"', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
      },
      boxShadow: {
        'glow-gold':   '0 0 30px rgba(201,168,76,0.45), 0 0 60px rgba(201,168,76,0.15)',
        'glow-green':  '0 0 25px rgba(26,107,60,0.5), 0 0 50px rgba(26,107,60,0.15)',
        'glow-rare':   '0 0 28px rgba(59,130,246,0.45)',
        'glow-epic':   '0 0 30px rgba(168,85,247,0.45)',
        'glow-legend': '0 0 35px rgba(245,158,11,0.55)',
        'glow-icon':   '0 0 40px rgba(239,68,68,0.6)',
        'card-lift':   '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
        'inset-top':   'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'cricket-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a6b3c' fill-opacity='0.055'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gold-gradient':   'linear-gradient(135deg, #d9ae3a 0%, #c9a84c 45%, #b8943d 100%)',
        'green-gradient':  'linear-gradient(135deg, #1e7a44 0%, #1a6b3c 100%)',
        'card-shimmer':    'linear-gradient(135deg, rgba(255,255,255,0.028) 0%, transparent 55%)',
        'hero-mesh':       'radial-gradient(ellipse 90% 55% at 50% -8%, rgba(26,107,60,0.38) 0%, transparent 70%)',
      },
      animation: {
        'tier-up':    'tierUp 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'glow-pulse': 'glowPulse 2.2s ease-in-out infinite',
        'score-bar':  'scoreBar 1.4s cubic-bezier(0.34,1.1,0.64,1) forwards',
        'fade-in':    'fadeIn 0.45s ease-out forwards',
        'slide-up':   'slideUp 0.5s ease-out forwards',
        'shimmer':    'shimmer 2.5s ease-in-out infinite',
        'float':      'floatY 4s ease-in-out infinite',
        'live-ping':  'livePing 1.8s ease-out infinite',
        'count-up':   'countUp 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards',
        'skeleton':   'skeleton 1.7s ease-in-out infinite',
      },
      keyframes: {
        tierUp: {
          '0%':   { transform: 'scale(0.72) rotate(-3deg)', opacity: '0', filter: 'brightness(2.5)' },
          '55%':  { transform: 'scale(1.1) rotate(1.5deg)', opacity: '1', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1) rotate(0deg)',     opacity: '1', filter: 'brightness(1)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(201,168,76,0.22)' },
          '50%':     { boxShadow: '0 0 55px rgba(201,168,76,0.7), 0 0 90px rgba(201,168,76,0.18)' },
        },
        scoreBar: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--score-width)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-300% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        floatY: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-9px)' },
        },
        livePing: {
          '0%':       { transform: 'scale(0.85)', opacity: '0.85' },
          '80%,100%': { transform: 'scale(2.1)',  opacity: '0' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px) scale(0.88)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        skeleton: {
          '0%':   { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
      },
    },
  },
  plugins: [],
}