import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager, SoundType } from '../utils/soundManager';

interface DeepseekCard {
  id: string;
  rank: string;
  suit: string;
  color: string;
}



interface CardProps {
  card: DeepseekCard;
  index: number;
  playCard: (indices: number[]) => void;
  isPlayedUp: boolean;
  isMovingOut: boolean;
  zIndex: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  totalCards: number;
  showScore?: boolean;
  score?: number;
}

const Card: React.FC<CardProps> = ({
  card,
  index,
  playCard,
  isPlayedUp,
  isMovingOut,
  zIndex,
  isSelected,
  onSelect,
  totalCards,
  showScore = false,
  score = 0
}) => {
  // 计算手牌的位置（横向排列）
  const calculateCardPosition = (idx: number, total: number) => {
    const cardWidth = 120;
    const gap = 20;
    const totalWidth = total * cardWidth + (total - 1) * gap;
    const startX = -totalWidth / 2 + cardWidth / 2;
    
    const x = startX + idx * (cardWidth + gap);
    const y = 0;
    
    return { x, y, rotation: 0 };
  };

  // 计算卡牌位置
  const { x, y, rotation } = calculateCardPosition(index, totalCards);
  
  const handleClick = () => {
    onSelect(index);
    soundManager.play(SoundType.CARD_SELECT);
  };
  
  const handleDoubleClick = () => {
    playCard([index]);
  };

  return (
    <motion.div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: "absolute",
        zIndex: zIndex,
        cursor: "pointer"
      }}
      whileHover={!isSelected ? { scale: 1.05 } : {}}
      whileTap={{ scale: 0.95 }}
      animate={{
        x: isMovingOut ? 1000 : x,
        y: isPlayedUp ? -200 : isSelected ? -40 : y,
        rotate: isSelected ? 0 : rotation,
        scale: isSelected ? 1.15 : 1,
        opacity: isMovingOut ? 0 : 1
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300
      }}
    >
      <motion.div
        style={{
          width: 120,
          height: 180,
          background: card.color,
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          border: isSelected ? "3px solid gold" : "1px solid #fff",
          transformOrigin: "center bottom"
        }}
      >
        <div className="text-white text-2xl font-bold mb-2" style={{ userSelect: "none" }}>
          {card.rank}
        </div>
        <div className="text-white text-4xl" style={{ userSelect: "none" }}>
          {card.suit}
        </div>
        
        {/* 内置积分显示 */}
        {showScore && (
          <motion.div
            className="absolute left-0 top-0 pointer-events-none z-50"
            style={{ width: 120 }} // 与卡片宽度相等
            initial={{ opacity: 0, translateY: 0, translateX: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              translateY: [0, -80, -80, -160],
              translateX: [0, 0, 0, 200] // 消失时向右移出
            }}
            transition={{
              duration: 1.0, // 延长动画时间以配合右移
              ease: "easeOut"
            }}
          >
            <div className="w-full flex justify-center">
              <span className="text-white text-[36px] font-bold drop-shadow-2xl  ">
                +{score}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

interface DeepseekCardDemoProps {
  cards: DeepseekCard[];
}

const DeepseekCardDemo: React.FC<DeepseekCardDemoProps> = ({ cards }) => {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [playedUpCards, setPlayedUpCards] = useState<number[]>([]);
  const [movingOutCards, setMovingOutCards] = useState<number[]>([]);
  const [cardScores, setCardScores] = useState<{[key: number]: {showScore: boolean, score: number}}>({});
  const [currentCards, setCurrentCards] = useState(cards);

  // 计算卡牌积分
  const calculateCardScore = (card: DeepseekCard): number => {
    const rank = card.rank;
    if (rank === 'J' || rank === 'Q' || rank === 'K' || rank === 'A') {
      return 10;
    }
    const numValue = parseInt(rank);
    if (numValue >= 10) {
      return 10;
    }
    return numValue;
  };

  const calculateCardPosition = (idx: number, total: number) => {
    const cardWidth = 120;
    const gap = 20;
    const totalWidth = total * cardWidth + (total - 1) * gap;
    const startX = -totalWidth / 2 + cardWidth / 2;
    
    const x = startX + idx * (cardWidth + gap);
    const y = 0;
    
    return { x, y };
  };

  const playCard = (indices: number[]) => {
    // 将选中的卡牌设置为向上位移状态
    setPlayedUpCards([...playedUpCards, ...indices]);
    setSelectedCards([]);
    soundManager.play(SoundType.CARD_SELECT);
    
    // 1秒后开始依次显示积分
    setTimeout(() => {
      // 依次显示每张牌的积分，每张牌间隔0.5秒
      indices.forEach((index, cardIndex) => {
        setTimeout(() => {
          const card = currentCards[index];
          const score = calculateCardScore(card);
          
          // 显示当前卡牌的积分
          setCardScores(prev => ({
            ...prev,
            [index]: { showScore: true, score: score }
          }));
          
          // 0.5秒后隐藏当前积分文字
          setTimeout(() => {
            setCardScores(prev => ({
              ...prev,
              [index]: { showScore: false, score: score }
            }));
            
            // 如果是最后一张牌，0.5秒后开始移出动画
            if (cardIndex === indices.length - 1) {
              setTimeout(() => {
                setMovingOutCards([...movingOutCards, ...indices]);
              }, 500);
            }
          }, 500);
        }, cardIndex * 500); // 每张牌间隔0.5秒
      });
    }, 1000);
  };

  const onSelectCard = (index: number) => {
    const isSelected = selectedCards.includes(index);
    let newSelectedCards: number[];
    
    if (isSelected) {
      // 取消选择
      newSelectedCards = selectedCards.filter(i => i !== index);
      soundManager.play(SoundType.CARD_DESELECT);
    } else {
      // 添加选择
      newSelectedCards = [...selectedCards, index];
      soundManager.play(SoundType.CARD_SELECT);
    }
    
    setSelectedCards(newSelectedCards);
  };

  const resetDemo = () => {
    setCurrentCards(cards);
    setPlayedUpCards([]);
    setMovingOutCards([]);
    setCardScores({});
    setSelectedCards([]);
  };

  const playSelectedCards = () => {
    if (selectedCards.length > 0) {
      playCard(selectedCards);
    }
  };

  return (
    <div className="deepseek-hand-container relative w-full h-96 flex flex-col items-center justify-center">
      {/* 手牌区域 */}
      <div className="hand-area relative mb-8 flex items-center justify-center">
        <AnimatePresence>
          {currentCards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              playCard={playCard}
              isPlayedUp={playedUpCards.includes(index)}
              isMovingOut={movingOutCards.includes(index)}
              zIndex={index}
              isSelected={selectedCards.includes(index)}
              onSelect={onSelectCard}
              totalCards={currentCards.length}
              showScore={cardScores[index]?.showScore || false}
              score={cardScores[index]?.score || 0}
            />
          ))}
        </AnimatePresence>

      </div>

      
      {/* 出牌按钮 */}
      {selectedCards.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={playSelectedCards}
          className="absolute bottom-4 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-bold shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 出牌 ({selectedCards.length})
        </motion.button>
      )}
      
      {/* 重置按钮 */}
      {(playedUpCards.length > 0 || movingOutCards.length > 0) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={resetDemo}
          className="absolute bottom-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-bold shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 重置演示
        </motion.button>
      )}
    </div>
  );
};

export default DeepseekCardDemo;