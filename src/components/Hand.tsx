import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '../types/game';
import Card from './Card';
import { soundManager, SoundType } from '../utils/soundManager';

interface HandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  onReorder?: (newOrder: CardType[]) => void;
  maxSelection?: number;
  isPlayable?: boolean;
  className?: string;
}

const Hand: React.FC<HandProps> = ({
  cards,
  onCardClick,
  onReorder,
  maxSelection = 5,
  isPlayable = true,
  className = ''
}) => {
  const [draggedCard, setDraggedCard] = React.useState<CardType | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [previewOrder, setPreviewOrder] = React.useState<CardType[]>(cards);
  const selectedCount = cards.filter(card => card.isSelected).length;

  // 同步cards变化到previewOrder
  React.useEffect(() => {
    if (!isDragging) {
      setPreviewOrder(cards);
    }
  }, [cards, isDragging]);

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
    // 设置自定义拖拽图像为透明，这样我们可以完全控制视觉效果
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

  const handleDragLeave = () => {
    // 不立即清除dragOverIndex，避免闪烁
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

  // 鼠标悬停处理
  const handleMouseEnter = (index: number) => {
    if (!isDragging) {
      setHoveredIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoveredIndex(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // 加快动画速度
        delayChildren: 0.1 // 减少延迟
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
        stiffness: 150, // 增加弹性
        damping: 20 // 增加阻尼
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      rotateY: 90,
      transition: {
        duration: 0.15 // 减少退出动画时间
      }
    }
  };

  // 计算卡牌的排列位置（移除倾斜角度）
  const getCardTransform = (index: number, total: number) => {
    return {
      rotate: 0, // 移除所有倾斜角度
      x: 0,
      y: 0
    };
  };

  // 计算动态间距
  const calculateDynamicGap = (cardCount: number) => {
    if (cardCount <= 1) return '0rem';
    
    if (cardCount <= 5) {
      // 5张及以下保持原有间距
      return '-1.4rem';
    } else if (cardCount <= 8) {
      // 6-8张卡牌，逐渐减小间距（增加重叠）
      const additionalOverlap = (cardCount - 5) * 0.3; // 每多一张卡增加0.3rem重叠
      return `${-1.4 - additionalOverlap}rem`;
    } else {
      // 9张及以上，最大重叠
      const maxOverlap = -1.4 - 0.9; // 最大额外重叠0.9rem
      const extraOverlap = (cardCount - 8) * 0.15; // 继续增加重叠，但增幅减小
      return `${Math.max(maxOverlap - extraOverlap, -3.5)}rem`; // 设置最大重叠限制
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
          gap: calculateDynamicGap((isDragging ? previewOrder : cards).length)
        }}
      >
        <AnimatePresence mode="popLayout">
          {(isDragging ? previewOrder : cards).map((card, index) => {
            const currentCards = isDragging ? previewOrder : cards;
            const transform = getCardTransform(index, currentCards.length);
            const isSelectable = !card.isSelected && selectedCount < maxSelection;
            const cardPlayable = isPlayable && (card.isSelected || isSelectable);
            
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                initial="hidden"
                animate={{
                  ...cardVariants.visible,
                  scale: draggedCard?.id === card.id ? 1.05 : (hoveredIndex === index && onReorder && !isDragging ? 1.05 : 1),
                  opacity: draggedCard?.id === card.id ? 0.7 : 1,
                  y: dragOverIndex === index && draggedCard ? -10 : (hoveredIndex === index && onReorder && !isDragging ? -5 : 0),
                  rotate: transform.rotate,
                  x: transform.x
                }}
                exit="exit"
                layout
                style={{
                  zIndex: card.isSelected ? 20 : 10 - Math.abs(index - cards.length / 2)
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
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e as any, index)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <Card
                  card={card}
                  onClick={handleCardClick}
                  isPlayable={cardPlayable}
                  isInHand={true}
                  size="xlarge"
                  className={`
                    transition-all duration-200
                    ${!cardPlayable && !card.isSelected ? 'opacity-60' : ''}
                    ${card.isSelected ? 'z-20' : ''}
                    ${draggedCard?.id === card.id ? 'pointer-events-none' : ''}
                  `}
                />
                
                {/* 选择指示器已移除 */}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      
      {/* 选择计数器 */}
      {selectedCount > 0 && (
        <motion.div
          className="absolute -top-8 sm:-top-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-blue-600 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium shadow-lg">
            {selectedCount}/{maxSelection} 已选择
          </div>
        </motion.div>
      )}
      
      {/* 满选提示 */}
      {selectedCount >= maxSelection && (
        <motion.div
          className="absolute -top-16 sm:-top-20 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="bg-yellow-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs font-medium shadow-lg">
            <span className="hidden sm:inline">已达到最大选择数量</span>
            <span className="sm:hidden">已满选</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Hand;