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
    },
    plugins: [],
}

export default config;