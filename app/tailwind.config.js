/* eslint-disable @typescript-eslint/no-var-requires */
const forms = require('@tailwindcss/forms')({
  strategy: 'class',
});
const colors = require('tailwindcss/colors');

const SCREENS = require('./utils/media');

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./components/**/*.@(tsx|ts)', './layout/**/*.@(tsx|ts)', './pages/**/*.tsx'],
  theme: {
    extend: {
      animation: {
        banner: 'banner 6s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      backgroundImage: {
        'gradient-repeat-to-br': 'repeating-linear-gradient(-45deg, var(--tw-gradient-stops))',
      },
      colors: {
        border: 'hsl(var(--border))',
        transparent: 'transparent',
        current: 'currentColor',
        primary: {
          50: '#F1F9FE',
          200: '#4dd2ff',
          300: '#33ccff',
          400: '#1ac5ff',
          500: '#00BFFF',
          600: '#00ace6',
          700: '#0099cc',
          800: '#0086b3',
        },
        black: colors.black,
        white: colors.white,
        gray: {
          100: '#F2F2F2',
          200: '#E8E8E8',
          300: '#C4C4C4',
          400: '#A2A2A9',
          500: '#77777F',
          600: '#5F646E',
          700: '#35373E',
          800: '#151515',
          900: '#111111',
        },
        red: {
          50: '#FFBFB7',
          100: '#FFAFA4',
          200: '#FF9D90',
          300: '#FF7E6C',
          400: '#FF6D59',
          500: '#F25C47',
          600: '#FF472E',
          700: '#CF2A14',
          800: '#C21701',
        },
        yellow: {
          50: '#FFE39D',
          100: '#FFDD8D',
          200: '#FFD780',
          300: '#FFCA42',
          400: '#FFC453',
          500: '#FDB944',
          600: '#FBAD35',
          700: '#F79618',
          800: '#F38401',
        },
        green: {
          50: '#B1FEF7',
          100: '#8CF9EF',
          200: '#66F4E7',
          300: '#03E7D1',
          400: '#03E4CE',
          500: '#03D6C2',
          600: '#02BBA9',
          700: '#02AD9D',
          800: '#029F90',
        },
        blue: {
          50: '#BFF0FF',
          100: '#99E6FF',
          200: '#6DDBFF',
          300: '#1EC7FF',
          400: '#00BFFF',
          500: '#01ADF1',
          600: '#3787FF',
          700: '#1B72F5',
          800: '#015EEB',
        },
        purple: {
          200: '#E3CEFF',
          300: '#CEA8FF',
          400: '#C496FF',
          500: '#AE72FF',
          600: '#9962FD',
          700: '#8451FC',
          800: '#674BFD',
          900: '#401EF8',
        },
        pink: {
          100: '#FFDDF6',
          200: '#FFBAEC',
          300: '#FF9AE4',
          400: '#FF7CDB',
          500: '#FF3DCA',
          600: '#F531B3',
          700: '#EB269D',
          800: '#E11A87',
          900: '#BC0166',
        },
      },
      dropShadow: {
        blue: '1px 0px 3px #00BFFF',
      },
      fontFamily: {
        heading: 'Poppins',
        sans: [
          'Basier Circle',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        xxs: ['0.625rem', { lineHeight: '0.75rem' }],
      },
      keyframes: {
        banner: {
          '0%': {
            transform: 'translateY(0%)',
          },
          '11.11%': {
            transform: 'translateY(0%)',
          },
          '22.22%': {
            transform: 'translateY(0%)',
          },
          '33.33%': {
            transform: 'translateY(-33.33%)',
          },
          '44.44%': {
            transform: 'translateY(-33.33%)',
          },
          '55.55%': {
            transform: 'translateY(-33.33%)',
          },
          '66.66%': {
            transform: 'translateY(-66.66%)',
          },
          '77.77%': {
            transform: 'translateY(-66.66%)',
          },
          '88.88%': {
            transform: 'translateY(-66.66%)',
          },
          '100%': {
            transform: 'translateY(0%)',
          },
        },
      },
      outline: {
        blue: '2px dotted #00ace6',
      },
      screens: Object.keys(SCREENS).reduce((acc, k) => {
        const SCREEN_TEXT = `${SCREENS[k]}px`;
        return {
          ...acc,
          [k]: SCREEN_TEXT,
        };
      }, {}),
    },
  },
  plugins: [forms],
};
