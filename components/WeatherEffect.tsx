import React, { useEffect, useState } from 'react';

export const WeatherEffect: React.FC = () => {
    const [petals, setPetals] = useState<{id: number, left: number, delay: number, dur: number, scale: number, opac: number}[]>([]);

    useEffect(() => {
        // Generate random parameters once on mount to avoid re-renders causing jitter
        const generated = Array.from({ length: 35 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 15,
            dur: 7 + Math.random() * 12,
            scale: 0.4 + Math.random() * 0.8,
            opac: 0.3 + Math.random() * 0.6
        }));
        setPetals(generated);
    }, []);

    // Pure CSS Sakura Falling Animation (optimized for GPU)
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true" style={{ perspective: '1000px' }}>
            {petals.map(p => (
                <div 
                    key={p.id}
                    className="absolute bg-gradient-to-br from-pink-200 to-pink-400 dark:from-pink-400 dark:to-purple-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)] opacity-0"
                    style={{
                        left: `${p.left}%`,
                        top: `-10vh`,
                        width: '10px',
                        height: '16px',
                        borderRadius: '10px 0px 10px 0px', // Petal shape
                        animation: `sakuraFall ${p.dur}s linear ${p.delay}s infinite`,
                        transform: `scale(${p.scale})`,
                        '--petal-opac': p.opac
                    } as React.CSSProperties}
                ></div>
            ))}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes sakuraFall {
                    0% { 
                        transform: translateY(-10vh) translateX(0) rotate3d(1, 1, 1, 0deg); 
                        opacity: 0; 
                    }
                    10% { 
                        opacity: var(--petal-opac); 
                    }
                    50% { 
                        transform: translateY(50vh) translateX(30px) rotate3d(1, 1, 1, 180deg); 
                    }
                    90% { 
                        opacity: var(--petal-opac); 
                    }
                    100% { 
                        transform: translateY(110vh) translateX(-30px) rotate3d(1, 1, 1, 360deg); 
                        opacity: 0; 
                    }
                }
            `}} />
        </div>
    );
};
