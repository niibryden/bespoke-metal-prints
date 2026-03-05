import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

export function SuccessConfetti() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Generate confetti pieces
    const pieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: 0,
      color: ['#ff6b35', '#ffa066', '#ff8c42', '#4ade80', '#22c55e', '#ef4444'][Math.floor(Math.random() * 6)],
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            x: '50vw',
            y: '50vh',
            opacity: 1,
            rotate: 0,
            scale: piece.scale
          }}
          animate={{
            x: `calc(50vw + ${piece.x}vw)`,
            y: '120vh',
            opacity: 0,
            rotate: piece.rotation + 720,
          }}
          transition={{
            duration: 1.5 + Math.random() * 0.5,
            ease: 'easeOut',
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
