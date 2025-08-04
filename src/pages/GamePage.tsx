import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { GameEngine } from '../game-engine/GameEngine';
import Hand from '../components/Hand';
import JokerCard from '../components/JokerCard';
import { Card as CardType, Joker, ScoreResult } from '../types/game';
import { HandEvaluator } from '../game-engine/HandEvaluator';
import { ScoreCalculator } from '../game-engine/ScoreCalculator';

const GamePage: React.FC = () => {
  const {
    gamePhase,
    currentRound,
    currentScore,
    targetScore,
    money,
    deck,
    hand,
    selectedCards,
    discardPile,
    jokers,
    maxJokers,
    handsLeft,
    discardsLeft,
    shopItems,
    shopRefreshCost,
    handTypeConfigs,
    settings,
    selectCard,
    deselectCard,
    playSelectedCards,
    discardSelectedCards,
    clearSelection,
    enterShop,
    sellJoker
  } = useGameStore();

  // 创建gameState对象用于兼容现有代码
  const gameState = {
    gamePhase,
    currentRound,
    currentScore,
    targetScore,
    money,
    deck,
    hand,
    selectedCards,
    discardPile,
    jokers,
    maxJokers,
    handsLeft,
    discardsLeft,
    shopItems,
    shopRefreshCost,
    handTypeConfigs,
    settings
  };

  const [gameEngine] = useState(() => new GameEngine(gameState));
  const [scorePreview, setScorePreview] = useState<ScoreResult | null>(null);
  const [showJokerDetails, setShowJokerDetails] = useState(false);

  // 同步游戏状态到引擎
  useEffect(() => {
    gameEngine.updateGameState(gameState);
  }, [gameState, gameEngine]);

  // 计算分数预览
  useEffect(() => {
    if (gameState.selectedCards.length > 0) {
      const preview = ScoreCalculator.previewScore(
        gameState.selectedCards,
        gameState.jokers,
        gameState.handTypeConfigs
      );
      setScorePreview(preview);
    } else {
      setScorePreview(null);
    }
  }, [gameState.selectedCards, gameState.jokers, gameState.handTypeConfigs]);

  const handleCardClick = (card: CardType) => {
    if (card.isSelected) {
      deselectCard(card.id);
    } else {
      selectCard(card.id);
    }
  };

  const handlePlayHand = () => {
    if (gameState.selectedCards.length > 0 && gameState.handsLeft > 0) {
      playSelectedCards();
    }
  };

  const handleDiscardCards = () => {
    if (gameState.selectedCards.length > 0 && gameState.discardsLeft > 0) {
      discardSelectedCards();
    }
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  const handleEnterShop = () => {
    enterShop();
  };

  const handleSellJoker = (joker: Joker) => {
    sellJoker(joker.id);
  };

  const getHandTypeDisplay = () => {
    if (gameState.selectedCards.length === 0) return null;
    
    const evaluation = HandEvaluator.evaluateHand(gameState.selectedCards);
    return evaluation.handType;
  };

  const canPlayHand = gameState.selectedCards.length > 0 && gameState.handsLeft > 0;
  const canDiscard = gameState.selectedCards.length > 0 && gameState.discardsLeft > 0;
  const targetReached = gameState.currentScore >= gameState.targetScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-black text-white flex">
      {/* 左侧信息面板 */}
      <div className="w-80 bg-black bg-opacity-40 p-4 flex flex-col space-y-4">
        {/* 分数信息 */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-blue-400">回合分数</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">当前分数:</span>
              <span className="text-yellow-400 font-bold">
                {gameState.currentScore.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">目标分数:</span>
              <span className="text-blue-400 font-bold">
                {gameState.targetScore.toLocaleString()}
              </span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden mt-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, (gameState.currentScore / gameState.targetScore) * 100)}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-center text-sm text-gray-400">
              {Math.round((gameState.currentScore / gameState.targetScore) * 100)}% 完成
            </div>
          </div>
        </div>

        {/* 当前牌型 */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-purple-400">当前牌型</h3>
          <div className="text-center">
            {getHandTypeDisplay() ? (
              <div className="text-xl font-bold text-yellow-300">
                {getHandTypeDisplay()}
              </div>
            ) : (
              <div className="text-gray-400">请选择卡牌</div>
            )}
          </div>
        </div>

        {/* 金币信息 */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-green-400">金币</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              ${gameState.money}
            </div>
          </div>
        </div>

        {/* 比赛信息 */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-orange-400">比赛信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">回合:</span>
              <span className="text-white font-bold">{gameState.currentRound}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">出牌:</span>
              <span className="text-blue-400 font-bold">{gameState.handsLeft}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">弃牌:</span>
              <span className="text-red-400 font-bold">{gameState.discardsLeft}</span>
            </div>
          </div>
        </div>

        {/* 选项按钮 */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-cyan-400">选项</h3>
          <div className="space-y-2">
            {targetReached && (
              <motion.button
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-bold transition-colors"
                onClick={handleEnterShop}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                进入商店
              </motion.button>
            )}
            <button
              className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold transition-colors"
              onClick={handleClearSelection}
            >
              清空选择
            </button>
          </div>
        </div>
      </div>

      {/* 右侧游戏区域 */}
      <div className="flex-1 flex flex-col relative">
        {/* 顶部区域：小丑牌和消耗品 */}
        <div className="flex justify-between p-4">
          {/* 小丑牌区域 */}
          <div className="flex-1 mr-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">小丑牌 ({gameState.jokers.length}/{gameState.maxJokers})</h3>
              <button
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => setShowJokerDetails(!showJokerDetails)}
              >
                {showJokerDetails ? '隐藏详情' : '显示详情'}
              </button>
            </div>
            
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <AnimatePresence>
                {gameState.jokers.map((joker) => (
                  <motion.div
                    key={joker.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    <JokerCard
                      joker={joker}
                      onSell={handleSellJoker}
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
                  className="w-24 h-36 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">+</div>
                    <div className="text-xs">空位</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右上角：消耗品区域 */}
          <div className="w-32">
            <h3 className="text-lg font-bold mb-3">消耗品</h3>
            <div className="space-y-2">
              <div className="w-24 h-36 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-2xl mb-1">🃏</div>
                  <div className="text-xs">空位</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间区域：分数预览/结算区 */}
        <div className="flex-1 flex items-center justify-center px-4">
          <AnimatePresence>
            {scorePreview && (
              <motion.div
                className="p-6 bg-black bg-opacity-60 rounded-xl border-2 border-yellow-500"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-4 text-yellow-300">
                    {getHandTypeDisplay()}
                  </div>
                  <div className="flex justify-center items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-300">基础分</div>
                      <div className="text-xl font-bold text-blue-400">{scorePreview.baseScore}</div>
                    </div>
                    <div className="text-2xl text-gray-400">×</div>
                    <div className="text-center">
                      <div className="text-sm text-gray-300">倍数</div>
                      <div className="text-xl font-bold text-green-400">{scorePreview.multiplier}</div>
                    </div>
                    <div className="text-2xl text-gray-400">=</div>
                    <div className="text-center">
                      <div className="text-sm text-gray-300">总分</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {scorePreview.finalScore.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部区域：手牌和操作 */}
        <div className="p-4">
          <div className="flex justify-between items-end">
            {/* 手牌区域 */}
            <div className="flex-1">
              <Hand
                cards={gameState.hand}
                onCardClick={handleCardClick}
                maxSelection={5}
                isPlayable={gameState.handsLeft > 0 || gameState.discardsLeft > 0}
              />
            </div>

            {/* 右下角：牌组 */}
            <div className="w-32 ml-4">
              <h3 className="text-lg font-bold mb-3">牌组</h3>
              <div className="w-24 h-36 bg-gradient-to-br from-blue-800 to-purple-900 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer">
                <div className="text-center">
                  <div className="text-white text-2xl font-bold opacity-30">♠</div>
                  <div className="text-xs text-gray-300 mt-1">27/54</div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮区域 */}
          <div className="flex justify-center space-x-4 mt-4">
            <motion.button
              className={`
                px-6 py-3 rounded-lg font-bold transition-all
                ${canPlayHand 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
              onClick={handlePlayHand}
              disabled={!canPlayHand}
              whileHover={canPlayHand ? { scale: 1.05 } : {}}
              whileTap={canPlayHand ? { scale: 0.95 } : {}}
            >
              出牌 ({gameState.handsLeft})
            </motion.button>
            
            <motion.button
              className={`
                px-6 py-3 rounded-lg font-bold transition-all
                ${canDiscard 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
              onClick={handleDiscardCards}
              disabled={!canDiscard}
              whileHover={canDiscard ? { scale: 1.05 } : {}}
              whileTap={canDiscard ? { scale: 0.95 } : {}}
            >
              弃牌 ({gameState.discardsLeft})
            </motion.button>
            
            <motion.button
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all"
              onClick={handleClearSelection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              清空选择
            </motion.button>
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
                🎉 目标达成！点击进入商店 🎉
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
    </div>
  );
};

export default GamePage;