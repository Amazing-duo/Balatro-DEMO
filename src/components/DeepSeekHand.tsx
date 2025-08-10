import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '../types/game';
import { soundManager, SoundType } from '../utils/soundManager';

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

interface DeepSeekCardProps {
  card: CardType;
  index: number;
  onCardClick: (card: CardType) => void;
  isSelected: boolean;
  totalCards: number;
  isPlayable: boolean;
  showScore?: boolean;
  score?: number;
  isPlayedUp?: boolean;
}

const DeepSeekCard: React.FC<DeepSeekCardProps> = ({
  card,
  index,
  onCardClick,
  isSelected,
  totalCards,
  isPlayable,
  showScore = false,
  score = 0,
  isPlayedUp = false
}) => {
  // 时间状态用于晃动动画
  const [time, setTime] = useState(0);
  
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
    if (!isPlayable) return;
    onCardClick(card);
  };

  // 获取花色符号
  const getSuitSymbol = (suit: string) => {
    switch (suit.toLowerCase()) {
      case 'spades': return '♠';
      case 'hearts': return '♥';
      case 'clubs': return '♣';
      case 'diamonds': return '♦';
      default: return '♠';
    }
  };

  // 获取卡牌颜色
  const getCardColor = (suit: string) => {
    const suitLower = suit.toLowerCase();
    if (suitLower === 'hearts' || suitLower === 'diamonds') {
      return 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
    } else {
      return 'linear-gradient(135deg, #1f2937 0%, #111827 100%)';
    }
  };

  // 获取文字颜色
  const getTextColor = (suit: string) => {
    const suitLower = suit.toLowerCase();
    return suitLower === 'hearts' || suitLower === 'diamonds' ? '#fef2f2' : '#f9fafb';
  };

  // 获取显示的点数
  const getDisplayRank = (rank: number) => {
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return rank.toString();
  };

  return (
    <motion.div
      onClick={handleClick}
      style={{
        position: "absolute",
        zIndex: 10 + index, // 固定层级，右侧卡牌始终覆盖左侧卡牌
        cursor: isPlayable ? "pointer" : "default"
      }}
      whileHover={isPlayable && !isSelected ? { scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      animate={{
        x: x,
        y: isPlayedUp ? y : (isSelected ? -20 : 0), // 出牌状态使用计算的y值，选中状态的上移效果
        rotate: rotation, // 使用计算的旋转值（出牌状态时已经是0）
        scale: isSelected ? 1.05 : 1, // 选中状态的放大效果
        opacity: 1
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
          background: getCardColor(card.suit),
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          border: "1px solid #fff", // 移除选中状态的金色边框
          transformOrigin: "center bottom",
          opacity: isPlayable ? 1 : 0.6
        }}
      >
        <div 
          className="text-2xl font-bold mb-2" 
          style={{ 
            userSelect: "none",
            color: getTextColor(card.suit)
          }}
        >
          {getDisplayRank(card.rank)}
        </div>
        <div 
          className="text-4xl" 
          style={{ 
            userSelect: "none",
            color: getTextColor(card.suit)
          }}
        >
          {getSuitSymbol(card.suit)}
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
              <span className="text-white text-[36px] font-bold drop-shadow-2xl">
                +{score}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

interface DeepSeekHandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  onReorder?: (newOrder: CardType[]) => void;
  maxSelection?: number;
  isPlayable?: boolean;
  className?: string;
  onPlayCards?: (cards: CardType[]) => void;
}

const DeepSeekHand: React.FC<DeepSeekHandProps> = ({
  cards,
  onCardClick,
  onReorder,
  maxSelection = 5,
  isPlayable = true,
  className = '',
  onPlayCards
}) => {
  const [draggedCard, setDraggedCard] = useState<CardType | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<CardType[]>(cards);
  const [playedUpCards, setPlayedUpCards] = useState<string[]>([]);
  const [movingOutCards, setMovingOutCards] = useState<string[]>([]);
  const [cardScores, setCardScores] = useState<{[key: string]: {showScore: boolean, score: number}}>({});

  const selectedCards = cards.filter(card => card.isSelected);
  const selectedCount = selectedCards.length;

  // 同步cards变化到previewOrder
  useEffect(() => {
    if (!isDragging) {
      setPreviewOrder(cards);
    }
  }, [cards, isDragging]);

  // 计算卡牌积分
  const calculateCardScore = (card: CardType): number => {
    const rank = card.rank;
    if (rank === 1 || rank === 11 || rank === 12 || rank === 13) {
      return 10;
    }
    if (rank >= 10) {
      return 10;
    }
    return rank;
  };

  // 计算手牌位置
  const calculateCardPosition = (idx: number, total: number) => {
    const cardWidth = 120;
    const overlap = 40; // 右侧卡牌覆盖左侧卡牌的1/3
    const spacing = cardWidth - overlap;
    const totalWidth = total * spacing;
    const startX = -totalWidth / 2 + cardWidth / 2;
    
    const x = startX + idx * spacing;
    const y = 0;
    
    return { x, y };
  };



  const handleCardClick = (card: CardType) => {
    if (!isPlayable) return;
    
    // 如果卡牌已选中，允许取消选择
    if (card.isSelected) {
      soundManager.play(SoundType.CARD_DESELECT);
      onCardClick?.(card);
      return;
    }
    
    // 如果未达到最大选择数量，允许选择
    if (selectedCount < maxSelection) {
      soundManager.play(SoundType.CARD_SELECT);
      onCardClick?.(card);
    }
  };

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, card: CardType) => {
    setDraggedCard(card);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    // 设置自定义拖拽图像为透明
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
    
    // 实时预览位置变化
    if (draggedCard && onReorder) {
      const dragIndex = cards.findIndex(card => card.id === draggedCard.id);
      if (dragIndex !== index) {
        const newCards = [...cards];
        const [draggedItem] = newCards.splice(dragIndex, 1);
        newCards.splice(index, 0, draggedItem);
        setPreviewOrder(newCards);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    // 应用预览的顺序
    if (draggedCard && onReorder && previewOrder.length > 0) {
      onReorder(previewOrder);
    }
    
    setDraggedCard(null);
    setDragOverIndex(null);
    setIsDragging(false);
    setPreviewOrder(cards);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverIndex(null);
    setIsDragging(false);
    setPreviewOrder(cards);
  };

  // 出牌动画逻辑
  const triggerPlayAnimation = () => {
    if (selectedCards.length === 0) return;
    
    const selectedIndices = selectedCards.map(card => {
      return cards.findIndex(c => c.id === card.id);
    }).filter(index => index !== -1);

    // 将选中的卡牌设置为向上位移状态
    setPlayedUpCards(selectedCards.map(card => card.id));
    
    // 1秒后开始依次显示积分
    setTimeout(() => {
      // 按照选择顺序排序（保持原有的选择顺序）
      const sortedIndices = [...selectedIndices];
      
      // 依次显示每张牌的积分，每张牌间隔0.5秒
      sortedIndices.forEach((index, cardIndex) => {
        setTimeout(() => {
          const card = cards[index];
          const score = calculateCardScore(card);
          
          // 显示当前卡牌的积分
          setCardScores(prev => ({
            ...prev,
            [card.id]: { showScore: true, score: score }
          }));
          
          // 0.5秒后隐藏当前积分文字
          setTimeout(() => {
            setCardScores(prev => ({
              ...prev,
              [card.id]: { showScore: false, score: score }
            }));
            
            // 如果是最后一张牌，0.5秒后开始移出动画
            if (cardIndex === sortedIndices.length - 1) {
              setTimeout(() => {
                setMovingOutCards(selectedCards.map(card => card.id));
                // 调用原有的出牌逻辑
                onPlayCards?.(selectedCards);
              }, 500);
            }
          }, 500);
        }, cardIndex * 500); // 每张牌间隔0.5秒
      });
    }, 1000);
  };

  // 监听选中卡牌变化，如果有新的出牌操作，触发动画
  useEffect(() => {
    // 重置动画状态
    setPlayedUpCards([]);
    setMovingOutCards([]);
    setCardScores({});
  }, [cards.length]); // 当卡牌数量变化时重置

  // 暴露触发动画的方法
  useEffect(() => {
    if (onPlayCards) {
      // 将触发动画的方法传递给父组件
      (window as any).triggerDeepSeekPlayAnimation = triggerPlayAnimation;
    }
  }, [selectedCards, triggerPlayAnimation]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
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
        stiffness: 150,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      rotateY: 90,
      transition: {
        duration: 0.15
      }
    }
  };

  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <motion.div
        className="flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          gap: '0rem' // 移除负间距，使用卡牌位置计算来处理重叠
        }}
      >
        <div className="deepseek-hand-container relative w-full h-96 flex items-center justify-center">
          {/* 手牌区域 */}
          <div className="hand-area relative flex items-center justify-center">
            <AnimatePresence>
              {(isDragging ? previewOrder : cards).map((card, index) => {
                const currentCards = isDragging ? previewOrder : cards;
                const isCardSelected = card.isSelected || playedUpCards.includes(card.id);
                const isCardMovingOut = movingOutCards.includes(card.id);
                const isSelectable = !card.isSelected && selectedCount < maxSelection;
                const cardPlayable = isPlayable && (card.isSelected || isSelectable);
                
                return (
                  <motion.div
                    key={card.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate={{
                      ...cardVariants.visible,
                      scale: draggedCard?.id === card.id ? 1.05 : 1,
                      opacity: draggedCard?.id === card.id ? 0.7 : (isCardMovingOut ? 0 : 1),
                      x: isCardMovingOut ? 1000 : 0,
                      y: dragOverIndex === index && draggedCard ? -10 : 0
                    }}
                    exit="exit"
                    layout
                    style={{
                      zIndex: 10 + index // 移除选中状态对层级的影响
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    className={`relative ${
                      dragOverIndex === index ? 'border-2 border-blue-400 border-dashed rounded-lg' : ''
                    } ${
                      draggedCard?.id === card.id ? 'shadow-2xl z-50' : ''
                    } ${
                      onReorder ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
                    }`}
                    draggable={onReorder ? true : false}
                    onDragStart={(e) => handleDragStart(e as any, card)}
                    onDragOver={(e) => handleDragOver(e as any, index)}
                    onDrop={(e) => handleDrop(e as any, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <DeepSeekCard
                      card={card}
                      index={index}
                      onCardClick={handleCardClick}
                      isSelected={isCardSelected}
                      totalCards={currentCards.length}
                      isPlayable={cardPlayable}
                      showScore={cardScores[card.id]?.showScore || false}
                      score={cardScores[card.id]?.score || 0}
                      isPlayedUp={playedUpCards.includes(card.id)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      

    </div>
  );
};

export default DeepSeekHand;
export { DeepSeekCard };