// 游戏核心类型定义

// 花色枚举
export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

// 牌型枚举
export enum HandType {
  HIGH_CARD = 'high_card',
  PAIR = 'pair',
  TWO_PAIR = 'two_pair',
  THREE_OF_A_KIND = 'three_of_a_kind',
  STRAIGHT = 'straight',
  FLUSH = 'flush',
  FULL_HOUSE = 'full_house',
  FOUR_OF_A_KIND = 'four_of_a_kind',
  STRAIGHT_FLUSH = 'straight_flush',
  ROYAL_FLUSH = 'royal_flush'
}

// 游戏阶段枚举
export enum GamePhase {
  MENU = 'menu',
  PLAYING = 'playing',
  SHOP = 'shop',
  GAME_OVER = 'gameOver',
  GAME_COMPLETED = 'gameCompleted'
}

// 小丑牌稀有度枚举
export enum JokerRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  LEGENDARY = 'legendary'
}

// 卡牌接口
export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 1-13 (A, 2-10, J, Q, K)
  isSelected: boolean;
  isEnhanced: boolean;
  enhancement?: Enhancement;
  isStone?: boolean;
  isSteel?: boolean;
  isGlass?: boolean;
  isGold?: boolean;
}

// 卡牌增强类型
export interface Enhancement {
  type: 'bonus' | 'mult' | 'wild' | 'glass' | 'steel';
  value: number;
}

// 小丑牌效果接口
export interface JokerEffect {
  type: 'multiplier' | 'additive' | 'conditional' | 'special';
  trigger: 'onScore' | 'onDiscard' | 'onDraw' | 'passive';
  value: number;
  condition?: (gameState: GameState) => boolean;
  apply: (score: number, gameState: GameState) => number;
}

// 小丑牌接口
export interface Joker {
  id: string;
  name: string;
  description: string;
  rarity: JokerRarity;
  cost: number;
  effect: JokerEffect;
  sellValue: number;
  timesTriggered?: number;
  isEternal?: boolean;
  isPerishable?: boolean;
  isRental?: boolean;
}

// 牌型配置接口
export interface HandTypeConfig {
  name: string;
  baseChips: number;
  baseMultiplier: number;
  level: number;
  upgradeCost: number;
}

// 分数计算结果接口
export interface ScoreResult {
  handType: HandType;
  baseScore: number;
  chips: number;
  multiplier: number;
  finalScore: number;
  jokerEffects: JokerEffectResult[];
}

// 小丑牌效果结果接口
export interface JokerEffectResult {
  jokerId: string;
  jokerName: string;
  effectType: string;
  value: number;
  description: string;
}

// 商店物品接口
export interface ShopItem {
  id: string;
  type: 'joker' | 'consumable' | 'voucher';
  item: Joker | Consumable | Voucher;
  cost: number;
}

// 消耗品接口
export interface Consumable {
  id: string;
  name: string;
  description: string;
  effect: () => void;
}

// 优惠券接口
export interface Voucher {
  id: string;
  name: string;
  description: string;
  effect: () => void;
}

// 游戏统计接口
export interface GameStatistics {
  highScore: number;
  totalGames: number;
  totalWins: number;
  totalPlayTime: number;
  averageScore: number;
  bestRound: number;
  achievements: Achievement[];
  jokerStats: Record<string, JokerUsageStats>;
}

// 成就接口
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

// 小丑牌使用统计接口
export interface JokerUsageStats {
  timesUsed: number;
  totalScoreContribution: number;
  averageContribution: number;
}

// 游戏主状态接口
export interface GameState {
  // 游戏基础状态
  gamePhase: GamePhase;
  currentRound: number;
  targetScore: number;
  currentScore: number;
  money: number;
  isGameCompleted: boolean;
  
  // 卡牌相关
  deck: Card[];
  hand: Card[];
  selectedCards: Card[];
  discardPile: Card[];
  
  // 小丑牌系统
  jokers: Joker[];
  maxJokers: number;
  
  // 回合控制
  handsLeft: number;
  discardsLeft: number;
  
  // 商店状态
  shopItems: ShopItem[];
  shopRefreshCost: number;
  
  // 牌型等级
  handTypeConfigs: Record<HandType, HandTypeConfig>;
  
  // 游戏设置
  settings: GameSettings;
}

// 游戏设置接口
export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  autoSave: boolean;
  showTutorial: boolean;
  language: 'zh-CN' | 'en-US';
}

// 游戏存档接口
export interface GameSave {
  id: string;
  name: string;
  gameState: GameState;
  statistics: GameStatistics;
  createdAt: Date;
  updatedAt: Date;
  isAutoSave: boolean;
}