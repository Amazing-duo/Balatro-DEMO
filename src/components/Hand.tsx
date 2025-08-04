import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '../types/game';
import Card from './Card';

interface HandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  maxSelection?: number;
  isPlayable?: boolean;
  className?: string;
}

const Hand: React.FC<HandProps> = ({
  cards,
  onCardClick,
  maxSelection = 5,
  isPlayable = true,
  className = ''
}) => {
  const selectedCount = cards.filter(card => card.isSelected).length;

  const handleCardClick = (card: CardType) => {
    if (!isPlayable) return;
    
    // 如果卡牌已选中，允许取消选择
    if (card.isSelected) {
      onCardClick?.(card);
      return;
    }
    
    // 如果未达到最大选择数量，允许选择
    if (selectedCount < maxSelection) {
      onCardClick?.(card);
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

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateY: -90
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      rotateY: 90,
      transition: {
        duration: 0.3
      }
    }
  };

  // 计算卡牌的排列角度和位置
  const getCardTransform = (index: number, total: number) => {
    if (total <= 1) return { rotate: 0, x: 0 };
    
    const maxRotation = Math.min(30, total * 3); // 最大旋转角度
    const step = maxRotation / (total - 1);
    const rotation = -maxRotation / 2 + step * index;
    
    // 轻微的弧形排列
    const arcHeight = Math.min(10, total * 0.5);
    const normalizedIndex = (index - (total - 1) / 2) / (total - 1);
    const yOffset = arcHeight * (1 - Math.pow(normalizedIndex * 2, 2));
    
    return {
      rotate: rotation,
      x: 0,
      y: yOffset
    };
  };

  return (
    <div className={`relative flex justify-center items-end ${className}`}>
      <motion.div
        className="flex items-end justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          gap: cards.length > 8 ? '-0.5rem' : cards.length > 5 ? '0.25rem' : '0.5rem'
        }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const transform = getCardTransform(index, cards.length);
            const isSelectable = !card.isSelected && selectedCount < maxSelection;
            const cardPlayable = isPlayable && (card.isSelected || isSelectable);
            
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                style={{
                  rotate: transform.rotate,
                  x: transform.x,
                  y: transform.y,
                  zIndex: card.isSelected ? 20 : 10 - Math.abs(index - cards.length / 2)
                }}
                className="relative"
              >
                <Card
                  card={card}
                  onClick={handleCardClick}
                  isPlayable={cardPlayable}
                  isInHand={true}
                  size="medium"
                  className={`
                    transition-all duration-200
                    ${!cardPlayable && !card.isSelected ? 'opacity-60' : ''}
                    ${card.isSelected ? 'z-20' : ''}
                  `}
                />
                
                {/* 选择指示器 */}
                {card.isSelected && (
                  <motion.div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      
      {/* 选择计数器 */}
      {selectedCount > 0 && (
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {selectedCount}/{maxSelection} 已选择
          </div>
        </motion.div>
      )}
      
      {/* 满选提示 */}
      {selectedCount >= maxSelection && (
        <motion.div
          className="absolute -top-20 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            已达到最大选择数量
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Hand;