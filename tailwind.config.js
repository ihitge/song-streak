/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Matte Fog palette
        'matte-fog': '#e6e6e6',
        'soft-white': '#f0f0f0',
        'charcoal': '#333333',
        'alloy': '#d6d6d6',
        'vermilion': '#ea5428',
        'ink': '#222222',
        'graphite': '#888888',
        // Industrial Play palette
        'chassis': '#2F3136',
        'surface': '#4A5D49',
        'border': '#BFCAD0',
        'placeholder': '#6B7580',
        'rhythm': '#FF5722',
        'pitch': '#00AEEF',
        'recording': '#DCEE00',
        'data': '#F4F5F0',
      },
      fontFamily: {
        'lexend-thin': ['LexendDecaThin'],
        'lexend-extralight': ['LexendDecaExtraLight'],
        'lexend-light': ['LexendDecaLight'],
        'lexend-regular': ['LexendDecaRegular'],
        'lexend-medium': ['LexendDecaMedium'],
        'lexend-semibold': ['LexendDecaSemiBold'],
        'lexend-bold': ['LexendDecaBold'],
        'lexend-extrabold': ['LexendDecaExtraBold'],
        'lexend-black': ['LexendDecaBlack'],
      },
    },
  },
  plugins: [],
};
