module.exports = {
    content: [
        "./src/**/*.{html,js,ts,jsx,tsx}",
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "01-tokens-borders-borders": "var(--01-tokens-borders-borders)",
                "01-tokens-borders-dividers": "var(--01-tokens-borders-dividers)",
                "01-tokens-components-button-primary-background":
                    "var(--01-tokens-components-button-primary-background)",
                "01-tokens-components-button-tertiary-hover-focus-background":
                    "var(--01-tokens-components-button-tertiary-hover-focus-background)",
                "01-tokens-surfaces-and-elevation-elevation-1":
                    "var(--01-tokens-surfaces-and-elevation-elevation-1)",
                "01-tokens-surfaces-and-elevation-elevation-2":
                    "var(--01-tokens-surfaces-and-elevation-elevation-2)",
                "01-tokens-text-placeholder": "var(--01-tokens-text-placeholder)",
                "01-tokens-text-primary": "var(--01-tokens-text-primary)",
                "01-tokens-text-secondary": "var(--01-tokens-text-secondary)",
                "02-primatives-neutral-200": "var(--02-primatives-neutral-200)",
                "02-primatives-neutral-50": "var(--02-primatives-neutral-50)",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            fontFamily: {
                "paragraph-extra-small-12-medium":
                    "var(--paragraph-extra-small-12-medium-font-family)",
                "paragraph-regular-16-bold":
                    "var(--paragraph-regular-16-bold-font-family)",
                "paragraph-regular-16-medium":
                    "var(--paragraph-regular-16-medium-font-family)",
                "paragraph-small-14-medium":
                    "var(--paragraph-small-14-medium-font-family)",
                "paragraph-small-14-regular":
                    "var(--paragraph-small-14-regular-font-family)",
                sans: [
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                    '"Noto Color Emoji"',
                ],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
        container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    },
    plugins: [],
    darkMode: ["class"],
};
