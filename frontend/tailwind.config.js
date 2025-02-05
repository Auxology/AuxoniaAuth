/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		colors: {
			background: "#232946",
			headline: "#fffffe",
			paragraph: "#b8c1ec",
			button: "#eebbc3",
			buttonText: "#232946",
		},
		keyframes: {
			"caret-blink": {
				"0%,70%,100%": {opacity: "1"},
				"20%,50%": {opacity: "0"},
			},
		},
		animation: {
			"caret-blink": "caret-blink 1.25s ease-out infinite",
		}
	}
  },
  plugins: [require("tailwindcss-animate")],
}