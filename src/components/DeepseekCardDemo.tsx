import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager, SoundType } from '../utils/soundManager';

interface DeepseekCard {
  id: string;
  rank: string;
  suit: string;
  color: string;
}



// 计算出牌状态的位置（5个固定标准位置，无覆盖）
const calculatePlayedCardPosition = (playedIndex: number) => {
  const cardWidth = 120;
  const gap = 30; // 出牌状态时的固定间距，确保无覆盖
  const maxPlayedCards = 5; // 最多出5张牌
  const totalWidth = maxPlayedCards * cardWidth + (maxPlayedCards - 1) * gap;
  const startX = -totalWidth / 2 + cardWidth / 2;
  
  const x = startX + playedIndex * (cardWidth + gap);
  const y = -200; // 向上移动到出牌区域
  
  return { x, y };
};

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
  const [time, setTime] = useState(0);

  // 晃动动画：每秒变化1度
  useEffect(() => {
    if (isPlayedUp) return; // 出牌状态时不需要晃动
    
    const interval = setInterval(() => {
      setTime(prev => prev + 0.1); // 更频繁的更新以实现平滑动画
    }, 100); // 每100ms更新一次
    return () => clearInterval(interval);
  }, [isPlayedUp]);

  // 计算手牌的位置（横向排列）
  const calculateCardPosition = (idx: number, total: number) => {
    const cardWidth = 120;
    const overlap = 40; // 右侧卡牌覆盖左侧卡牌的1/3
    const spacing = cardWidth - overlap;
    const totalWidth = total * spacing;
    const startX = -totalWidth / 2 + cardWidth / 2;
    
    const x = startX + idx * spacing;
    const y = 0;
    
    // 新的晃动算法：基于卡牌位置计算角度范围
    const halfTotal = total / 2;
    let baseRotation;
    
    if (idx < halfTotal) {
      // 左半部分：从-5度到0度
      baseRotation = -2.5 + (idx / halfTotal) * 2.5;
    } else {
      // 右半部分：从0度到5度
      baseRotation = ((idx - halfTotal) / halfTotal) * 5;
    }
    
    // 添加循环晃动效果：使用sin波实现平滑晃动
    const swayAmount = Math.sin(time + idx) * 2.5; // 每张卡有不同的相位
    const rotation = baseRotation + swayAmount;
    
    return { x, y, rotation };
  };

  // 计算卡牌位置 - 根据状态选择不同的计算方式
  const { x, y, rotation } = isPlayedUp 
    ? { ...calculatePlayedCardPosition(index), rotation: 0 } // 出牌状态时使用固定位置且无旋转
    : calculateCardPosition(index, totalCards); // 手牌状态时使用原有逻辑
  
  const handleClick = () => {
    onSelect(index);
    soundManager.play(SoundType.CARD_SELECT);
  };

  return (
    <motion.div
      onClick={handleClick}
      style={{
        position: "absolute",
        zIndex: 10 + index, // 固定层级，右侧卡牌始终覆盖左侧卡牌
        cursor: "pointer"
      }}
      whileHover={!isSelected ? { scale: 1.05 } : {}}
      whileTap={{ scale: 0.95 }}
      animate={{
        x: isMovingOut ? 1000 : x,
        y: isPlayedUp ? y : (isSelected ? y - 20 : y), // 出牌状态使用计算的y值，选中状态的上移效果
        rotate: rotation, // 使用计算的旋转值（出牌状态时已经是0）
        scale: isSelected ? 1.05 : 1, // 选中状态的放大效果
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
          border: "1px solid #fff", // 移除选中状态的金色边框
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



  const playCard = (indices: number[]) => {
    // 将选中的卡牌设置为向上位移状态
    setPlayedUpCards([...playedUpCards, ...indices]);
    setSelectedCards([]);
    soundManager.play(SoundType.CARD_SELECT);
    
    // 1秒后开始依次显示积分
    setTimeout(() => {
      // 按照选择顺序排序（保持原有的选择顺序）
      const sortedIndices = [...indices];
      
      // 依次显示每张牌的积分，每张牌间隔0.5秒
      sortedIndices.forEach((index, cardIndex) => {
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
            if (cardIndex === sortedIndices.length - 1) {
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
              zIndex={10 + index} // 移除选中状态对层级的影响
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