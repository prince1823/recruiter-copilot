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
        'primary-blue': '#3B82F6',
        'primary-blue-dark': '#2563EB',
        'primary-blue-light': '#DBEAFE',
        'secondary-gray': '#8696A0',
        'secondary-gray-light': '#F0F2F5',
        'accent-blue': '#60A5FA',
        'chat-bg': '#F7F8FA',
        'hover-bg': '#F5F6F6',
      },
    },
  },
  plugins: [],
};
