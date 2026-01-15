/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    850: '#151e2d', // Custom deeper slate
                    900: '#0f172a',
                },
                cyan: {
                    400: '#22d3ee',
                    500: '#06b6d4',
                    900: '#164e63',
                }
            },
            animation: {
                'scan': 'scan 2s linear infinite',
            },
            keyframes: {
                scan: {
                    '0%': { top: '0%', opacity: 0 },
                    '10%': { opacity: 1 },
                    '90%': { opacity: 1 },
                    '100%': { top: '100%', opacity: 0 },
                }
            }
        },
    },
    plugins: [],
}
