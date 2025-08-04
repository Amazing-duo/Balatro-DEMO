// 牌型识别系统

import { Card, HandType } from '../types/game';
import { 
  sortCardsByRank, 
  groupCardsByRank, 
  groupCardsBySuit, 
  isFlush, 
  isStraight,
  getCardStraightValue
} from '../utils/cardUtils';

/**
 * 牌型识别结果
 */
export interface HandEvaluationResult {
  handType: HandType;
  cards: Card[];
  kickers: Card[]; // 踢脚牌（用于比较同类型牌型的大小）
  rank: number; // 牌型强度排名，数字越大越强
}

/**
 * 牌型识别器
 */
export class HandEvaluator {
  /**
   * 评估手牌类型
   */
  static evaluateHand(cards: Card[]): HandEvaluationResult {
    if (cards.length === 0) {
      throw new Error('Cannot evaluate empty hand');
    }

    // 按优先级从高到低检查牌型
    const evaluators = [
      this.checkRoyalFlush,
      this.checkStraightFlush,
      this.checkFourOfAKind,
      this.checkFullHouse,
      this.checkFlush,
      this.checkStraight,
      this.checkThreeOfAKind,
      this.checkTwoPair,
      this.checkPair,
      this.checkHighCard
    ];

    for (const evaluator of evaluators) {
      const result = evaluator.call(this, cards);
      if (result) {
        return result;
      }
    }

    // 默认返回高牌
    return this.checkHighCard(cards)!;
  }

  /**
   * 检查皇家同花顺 (10, J, Q, K, A 同花)
   */
  private static checkRoyalFlush(cards: Card[]): HandEvaluationResult | null {
    if (cards.length !== 5) return null;

    const straightFlushResult = this.checkStraightFlush(cards);
    if (!straightFlushResult) return null;

    // 检查是否为 10, J, Q, K, A
    const sortedCards = sortCardsByRank(cards, true);
    const ranks = sortedCards.map(card => getCardStraightValue(card, true));
    const isRoyal = ranks.join(',') === '10,11,12,13,14';

    if (isRoyal) {
      return {
        handType: HandType.ROYAL_FLUSH,
        cards: sortedCards,
        kickers: [],
        rank: 10
      };
    }

    return null;
  }

  /**
   * 检查同花顺
   */
  private static checkStraightFlush(cards: Card[]): HandEvaluationResult | null {
    if (cards.length !== 5) return null;

    const isFlushHand = isFlush(cards);
    const isStraightHand = isStraight(cards);

    if (isFlushHand && isStraightHand) {
      const sortedCards = sortCardsByRank(cards, true);
      const highCard = sortedCards[sortedCards.length - 1];
      
      return {
        handType: HandType.STRAIGHT_FLUSH,
        cards: sortedCards,
        kickers: [],
        rank: 9 * 100 + getCardStraightValue(highCard, true)
      };
    }

    return null;
  }

  /**
   * 检查四条
   */
  private static checkFourOfAKind(cards: Card[]): HandEvaluationResult | null {
    const rankGroups = groupCardsByRank(cards);
    const ranks = Object.keys(rankGroups).map(Number);

    for (const rank of ranks) {
      if (rankGroups[rank].length === 4) {
        const fourCards = rankGroups[rank];
        const kickers = cards.filter(card => card.rank !== rank);
        
        return {
          handType: HandType.FOUR_OF_A_KIND,
          cards: fourCards,
          kickers: sortCardsByRank(kickers, true),
          rank: 8 * 100 + rank
        };
      }
    }

    return null;
  }

  /**
   * 检查葫芦（三条+对子）
   */
  private static checkFullHouse(cards: Card[]): HandEvaluationResult | null {
    if (cards.length !== 5) return null;

    const rankGroups = groupCardsByRank(cards);
    const ranks = Object.keys(rankGroups).map(Number);
    
    let threeRank: number | null = null;
    let pairRank: number | null = null;

    for (const rank of ranks) {
      if (rankGroups[rank].length === 3) {
        threeRank = rank;
      } else if (rankGroups[rank].length === 2) {
        pairRank = rank;
      }
    }

    if (threeRank !== null && pairRank !== null) {
      const threeCards = rankGroups[threeRank];
      const pairCards = rankGroups[pairRank];
      
      return {
        handType: HandType.FULL_HOUSE,
        cards: [...threeCards, ...pairCards],
        kickers: [],
        rank: 7 * 100 + threeRank
      };
    }

    return null;
  }

  /**
   * 检查同花
   */
  private static checkFlush(cards: Card[]): HandEvaluationResult | null {
    if (cards.length !== 5) return null;

    if (isFlush(cards)) {
      const sortedCards = sortCardsByRank(cards, true);
      const highCard = sortedCards[sortedCards.length - 1];
      
      return {
        handType: HandType.FLUSH,
        cards: sortedCards,
        kickers: [],
        rank: 6 * 100 + getCardStraightValue(highCard, true)
      };
    }

    return null;
  }

