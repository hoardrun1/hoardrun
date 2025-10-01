import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Enhanced semantic color system for proper contrast
  			content: {
  				primary: 'hsl(var(--content-primary, var(--foreground)))',
  				secondary: 'hsl(var(--content-secondary, var(--muted-foreground)))',
  				tertiary: 'hsl(var(--content-tertiary, var(--muted-foreground)))',
  				inverse: 'hsl(var(--content-inverse, var(--background)))',
  				subtle: 'hsl(var(--content-subtle, var(--muted-foreground)))',
  				disabled: 'hsl(var(--content-disabled, var(--muted-foreground)))'
  			},
  			surface: {
  				DEFAULT: 'hsl(var(--surface))',
  				foreground: 'hsl(var(--surface-foreground))',
  				hover: 'hsl(var(--surface-hover))',
  				elevated: 'hsl(var(--surface-elevated, var(--card)))',
  				overlay: 'hsl(var(--surface-overlay, var(--popover)))'
  			},
  			// Status colors with proper contrast
  			status: {
  				success: 'hsl(var(--status-success, var(--success)))',
  				'success-foreground': 'hsl(var(--status-success-foreground, var(--success-foreground)))',
  				warning: 'hsl(var(--status-warning, var(--warning)))',
  				'warning-foreground': 'hsl(var(--status-warning-foreground, var(--warning-foreground)))',
  				error: 'hsl(var(--status-error, var(--destructive)))',
  				'error-foreground': 'hsl(var(--status-error-foreground, var(--destructive-foreground)))',
  				info: 'hsl(var(--status-info, var(--info)))',
  				'info-foreground': 'hsl(var(--status-info-foreground, var(--info-foreground)))'
  			},
  			// Interactive element colors
  			interactive: {
  				DEFAULT: 'hsl(var(--interactive, var(--primary)))',
  				foreground: 'hsl(var(--interactive-foreground, var(--primary-foreground)))',
  				hover: 'hsl(var(--interactive-hover, var(--primary)))',
  				active: 'hsl(var(--interactive-active, var(--primary)))',
  				disabled: 'hsl(var(--interactive-disabled, var(--muted)))',
  				'disabled-foreground': 'hsl(var(--interactive-disabled-foreground, var(--muted-foreground)))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Mobile-specific extensions
  		screens: {
  			'xs': '475px',
  			'3xl': '1600px',
  		},
  		spacing: {
  			'safe-top': 'env(safe-area-inset-top)',
  			'safe-bottom': 'env(safe-area-inset-bottom)',
  			'safe-left': 'env(safe-area-inset-left)',
  			'safe-right': 'env(safe-area-inset-right)',
  		},
  		height: {
  			'screen-mobile': '100dvh', // Dynamic viewport height
  			'safe-screen': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
  		},
  		minHeight: {
  			'screen-mobile': '100dvh',
  			'safe-screen': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
  		},
  		fontSize: {
  			'mobile-xs': ['0.625rem', { lineHeight: '0.875rem' }],
  			'mobile-sm': ['0.75rem', { lineHeight: '1rem' }],
  			'mobile-base': ['0.875rem', { lineHeight: '1.25rem' }],
  			'mobile-lg': ['1rem', { lineHeight: '1.5rem' }],
  			'mobile-xl': ['1.125rem', { lineHeight: '1.5rem' }],
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
