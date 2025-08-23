import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../../types/game';

interface GameCompletedInterfaceProps {
  gameState: GameState;
  onEnterShop: () => void;
}

const GameCompletedInterface: React.FC<GameCompletedInterfaceProps> = ({
  gameState,
  onEnterShop
}) => {
  return (
    <div className="text-center">
      <motion.h2
        className="text-2xl font-bold text-yellow-400 mb-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        🎉 关卡完成！🎉
      </motion.h2>
      <motion.div
        className="text-sm text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p>目标: {gameState.targetScore}</p>
        <p>得分: {gameState.currentScore}</p>
        <p className="text-green-400">超额: +{gameState.currentScore - gameState.targetScore}</p>
      </motion.div>
      <motion.button
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg text-sm"
        onClick={onEnterShop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        进入商店
      </motion.button>
    </div>
  );
};

export default GameCompletedInterface;