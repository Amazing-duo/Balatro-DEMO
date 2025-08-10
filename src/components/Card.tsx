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
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showBack?: boolean;
  className?: string;
  showScore?: boolean;
  score?: number;
  isPlayedUp?: boolean;
  isMovingOut?: boolean;
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isPlayable = true,
  isInHand = false,
  size = 'medium',
  showBack = false,
  className = '',
  showScore = false,
  score = 0,
  isPlayedUp = false,
  isMovingOut = false
}) => {
  const cardColor = getCardColor(card);
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitCssColor = SUIT_CSS_COLORS[card.suit];
  const displayName = getCardDisplayName(card);

  const sizeClasses = {
    small: 'w-10 h-14 sm:w-12 sm:h-18 text-xs',
    medium: 'w-12 h-18 sm:w-16 sm:h-24 text-xs sm:text-sm',
    large: 'w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 text-sm sm:text-base',
    xlarge: 'w-20 h-30 sm:w-24 sm:h-36 md:w-28 md:h-42 lg:w-32 lg:h-48 text-base sm:text-lg'
  };

  const touchClasses = 'touch-manipulation select-none';

  const handleClick = () => {
    if (isPlayable && onClick) {
      onClick(card);
    }
  };

  const cardVariants = {
    idle: {
      scale: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.03, ease: "easeInOut" }
    },
    hover: {
      scale: isPlayable ? 1.03 : 1,
      y: 0,
      x: 0,
      transition: { duration: 0.03, ease: "easeInOut" }
    },
    selected: {
      scale: 1,
      y: -5,
      x: 0,
      transition: { duration: 0.03, ease: "easeInOut" }
    },
    tap: {
      scale: 0.98,
      y: 0,
      x: 0,
      transition: { duration: 0.02, ease: "easeInOut" }
    },
    playedUp: {
      scale: 1,
      y: -200,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    movingOut: {
      scale: 1,
      y: -200,
      x: 1000,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const getCardState = () => {
    if (isMovingOut) return 'movingOut';
    if (isPlayedUp) return 'playedUp';
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
        ${touchClasses}
        bg-white rounded-lg border-2 
        ${card.isSelected 
          ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 ring-2 sm:ring-4 ring-yellow-300/50' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isPlayable ? 'cursor-pointer' : 'cursor-default'}
        select-none relative overflow-hidden
        min-h-[56px] min-w-[40px]
        ${className}
      `}
      variants={cardVariants}
      initial="idle"
      animate={getCardState()}
      whileHover={isPlayable ? "hover" : "idle"}
      whileTap={isPlayable ? "tap" : "idle"}
      onClick={handleClick}

    >
      {/* 卡牌背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
      
      {/* 左上角数值和花色 */}
      <div className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 flex flex-col items-center ${suitCssColor}`}>
        <span className="font-bold leading-none text-xs sm:text-sm md:text-base">{displayName}</span>
        <span className="text-sm sm:text-base md:text-lg leading-none">{suitSymbol}</span>
      </div>
      
      {/* 右下角数值和花色（倒置） */}
      <div className={`absolute bottom-0.5 sm:bottom-1 right-0.5 sm:right-1 flex flex-col items-center ${suitCssColor} transform rotate-180`}>
        <span className="font-bold leading-none text-xs sm:text-sm md:text-base">{displayName}</span>
        <span className="text-sm sm:text-base md:text-lg leading-none">{suitSymbol}</span>
      </div>
      
      {/* 中央花色 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl sm:text-3xl md:text-4xl ${suitCssColor} opacity-20`}>
          {suitSymbol}
        </span>
      </div>
      
      {/* 分数显示 */}
      {showScore && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs sm:text-sm font-bold px-1 sm:px-1.5 py-0.5 rounded-bl-md">
          +{card.rank}
        </div>
      )}
      
      {/* 特殊效果指示器 */}
      {card.enhancement && (
        <div className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
      )}
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