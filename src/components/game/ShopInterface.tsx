import React from 'react';
import { motion } from 'framer-motion';
import { GameState, Joker, ShopItem } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';
import { soundManager, SoundType } from '../../utils/soundManager';

interface ShopInterfaceProps {
  gameState: GameState;
  onNextLevel: () => void;
}

const ShopInterface: React.FC<ShopInterfaceProps> = ({
  gameState,
  onNextLevel
}) => {
  const handleNextLevel = () => {
    soundManager.play(SoundType.LEVEL_UP);
    onNextLevel();
    useGameStore.getState().proceedToNextLevel();
  };

  return (
    <div className="h-full flex flex-col">
      {/* 商店标题 */}
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold text-purple-400 mb-1">🛒 小丑牌商店</h2>
        <div className="flex justify-center items-center gap-4 text-xs">
          <div className="text-green-400 font-bold">
            💰 ${gameState.money}
          </div>
          <div className="text-blue-400 font-bold">
            🎯 第 {gameState.currentRound} 关
          </div>
        </div>
      </div>

      {/* 商店物品展示 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {gameState.shopItems.map((item, index) => {
            const joker = item.item as Joker;
            const canAfford = gameState.money >= item.cost;
            const hasSpace = gameState.jokers.length < gameState.maxJokers;
            
            return (
              <motion.div
                key={item.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-gray-800 rounded-lg p-2 border transition-all text-xs ${
                  canAfford && hasSpace 
                    ? 'border-green-400 hover:border-green-300 hover:bg-gray-700 cursor-pointer' 
                    : 'border-gray-600 opacity-60'
                }`}
                onClick={() => {
                  if (canAfford && hasSpace) {
                    soundManager.play(SoundType.BUTTON_CLICK);
                    useGameStore.getState().buyShopItem(item.id);
                  }
                }}
                whileHover={canAfford && hasSpace ? { scale: 1.02 } : {}}
                whileTap={canAfford && hasSpace ? { scale: 0.98 } : {}}
              >
                {/* 小丑牌图标 */}
                <div className="text-center mb-1">
                  <div className="text-lg mb-1">🃏</div>
                  <div className="text-xs font-bold text-yellow-400">{joker.name}</div>
                </div>
                
                {/* 小丑牌描述 */}
                <div className="text-center mb-1">
                  <div className="text-gray-300 text-xs mb-1">{joker.description}</div>
                </div>
                
                {/* 价格和购买状态 */}
                <div className="text-center">
                  <div className={`text-sm font-bold mb-1 ${
                    canAfford ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${item.cost}
                  </div>
                  {!hasSpace && (
                    <div className="text-red-400 text-xs">位置已满</div>
                  )}
                  {!canAfford && hasSpace && (
                    <div className="text-red-400 text-xs">金币不足</div>
                  )}
                  {canAfford && hasSpace && (
                    <div className="text-green-400 text-xs">点击购买</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 商店操作按钮 */}
      <div className="flex justify-center gap-2 mt-2">
        {/* 刷新商店按钮 */}
        <motion.button
          className={`px-2 py-1 rounded-lg font-bold transition-all text-xs ${
            gameState.money >= gameState.shopRefreshCost
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => {
            if (gameState.money >= gameState.shopRefreshCost) {
              soundManager.play(SoundType.SHUFFLE);
              useGameStore.getState().refreshShop();
            }
          }}
          disabled={gameState.money < gameState.shopRefreshCost}
          whileHover={gameState.money >= gameState.shopRefreshCost ? { scale: 1.05 } : {}}
          whileTap={gameState.money >= gameState.shopRefreshCost ? { scale: 0.95 } : {}}
        >
          🔄 刷新 (${gameState.shopRefreshCost})
        </motion.button>
        
        {/* 进入下一关按钮 */}
        <motion.button
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg font-bold text-white transition-all text-xs"
          onClick={handleNextLevel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ➡️ 下一关
        </motion.button>
      </div>
    </div>
  );
};

export default ShopInterface;