import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../types/game';
import { getCardDisplayName, getCardColor } from '../utils/cardUtils';
import { SUIT_SYMBOLS, SUIT_COLORS, SUIT_CSS_COLORS } from '../types/constants';

interface CardProps {
  card: CardType;
  onClick?: (card: CardType) => void;
  isPlayable?: boolean;
  isInHand?: boolean;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isPlayable = true,
  isInHand = false,
  size = 'medium',
  showBack = false,
  className = ''
}) => {
  const cardColor = getCardColor(card);
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitCssColor = SUIT_CSS_COLORS[card.suit];
  const displayName = getCardDisplayName(card);

  const sizeClasses = {
    small: 'w-12 h-16 text-xs',
    medium: 'w-16 h-24 text-sm',
    large: 'w-20 h-28 text-base'
  };

  const handleClick = () => {
    if (isPlayable && onClick) {
      onClick(card);
    }
  };

  const cardVariants = {
    idle: {
      scale: 1,
      y: 0,
      rotateZ: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    hover: {
      scale: isPlayable ? 1.05 : 1,
      y: isInHand ? -8 : 0,
      rotateZ: isInHand ? (Math.random() - 0.5) * 2 : 0,
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
    },
    selected: {
      scale: 1.1,
      y: isInHand ? -16 : 0,
      rotateZ: 0,
      boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4)'
    },
    tap: {
      scale: 0.95
    }
  };

  const getCardState = () => {
    if (card.isSelected) return 'selected';
    return 'idle';
  };

  if (showBack) {
    return (
      <motion.div
        className={`
          ${sizeClasses[size]} 
          bg-gradient-to-br from-blue-800 to-purple-900 
          rounded-lg border-2 border-gray-300 
          flex items-center justify-center 
          cursor-pointer select-none
          ${className}
        `}
        variants={cardVariants}
        initial="idle"
        animate={getCardState()}
        whileHover={isPlayable ? "hover" : "idle"}
        whileTap={isPlayable ? "tap" : "idle"}
        onClick={handleClick}
        layout
      >
        <div className="text-white text-2xl font-bold opacity-30">
          ♠
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        ${sizeClasses[size]} 
        bg-white rounded-lg border-2 
        ${card.isSelected 
          ? 'border-blue-500 shadow-lg shadow-blue-500/50' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isPlayable ? 'cursor-pointer' : 'cursor-default'}
        select-none relative overflow-hidden
        ${className}
      `}
      variants={cardVariants}
      initial="idle"
      animate={getCardState()}
      whileHover={isPlayable ? "hover" : "idle"}
      whileTap={isPlayable ? "tap" : "idle"}
      onClick={handleClick}
      layout
    >
      {/* 卡牌背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
      
      {/* 左上角数值和花色 */}
      <div className={`absolute top-1 left-1 flex flex-col items-center ${suitCssColor}`}>
        <span className="font-bold leading-none">{displayName}</span>
        <span className="text-lg leading-none">{suitSymbol}</span>
      </div>
      
      {/* 右下角数值和花色（倒置） */}
      <div className={`absolute bottom-1 right-1 flex flex-col items-center ${suitCssColor} transform rotate-180`}>
        <span className="font-bold leading-none">{displayName}</span>
        <span className="text-lg leading-none">{suitSymbol}</span>
      </div>
      
      {/* 中央花色 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-4xl ${suitCssColor} opacity-20`}>
          {suitSymbol}
        </span>
      </div>
      
      {/* 选中状态指示器 */}
      {card.isSelected && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400 rounded-lg bg-blue-100 bg-opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      {/* 特殊效果指示器 */}
      {card.isEnhanced && (
        <motion.div
          className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* 石头卡牌效果 */}
      {card.isStone && (
        <div className="absolute inset-0 bg-gray-600 bg-opacity-30 rounded-lg" />
      )}
      
      {/* 钢铁卡牌效果 */}
      {card.isSteel && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 bg-opacity-20 rounded-lg" />
      )}
      
      {/* 玻璃卡牌效果 */}
      {card.isGlass && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-300 bg-opacity-30 rounded-lg"
          animate={{
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* 黄金卡牌效果 */}
      {card.isGold && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 bg-opacity-30 rounded-lg"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export default Card;