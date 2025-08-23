import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../../types/game';
import GameCompletedInterface from './GameCompletedInterface';
import ShopInterface from './ShopInterface';

interface GameOverlayProps {
  showOverlay: boolean;
  overlayPhase: 'settlement' | 'shop';
  gameState: GameState;
  setOverlayPhase: (phase: 'settlement' | 'shop') => void;
  setShowOverlay: (show: boolean) => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  showOverlay,
  overlayPhase,
  gameState,
  setOverlayPhase,
  setShowOverlay
}) => {
  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          className="absolute inset-0 z-50 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 border-t-4 border-yellow-400 rounded-t-2xl shadow-2xl overflow-hidden"
          initial={{ top: '100%' }}
          animate={{ top: 0 }}
          exit={{ top: '100%' }}
          transition={{ 
            type: 'spring',
            stiffness: 100,
            damping: 20,
            duration: 0.8
          }}
        >
          <div className="p-4 h-full flex flex-col">
            {overlayPhase === 'settlement' && (
              <GameCompletedInterface
                gameState={gameState}
                onEnterShop={() => setOverlayPhase('shop')}
              />
            )}
            
            {overlayPhase === 'shop' && (
              <ShopInterface
                gameState={gameState}
                onNextLevel={() => {
                  setShowOverlay(false);
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameOverlay;