import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANIMALS = [
  { emoji: '🐰', type: 'Bunny' },
  { emoji: '🐱', type: 'Cat' },
  { emoji: '🐼', type: 'Panda' },
  { emoji: '🐣', type: 'Chick' },
];

export const AnimalCompanions: React.FC = () => {
  const [currentAnimal, setCurrentAnimal] = useState<{ emoji: string, id: number } | null>(null);

  useEffect(() => {
    // Randomly spawn an animal every 15-45 seconds
    const spawnAnimal = () => {
      if (Math.random() > 0.3) { // 70% chance to spawn
        const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        setCurrentAnimal({ ...randomAnimal, id: Date.now() });
      }
    };

    const interval = setInterval(spawnAnimal, 20000);
    // Spawn one immediately on load for delight
    setTimeout(() => setCurrentAnimal({ ...ANIMALS[0], id: Date.now() }), 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 left-0 right-0 h-20 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence mode="wait">
        {currentAnimal && (
          <motion.div
            key={currentAnimal.id}
            initial={{ x: -50, opacity: 0, y: 0 }}
            animate={{ 
              x: window.innerWidth + 50, 
              opacity: 1,
              y: [0, -10, 0, -10, 0] // Hopping effect
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 8, 
              ease: "linear",
              y: { repeat: Infinity, duration: 0.5 } 
            }}
            onAnimationComplete={() => setCurrentAnimal(null)}
            className="absolute bottom-0 text-4xl filter drop-shadow-lg"
          >
            {currentAnimal.emoji}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};