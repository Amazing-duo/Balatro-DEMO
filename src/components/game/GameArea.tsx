import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Card, GameState, Joker } from '../../types/game';
import JokerCard from '../JokerCard';
import DeepSeekHand from '../DeepSeekHand';

interface GameAreaProps {
  gameState: GameState;
  showJokerDetails: boolean;
  canPlayHand: boolean;
  canDiscard: boolean;
  targetReached: boolean;
  showOverlay: boolean;
  overlayPhase: 'settlement' | 'shop';
  onSellJoker: (joker: Joker) => void;
  onCardClick: (card: Card) => void;
  onHandReorder: (cards: Card[]) => void;
  onPlayHand: () => void;
  onDiscardCards: () => void;
  onSortByRank: () => void;
  onSortBySuit: () => void;
  onAIButtonClick: () => void;
  onDeckClick: () => void;
  onPlaySelectedCards: () => void;
  setOverlayPhase: (phase: 'settlement' | 'shop') => void;
  setShowOverlay: (show: boolean) => void;
}

const GameArea: React.FC<GameAreaProps> = ({
  gameState,
  showJokerDetails,
  canPlayHand,
  canDiscard,
  targetReached,
  showOverlay,
  overlayPhase,
  onSellJoker,
  onCardClick,
  onHandReorder,
  onPlayHand,
  onDiscardCards,
  onSortByRank,
  onSortBySuit,
  onAIButtonClick,
  onDeckClick,
  onPlaySelectedCards,
  setOverlayPhase,
  setShowOverlay
}) => {
  return (
    <div className="flex-1 flex flex-col relative">
      {/* 上方区域：小丑牌和消耗品 */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          {/* 左上角：小丑牌区域 - 5张牌宽度，1张牌高度 */}
          <div className="relative">
            <div className="bg-gray-500/20 rounded-lg p-4" style={{width: 'calc(5 * 6rem + 4 * 0.5rem + 2rem)', height: 'calc(9rem + 2rem)'}}>
              <div className="flex space-x-2 overflow-x-auto">
                <div className="flex space-x-2">
                  <AnimatePresence>
                    {gameState.jokers.map((joker) => (
                      <motion.div
                        key={joker.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <JokerCard
                          joker={joker}
                          onSell={onSellJoker}
                          showSellButton={showJokerDetails}
                          size="medium"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* 空位指示器 */}
                  {Array.from({ length: gameState.maxJokers - gameState.jokers.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="w-24 h-36 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">+</div>
                        <div className="text-xs">空位</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* 小丑牌计数 - 靠左显示 */}
            <div className="text-xs text-gray-400 mt-1">
              {gameState.jokers.length}/{gameState.maxJokers}
            </div>
          </div>

          {/* 右上角：消耗品区域 - 2张牌宽度，1张牌高度 */}
          <div className="relative">
            <div className="bg-gray-500/20 rounded-lg p-4" style={{width: 'calc(2 * 6rem + 1 * 0.5rem + 2rem)', height: 'calc(9rem + 2rem)'}}>
              <div className="flex space-x-2">
                {/* 第一个消耗品栏位 */}
                <div className="w-24 h-36 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🃏</div>
                    <div className="text-xs">空位</div>
                  </div>
                </div>
                {/* 第二个消耗品栏位 */}
                <div className="w-24 h-36 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🃏</div>
                    <div className="text-xs">空位</div>
                  </div>
                </div>
              </div>
              {/* 消耗品计数 - 靠右显示 */}
              <div className="text-xs text-gray-400 mt-1 text-right">
                0/2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 中间区域：游戏信息显示区 */}
      <div className="flex-1 flex items-center justify-center px-4">
        {/* 这里可以显示其他游戏信息，如特殊效果、提示等 */}
        <div className="text-center text-gray-400">
          {/* 预留空间用于显示游戏状态信息 */}
        </div>
      </div>

      {/* 底部区域：手牌和操作 */}
      <div className="p-4">
        {/* 手牌区域 - 80%宽度 */}
        <div className="bg-gray-500/20 rounded-lg p-4 w-4/5">
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

        {/* 右下角：AI助手和牌组 - 绝对定位 */}
        <div className="absolute bottom-4 right-4 w-32">
          {/* AI助手按钮 */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-3 text-center">AI助手</h3>
            <motion.button
              className="w-24 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg border-2 border-purple-400 flex items-center justify-center cursor-pointer hover:border-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onAIButtonClick}
              disabled={gameState.hand.length === 0 || gameState.handsLeft === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <Brain className="w-6 h-6 text-white mx-auto mb-1" />
                <div className="text-xs text-purple-200">建议</div>
              </div>
            </motion.button>
          </div>
          
          {/* 牌组 */}
          <div>
            <h3 className="text-lg font-bold mb-3">牌组</h3>
            <div 
              className="w-24 h-36 bg-gradient-to-br from-blue-800 to-purple-900 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-200 transition-colors"
              onClick={onDeckClick}
            >
              <div className="text-center">
                <div className="text-white text-2xl font-bold opacity-30">♠</div>
                <div className="text-xs text-gray-300 mt-1">{gameState.deck.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮区域 - 与手牌中轴对齐 */}
        <div className="relative flex mt-4 gap-2 max-w-md" style={{marginLeft: 'calc(20% * 0.5 + 1rem)'}}>
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
    </div>
  );
};

export default GameArea;