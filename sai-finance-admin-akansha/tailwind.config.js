/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins"],
        regular: ["Poppins-Regular"],
        poppinsbold: ["Poppins-Bold"],
        poppinsblack: ["Poppins-Black"],
        cunia: ["Cunia"],
        cuniaRegular: ["Cunia-Regular"],
        gilroy: ["Gilroy"],
        yung: ["Young"],
        poppins: ["Poppins", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
      },
      colors: {
        primary: "#2563eb", // Professional blue - primary color
        secondary: "#7c3aed", // Modern purple - secondary color
        primaryLight: "#3b82f6", // Lighter blue
        primaryDark: "#1d4ed8", // Darker blue
        secondaryLight: "#8b5cf6", // Lighter purple
        secondaryDark: "#6d28d9", // Darker purple
        primaryBg: "#eff6ff", // Light blue background
        secondaryBg: "#faf5ff", // Light purple background
        coolGray: "#8493A8",
        midGray: "#ADB9CA",
        lightGray: "#CAD3DF",
        deepBlue: "#0E0E52",
        brightYellow: "#FFC13D",
        indigo: "#4169e1",
        darkBlue: "#1167b1",
        EB5757: "#EB5757",
        DEE8FF: "#DEE8FF",
        EFEEFB: "#EFEEFB",
        D7D4F5: "#D7D4F5",
        B9B6EC: "#B9B6EC",
        white: "#ffffff",
        F5F8FF: "#F5F8FF",
        green: "#10b981",
        lightPink: "#D02F68",
        darkGray: "#4E4E4E",
        bgBlue: "#2563eb",
        bgBlueOld: "#F2CF7E",
        DFEFFF: "#DFEFFF",
        E61A89: "#E61A89",
        Gold: "#B4833E",
        lightGold: "#EDD87D",
        Platinum: "#C7C6C4",
        lightPlatinum: "#F4F3F1",
        blue: "#2563eb",
        black: "#000000",
        Brown: "#654321",
        arrowC:"#0B0B38",
        dotC: "#9EB8D9",
        buttonC:"#7c3aed",
        redC:"#ef4444",
        singC:"#0e0e52",
        Waletcolor:"#2563eb",
        yellowcolor:"#FFFFF0",
        purple1:"#7c3aed",
        purple:"#7c3aed",
        red:"#ef4444",
        bgWhite:"#f8fafc",
        heroBg: "#4D2C5E03",
        tagsky:"#06b6d4"
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-in-up': 'slideInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '50%': { transform: 'translateY(-5px)', opacity: '0.5' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins:  [
    require('flowbite/plugin'),
    require('tailwind-scrollbar-hide')
],
}
