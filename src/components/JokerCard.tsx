import React from 'react';
import { motion } from 'framer-motion';
import { Joker } from '../types/game';
import { RARITY_COLORS } from '../types/constants';
import { JokerManager } from '../game-engine/JokerManager';

interface JokerCardProps {
  joker: Joker;
  onClick?: (joker: Joker) => void;
  onSell?: (joker: Joker) => void;
  isInShop?: boolean;
  isSelectable?: boolean;
  showSellButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const JokerCard: React.FC<JokerCardProps> = ({
  joker,
  onClick,
  onSell,
  isInShop = false,
  isSelectable = true,
  showSellButton = false,
  size = 'medium',
  className = ''
}) => {
  const rarityColor = RARITY_COLORS[joker.rarity];
  const description = JokerManager.getJokerEffectDescription(joker);

  const sizeClasses = {
    small: 'w-20 h-28 text-xs',
    medium: 'w-24 h-36 text-sm',
    large: 'w-28 h-40 text-base'
  };

  const handleClick = () => {
    if (isSelectable && onClick) {
      onClick(joker);
    }
  };

  const handleSell = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSell) {
      onSell(joker);
    }
  };

  const cardVariants = {
    idle: {
      scale: 1,
      rotateY: 0,
      boxShadow: `0 4px 8px ${rarityColor}20`
    },
    hover: {
      scale: isSelectable ? 1.05 : 1,
      rotateY: isSelectable ? 5 : 0,
      boxShadow: `0 8px 16px ${rarityColor}40`
    },
    tap: {
      scale: 0.95
    }
  };

  const getRarityGradient = () => {
    switch (joker.rarity) {
      case 'common':
        return 'from-gray-100 to-gray-200';
      case 'uncommon':
        return 'from-green-100 to-green-200';
      case 'rare':
        return 'from-blue-100 to-blue-200';
      case 'legendary':
        return 'from-purple-100 to-purple-200';
      default:
        return 'from-gray-100 to-gray-200';
    }
  };

  return (
    <motion.div
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br ${getRarityGradient()}
        rounded-lg border-2 relative overflow-hidden
        ${isSelectable ? 'cursor-pointer' : 'cursor-default'}
        select-none
        ${className}
      `}
      style={{
        borderColor: rarityColor
      }}
      variants={cardVariants}
      initial="idle"
      whileHover={"hover"}
      whileTap={isSelectable ? "tap" : "idle"}
      onClick={handleClick}
      layout
    >
      {/* 稀有度边框光效 */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-30"
        style={{
          background: `linear-gradient(45deg, ${rarityColor}00, ${rarityColor}80, ${rarityColor}00)`
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* 小丑牌图标/表情 */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
        <div className="text-2xl">
          {'🃏'}
        </div>
      </div>
      
      {/* 小丑牌名称 */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full px-1">
        <div className="text-center font-bold text-gray-800 leading-tight truncate">
          {joker.name}
        </div>
      </div>
      
      {/* 稀有度标识 */}
      <div className="absolute top-1 right-1">
        <div 
          className="w-3 h-3 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: rarityColor }}
        />
      </div>
      
      {/* 效果描述 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full px-2">
        <div className="text-center text-xs text-gray-700 leading-tight">
          {description}
        </div>
      </div>
      
      {/* 价格/售价信息 */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        {isInShop ? (
          <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
            ${joker.cost}
          </div>
        ) : (
          <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold">
            卖 ${joker.sellValue}
          </div>
        )}
      </div>
      
      {/* 出售按钮 */}
      {showSellButton && !isInShop && (
        <motion.button
          className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
          onClick={handleSell}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>
      )}
      
      {/* 触发次数显示（如果有） */}
      {joker.timesTriggered !== undefined && joker.timesTriggered > 0 && (
        <div className="absolute bottom-1 right-1">
          <div className="bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-bold">
            {joker.timesTriggered}
          </div>
        </div>
      )}
      
      {/* 特殊状态指示器 */}
      {joker.isEternal && (
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {joker.isPerishable && (
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"
          animate={{
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {joker.isRental && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-yellow-500" />
      )}
    </motion.div>
  );
};

export default JokerCard;