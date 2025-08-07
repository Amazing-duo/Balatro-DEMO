import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, Settings, Info, Music } from 'lucide-react';
import { soundManager, SoundType } from '../utils/soundManager';
import { getAllModernSoundPresets, ModernSoundConfig } from '../utils/modernSoundEffects';
import { useGameStore } from '../stores/gameStore';
import Card from '../components/Card';
import DeepseekCardDemo from '../components/DeepseekCardDemo';
import GeminiCardDemo from '../components/GeminiCardDemo';
import { createStandardDeck, shuffleDeck } from '../utils/cardUtils';
import { Card as CardType } from '../types/game';

interface HomeProps {
  onStartGame?: () => void;
}

export default function Home({ onStartGame }: HomeProps = {}) {
  const { initializeGame } = useGameStore();
  const [currentPreset, setCurrentPreset] = useState<string>('elegant');
  const [isMuted, setIsMuted] = useState(soundManager.isSoundMuted());
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [modernPresets, setModernPresets] = useState<{ preset: string; config: ModernSoundConfig }[]>([]);
  const [previewingSound, setPreviewingSound] = useState<string | null>(null);
  
  // 卡牌动画演示相关状态
  const [demoCards] = useState(() => {
    const deck = shuffleDeck(createStandardDeck());
    return deck.slice(0, 7); // 显示7张卡牌做动画演示
  });
  const [selectedDemoCards, setSelectedDemoCards] = useState<Set<string>>(new Set());
  const [animationType, setAnimationType] = useState<'idle' | 'drag' | 'click' | 'play' | 'discard'>('idle');
  const [draggedDemoCard, setDraggedDemoCard] = useState<string | null>(null);
  
  // 动画模式切换
  const [animationMode, setAnimationMode] = useState<'original' | 'deepseek' | 'gemini'>('original');
  
  // Deepseek动画演示卡牌
  const [deepseekCards] = useState(() => {
    const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
    return [
      { id: '1', rank: 'A', suit: '♠', color: colors[0] },
      { id: '2', rank: 'K', suit: '♥', color: colors[1] },
      { id: '3', rank: 'Q', suit: '♦', color: colors[2] },
      { id: '4', rank: 'J', suit: '♣', color: colors[3] },
      { id: '5', rank: 'JOKER', suit: '🃏', color: colors[4] }
    ];
  });
  
  // Gemini动画演示卡牌
  const [geminiCards] = useState(() => {
    return [
      { id: 1, isSelected: false },
      { id: 2, isSelected: false },
      { id: 3, isSelected: false },
      { id: 4, isSelected: false },
      { id: 5, isSelected: false },
      { id: 6, isSelected: false },
      { id: 7, isSelected: false }
    ];
  });

  useEffect(() => {
    // 初始化现代化音效预设
    const presets = getAllModernSoundPresets();
    setModernPresets(presets);
    
    // 设置默认预设
    if (presets.length > 0) {
      soundManager.setCurrentPreset(presets[0].preset);
    }
  }, []);

  const handlePresetChange = (presetName: string) => {
    setCurrentPreset(presetName);
    soundManager.setCurrentPreset(presetName);
    soundManager.play(SoundType.CARD_SELECT);
  };

  const playPreviewSound = (type: SoundType, presetName?: string) => {
    if (presetName) {
      setPreviewingSound(presetName);
      const originalPreset = soundManager.getCurrentPreset();
      soundManager.setCurrentPreset(presetName);
      soundManager.play(type);
      
      setTimeout(() => {
        soundManager.setCurrentPreset(originalPreset);
        setPreviewingSound(null);
      }, 500);
    } else {
      soundManager.play(type);
    }
  };

  const toggleMute = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.isSoundMuted());
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const handleStartGame = () => {
    initializeGame();
    if (onStartGame) {
      onStartGame();
    } else {
      console.log('开始游戏');
    }
  };

  // 卡牌动画演示函数
  const handleDemoCardClick = (cardId: string) => {
    setAnimationType('click');
    const newSelected = new Set(selectedDemoCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
      soundManager.play(SoundType.CARD_DESELECT);
    } else {
      newSelected.add(cardId);
      soundManager.play(SoundType.CARD_SELECT);
    }
    setSelectedDemoCards(newSelected);
    
    setTimeout(() => setAnimationType('idle'), 300);
  };

  const handleDemoPlay = () => {
    setAnimationType('play');
    soundManager.play(SoundType.CARD_SELECT);
    setTimeout(() => {
      setSelectedDemoCards(new Set());
      setAnimationType('idle');
    }, 1000);
  };

  const handleDemoDiscard = () => {
    setAnimationType('discard');
    soundManager.play(SoundType.CARD_DESELECT);
    setTimeout(() => {
      setSelectedDemoCards(new Set());
      setAnimationType('idle');
    }, 800);
  };

  const handleDemoDrag = (cardId: string) => {
    setAnimationType('drag');
    setDraggedDemoCard(cardId);
    setTimeout(() => {
      setAnimationType('idle');
      setDraggedDemoCard(null);
    }, 1500);
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    }
  };

  // 专业卡牌动画变体（移除hover动画）
  const getCardDemoVariants = (index: number) => ({
    idle: {
      scale: 1,
      y: 0,
      rotate: 0,
      boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
      filter: "brightness(1) saturate(1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    selected: {
      scale: 1.12,
      y: -25,
      rotate: (index - 3) * 3,
      boxShadow: "0 16px 32px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.6)",
      filter: "brightness(1.2) saturate(1.3) drop-shadow(0 0 10px rgba(255,215,0,0.8))",
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 20,
        duration: 0.4
      }
    },
    drag: {
      scale: 1.2,
      y: -35,
      rotate: 8,
      zIndex: 100,
      boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(255,255,255,0.4)",
      filter: "brightness(1.3) saturate(1.4) drop-shadow(0 0 15px rgba(255,255,255,0.9))",
      transition: {
        type: "spring",
        stiffness: 450,
        damping: 18,
        duration: 0.2
      }
    },
    play: {
      scale: 0.7,
      y: -120,
      rotate: (index - 3) * 15,
      opacity: 0.2,
      boxShadow: "0 8px 16px rgba(0,255,0,0.4)",
      filter: "brightness(0.8) saturate(0.6) hue-rotate(120deg)",
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: index * 0.1
      }
    },
    discard: {
      scale: 0.5,
      y: 150,
      rotate: 180 + (index - 3) * 30,
      opacity: 0,
      boxShadow: "0 8px 16px rgba(255,0,0,0.4)",
      filter: "brightness(0.5) saturate(0.3) hue-rotate(-60deg)",
      transition: {
        duration: 0.8,
        ease: [0.55, 0.085, 0.68, 0.53],
        delay: index * 0.08
      }
    }
  });

  const titleVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white overflow-hidden relative flex flex-col">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {['♠', '♥', '♦', '♣'].map((suit, index) => (
          <motion.div
            key={suit}
            className="absolute text-6xl opacity-10"
            style={{
              left: `${20 + index * 20}%`,
              top: `${10 + index * 15}%`
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-5, 5, -5],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{
              duration: 6 + index,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {suit}
          </motion.div>
        ))}
        
        {/* 光效 */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 顶部标题区域 */}
        <motion.div
          className="text-center pt-8 pb-4"
          variants={titleVariants}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent"
            animate={{
              y: [-5, 5, -5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            BALATRO
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 font-light"
            variants={itemVariants}
          >
            扑克牌 Roguelike 游戏
          </motion.p>
        </motion.div>

        {/* 中间卡牌动画演示区域 */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center px-8"
          variants={itemVariants}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-4 text-yellow-300">🎴 卡牌动画演示</h2>
            <p className="text-center text-gray-400 mb-4">体验专业级卡牌动画效果</p>
            
            {/* 动画模式切换按钮 */}
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              <motion.button
                className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                  animationMode === 'original'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                onClick={() => setAnimationMode('original')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎨 原版动画
              </motion.button>
              
              <motion.button
                className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                  animationMode === 'deepseek'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                onClick={() => setAnimationMode('deepseek')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Deepseek动画
              </motion.button>
              
              <motion.button
                className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                  animationMode === 'gemini'
                    ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                onClick={() => setAnimationMode('gemini')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✨ Gemini动画
              </motion.button>
            </div>
          </div>

          {/* 卡牌展示区域 */}
          <div className="relative mb-8">
            {/* 背景光效 */}
            <motion.div
              className="absolute inset-0 -m-8 bg-gradient-radial from-purple-500/20 via-transparent to-transparent rounded-full blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* 根据动画模式显示不同的动画组件 */}
            {animationMode === 'original' ? (
              <div className="relative flex items-center justify-center" style={{ gap: '-1.5rem' }}>
                {demoCards.map((card, index) => {
                  const isSelected = selectedDemoCards.has(card.id);
                  const isDragged = draggedDemoCard === card.id;
                  
                  let animationState = 'idle';
                  if (isDragged) animationState = 'drag';
                  else if (isSelected && animationType === 'play') animationState = 'play';
                  else if (isSelected && animationType === 'discard') animationState = 'discard';
                  else if (isSelected) animationState = 'selected';

                  return (
                    <motion.div
                      key={card.id}
                      className="relative cursor-pointer"
                      style={{ 
                        zIndex: isDragged ? 100 : isSelected ? 50 : 20 - Math.abs(index - 3)
                      }}
                      variants={getCardDemoVariants(index)}
                      initial="idle"
                      animate={animationState}
                      onClick={() => handleDemoCardClick(card.id)}
                      onMouseDown={() => handleDemoDrag(card.id)}
                    >
                      {/* 选中状态的光环效果 */}
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 -m-2 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-yellow-400/30 rounded-xl blur-sm"
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.6, 0.8, 0.6]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                    )}
                    
                    {/* 拖拽状态的粒子效果 */}
                    {isDragged && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                              left: `${20 + i * 10}%`,
                              top: `${20 + (i % 3) * 20}%`
                            }}
                            animate={{
                              y: [-5, -15, -5],
                              opacity: [0.8, 0.3, 0.8],
                              scale: [1, 0.5, 1]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                    
                    {/* 拖拽状态的粒子效果 */}
                    {isDragged && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                              left: `${20 + i * 10}%`,
                              top: `${20 + (i % 3) * 20}%`
                            }}
                            animate={{
                              y: [-5, -15, -5],
                              opacity: [0.8, 0.3, 0.8],
                              scale: [1, 0.5, 1]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                    
                    <Card
                      card={card}
                      size="large"
                      isPlayable={true}
                      className={`transition-all duration-300 ${
                        isSelected ? 'ring-2 ring-yellow-400 ring-opacity-80' : ''
                      } ${
                        isDragged ? 'ring-4 ring-white ring-opacity-60' : ''
                      }`}
                    />
                  </motion.div>
                );
              })}
            </div>
            ) : animationMode === 'deepseek' ? (
              <DeepseekCardDemo cards={deepseekCards} />
            ) : (
              <GeminiCardDemo cards={geminiCards} />
            )}
          </div>

          {/* 动画控制按钮 - 只在原版动画模式下显示 */}
          {animationMode === 'original' && (
            <div className="flex gap-6 mb-8">
              <motion.button
                className={`px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                  selectedDemoCards.size === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
                onClick={handleDemoPlay}
                disabled={selectedDemoCards.size === 0}
                whileHover={selectedDemoCards.size > 0 ? { 
                  scale: 1.08,
                  boxShadow: "0 12px 24px rgba(34, 197, 94, 0.4)"
                } : {}}
                whileTap={selectedDemoCards.size > 0 ? { scale: 0.95 } : {}}
              >
                <motion.span
                  className="flex items-center gap-2"
                  animate={selectedDemoCards.size > 0 ? {
                    y: [0, -2, 0]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🎯 出牌动画
                </motion.span>
              </motion.button>
              
              <motion.button
                className={`px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                  selectedDemoCards.size === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
                }`}
                onClick={handleDemoDiscard}
                disabled={selectedDemoCards.size === 0}
                whileHover={selectedDemoCards.size > 0 ? { 
                  scale: 1.08,
                  boxShadow: "0 12px 24px rgba(239, 68, 68, 0.4)"
                } : {}}
                whileTap={selectedDemoCards.size > 0 ? { scale: 0.95 } : {}}
              >
                <motion.span
                  className="flex items-center gap-2"
                  animate={selectedDemoCards.size > 0 ? {
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🗑️ 弃牌动画
                </motion.span>
              </motion.button>
            </div>
          )}

          {/* 动画说明和状态显示 */}
          <div className="text-center max-w-lg">
            <motion.div
              className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* 操作指南 - 只在原版动画模式下显示 */}
              {animationMode === 'original' && (
                <div className="text-sm text-gray-300 mb-4">
                  <p className="mb-2">🎮 <strong>操作指南:</strong></p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span>点击选择卡牌</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>按住拖拽卡牌</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>按钮测试动画</span>
                    </div>
                  </div>
                </div>
              )}
              
              {animationMode === 'original' && (
                <motion.div
                  className="text-lg font-bold"
                  animate={{
                    color: selectedDemoCards.size > 0 ? '#fbbf24' : '#9ca3af'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  已选择: 
                  <motion.span
                    key={selectedDemoCards.size}
                    initial={{ scale: 1.5, color: '#fbbf24' }}
                    animate={{ scale: 1, color: selectedDemoCards.size > 0 ? '#fbbf24' : '#9ca3af' }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedDemoCards.size}
                  </motion.span>
                  {' '}张卡牌
                </motion.div>
              )}
              
              {selectedDemoCards.size > 0 && (
                <motion.div
                  className="mt-3 text-xs text-yellow-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  ✨ 现在可以测试出牌和弃牌动画了！
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* 底部菜单区域 */}
        <motion.div
          className="pb-8 px-8"
          variants={itemVariants}
        >
          <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
            <motion.button
              className="w-full py-4 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl text-xl font-bold shadow-2xl transition-all duration-300"
              onClick={handleStartGame}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,255,0,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              🎮 开始游戏
            </motion.button>
            
            <div className="flex gap-4 w-full">
              <motion.button
                className="flex-1 py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl font-bold shadow-xl transition-all duration-300"
                onClick={() => setShowSoundSettings(!showSoundSettings)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ⚙️ 声音设置
              </motion.button>
              
              <motion.button
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                📖 规则
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 声音设置面板 */}
        <AnimatePresence>
          {showSoundSettings && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSoundSettings(false)}
            >
              <motion.div
                className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">声音设置</h2>
                  <button
                    onClick={() => setShowSoundSettings(false)}
                    className="text-white/70 hover:text-white transition-colors text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* 音量控制 */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={toggleMute}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        disabled={isMuted}
                      />
                    </div>
                    <span className="text-white/70 text-sm w-12">{Math.round(volume * 100)}%</span>
                  </div>
                </div>

                {/* 声音预设选择 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">音效预设 ({modernPresets.length}种)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {modernPresets.slice(0, 12).map(({ preset, config }) => (
                      <motion.div
                        key={preset}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                          currentPreset === preset
                            ? 'bg-blue-500/20 border-blue-400 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                        onClick={() => handlePresetChange(preset)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white font-medium text-sm truncate">{config.displayName}</h5>
                            <p className="text-gray-400 text-xs truncate">{config.description}</p>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              playPreviewSound(SoundType.CARD_SELECT, preset);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-green-500/20 text-green-400 p-2 rounded hover:bg-green-500/30 transition-colors ml-2"
                            disabled={isMuted}
                          >
                            <Play className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}