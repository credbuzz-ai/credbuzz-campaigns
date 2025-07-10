import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        "6xl": "1192px",
        "3xl": "808px",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        pastel: {
          beige: "#E8E0D4",
          mint: "#B8D4C8",
          lavender: "#C8C4D8",
          peach: "#F0D4C8",
          sage: "#A8C4B8",
          cream: "#F4F0E8",
          // Dark mode variants
          "beige-dark": "#3A3530",
          "mint-dark": "#2A3530",
          "lavender-dark": "#353040",
          "peach-dark": "#3A3028",
          "sage-dark": "#2A3530",
          "cream-dark": "#2A2820",
        },
        gray: {
          800: "#2D3748",
          700: "#4A5568",
          600: "#718096",
        },
        // Neutral grayscale & deep greens
        neutral: {
          100: "#CFCFCF", // light gray
          200: "#9CA7A4", // cool gray
          300: "#6A7B78", // sage green (light)
          400: "#4D5B59", // sage green (medium)
          500: "#2D3B39", // deep sage
          600: "#1E2A28", // evergreen
          700: "#151B1A", // charcoal
          800: "#060F11", // rich black
          900: "#080B0A", // deep black
        },

        // Brand greens (primary palette)
        brand: {
          50: "#DFFCF6", // mint tint
          200: "#A9F0DF", // mint light
          400: "#66E2C1", // mint
          600: "#00D992", // brand green (primary)
        },

        // Supporting accent colors
        support: {
          salmon: "#F38C8C", // soft red (alert / danger)
          sand: "#DCD9A2", // muted yellow (warning / info)
        },

        cardBackground: "#151B1AA6",
        cardBackground2: "#242A29A6",
        navbarBackground: "#080B0A",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        seasonVF: ["seasonVF"],
        seasonMix: ["seasonMix"],
        seasonSansMedium: ["seasonSansMedium"],
        seasonSansSemiBold: ["seasonSansSemiBold"],
      },
    },
  },
  plugins: [],
};
export default config;
