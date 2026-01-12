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
        'ami-turquoise': '#00B5A5',
        'ami-purple': '#7B2D8E',
        'ami-dark-gray': '#4A5568',
        'ami-light-turquoise': '#4FD1C7',
        'ami-light-purple': '#9F7AEA',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
