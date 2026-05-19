/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#F0F2F0',
          100: '#E0E5E1',
          200: '#C1CCC4',
          300: '#A3B3A7',
          400: '#849A89',
          500: '#758C7A',
          600: '#657166', // Deep Earthy Sage Green (#657166)
          700: '#515B52',
          800: '#3D453E',
          900: '#292E2A',
        },
        violet: {
          50: '#F0F7F9',
          100: '#DDF0F4',
          200: '#BBE2EB',
          300: '#99CDD8', // Muted Pastel Blue (#99CDD8)
          400: '#77B7C5',
          500: '#55A2B2',
          600: '#3E8E9E',
          700: '#2E6C79',
          800: '#1E4953',
          900: '#0F272C',
        },
        emerald: {
          50: '#F4FAF7',
          100: '#DAEBE3', // Pale Sage / Mint Green (#DAEBE3)
          200: '#B5D6C7',
          300: '#90C2AD',
          400: '#6BA88D',
          500: '#559477',
          600: '#4B8E70',
          700: '#356B53',
          800: '#204938',
          900: '#0D271E',
        },
        amber: {
          50: '#FFFBF7',
          100: '#FDE8D3', // Light Peach / Cream (#FDE8D3)
          200: '#FCD0A7',
          300: '#FBB97B',
          400: '#FAA14F',
          500: '#F88A23',
          600: '#DC8130',
          700: '#B5611B',
          800: '#8D430F',
          900: '#662B05',
        },
        rose: {
          50: '#FEF6F4',
          100: '#FCDFD5',
          200: '#F3C3B2', // Soft Salmon / Rose Gold (#F3C3B2)
          300: '#EC9D82',
          400: '#E47854',
          500: '#D9582E',
          600: '#C1593B',
          700: '#993B20',
          800: '#722812',
          900: '#4C1405',
        },
        slate: {
          50: '#F7F8F6',
          100: '#EAECE7',
          200: '#CFD6C4', // Muted Olive / Khaki Green (#CFD6C4)
          300: '#B8C1AB',
          400: '#9FA991',
          500: '#848F76',
          600: '#69715E',
          700: '#4E5446',
          800: '#33372E',
          900: '#1A1D18',
        }
      }
    },
  },
  plugins: [],
}
