import React from 'react';
import { motion } from 'framer-motion';

export const FloatingPetals: React.FC = () => {
  // Create fixed number of petals
  const petals = Array.from({ length: 6 });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-200/40 text-2xl"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: -20, 
            rotate: 0 
          }}
          animate={{ 
            y: window.innerHeight + 20, 
            rotate: 360,
            x: `calc(${Math.random() * 100}vw)`
          }}
          transition={{ 
            duration: 10 + Math.random() * 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5
          }}
        >
          🌸
        </motion.div>
      ))}
    </div>
  );
};