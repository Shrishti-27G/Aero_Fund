// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {
//       keyframes: {
//         liquidFloat: {
//           "0%, 100%": { transform: "translate(0px,0px)" },
//           "50%": { transform: "translate(45px,55px)" },
//         },
//         shine: {
//           "0%": { transform: "translateX(-100%)" },
//           "100%": { transform: "translateX(200%)" },
//         },
//         depthPulse: {
//           "0%,100%": { transform: "scale(1)" },
//           "50%": { transform: "scale(1.1)" },
//         },
//       },

//       animation: {
//         liquid: "liquidFloat 6s ease-in-out infinite",
//         shine: "shine 3s linear infinite",
//         depth: "depthPulse 5s ease-in-out infinite",
//       },
//     },
//   },
//   plugins: [],
// };




/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-35px)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(25px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeUpLate: {
          "0%": { opacity: 0, transform: "translateY(40px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        floatY: "floatY 7s ease-in-out infinite",
        floatYslow: "floatY 10s ease-in-out infinite",
        fadeUp: "fadeUp .9s ease-out forwards",
        fadeUpLate: "fadeUpLate 1.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
