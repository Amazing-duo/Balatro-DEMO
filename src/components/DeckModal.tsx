import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, Suit } from '../types/game';
import { SUIT_SYMBOLS, RANK_NAMES } from '../types/constants';
import Card from './Card';

interface DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckCards: CardType[];
}

const DeckModal: React.FC<DeckModalProps> = ({ isOpen, onClose, deckCards }) => {

  // 按花色分组卡牌
  const groupCardsBySuit = (cards: CardType[]) => {
    const groups = {
      [Suit.SPADES]: [] as CardType[],
      [Suit.HEARTS]: [] as CardType[],
      [Suit.CLUBS]: [] as CardType[],
      [Suit.DIAMONDS]: [] as CardType[]
    };

    cards.forEach(card => {
      groups[card.suit].push(card);
    });

    // 每个花色按点数排序 (A, K, Q, J, 10, 9, ..., 2)
    Object.keys(groups).forEach(suit => {
      groups[suit as Suit].sort((a, b) => {
        if (a.rank === 1) return -1; // A排在最前
        if (b.rank === 1) return 1;
        return b.rank - a.rank; // 其他按降序排列
      });
    });

    return groups;
  };

  const groupedCards = groupCardsBySuit(deckCards);

  const suitNames = {
    [Suit.SPADES]: '黑桃',
    [Suit.HEARTS]: '红桃',
    [Suit.CLUBS]: '梅花',
    [Suit.DIAMONDS]: '方片'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 弹窗内容 */}
          <motion.div
            className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl z-50 overflow-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* 标题栏 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">牌组预览</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold p-2 sm:p-1 hover:bg-gray-100 rounded touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            {/* 卡牌内容 */}
            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
              {[Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS].map(suit => (
                <div key={suit} className="space-y-2 sm:space-y-3 md:space-y-4">
                  {/* 花色标题 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl md:text-2xl">{SUIT_SYMBOLS[suit]}</span>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                      {suitNames[suit]}
                    </h3>
                  </div>
                  
                  {/* 该花色的所有卡牌 */}
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {groupedCards[suit].map(card => (
                      <div
                        key={card.id}
                        className="relative flex-shrink-0"
                      >
                        <Card
                          card={card}
                          size="small"
                          isPlayable={false}
                          className="transition-all duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 统计信息 */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 sm:p-4">
              <div className="text-center text-sm sm:text-base text-gray-600">
                牌组卡牌: {deckCards.length}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeckModal;