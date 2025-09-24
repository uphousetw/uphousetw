/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary (60% - Main brand color)
        primary: {
          50: '#f1ebe1',   // Lightest shade
          100: '#c0cfb2',  // Light green
          200: '#c0cfb2',
          300: '#8ba888',  // Medium green
          400: '#8ba888',
          500: '#44624a',  // Main dark green
          600: '#44624a',
          700: '#3a5440',  // Darker shade
          800: '#2f4535',
          900: '#24362a',  // Darkest shade
        },
        // Secondary (30% - Supporting colors)
        secondary: {
          50: '#ffffff',   // White
          100: '#f1ebe1',  // Cream
          200: '#f1ebe1',
          300: '#c0cfb2',  // Light green
          400: '#c0cfb2',
          500: '#8ba888',  // Medium green
          600: '#8ba888',
          700: '#44624a',  // Dark green
          800: '#44624a',
          900: '#3a5440',
        },
        // Accent (10% - Highlight color)
        accent: {
          50: '#f1ebe1',
          100: '#f1ebe1',
          200: '#c0cfb2',
          300: '#c0cfb2',
          400: '#8ba888',
          500: '#8ba888',  // Accent color
          600: '#44624a',
          700: '#44624a',
          800: '#3a5440',
          900: '#2f4535',
        },
        // Neutral colors
        neutral: {
          50: '#ffffff',
          100: '#f1ebe1',
          200: '#e5ddd1',
          300: '#d4c8b8',
          400: '#c0b4a1',
          500: '#9d9185',
          600: '#7a6f68',
          700: '#5c534e',
          800: '#3f3938',
          900: '#2a2525',
        }
      }
    },
  },
  plugins: [],
}