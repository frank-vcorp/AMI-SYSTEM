/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/core-ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ami-turquoise': '#00B5A5', // Core Brand
        'ami-purple': '#7B2D8E',    // Core Secondary
        'ami-light-turquoise': '#4FD1C7',
        'ami-blue': '#00B5A5',
        'ami-green': '#00B5A5',
        'ami-yellow': '#f59e0b',
        medical: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#00B5A5', // primary
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          deep: '#042F2E',
        },
        clinical: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        surface: {
          light: '#F8FAFC',
          card: '#FFFFFF',
          dark: '#0F172A',
        }
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 181, 165, 0.1), 0 2px 10px -2px rgba(0, 181, 165, 0.05)',
        'card-hover': '0 10px 30px -5px rgba(0, 181, 165, 0.15)',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
