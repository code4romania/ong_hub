/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      black: '#020202',
      white: '#FFFFFF',
      orange: {
        DEFAULT: '#FFB037',
        50: '#FFF7ED',
        100: '#FFEDD5',
        200: '#FED7AA',
        300: '#FDBA74',
        400: '#FB923C',
        500: '#F97316',
        600: '#EA580C',
        700: '#C2410C',
        800: '#9A3412',
        900: '#7C2D12',
      },
      yellow: {
        DEFAULT: '#FFF649',
        50: '#FFFDE7',
        100: '#FFF9C4',
        200: '#FFF59D',
        300: '#FFF176',
        400: '#FFEE58',
        500: '#FFEB3B',
        600: '#FDD835',
        700: '#FBC02D',
        800: '#F9A825',
        900: '#F57F17',
      },
      blue: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        200: '#C7D2FE',
        300: '#A5B4FC',
        400: '#818CF8',
        500: '#6366F1',
        600: '#4F46E5',
        700: '#4338CA',
        800: '#3730A3',
        900: '#312E81',
      },
      gray: {
        50: '#F8F8FB',
        100: '#EFF0F3',
        200: '#DFE1E7',
        300: '#CDD0D8',
        400: '#A6AAB7',
        500: '#7D869A',
        600: '#5C657C',
        700: '#374159',
        800: '#283147',
        900: '#151926',
      },
      red: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
      },
      green: {
        DEFAULT: '#0DB683',
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
      },
      'green-tab': '#D5F2E9',
      'menu-green': '#43ff64',
      background: '#E5E5E5',
      'default-gray': colors.gray,
      indigo: {
        500: '#5243EA',
        600: '#4F46E5',
      },
    },
    borderWidth: {
      DEFAULT: '1px',
      0: '0',
      2: '2px',
      3: '3px',
      4: '4px',
      6: '6px',
      8: '8px',
    },
    extend: {
      backgroundImage: {
        logo: 'url(./assets/images/logo.svg)',
        clock: 'url(./assets/images/clock.svg)',
        loginBackground: 'url(./assets/images/login_background.svg)',
      },
      fontFamily: {
        roboto: 'Roboto',
        titilliumBold: 'TitilliumWeb-Bold',
        titillium: 'TitilliumWeb',
        titilliumSemiBold: 'TitilliumWeb-SemiBold',
      },
      transitionProperty: {
        width: 'width',
      },
      flex: {
        2: '2 2 0%',
        3: '3 3 0%',
      },
      spacing: {
        128: '32rem',
        136: '34rem',
      },
      gridTemplateColumns: {
        'graphs-desktop': 'repeat(auto-fill, minmax(54rem, 1fr))',
        'graphs-tablet': 'repeat(auto-fill, minmax(40rem, 1fr))',
        'graphs-mobile': 'repeat(auto-fill, minmax(15rem, 1fr))',
        cards: 'repeat(auto-fill, minmax(19rem, 1fr))',
      },
      screens: {
        '3xl': '2100px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio')],
};
