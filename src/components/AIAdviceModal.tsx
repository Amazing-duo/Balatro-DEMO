// AI建议弹窗组件

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAdvice } from '../utils/deepseekService';
import { Card } from '../types/game';
import { X, Brain, Target, TrendingUp } from 'lucide-react';

interface AIAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  advice: AIAdvice | null;
  isLoading: boolean;
  error: string | null;
  hand: Card[];
  onApplyAdvice: (cardIds: string[]) => void;
}

/**
 * AI建议弹窗组件
 * @param props 组件属性
 * @returns JSX元素
 */
const AIAdviceModal: React.FC<AIAdviceModalProps> = ({
  isOpen,
  onClose,
  advice,
  isLoading,
  error,
  hand,
  onApplyAdvice
}) => {
  /**
   * 获取推荐卡牌的详细信息
   * @returns 推荐卡牌数组
   */
  const getRecommendedCards = (): Card[] => {
    if (!advice) return [];
    
    return advice.recommendedCards
      .map(cardId => hand.find(card => card.id === cardId))
      .filter((card): card is Card => card !== undefined);
  };
  
  /**
   * 获取花色符号
   * @param suit 花色
   * @returns 花色符号
   */
  const getSuitSymbol = (suit: string): string => {
    const symbols: Record<string, string> = {
      'spades': '♠',
      'hearts': '♥',
      'clubs': '♣',
      'diamonds': '♦'
    };
    return symbols[suit] || suit;
  };
  
  /**
   * 获取牌面名称
   * @param rank 牌面值
   * @returns 牌面名称
   */
  const getRankName = (rank: number): string => {
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return rank.toString();
  };
  
  /**
   * 获取置信度颜色
   * @param confidence 置信度
   * @returns 颜色类名
   */
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  /**
   * 应用AI建议
   */
  const handleApplyAdvice = () => {
    if (advice && advice.recommendedCards.length > 0) {
      onApplyAdvice(advice.recommendedCards);
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-blue-500"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">AI 出牌建议</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="text-center py-8">
                <motion.div
                  className="inline-block w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-gray-300 mt-4">AI正在分析中...</p>
              </div>
            )}
            
            {/* 错误状态 */}
            {error && (
              <div className="text-center py-8">
                <div className="text-red-400 text-4xl mb-4">⚠️</div>
                <p className="text-red-400 mb-4">获取AI建议失败</p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            )}
            
            {/* AI建议内容 */}
            {advice && !isLoading && !error && (
              <div className="space-y-4">
                {/* 推荐卡牌 */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    推荐出牌
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getRecommendedCards().map((card) => (
                      <div
                        key={card.id}
                        className="bg-gray-800 border border-blue-400 rounded px-3 py-1 text-white font-mono"
                      >
                        {getRankName(card.rank)}{getSuitSymbol(card.suit)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 牌型和预期分数 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1">牌型</h4>
                    <p className="text-yellow-400 font-bold">{advice.handType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      预期得分
                    </h4>
                    <p className="text-green-400 font-bold">{advice.expectedScore.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* 置信度 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">置信度</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${advice.confidence * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className={`font-bold ${getConfidenceColor(advice.confidence)}`}>
                      {Math.round(advice.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                {/* 推荐理由 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">推荐理由</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{advice.reasoning}</p>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleApplyAdvice}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    disabled={advice.recommendedCards.length === 0}
                  >
                    应用建议
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAdviceModal;