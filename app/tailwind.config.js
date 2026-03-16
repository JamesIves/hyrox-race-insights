/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ts}',
    'node_modules/flowbite-react/lib/**/*.js',
    'node_modules/flowbite/**/*.js'
  ],
  theme: {
    extend: {}
  },
  plugins: [require('flowbite/plugin')],
  darkMode: 'class'
}
