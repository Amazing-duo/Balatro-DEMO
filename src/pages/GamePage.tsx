import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { Card, Card as CardType, Suit, GamePhase, Joker, ScoreResult } from '../types/game';
import { soundManager, SoundType } from '../utils/soundManager';
import { GameEngine } from '../game-engine/GameEngine';
import { ScoreCalculator } from '../game-engine/ScoreCalculator';
import { AIAdvice, DeepSeekService } from '../utils/deepseekService';
import { sortCardsByRank } from '../utils/cardUtils';
import { HandEvaluator } from '../game-engine/HandEvaluator';
import LeftInfoPanel from '../components/game/LeftInfoPanel';
import GameArea from '../components/game/GameArea';
import GameOverlay from '../components/game/GameOverlay';
import DeckModal from '../components/DeckModal';
import AIAdviceModal from '../components/AIAdviceModal';
import ChaosBackground from '../components/ChaosBackground';

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
    proceedToNextLevel,
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
  
  // AI建议相关状态
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 覆盖层相关状态
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState<'settlement' | 'shop'>('settlement');

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

  // 监听目标达成，播放升级音效并触发覆盖层
  const [prevTargetReached, setPrevTargetReached] = useState(false);
  useEffect(() => {
    const targetReached = gameState.currentScore >= gameState.targetScore;
    if (targetReached && !prevTargetReached) {
      soundManager.play(SoundType.LEVEL_UP);
      // 触发覆盖层显示，开始结算阶段
      setShowOverlay(true);
      setOverlayPhase('settlement');
      
      // 延迟显示商店
      setTimeout(() => {
        setOverlayPhase('shop');
      }, 3000); // 3秒后显示商店
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
    proceedToNextLevel();
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
  
  /**
   * 处理AI按钮点击
   */
  const handleAIButtonClick = async () => {
    if (gameState.hand.length === 0) {
      setAiError('手牌为空，无法获取AI建议');
      setIsAIModalOpen(true);
      return;
    }
    
    setIsAIModalOpen(true);
    setIsAILoading(true);
    setAiError(null);
    setAiAdvice(null);
    
    try {
      // 构建游戏状态数据
      const gameStateData = {
        hand: gameState.hand,
        jokers: gameState.jokers,
        handTypeConfigs: gameState.handTypeConfigs,
        currentScore: gameState.currentScore,
        targetScore: gameState.targetScore,
        handsLeft: gameState.handsLeft,
        discardsLeft: gameState.discardsLeft
      };
      
      // 获取AI建议
      const advice = await DeepSeekService.getPlayAdvice(gameStateData);
      setAiAdvice(advice);
    } catch (error) {
      console.error('获取AI建议失败:', error);
      setAiError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsAILoading(false);
    }
  };
  
  /**
   * 关闭AI建议弹窗
   */
  const handleCloseAIModal = () => {
    setIsAIModalOpen(false);
    setAiAdvice(null);
    setAiError(null);
  };
  
  /**
   * 应用AI建议
   * @param cardIds 推荐的卡牌ID数组
   */
  const handleApplyAIAdvice = (cardIds: string[]) => {
    // 先清空当前选择
    clearSelection();
    
    // 选择AI推荐的卡牌
    cardIds.forEach(cardId => {
      selectCard(cardId);
    });
    
    soundManager.play(SoundType.CARD_SELECT);
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

  // 商店界面渲染
  if (gamePhase === GamePhase.SHOP) {
    return (
      <div className="min-h-screen text-white relative">
        {/* 动态混沌背景 */}
        <ChaosBackground />
        
        {/* 商店界面 */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-black bg-opacity-90 rounded-2xl p-8 border-4 border-purple-400 max-w-6xl w-full"
          >
            {/* 商店标题 */}
            <div className="text-center mb-8">
              <motion.h1
                className="text-5xl font-bold text-purple-400 mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🛒 小丑牌商店
              </motion.h1>
              <div className="flex justify-center items-center gap-8 text-xl">
                <div className="text-green-400 font-bold">
                  💰 金币: ${gameState.money}
                </div>
                <div className="text-blue-400 font-bold">
                  🎯 第 {gameState.currentRound} 关
                </div>
              </div>
            </div>

            {/* 商店物品展示 */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {gameState.shopItems.map((item, index) => {
                const joker = item.item as Joker;
                const canAfford = gameState.money >= item.cost;
                const hasSpace = gameState.jokers.length < gameState.maxJokers;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
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
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">🃏</div>
                      <div className="text-xl font-bold text-yellow-400">{joker.name}</div>
                    </div>
                    
                    {/* 小丑牌描述 */}
                    <div className="text-center mb-4">
                      <div className="text-gray-300 text-sm mb-2">{joker.description}</div>
                      <div className="text-xs text-gray-400">
                        稀有度: <span className={`font-bold ${
                          joker.rarity === 'common' ? 'text-gray-400' :
                          joker.rarity === 'uncommon' ? 'text-green-400' :
                          joker.rarity === 'rare' ? 'text-blue-400' :
                          'text-purple-400'
                        }`}>
                          {joker.rarity === 'common' ? '普通' :
                           joker.rarity === 'uncommon' ? '不常见' :
                           joker.rarity === 'rare' ? '稀有' : '传说'}
                        </span>
                      </div>
                    </div>
                    
                    {/* 价格和购买状态 */}
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-2 ${
                        canAfford ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${item.cost}
                      </div>
                      {!hasSpace && (
                        <div className="text-red-400 text-xs">小丑牌位置已满</div>
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

            {/* 商店操作按钮 */}
            <div className="flex justify-center gap-6">
              {/* 刷新商店按钮 */}
              <motion.button
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
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
                🔄 刷新商店 (${gameState.shopRefreshCost})
              </motion.button>
              
              {/* 进入下一关按钮 */}
              <motion.button
                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-bold text-white transition-all"
                onClick={() => {
                  soundManager.play(SoundType.LEVEL_UP);
                  useGameStore.getState().proceedToNextLevel();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ➡️ 进入下一关
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white relative overflow-hidden">
      <div className="relative z-10 flex h-screen">
        {/* 左侧信息面板 */}
        <LeftInfoPanel
          currentScore={gameState.currentScore}
          targetScore={gameState.targetScore}
          money={gameState.money}
          handsLeft={gameState.handsLeft}
          discardsLeft={gameState.discardsLeft}
          currentRound={gameState.currentRound}
          scorePreview={scorePreview}
          handTypeDisplay={getHandTypeDisplay()}
          onBackToMenu={handleBackToMenu}
        />

        {/* 右侧游戏区域 */}
        <GameArea
          gameState={gameState}
          showJokerDetails={showJokerDetails}
          canPlayHand={canPlayHand}
          canDiscard={canDiscard}
          targetReached={targetReached}
          showOverlay={showOverlay}
          overlayPhase={overlayPhase}
          onSellJoker={handleSellJoker}
          onCardClick={handleCardClick}
          onHandReorder={handleHandReorder}
          onPlayHand={handlePlayHand}
          onDiscardCards={handleDiscardCards}
          onSortByRank={handleSortByRank}
          onSortBySuit={handleSortBySuit}
          onAIButtonClick={handleAIButtonClick}
          onDeckClick={handleDeckClick}
          onPlaySelectedCards={playSelectedCards}
          setOverlayPhase={setOverlayPhase}
          setShowOverlay={setShowOverlay}
        />

        {/* 覆盖层 */}
        <GameOverlay
          showOverlay={showOverlay}
          overlayPhase={overlayPhase}
          gameState={gameState}
          setOverlayPhase={setOverlayPhase}
          setShowOverlay={setShowOverlay}
        />
      </div>
      
      {/* 牌组弹窗 */}
      <DeckModal
        isOpen={isDeckModalOpen}
        onClose={handleCloseDeckModal}
        deckCards={gameState.deck}
      />
      
      {/* AI建议弹窗 */}
      <AIAdviceModal
        isOpen={isAIModalOpen}
        onClose={handleCloseAIModal}
        advice={aiAdvice}
        isLoading={isAILoading}
        error={aiError}
        hand={gameState.hand}
        onApplyAdvice={handleApplyAIAdvice}
      />
      

    </div>
  );
};

export default GamePage;