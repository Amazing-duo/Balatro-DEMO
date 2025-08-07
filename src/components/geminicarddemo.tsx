import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { soundManager, SoundType } from '../utils/soundManager';

interface GeminiCard {
  id: number;
  isSelected: boolean;
}

interface CardProps {
  id: number;
  x?: number;
  y?: number;
  rotate?: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDragEnd: (event: any, info: any, cardId: number) => void;
}

const Card: React.FC<CardProps> = ({ id, x, y, rotate, isSelected, onSelect, onDragEnd }) => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '100px',
        height: '150px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '24px',
        color: '#333',
        x: x || 0,
        y: isSelected ? -20 : 0,
        rotate: rotate || 0,
        zIndex: isSelected ? 10 : 1,
      }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: -50, right: 50 }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
      onDragEnd={(event, info) => onDragEnd(event, info, id)}
      onClick={() => {
        onSelect(id);
        soundManager.play(SoundType.CARD_SELECT);
      }}
      animate={{
        y: isSelected ? -20 : 0,
        boxShadow: isSelected
          ? '0 8px 12px rgba(0, 0, 0, 0.2)'
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {id}
    </motion.div>
  );
};

interface HandProps {
  cards: GeminiCard[];
}

const Hand: React.FC<HandProps> = ({ cards: initialCards }) => {
  const [cards, setCards] = useState<GeminiCard[]>(initialCards);
  const [playedCards, setPlayedCards] = useState<any[]>([]);
  const containerControls = useAnimation();

  // Helper function to calculate card positions
  const getCardPosition = (index: number) => {
    const totalCards = cards.length;
    const cardWidth = 100;
    const gap = 20;
    const totalWidth = totalCards * cardWidth + (totalCards - 1) * gap;
    const startX = -totalWidth / 2 + cardWidth / 2;
    return startX + index * (cardWidth + gap);
  };

  // Toggle card selection
  const handleSelect = (id: number) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, isSelected: !card.isSelected } : card
      )
    );
  };

  // Handle drag end logic
  const handleDragEnd = (event: any, info: any, cardId: number) => {
    // For simplicity, we just snap the card back to its original position
    // A more complex implementation would re-order the cards based on drag position
  };

  // Play the selected cards
  const handlePlayCards = () => {
    const selected = cards.filter((card) => card.isSelected);
    if (selected.length === 0) return;

    // Animate the selected cards to a "played" position
    setPlayedCards(
      selected.map((card, index) => ({
        ...card,
        x: (index - (selected.length - 1) / 2) * 120,
        y: -300,
        rotate: (Math.random() - 0.5) * 30,
        opacity: 0,
      }))
    );

    // Filter out the selected cards from the hand
    setCards((prevCards) => prevCards.filter((card) => !card.isSelected));
    soundManager.play(SoundType.CARD_SELECT);
  };

  const resetDemo = () => {
    setCards(initialCards);
    setPlayedCards([]);
  };

  return (
    <div className="relative w-full h-96 flex flex-col items-center justify-center">
      {/* Hand container */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '10%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          width: '100%',
        }}
        animate={containerControls}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            layout
            style={{ position: 'absolute' }}
            initial={{ x: getCardPosition(index), y: 0 }}
            animate={{
              x: getCardPosition(index),
              y: card.isSelected ? -20 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              layout: { duration: 0.3 }
            }}
          >
            <Card
              id={card.id}
              isSelected={card.isSelected}
              onSelect={handleSelect}
              onDragEnd={handleDragEnd}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Played cards container */}
      <motion.div
        style={{
          position: 'absolute',
          top: '30%',
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {playedCards.map((card) => (
          <motion.div
            key={`played-${card.id}`}
            style={{
              position: 'absolute',
              width: '100px',
              height: '150px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '24px',
              color: '#333',
            }}
            initial={{ y: 0, x: getCardPosition(cards.findIndex(c => c.id === card.id)), rotate: 0, opacity: 1 }}
            animate={{
              y: card.y,
              x: card.x,
              rotate: card.rotate,
              opacity: card.opacity,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setPlayedCards((prev) => prev.filter((c) => c.id !== card.id));
            }}
          >
            {card.id}
          </motion.div>
        ))}
      </motion.div>

      <button
        onClick={handlePlayCards}
        className="absolute bottom-4 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-xl text-white font-bold shadow-xl transition-all duration-300"
        style={{
          cursor: 'pointer',
        }}
      >
        出牌
      </button>
      
      {/* 重置按钮 */}
      {cards.length === 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={resetDemo}
          className="absolute bottom-16 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-white font-bold shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 重置演示
        </motion.button>
      )}
    </div>
  );
};

interface GeminiCardDemoProps {
  cards: GeminiCard[];
}

const GeminiCardDemo: React.FC<GeminiCardDemoProps> = ({ cards }) => {
  return (
    <div className="gemini-card-demo w-full h-full">
      <Hand cards={cards} />
    </div>
  );
};

export default GeminiCardDemo;