  /**
   * 检查顺子
   */
  private static checkStraight(cards: Card[]): HandEvaluationResult | null {
    if (cards.length !== 5) return null;

    if (isStraight(cards)) {
      const sortedCards = sortCardsByRank(cards, true);
      const highCard = sortedCards[sortedCards.length - 1];
      
      return {
        handType: HandType.STRAIGHT,
        cards: sortedCards,
        kickers: [],
        rank: 5 * 100 + getCardStraightValue(highCard, true)
      };
    }

    return null;
  }

  /**
   * 检查三条
   */
  private static checkThreeOfAKind(cards: Card[]): HandEvaluationResult | null {
    const rankGroups = groupCardsByRank(cards);
    const ranks = Object.keys(rankGroups).map(Number);

    for (const rank of ranks) {
      if (rankGroups[rank].length === 3) {
        const threeCards = rankGroups[rank];
        const kickers = cards.filter(card => card.rank !== rank);
        
        return {
          handType: HandType.THREE_OF_A_KIND,
          cards: threeCards,
          kickers: sortCardsByRank(kickers, true),
          rank: 4 * 100 + rank
        };
      }
    }

    return null;
  }

  /**
   * 检查两对
   */
  private static checkTwoPair(cards: Card[]): HandEvaluationResult | null {
    const rankGroups = groupCardsByRank(cards);
    const ranks = Object.keys(rankGroups).map(Number);
    const pairs: number[] = [];

    for (const rank of ranks) {
      if (rankGroups[rank].length === 2) {
        pairs.push(rank);
      }
    }

    if (pairs.length >= 2) {
      // 取最大的两对
      pairs.sort((a, b) => b - a);
      const highPair = pairs[0];
      const lowPair = pairs[1];
      
      const pairCards = [...rankGroups[highPair], ...rankGroups[lowPair]];
      const kickers = cards.filter(card => !pairs.includes(card.rank));
      
      return {
        handType: HandType.TWO_PAIR,
        cards: pairCards,
        kickers: sortCardsByRank(kickers, true),
        rank: 3 * 100 + highPair * 10 + lowPair
      };
    }

    return null;
  }

  /**
   * 检查对子
   */
  private static checkPair(cards: Card[]): HandEvaluationResult | null {
    const rankGroups = groupCardsByRank(cards);
    const ranks = Object.keys(rankGroups).map(Number);

    for (const rank of ranks) {
      if (rankGroups[rank].length === 2) {
        const pairCards = rankGroups[rank];
        const kickers = cards.filter(card => card.rank !== rank);
        
        return {
          handType: HandType.PAIR,
          cards: pairCards,
          kickers: sortCardsByRank(kickers, true),
          rank: 2 * 100 + rank
        };
      }
    }

    return null;
  }

  /**
   * 检查高牌
   */
  private static checkHighCard(cards: Card[]): HandEvaluationResult {
    const sortedCards = sortCardsByRank(cards, true);
    const highCard = sortedCards[sortedCards.length - 1];
    
    return {
      handType: HandType.HIGH_CARD,
      cards: [highCard],
      kickers: sortedCards.slice(0, -1),
      rank: 1 * 100 + getCardStraightValue(highCard, true)
    };
  }

  /**
   * 比较两个牌型的强弱
   * @param hand1 第一个牌型
   * @param hand2 第二个牌型
   * @returns 正数表示hand1更强，负数表示hand2更强，0表示相等
   */
  static compareHands(hand1: HandEvaluationResult, hand2: HandEvaluationResult): number {
    // 首先比较牌型等级
    const rankDiff = hand1.rank - hand2.rank;
    if (rankDiff !== 0) {
      return rankDiff;
    }

    // 如果牌型等级相同，比较踢脚牌
    const maxKickers = Math.max(hand1.kickers.length, hand2.kickers.length);
    for (let i = 0; i < maxKickers; i++) {
      const kicker1 = hand1.kickers[i];
      const kicker2 = hand2.kickers[i];
      
      if (!kicker1 && !kicker2) continue;
      if (!kicker1) return -1;
      if (!kicker2) return 1;
      
      const kickerDiff = getCardStraightValue(kicker1, true) - getCardStraightValue(kicker2, true);
      if (kickerDiff !== 0) {
        return kickerDiff;
      }
    }

    return 0;
  }

  /**
   * 获取牌型的显示名称
   */
  static getHandTypeName(handType: HandType): string {
    const names: Record<HandType, string> = {
      [HandType.HIGH_CARD]: '高牌',
      [HandType.PAIR]: '对子',
      [HandType.TWO_PAIR]: '两对',
      [HandType.THREE_OF_A_KIND]: '三条',
      [HandType.STRAIGHT]: '顺子',
      [HandType.FLUSH]: '同花',
      [HandType.FULL_HOUSE]: '葫芦',
      [HandType.FOUR_OF_A_KIND]: '四条',
      [HandType.STRAIGHT_FLUSH]: '同花顺',
      [HandType.ROYAL_FLUSH]: '皇家同花顺'
    };
    
    return names[handType] || '未知牌型';
  }
}