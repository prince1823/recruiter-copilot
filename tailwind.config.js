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
        'whatsapp-green': '#25D366',
        'whatsapp-green-dark': '#128C7E',
        'whatsapp-gray': '#F0F0F0',
        'whatsapp-gray-light': '#F5F5F5',
        'whatsapp-blue': '#34B7F1',
      },
    },
  },
  plugins: [],
};
