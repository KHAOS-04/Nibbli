/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nibbli: {
          bg:       '#FAF7FF',   // soft lavender white
          surface:  '#FFFFFF',
          purple:   '#C4B5FD',   // pastel purple
          purpleDark: '#7C3AED',
          pink:     '#FBCFE8',   // pastel pink
          pinkDark: '#DB2777',
          yellow:   '#FDE68A',   // pastel yellow
          blue:     '#BAE6FD',   // pastel blue
          border:   '#EDE9FE',   // very light purple border
          text:     '#4B4B6B',   // soft dark purple-grey
          muted:    '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(139,92,246,0.08)',
        panel: '0 4px 24px rgba(139,92,246,0.10)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.25rem',
      },
    },
  },
  plugins: [],
};
