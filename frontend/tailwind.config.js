/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '.dark-mode'], // Enable dark mode with both class and .dark-mode selector
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        // Custom colors for dark mode
        dark: {
          primary: '#0f172a',
          secondary: '#1e293b',
          accent: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}
