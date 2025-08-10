import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { soundManager, SoundType } from '../utils/soundManager';
import Card from '../components/Card';
import DeepseekCardDemo from '../components/DeepseekCardDemo';
import GeminiCardDemo from '../components/GeminiCardDemo';
import { createStandardDeck, shuffleDeck } from '../utils/cardUtils';
import { Card as CardType } from '../types/game';

interface AnimationTestPageProps {
  onBack?: () => void;
}

export default function AnimationTestPage({ onBack }: AnimationTestPageProps = {}) {
  const [currentAnimation, setCurrentAnimation] = useState<'original' | 'deepseek' | 'gemini'>('original');
  const [key, setKey] = useState(0); // 用于强制重新渲染组件

  // 原版动画演示卡牌
  const [originalCards] = useState(() => {
    const deck = shuffleDeck(createStandardDeck());
    return deck.slice(0, 7);
  });

  // Deepseek动画演示卡牌
  const [deepseekCards] = useState(() => {
    const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
    return [
      { id: '1', rank: 'A', suit: '♠', color: colors[0] },
      { id: '2', rank: 'K', suit: '♥', color: colors[1] },
      { id: '3', rank: 'Q', suit: '♦', color: colors[2] },
      { id: '4', rank: 'J', suit: '♣', color: colors[3] },
      { id: '5', rank: '10', suit: '♠', color: colors[4] }
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

  const handleAnimationChange = (type: 'original' | 'deepseek' | 'gemini') => {
    setCurrentAnimation(type);
    soundManager.play(SoundType.CARD_SELECT);
  };

  const handleReset = () => {
    setKey(prev => prev + 1);
    soundManager.play(SoundType.CARD_DESELECT);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      console.log('返回首页');
    }
  };

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

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 600px 800px at 80% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)
            `
          }}
          animate={{
            background: [
              `radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
               radial-gradient(ellipse 600px 800px at 80% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`,
              `radial-gradient(ellipse 700px 700px at 30% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
               radial-gradient(ellipse 500px 900px at 70% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)`,
              `radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
               radial-gradient(ellipse 600px 800px at 80% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 h-full w-full flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 顶部导航 */}
        <motion.div
          className="flex items-center justify-between p-4 sm:p-6"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg font-bold shadow-lg transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回首页</span>
            <span className="sm:hidden">返回</span>
          </motion.button>

          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center"
            style={{
              background: 'linear-gradient(45deg, #e5e7eb 0%, #f9fafb 25%, #d1d5db 50%, #f3f4f6 75%, #e5e7eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 20px rgba(255,255,255,0.3)'
            }}
          >
            卡牌动画测试
          </motion.h1>

          <motion.button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-500/80 rounded-lg font-bold shadow-lg transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">重置</span>
          </motion.button>
        </motion.div>

        {/* 动画模式选择 */}
        <motion.div
          className="flex justify-center mb-6 px-4"
          variants={itemVariants}
        >
          <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
            {[
              { key: 'original', label: '原版动画', desc: 'Balatro风格' },
              { key: 'deepseek', label: 'Deepseek动画', desc: '彩色卡牌' },
              { key: 'gemini', label: 'Gemini动画', desc: '拖拽交互' }
            ].map(({ key, label, desc }) => (
              <motion.button
                key={key}
                onClick={() => handleAnimationChange(key as any)}
                className={`px-4 sm:px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                  currentAnimation === key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-sm sm:text-base">{label}</div>
                  <div className="text-xs opacity-70 hidden sm:block">{desc}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 动画演示区域 */}
        <motion.div
          className="flex-1 px-4 pb-8"
          variants={itemVariants}
        >
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentAnimation}-${key}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 h-full flex flex-col overflow-hidden"
              >
                {/* 动画说明 */}
                <div className="mb-6 text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    {currentAnimation === 'original' && '原版 Balatro 风格动画'}
                    {currentAnimation === 'deepseek' && 'Deepseek 彩色卡牌动画'}
                    {currentAnimation === 'gemini' && 'Gemini 拖拽交互动画'}
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base">
                    {currentAnimation === 'original' && '经典的扑克牌选择和出牌动画，支持多选和组合出牌'}
                    {currentAnimation === 'deepseek' && '彩色卡牌设计，带有积分显示和流畅的出牌动画'}
                    {currentAnimation === 'gemini' && '支持拖拽交互的卡牌系统，可以拖动重新排列'}
                  </p>
                </div>

                {/* 动画组件 */}
                <div className="flex-1 flex items-center justify-center">
                  {currentAnimation === 'original' && (
                    <div className="w-full max-w-4xl">
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        {originalCards.map((card, index) => (
                          <motion.div
                            key={`${card.id}-${key}`}
                            initial={{ opacity: 0, y: 50, rotate: -10 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0, 
                              rotate: (index - 3) * 2,
                              transition: { delay: index * 0.1 }
                            }}
                          >
                            <Card
                              card={card}
                              size="large"
                              onClick={(clickedCard) => {
                                // 切换选中状态
                                clickedCard.isSelected = !clickedCard.isSelected;
                                soundManager.play(SoundType.CARD_SELECT);
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-center mt-6 text-gray-300">
                        <p className="text-sm sm:text-base">点击卡牌选择，再次点击取消选择</p>
                      </div>
                    </div>
                  )}

                  {currentAnimation === 'deepseek' && (
                    <div className="w-full">
                      <DeepseekCardDemo cards={deepseekCards} />
                      <div className="text-center mt-4 text-gray-300">
                        <p className="text-sm sm:text-base">选择卡牌后点击出牌按钮，观看积分动画效果</p>
                      </div>
                    </div>
                  )}

                  {currentAnimation === 'gemini' && (
                    <div className="w-full">
                      <GeminiCardDemo cards={geminiCards} />
                      <div className="text-center mt-4 text-gray-300">
                        <p className="text-sm sm:text-base">点击选择卡牌，拖拽重新排列，然后出牌</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}