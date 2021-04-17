module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  corePlugins: {
    // ...
   outline: false,
  }, 
  theme: {
    extend: {},
    fontFamily: {
      'sans': ['Raleway', 'Arial', 'sans-serif'],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
