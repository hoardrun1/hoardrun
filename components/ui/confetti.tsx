import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active?: boolean;
  duration?: number;
  particleCount?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ 
  active = false, 
  duration = 3000,
  particleCount = 50 
}) => {
  const [isActive, setIsActive] = useState(active);

  useEffect(() => {
    if (active) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isActive) return null;

  const particles = Array.from({ length: particleCount }, (_, i) => (
    <div
      key={i}
      className="confetti-particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}
    />
  ));

  return (
    <>
      <div className="confetti-container fixed inset-0 pointer-events-none z-50">
        {particles}
      </div>
      <style jsx>{`
        .confetti-container {
          overflow: hidden;
        }
        
        .confetti-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          top: -10px;
          animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};
