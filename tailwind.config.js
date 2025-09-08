/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Ensure the font family is defined here to be available in the app.
        // You can add more custom fonts if needed.
        'space-mono': ['SpaceMono', 'monospace'],
      },
    },
  },
  plugins: [],
};
