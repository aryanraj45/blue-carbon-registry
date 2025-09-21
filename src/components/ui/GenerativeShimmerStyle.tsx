// src/components/ui/GenerativeShimmerStyle.tsx

export const GenerativeShimmerStyle = () => (
    <style>{`
        @keyframes generative-gradient { 
            0% { background-position: 0% 50%; } 
            50% { background-position: 100% 50%; } 
            100% { background-position: 0% 50%; } 
        }

        /* Gradient adjusted for a dark theme */
        .generative-bg {
            background: linear-gradient(110deg, #1e293b, #334155, #1e293b);
            background-size: 200% 200%;
            animation: generative-gradient 3s ease infinite;
        }
    `}</style>
);
