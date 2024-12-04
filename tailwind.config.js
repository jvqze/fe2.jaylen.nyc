/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{tsx,ts,css,js,jsx}'],
    darkMode: 'class',
    theme: {
        screens: {
            sm: '480px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
        extend: {
            colors: {
                ThemeDark: '#111212',
            },
        },
    },
    plugins: [],
};
