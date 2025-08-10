// 游戏常量定义

import { HandType, HandTypeConfig, Suit } from './game';

// 标准扑克牌组
export const STANDARD_DECK_SIZE = 52;
export const CARDS_PER_SUIT = 13;
export const INITIAL_HAND_SIZE = 8;
export const MAX_HAND_SIZE = 5;

// 游戏初始值
export const INITIAL_MONEY = 4;
export const INITIAL_HANDS = 4;
export const INITIAL_DISCARDS = 3;
export const INITIAL_MAX_JOKERS = 5;
export const SHOP_SIZE = 2;
export const INITIAL_SHOP_REFRESH_COST = 2;

// 分数相关
export const BASE_ANTE_SCORE = 300;
export const ANTE_SCORE_MULTIPLIER = 1.6;
export const LEVEL_SCORE_INCREMENT = 150; // 每关分数增量
export const MAX_LEVELS = 8; // 最大关卡数

// 花色显示名称
export const SUIT_NAMES: Record<Suit, string> = {
  [Suit.HEARTS]: '红桃',
  [Suit.DIAMONDS]: '方块',
  [Suit.CLUBS]: '梅花',
  [Suit.SPADES]: '黑桃'
};

// 花色符号
export const SUIT_SYMBOLS: Record<Suit, string> = {
  [Suit.HEARTS]: '♥',
  [Suit.DIAMONDS]: '♦',
  [Suit.CLUBS]: '♣',
  [Suit.SPADES]: '♠'
};

// 花色颜色
export const SUIT_COLORS: Record<Suit, string> = {
  [Suit.HEARTS]: 'red',
  [Suit.DIAMONDS]: 'yellow',
  [Suit.CLUBS]: 'green',
  [Suit.SPADES]: 'black'
};

// 花色CSS类名
export const SUIT_CSS_COLORS: Record<Suit, string> = {
  [Suit.HEARTS]: 'text-red-500',
  [Suit.DIAMONDS]: 'text-yellow-500',
  [Suit.CLUBS]: 'text-green-600',
  [Suit.SPADES]: 'text-gray-800'
};

// 牌面值显示名称
export const RANK_NAMES: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K'
};

// 牌型显示名称
export const HAND_TYPE_NAMES: Record<HandType, string> = {
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

// 初始牌型配置
export const INITIAL_HAND_TYPE_CONFIGS: Record<HandType, HandTypeConfig> = {
  [HandType.HIGH_CARD]: {
    name: '高牌',
    baseChips: 5,
    baseMultiplier: 1,
    level: 1,
    upgradeCost: 3
  },
  [HandType.PAIR]: {
    name: '对子',
    baseChips: 10,
    baseMultiplier: 2,
    level: 1,
    upgradeCost: 3
  },
  [HandType.TWO_PAIR]: {
    name: '两对',
    baseChips: 20,
    baseMultiplier: 2,
    level: 1,
    upgradeCost: 3
  },
  [HandType.THREE_OF_A_KIND]: {
    name: '三条',
    baseChips: 30,
    baseMultiplier: 3,
    level: 1,
    upgradeCost: 4
  },
  [HandType.STRAIGHT]: {
    name: '顺子',
    baseChips: 30,
    baseMultiplier: 4,
    level: 1,
    upgradeCost: 4
  },
  [HandType.FLUSH]: {
    name: '同花',
    baseChips: 35,
    baseMultiplier: 4,
    level: 1,
    upgradeCost: 4
  },
  [HandType.FULL_HOUSE]: {
    name: '葫芦',
    baseChips: 40,
    baseMultiplier: 4,
    level: 1,
    upgradeCost: 5
  },
  [HandType.FOUR_OF_A_KIND]: {
    name: '四条',
    baseChips: 60,
    baseMultiplier: 7,
    level: 1,
    upgradeCost: 5
  },
  [HandType.STRAIGHT_FLUSH]: {
    name: '同花顺',
    baseChips: 100,
    baseMultiplier: 8,
    level: 1,
    upgradeCost: 6
  },
  [HandType.ROYAL_FLUSH]: {
    name: '皇家同花顺',
    baseChips: 100,
    baseMultiplier: 8,
    level: 1,
    upgradeCost: 6
  }
};

// 小丑牌稀有度颜色
export const RARITY_COLORS = {
  common: '#9ca3af',     // gray-400
  uncommon: '#22c55e',   // green-500
  rare: '#3b82f6',      // blue-500
  legendary: '#f59e0b'   // amber-500
};

// 动画持续时间（毫秒）
export const ANIMATION_DURATIONS = {
  CARD_FLIP: 300,
  CARD_DEAL: 150,
  CARD_SELECT: 200,
  SCORE_COUNT: 1000,
  JOKER_EFFECT: 500
};

// 音效文件路径
export const SOUND_PATHS = {
  CARD_FLIP: '/sounds/card-flip.mp3',
  CARD_SELECT: '/sounds/card-select.mp3',
  SCORE_COUNT: '/sounds/score-count.mp3',
  JOKER_ACTIVATE: '/sounds/joker-activate.mp3',
  SHOP_BUY: '/sounds/shop-buy.mp3',
  GAME_WIN: '/sounds/game-win.mp3',
  GAME_LOSE: '/sounds/game-lose.mp3'
};

// 本地存储键名
export const STORAGE_KEYS = {
  GAME_SETTINGS: 'balatro_settings',
  GAME_SAVES: 'balatro_saves',
  STATISTICS: 'balatro_statistics'
};