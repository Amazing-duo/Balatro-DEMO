// 卡牌相关工具函数

import { Card, Suit } from '../types/game';
import { STANDARD_DECK_SIZE, CARDS_PER_SUIT, RANK_NAMES, SUIT_SYMBOLS, SUIT_COLORS } from '../types/constants';

/**
 * 创建标准52张扑克牌组
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  const suits = Object.values(Suit);
  
  for (const suit of suits) {
    for (let rank = 1; rank <= CARDS_PER_SUIT; rank++) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        isSelected: false,
        isEnhanced: false
      });
    }
  }
  
  return deck;
}

/**
 * 洗牌算法（Fisher-Yates）
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * 从牌组中发牌
 */
export function dealCards(deck: Card[], count: number): { dealtCards: Card[], remainingDeck: Card[] } {
  if (count > deck.length) {
    throw new Error('Not enough cards in deck');
  }
  
  const dealtCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  
  return { dealtCards, remainingDeck };
}

/**
 * 获取卡牌显示名称
 */
export function getCardDisplayName(card: Card): string {
  return `${RANK_NAMES[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}

/**
 * 获取卡牌颜色
 */
export function getCardColor(card: Card): string {
  return SUIT_COLORS[card.suit];
}

/**
 * 检查卡牌是否为红色
 */
export function isRedCard(card: Card): boolean {
  return getCardColor(card) === 'red';
}

/**
 * 检查卡牌是否为黑色
 */
export function isBlackCard(card: Card): boolean {
  return getCardColor(card) === 'black';
}

/**
 * 检查卡牌是否为人头牌（J、Q、K）
 */
export function isFaceCard(card: Card): boolean {
  return card.rank >= 11 && card.rank <= 13;
}

/**
 * 检查卡牌是否为A
 */
export function isAce(card: Card): boolean {
  return card.rank === 1;
}

/**
 * 获取卡牌在顺子中的值（A可以是1或14）
 */
export function getCardStraightValue(card: Card, aceHigh: boolean = false): number {
  if (card.rank === 1) {
    return aceHigh ? 14 : 1;
  }
  return card.rank;
}

/**
 * 比较两张卡牌的大小
 */
export function compareCards(card1: Card, card2: Card, aceHigh: boolean = true): number {
  const value1 = getCardStraightValue(card1, aceHigh);
  const value2 = getCardStraightValue(card2, aceHigh);
  return value1 - value2;
}

/**
 * 按牌面值排序卡牌
 */
export function sortCardsByRank(cards: Card[], aceHigh: boolean = true): Card[] {
  return [...cards].sort((a, b) => compareCards(a, b, aceHigh));
}

/**
 * 按花色分组卡牌
 */
export function groupCardsBySuit(cards: Card[]): Record<Suit, Card[]> {
  const groups: Record<Suit, Card[]> = {
    [Suit.HEARTS]: [],
    [Suit.DIAMONDS]: [],
    [Suit.CLUBS]: [],
    [Suit.SPADES]: []
  };
  
  for (const card of cards) {
    groups[card.suit].push(card);
  }
  
  return groups;
}

/**
 * 按牌面值分组卡牌
 */
export function groupCardsByRank(cards: Card[]): Record<number, Card[]> {
  const groups: Record<number, Card[]> = {};
  
  for (const card of cards) {
    if (!groups[card.rank]) {
      groups[card.rank] = [];
    }
    groups[card.rank].push(card);
  }
  
  return groups;
}

/**
 * 检查是否为同花
 */
export function isFlush(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  const firstSuit = cards[0].suit;
  return cards.every(card => card.suit === firstSuit);
}

/**
 * 检查是否为顺子
 */
export function isStraight(cards: Card[]): boolean {
  if (cards.length < 5) return false;
  
  const sorted = sortCardsByRank(cards, false);
  
  // 检查低A顺子 (A, 2, 3, 4, 5)
  let isLowAceStraight = true;
  for (let i = 1; i < 5; i++) {
    if (sorted[i].rank !== sorted[i - 1].rank + 1) {
      isLowAceStraight = false;
      break;
    }
  }
  
  if (isLowAceStraight && sorted[0].rank === 1 && sorted[4].rank === 5) {
    return true;
  }
  
  // 检查高A顺子 (10, J, Q, K, A)
  const highSorted = sortCardsByRank(cards, true);
  let isHighAceStraight = true;
  for (let i = 1; i < 5; i++) {
    const current = getCardStraightValue(highSorted[i], true);
    const previous = getCardStraightValue(highSorted[i - 1], true);
    if (current !== previous + 1) {
      isHighAceStraight = false;
      break;
    }
  }
  
  return isHighAceStraight;
}

/**
 * 获取卡牌基础分数
 */
export function getCardBaseScore(card: Card): number {
  // A = 11, 2-10 = 面值, J/Q/K = 10
  if (card.rank === 1) return 11;
  if (card.rank >= 2 && card.rank <= 10) return card.rank;
  return 10;
}

/**
 * 计算手牌总基础分数
 */
export function calculateHandBaseScore(cards: Card[]): number {
  return cards.reduce((total, card) => total + getCardBaseScore(card), 0);
}