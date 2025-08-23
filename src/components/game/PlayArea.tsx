import React from 'react';
import { motion } from 'framer-motion';
import { Card, GameState } from '../../types/game';
import DeepSeekHand from '../DeepSeekHand';

interface PlayAreaProps {
  gameState: GameState;
  canPlayHand: boolean;
  canDiscard: boolean;
  targetReached: boolean;
  onCardClick: (card: Card) => void;
  onHandReorder: (cards: Card[]) => void;
  onPlayHand: () => void;
  onDiscardCards: () => void;
  onSortByRank: () => void;
  onSortBySuit: () => void;
  onPlaySelectedCards: () => void;
}

const PlayArea: React.FC<PlayAreaProps> = ({
  gameState,
  canPlayHand,
  canDiscard,
  targetReached,
  onCardClick,
  onHandReorder,
  onPlayHand,
  onDiscardCards,
  onSortByRank,
  onSortBySuit,
  onPlaySelectedCards
}) => {
  return (
    <div className="flex flex-col flex-1">
      {/* 手牌区域 */}
      <div className="bg-gray-500/20 rounded-lg p-4 mb-4">
        <DeepSeekHand
          cards={gameState.hand}
          onCardClick={onCardClick}
          onReorder={onHandReorder}
          maxSelection={5}
          isPlayable={gameState.handsLeft > 0 || gameState.discardsLeft > 0}
          onPlayCards={(cards) => {
            // DeepSeek动画完成后触发原有的出牌逻辑
            setTimeout(() => {
              onPlaySelectedCards();
            }, 100);
          }}
        />
      </div>

      <div className='flex justify-center'>
         {/* 操作按钮区域 */}
      <div className="flex gap-2 max-w-md justify-center w-full">
        {/* 出牌按钮 - 左侧，4:3宽高比 */}
        <div className="flex-1">
          <motion.button
            className={`
              w-full aspect-[4/3] px-3 py-2 rounded-lg font-bold transition-all text-base
              ${canPlayHand 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            onClick={onPlayHand}
            disabled={!canPlayHand}
            whileHover={canPlayHand ? { scale: 1.05 } : {}}
            whileTap={canPlayHand ? { scale: 0.95 } : {}}
          >
            出牌
          </motion.button>
        </div>
        
        {/* 理牌区域 - 中间，4:3宽高比 */}
        <div className="flex-1">
          <div className="border-2 border-white rounded-lg p-2 bg-transparent aspect-[4/3] flex flex-col justify-center">
            <div className="text-center text-white font-bold text-sm mb-1">理牌</div>
            <div className="flex gap-1 justify-center">
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded transition-colors flex-1 aspect-[4/3] flex items-center justify-center"
                onClick={onSortByRank}
              >
                点数
              </button>
              <button 
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded transition-colors flex-1 aspect-[4/3] flex items-center justify-center"
                onClick={onSortBySuit}
              >
                花色
              </button>
            </div>
          </div>
        </div>
        
        {/* 弃牌按钮 - 右侧，4:3宽高比 */}
        <div className="flex-1">
          <motion.button
            className={`
              w-full aspect-[4/3] px-3 py-2 rounded-lg font-bold transition-all text-base
              ${canDiscard 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            onClick={onDiscardCards}
            disabled={!canDiscard}
            whileHover={canDiscard ? { scale: 1.05 } : {}}
            whileTap={canDiscard ? { scale: 0.95 } : {}}
          >
            弃牌
          </motion.button>
        </div>
      </div>
    </div>

      {/* 游戏状态提示 */}
      <div className="mt-6 text-center">
        {targetReached && (
          <motion.div
            className="text-2xl font-bold text-green-400 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            🎉 目标达成！🎉
          </motion.div>
        )}
        
        {gameState.handsLeft === 0 && !targetReached && (
          <motion.div
            className="text-2xl font-bold text-red-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            💀 游戏结束 💀
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlayArea;