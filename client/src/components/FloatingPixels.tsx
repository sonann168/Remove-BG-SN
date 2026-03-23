import React from 'react';

interface FloatingPixel {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export const FloatingPixels: React.FC = () => {
  // Generate random floating pixels
  const pixels: FloatingPixel[] = React.useMemo(() => {
    const colors = ['#00FF00', '#00FFFF', '#FF00FF', '#FFFF00'];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {pixels.map((pixel) => (
        <div
          key={pixel.id}
          className="absolute animate-pixel-pulse"
          style={{
            left: `${pixel.x}%`,
            top: `${pixel.y}%`,
            width: `${pixel.size}px`,
            height: `${pixel.size}px`,
            backgroundColor: pixel.color,
            boxShadow: `0 0 ${pixel.size * 2}px ${pixel.color}`,
            animation: `float ${pixel.duration}s ease-in-out ${pixel.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(${Math.random() > 0.5 ? 20 : -20}px);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};
