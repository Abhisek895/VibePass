import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        base: {
          900: 'rgb(var(--bg-primary) / <alpha-value>)',
          800: 'rgb(var(--bg-secondary) / <alpha-value>)',
          700: 'rgb(var(--bg-surface) / <alpha-value>)',
          600: 'rgb(var(--bg-elevated) / <alpha-value>)',
        },
        accent: {
          primary: 'rgb(var(--accent-primary) / <alpha-value>)',
          secondary: 'rgb(var(--accent-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--accent-tertiary) / <alpha-value>)',
        },
        status: {
          success: 'rgb(var(--success) / <alpha-value>)',
          warning: 'rgb(var(--warning) / <alpha-value>)',
          danger: 'rgb(var(--danger) / <alpha-value>)',
          voice: 'rgb(var(--voice-active) / <alpha-value>)',
        },
        text: {
          main: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        }
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'voice-pulse': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.7)' },
          '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 15px rgba(139, 92, 246, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
};
export default config;
