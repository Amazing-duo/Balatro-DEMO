import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { GameEngine } from '../game-engine/GameEngine';
import DeepSeekHand from '../components/DeepSeekHand';
import JokerCard from '../components/JokerCard';
import ChaosBackground from '../components/ChaosBackground';
import DeckModal from '../components/DeckModal';
import { Card, Card as CardType, Joker, ScoreResult, Suit, GamePhase } from '../types/game';
import { HandEvaluator } from '../game-engine/HandEvaluator';
import { ScoreCalculator } from '../game-engine/ScoreCalculator';
import { sortCardsByRank } from '../utils/cardUtils';
import { soundManager, SoundType } from '../utils/soundManager';

interface GamePageProps {
  onBackToMenu?: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ onBackToMenu }) => {
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
    isGameCompleted,
    selectCard,
    deselectCard,
    playSelectedCards,
    discardSelectedCards,
    clearSelection,
    enterShop,
    nextRound,
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
    settings,
    isGameCompleted
  };

  const [gameEngine] = useState(() => new GameEngine(gameState));
  const [scorePreview, setScorePreview] = useState<ScoreResult | null>(null);
  const [showJokerDetails, setShowJokerDetails] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

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

  // 监听分数变化，播放计分音效
  const [prevScore, setPrevScore] = useState(gameState.currentScore);
  useEffect(() => {
    if (gameState.currentScore > prevScore) {
      soundManager.play(SoundType.SCORE_COUNT);
    }
    setPrevScore(gameState.currentScore);
  }, [gameState.currentScore, prevScore]);

  // 监听目标达成，播放升级音效
  const [prevTargetReached, setPrevTargetReached] = useState(false);
  useEffect(() => {
    const targetReached = gameState.currentScore >= gameState.targetScore;
    if (targetReached && !prevTargetReached) {
      soundManager.play(SoundType.LEVEL_UP);
    }
    setPrevTargetReached(targetReached);
  }, [gameState.currentScore, gameState.targetScore, prevTargetReached]);

  const handleCardClick = (card: CardType) => {
    if (card.isSelected) {
      deselectCard(card.id);
    } else {
      selectCard(card.id);
    }
  };

  const handlePlayHand = () => {
    if (gameState.selectedCards.length > 0 && gameState.handsLeft > 0) {
      soundManager.play(SoundType.CARD_PLAY);
      // 触发DeepSeek动画，动画完成后会自动调用原有逻辑
      if ((window as any).triggerDeepSeekPlayAnimation) {
        (window as any).triggerDeepSeekPlayAnimation();
      } else {
        // 如果动画方法不可用，直接执行原有逻辑
        playSelectedCards();
      }
    }
  };

  const handleDiscardCards = () => {
    if (gameState.selectedCards.length > 0 && gameState.discardsLeft > 0) {
      soundManager.play(SoundType.SHUFFLE);
      discardSelectedCards();
    }
  };

  const handleBackToMenu = () => {
    soundManager.play(SoundType.BUTTON_CLICK);
    if (onBackToMenu) {
      onBackToMenu();
    }
  };

  const handleEnterShop = () => {
    soundManager.play(SoundType.LEVEL_UP);
    enterShop();
  };

  const handleNextRound = () => {
    soundManager.play(SoundType.LEVEL_UP);
    nextRound();
  };

  const handleSellJoker = (joker: Joker) => {
    sellJoker(joker.id);
  };

  const handleDeckClick = () => {
    soundManager.play(SoundType.BUTTON_CLICK);
    setIsDeckModalOpen(true);
  };

  const handleCloseDeckModal = () => {
    setIsDeckModalOpen(false);
  };

  // 排序状态跟踪
  const [sortState, setSortState] = useState<'rank' | 'suit' | 'custom'>('rank'); // 默认按点数排序

  // 检查当前手牌是否已经按点数排序
  const isHandSortedByRank = () => {
    const sorted = sortCardsByRank(gameState.hand, true).reverse();
    return JSON.stringify(gameState.hand.map(c => c.id)) === JSON.stringify(sorted.map(c => c.id));
  };

  // 检查当前手牌是否已经按花色排序
  const isHandSortedBySuit = () => {
    const suitOrder = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
    const sorted = [...gameState.hand].sort((a, b) => {
      const suitIndexA = suitOrder.indexOf(a.suit);
      const suitIndexB = suitOrder.indexOf(b.suit);
      if (suitIndexA !== suitIndexB) {
        return suitIndexA - suitIndexB;
      }
      return b.rank - a.rank;
    });
    return JSON.stringify(gameState.hand.map(c => c.id)) === JSON.stringify(sorted.map(c => c.id));
  };

  // 理牌功能：按点数排序（从大到小）
  const handleSortByRank = () => {
    // 如果已经是点数排序状态，则不重复排序
    if (sortState === 'rank' && isHandSortedByRank()) {
      return;
    }
    
    soundManager.play(SoundType.SHUFFLE);
    const sortedHand = sortCardsByRank(gameState.hand, true).reverse(); // 从大到小
    // 更新手牌顺序
    useGameStore.setState((state) => {
      state.hand = sortedHand;
    });
    setSortState('rank');
  };

  // 理牌功能：按花色排序（黑红梅方）
  const handleSortBySuit = () => {
    // 如果已经是花色排序状态，则不重复排序
    if (sortState === 'suit' && isHandSortedBySuit()) {
      return;
    }
    
    soundManager.play(SoundType.SHUFFLE);
    const suitOrder = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS]; // 黑红梅方
    const sortedHand = [...gameState.hand].sort((a, b) => {
      const suitIndexA = suitOrder.indexOf(a.suit);
      const suitIndexB = suitOrder.indexOf(b.suit);
      if (suitIndexA !== suitIndexB) {
        return suitIndexA - suitIndexB;
      }
      // 同花色内按点数排序
      return b.rank - a.rank;
    });
    // 更新手牌顺序
    useGameStore.setState((state) => {
      state.hand = sortedHand;
    });
    setSortState('suit');
  };

  // 处理手牌拖拽重新排序
  const handleHandReorder = (newOrder: CardType[]) => {
    useGameStore.setState((state) => {
      state.hand = newOrder;
    });
    setSortState('custom'); // 标记为自定义排序
  };

  const getHandTypeDisplay = () => {
    if (gameState.selectedCards.length === 0) return null;
    
    const evaluation = HandEvaluator.evaluateHand(gameState.selectedCards);
    return evaluation.handType;
  };

  const canPlayHand = gameState.selectedCards.length > 0 && gameState.handsLeft > 0;
  const canDiscard = gameState.selectedCards.length > 0 && gameState.discardsLeft > 0;
  const targetReached = gameState.currentScore >= gameState.targetScore;

  // 通关界面渲染
  if (gamePhase === GamePhase.GAME_COMPLETED) {
    return (
      <div className="min-h-screen text-white relative flex items-center justify-center">
        {/* 动态混沌背景 */}
        <ChaosBackground />
        
        {/* 通关界面 */}
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-black bg-opacity-80 rounded-2xl p-12 border-4 border-yellow-400"
          >
            {/* 小丑图标 */}
            <motion.div
              className="text-8xl mb-6"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              🃏
            </motion.div>
            
            {/* 通关文字 */}
            <motion.h1
              className="text-6xl font-bold text-yellow-400 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              🎉 恭喜您已通关！🎉
            </motion.h1>
            
            <motion.p
              className="text-2xl text-gray-300 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              您已成功完成所有 8 关挑战！
            </motion.p>
            
            {/* 返回主菜单按钮 */}
            <motion.button
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105"
              onClick={handleBackToMenu}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              返回主菜单
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* 动态混沌背景 */}
      <ChaosBackground />
      
      {/* 主容器：响应式布局 - 主要内容区域最小宽度1280px，在1440px屏幕上左右各留80px */}
      <div className="relative z-10 min-h-screen flex justify-center px-0 xl:px-20">
        {/* 中间内容区域：最小宽度1280px，在小屏幕上左右边距压缩到0 */}
        <div className="flex w-full max-w-none" style={{
          minWidth: '1280px'
        }}>
          {/* 左侧信息面板：1/4宽度，最小宽度300px */}
          <div className="w-1/4 min-w-[300px] max-w-[350px] bg-black bg-opacity-40 p-4 flex flex-col space-y-4 flex-shrink-0">
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
                  <div className="text-xl font-bold text-yellow-300 mb-3">
                    {getHandTypeDisplay()}
                  </div>
                ) : (
                  <div className="text-gray-400 mb-3">请选择卡牌</div>
                )}
                
                {/* 基础分和倍数显示 */}
                <div className="flex gap-2 mt-3">
                  {/* 基础分 - 蓝色 */}
                  <div className="flex-1 bg-blue-600 bg-opacity-80 rounded-lg p-3 text-center">
                    <div className="text-white text-lg font-bold">
                      {scorePreview ? scorePreview.baseScore : 0}
                    </div>
                    <div className="text-blue-200 text-xs">基础分</div>
                  </div>
                  
                  {/* 倍数 - 红色 */}
                  <div className="flex-1 bg-red-600 bg-opacity-80 rounded-lg p-3 text-center">
                    <div className="text-white text-lg font-bold">
                      {scorePreview ? scorePreview.multiplier : 0}
                    </div>
                    <div className="text-red-200 text-xs">倍数</div>
                  </div>
                </div>
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
                    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold transition-colors"
                    onClick={handleNextRound}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    进入下一关
                  </motion.button>
                )}
                <button
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition-colors"
                  onClick={handleBackToMenu}
                >
                  返回主菜单
                </button>
              </div>
            </div>
          </div>

          {/* 右侧游戏区域：3/4宽度 */}
          <div className="w-3/4 flex flex-col relative">
            {/* 顶部区域：小丑牌和消耗品 */}
            <div className="flex justify-between p-4">
              {/* 小丑牌区域 - 5张牌宽度，1张牌高度 */}
              <div className="relative">
                <div className="bg-gray-500/20 rounded-lg p-4" style={{width: 'calc(5 * 6rem + 4 * 0.5rem + 2rem)', height: 'calc(9rem + 2rem)'}}>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
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

            {/* 中间区域：游戏信息显示区 */}
            <div className="flex-1 flex items-center justify-center px-4">
              {/* 这里可以显示其他游戏信息，如特殊效果、提示等 */}
              <div className="text-center text-gray-400">
                {/* 预留空间用于显示游戏状态信息 */}
              </div>
            </div>

            {/* 底部区域：手牌和操作 */}
            <div className="p-4">
              {/* 手牌区域 - 80%宽度，靠左对齐 */}
              <div className="bg-gray-500/20 rounded-lg p-4 w-4/5">
                <DeepSeekHand
                  cards={gameState.hand}
                  onCardClick={handleCardClick}
                  onReorder={handleHandReorder}
                  maxSelection={5}
                  isPlayable={gameState.handsLeft > 0 || gameState.discardsLeft > 0}
                  onPlayCards={(cards) => {
                    // DeepSeek动画完成后触发原有的出牌逻辑
                    setTimeout(() => {
                      playSelectedCards();
                    }, 100);
                  }}
                />
              </div>

              {/* 右下角：牌组 - 绝对定位 */}
              <div className="absolute bottom-4 right-4 w-32">
                <h3 className="text-lg font-bold mb-3">牌组</h3>
                <div 
                  className="w-24 h-36 bg-gradient-to-br from-blue-800 to-purple-900 rounded-lg border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-200 transition-colors"
                  onClick={handleDeckClick}
                >
                  <div className="text-center">
                    <div className="text-white text-2xl font-bold opacity-30">♠</div>
                    <div className="text-xs text-gray-300 mt-1">{gameState.deck.length + gameState.discardPile.length}/52</div>
                  </div>
                </div>
              </div>

              {/* 操作按钮区域 - 与手牌中轴对齐 */}
              <div className="flex mt-4 gap-2 max-w-md w-4/5" style={{marginLeft: 'calc(40% - 12rem)'}}>
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
                    onClick={handlePlayHand}
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
                         onClick={handleSortByRank}
                       >
                         点数
                       </button>
                       <button 
                         className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded transition-colors flex-1 aspect-[4/3] flex items-center justify-center"
                         onClick={handleSortBySuit}
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
                    onClick={handleDiscardCards}
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
        </div>
      </div>
      
      {/* 牌组弹窗 */}
      <DeckModal
        isOpen={isDeckModalOpen}
        onClose={handleCloseDeckModal}
        usedCards={[...gameState.hand, ...gameState.discardPile]}
      />
    </div>
  );
};

export default GamePage;