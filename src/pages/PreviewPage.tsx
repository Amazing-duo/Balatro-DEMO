import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import Card from '../components/Card';
import { createStandardDeck, shuffleDeck } from '../utils/cardUtils';
import { Card as CardType } from '../types/game';

interface PreviewPageProps {
  onStartGame: () => void;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ onStartGame }) => {
  const { initializeGame } = useGameStore();
  const [showCards, setShowCards] = useState(false);
  const [animationCards] = useState(() => {
    const deck = shuffleDeck(createStandardDeck());
    return deck.slice(0, 13); // 显示13张卡牌做动画
  });

  const handleStartGame = () => {
    initializeGame();
    onStartGame();
  };

  const handleShowCards = () => {
    setShowCards(!showCards);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const cardVariants = {
    hidden: { 
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    visible: (i: number) => ({
      scale: 1,
      rotate: (i - 6) * 5, // 扇形排列
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }),
    exit: {
      scale: 0,
      rotate: 180,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

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

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 浮动的扑克牌符号 */}
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
        className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 游戏标题 */}
        <motion.div
          className="text-center mb-12"
          variants={titleVariants}
        >
          <motion.h1 
            className="text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent"
            animate={floatingAnimation}
          >
            BALATRO
          </motion.h1>
          <motion.p 
            className="text-2xl text-gray-300 font-light"
            variants={itemVariants}
          >
            扑克牌 Roguelike 游戏
          </motion.p>
        </motion.div>

        {/* 卡牌展示区域 */}
        <motion.div
          className="mb-12 h-40 flex items-center justify-center"
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            {showCards && (
              <div className="relative">
                {animationCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    className="absolute"
                    style={{
                      left: `${(index - 6) * 15}px`,
                      zIndex: index
                    }}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={index}
                  >
                    <Card
                      card={card}
                      size="small"
                      isPlayable={false}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
          
          {!showCards && (
            <motion.div
              className="text-6xl opacity-30"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              🃏
            </motion.div>
          )}
        </motion.div>

        {/* 主菜单按钮 */}
        <motion.div
          className="space-y-4 w-80"
          variants={itemVariants}
        >
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
          
          <motion.button
            className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-xl font-bold shadow-2xl transition-all duration-300"
            onClick={handleShowCards}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(255,0,255,0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {showCards ? '🎴 隐藏卡牌' : '🎴 预览卡牌'}
          </motion.button>
          
          <motion.button
            className="w-full py-4 px-8 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl text-xl font-bold shadow-2xl transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(128,128,128,0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            ⚙️ 设置
          </motion.button>
          
          <motion.button
            className="w-full py-4 px-8 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl text-xl font-bold shadow-2xl transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(255,255,0,0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            📊 统计
          </motion.button>
        </motion.div>

        {/* 游戏特色介绍 */}
        <motion.div
          className="mt-12 text-center max-w-2xl"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <motion.div
              className="p-4 bg-black bg-opacity-30 rounded-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">🃏</div>
              <div className="font-bold mb-1">小丑牌系统</div>
              <div className="text-gray-300">收集强力小丑牌，改变游戏规则</div>
            </motion.div>
            
            <motion.div
              className="p-4 bg-black bg-opacity-30 rounded-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-bold mb-1">策略深度</div>
              <div className="text-gray-300">每次出牌都需要精心计算</div>
            </motion.div>
            
            <motion.div
              className="p-4 bg-black bg-opacity-30 rounded-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-bold mb-1">无限重玩</div>
              <div className="text-gray-300">每局游戏都有不同体验</div>
            </motion.div>
          </div>
        </motion.div>

        {/* 版本信息 */}
        <motion.div
          className="absolute bottom-4 right-4 text-sm text-gray-500"
          variants={itemVariants}
        >
          Demo v1.0.0
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PreviewPage;