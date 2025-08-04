import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'primary': '#007bff',
                'secondary': '#6c757d',
                'success': '#28a745',
                'info': '#17a2b8',
            },
            backgroundColor: {
                page: 'var(--bg-page)',
                sidebar: 'var(--bg-sidebar)',
                card: 'var(--bg-card)',
                button: 'var(--bg-button)',
                input: 'var(--bg-input)',
                text: 'var(--text-primary)',
            },
        },
        screens: {
            'min-h-xxs': {raw: '(min-height: 240px)'},
            'min-h-xs': {raw: '(min-height: 320px)'},
            'min-h-sm': {raw: '(min-height: 480px)'},
            'min-h-md': {raw: '(min-height: 640px)'},
            'min-h-lg': {raw: '(min-height: 768px)'},
            'min-h-xl': {raw: '(min-height: 1024px)'},
            'min-h-2xl': {raw: '(min-height: 1280px)'},
            'min-h-3xl': {raw: '(min-height: 1536px)'},
        },
    },
    plugins: [],
}

export default config;