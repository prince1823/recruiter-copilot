/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        foreground: 'hsl(240, 10%, 10%)',   // dark gray/black
        background: 'hsl(0, 0%, 100%)',
        border: 'hsl(240, 5%, 84%)',
        ring: 'hsl(240, 4%, 64%)',
      },
    },
  },
  plugins: [],
};
