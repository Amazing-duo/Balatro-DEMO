import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Card, GameState, Joker } from '../../types/game';
import JokerCard from '../JokerCard';
import PlayArea from './PlayArea';

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

      {/* 底部区域：手牌和操作 - 左右布局 */}
      <div className="p-4 flex justify-between gap-4">
        {/* 左侧：打牌区 */}
        <div className="flex-1">
          <PlayArea
            gameState={gameState}
            canPlayHand={canPlayHand}
            canDiscard={canDiscard}
            targetReached={targetReached}
            onCardClick={onCardClick}
            onHandReorder={onHandReorder}
            onPlayHand={onPlayHand}
            onDiscardCards={onDiscardCards}
            onSortByRank={onSortByRank}
            onSortBySuit={onSortBySuit}
            onPlaySelectedCards={onPlaySelectedCards}
          />
        </div>

        {/* 右侧：AI助手和牌组 */}
        <div className="w-32 flex flex-col">
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
      </div>
    </div>
  );
};

export default GameArea;