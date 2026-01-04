/**** Tailwind CSS config ****/
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2eaadc',
        secondary: '#f7f6f3',
        textPrimary: '#1f2933',
        textSecondary: '#616e7c',
      },
    },
  },
  plugins: [],
};
