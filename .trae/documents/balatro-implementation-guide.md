# Balatro 纯前端版本 - 开发实施指南

## 1. 项目结构设计

```
balatro-frontend/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── cards/          # 扑克牌图片
│   │   │   ├── jokers/         # 小丑牌图片
│   │   │   ├── ui/             # UI 图标
│   │   │   └── backgrounds/    # 背景图片
│   │   ├── sounds/
│   │   │   ├── sfx/            # 音效文件
│   │   │   └── music/          # 背景音乐
│   │   └── fonts/              # 字体文件
│   ├── manifest.json           # PWA 配置
│   └── index.html
├── src/
│   ├── components/             # React 组件
│   │   ├── ui/                 # 通用 UI 组件
│   │   ├── game/               # 游戏相关组件
│   │   ├── menu/               # 菜单组件
│   │   └── shop/               # 商店组件
│   ├── game-engine/            # 游戏引擎核心
│   │   ├── core/               # 核心游戏逻辑
│   │   ├── evaluators/         # 牌型评估器
│   │   ├── effects/            # 小丑牌效果
│   │   └── utils/              # 工具函数
│   ├── stores/                 # 状态管理
│   │   ├── game-store.ts       # 游戏状态
│   │   ├── settings-store.ts   # 设置状态
│   │   └── stats-store.ts      # 统计状态
│   ├── data/                   # 静态数据
│   │   ├── jokers.json         # 小丑牌配置
│   │   ├── cards.json          # 卡牌配置
│   │   └── achievements.json   # 成就配置
│   ├── hooks/                  # 自定义 Hooks
│   ├── utils/                  # 通用工具
│   ├── types/                  # TypeScript 类型定义
│   ├── styles/                 # 样式文件
│   ├── App.tsx                 # 主应用组件
│   └── main.tsx                # 应用入口
├── tests/                      # 测试文件
├── docs/                       # 文档
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 2. 核心模块实现

### 2.1 游戏引擎核心 (game-engine/core/)

```typescript
// game-engine/core/GameEngine.ts
export class GameEngine {
  private state: GameState;
  private handEvaluator: HandEvaluator;
  private jokerManager: JokerManager;
  private deckManager: DeckManager;
  private scoreCalculator: ScoreCalculator;

  constructor() {
    this.handEvaluator = new HandEvaluator();
    this.jokerManager = new JokerManager();
    this.deckManager = new DeckManager();
    this.scoreCalculator = new ScoreCalculator();
    this.initializeGame();
  }

  // 初始化新游戏
  initializeGame(): void {
    this.state = {
      gamePhase: 'playing',
      currentRound: 1,
      targetScore: 300,
      currentScore: 0,
      money: 4,
      deck: this.deckManager.createStandardDeck(),
      hand: [],
      selectedCards: [],
      discardPile: [],
      jokers: [],
      maxJokers: 5,
      handsLeft: 4,
      discardsLeft: 3,
      shopItems: [],
      shopRefreshCost: 2
    };
    this.dealInitialHand();
  }

  // 发初始手牌
  private dealInitialHand(): void {
    this.state.hand = this.deckManager.drawCards(this.state.deck, 8);
  }

  // 选择/取消选择卡牌
  selectCard(cardId: string): void {
    const card = this.state.hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.isSelected) {
      card.isSelected = false;
      this.state.selectedCards = this.state.selectedCards.filter(c => c.id !== cardId);
    } else if (this.state.selectedCards.length < 5) {
      card.isSelected = true;
      this.state.selectedCards.push(card);
    }
  }

  // 出牌
  playHand(): ScoreResult | null {
    if (this.state.selectedCards.length === 0 || this.state.handsLeft <= 0) {
      return null;
    }

    // 评估牌型
    const handType = this.handEvaluator.evaluateHand(this.state.selectedCards);
    
    // 计算基础分数
    const baseScore = this.scoreCalculator.calculateBaseScore(handType, this.state.selectedCards);
    
    // 应用小丑牌效果
    const finalScore = this.jokerManager.applyEffects(baseScore, this.state);
    
    // 更新游戏状态
    this.state.currentScore += finalScore.finalScore;
    this.state.handsLeft--;
    
    // 移除已出的牌
    this.removePlayedCards();
    
    // 检查是否通过当前轮
    if (this.state.currentScore >= this.state.targetScore) {
      this.completeRound();
    }
    
    return finalScore;
  }

  // 弃牌
  discardCards(cardIds: string[]): void {
    if (this.state.discardsLeft <= 0) return;

    cardIds.forEach(cardId => {
      const cardIndex = this.state.hand.findIndex(c => c.id === cardId);
      if (cardIndex !== -1) {
        const card = this.state.hand.splice(cardIndex, 1)[0];
        this.state.discardPile.push(card);
      }
    });

    this.state.discardsLeft--;
    this.drawNewCards(cardIds.length);
  }

  // 补充新牌
  private drawNewCards(count: number): void {
    const newCards = this.deckManager.drawCards(this.state.deck, count);
    this.state.hand.push(...newCards);
  }

  // 完成当前轮
  private completeRound(): void {
    this.state.currentRound++;
    this.state.targetScore = Math.floor(this.state.targetScore * 1.6);
    this.state.handsLeft = 4;
    this.state.discardsLeft = 3;
    this.state.money += 4;
    this.state.gamePhase = 'shop';
  }
}
```

### 2.2 牌型评估器 (game-engine/evaluators/)

```typescript
// game-engine/evaluators/HandEvaluator.ts
export class HandEvaluator {
  evaluateHand(cards: Card[]): HandType {
    if (cards.length === 0) return HandType.HIGH_CARD;

    const sortedCards = this.sortCardsByRank(cards);
    const suits = this.groupBySuit(sortedCards);
    const ranks = this.groupByRank(sortedCards);

    // 检查同花顺
    if (this.isFlush(suits) && this.isStraight(sortedCards)) {
      if (this.isRoyalFlush(sortedCards)) {
        return HandType.ROYAL_FLUSH;
      }
      return HandType.STRAIGHT_FLUSH;
    }

    // 检查四条
    if (this.isFourOfAKind(ranks)) {
      return HandType.FOUR_OF_A_KIND;
    }

    // 检查葫芦
    if (this.isFullHouse(ranks)) {
      return HandType.FULL_HOUSE;
    }

    // 检查同花
    if (this.isFlush(suits)) {
      return HandType.FLUSH;
    }

    // 检查顺子
    if (this.isStraight(sortedCards)) {
      return HandType.STRAIGHT;
    }

    // 检查三条
    if (this.isThreeOfAKind(ranks)) {
      return HandType.THREE_OF_A_KIND;
    }

    // 检查两对
    if (this.isTwoPair(ranks)) {
      return HandType.TWO_PAIR;
    }

    // 检查一对
    if (this.isPair(ranks)) {
      return HandType.PAIR;
    }

    return HandType.HIGH_CARD;
  }

  private sortCardsByRank(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => a.rank - b.rank);
  }

  private groupBySuit(cards: Card[]): Record<string, Card[]> {
    return cards.reduce((groups, card) => {
      if (!groups[card.suit]) groups[card.suit] = [];
      groups[card.suit].push(card);
      return groups;
    }, {} as Record<string, Card[]>);
  }

  private groupByRank(cards: Card[]): Record<number, Card[]> {
    return cards.reduce((groups, card) => {
      if (!groups[card.rank]) groups[card.rank] = [];
      groups[card.rank].push(card);
      return groups;
    }, {} as Record<number, Card[]>);
  }

  private isFlush(suits: Record<string, Card[]>): boolean {
    return Object.values(suits).some(suitCards => suitCards.length >= 5);
  }

  private isStraight(sortedCards: Card[]): boolean {
    if (sortedCards.length < 5) return false;
    
    for (let i = 0; i <= sortedCards.length - 5; i++) {
      let consecutive = 1;
      for (let j = i + 1; j < sortedCards.length; j++) {
        if (sortedCards[j].rank === sortedCards[j-1].rank + 1) {
          consecutive++;
          if (consecutive >= 5) return true;
        } else if (sortedCards[j].rank !== sortedCards[j-1].rank) {
          break;
        }
      }
    }
    return false;
  }

  private isFourOfAKind(ranks: Record<number, Card[]>): boolean {
    return Object.values(ranks).some(rankCards => rankCards.length >= 4);
  }

  private isFullHouse(ranks: Record<number, Card[]>): boolean {
    const rankCounts = Object.values(ranks).map(cards => cards.length).sort((a, b) => b - a);
    return rankCounts[0] >= 3 && rankCounts[1] >= 2;
  }

  private isThreeOfAKind(ranks: Record<number, Card[]>): boolean {
    return Object.values(ranks).some(rankCards => rankCards.length >= 3);
  }

  private isTwoPair(ranks: Record<number, Card[]>): boolean {
    const pairs = Object.values(ranks).filter(rankCards => rankCards.length >= 2);
    return pairs.length >= 2;
  }

  private isPair(ranks: Record<number, Card[]>): boolean {
    return Object.values(ranks).some(rankCards => rankCards.length >= 2);
  }

  private isRoyalFlush(sortedCards: Card[]): boolean {
    const royalRanks = [1, 10, 11, 12, 13]; // A, 10, J, Q, K
    const cardRanks = sortedCards.map(card => card.rank);
    return royalRanks.every(rank => cardRanks.includes(rank));
  }
}
```

### 2.3 小丑牌效果系统 (game-engine/effects/)

```typescript
// game-engine/effects/JokerManager.ts
export class JokerManager {
  private jokerEffects: Map<string, JokerEffect> = new Map();

  constructor() {
    this.loadJokerEffects();
  }

  private loadJokerEffects(): void {
    // 基础倍数小丑牌
    this.jokerEffects.set('basic_multiplier', {
      type: 'multiplier',
      trigger: 'onScore',
      value: 2,
      apply: (score: number) => score * 2
    });

    // 对子加成小丑牌
    this.jokerEffects.set('pair_bonus', {
      type: 'conditional',
      trigger: 'onScore',
      value: 50,
      condition: (gameState: GameState) => {
        const handType = new HandEvaluator().evaluateHand(gameState.selectedCards);
        return handType === HandType.PAIR;
      },
      apply: (score: number, gameState: GameState) => {
        if (this.jokerEffects.get('pair_bonus')?.condition?.(gameState)) {
          return score + 50;
        }
        return score;
      }
    });

    // 同花倍数小丑牌
    this.jokerEffects.set('flush_multiplier', {
      type: 'conditional',
      trigger: 'onScore',
      value: 3,
      condition: (gameState: GameState) => {
        const handType = new HandEvaluator().evaluateHand(gameState.selectedCards);
        return handType === HandType.FLUSH || handType === HandType.STRAIGHT_FLUSH || handType === HandType.ROYAL_FLUSH;
      },
      apply: (score: number, gameState: GameState) => {
        if (this.jokerEffects.get('flush_multiplier')?.condition?.(gameState)) {
          return score * 3;
        }
        return score;
      }
    });

    // 金钱奖励小丑牌
    this.jokerEffects.set('money_maker', {
      type: 'special',
      trigger: 'onScore',
      value: 2,
      apply: (score: number, gameState: GameState) => {
        gameState.money += 2;
        return score;
      }
    });
  }

  applyEffects(baseScore: ScoreResult, gameState: GameState): ScoreResult {
    let finalScore = { ...baseScore };
    const appliedEffects: JokerEffectResult[] = [];

    // 按顺序应用每个小丑牌的效果
    gameState.jokers.forEach(joker => {
      const effect = this.jokerEffects.get(joker.id);
      if (effect && effect.trigger === 'onScore') {
        const oldScore = finalScore.finalScore;
        finalScore.finalScore = effect.apply(finalScore.finalScore, gameState);
        
        appliedEffects.push({
          jokerId: joker.id,
          jokerName: joker.name,
          effectType: effect.type,
          oldValue: oldScore,
          newValue: finalScore.finalScore,
          description: `${joker.name}: ${oldScore} → ${finalScore.finalScore}`
        });
      }
    });

    finalScore.jokerEffects = appliedEffects;
    return finalScore;
  }

  // 添加小丑牌
  addJoker(joker: Joker, gameState: GameState): boolean {
    if (gameState.jokers.length >= gameState.maxJokers) {
      return false;
    }
    
    gameState.jokers.push(joker);
    return true;
  }

  // 移除小丑牌
  removeJoker(jokerId: string, gameState: GameState): boolean {
    const index = gameState.jokers.findIndex(j => j.id === jokerId);
    if (index === -1) return false;
    
    gameState.jokers.splice(index, 1);
    return true;
  }

  // 获取小丑牌效果描述
  getEffectDescription(jokerId: string): string {
    const effect = this.jokerEffects.get(jokerId);
    if (!effect) return '';
    
    switch (effect.type) {
      case 'multiplier':
        return `得分 ×${effect.value}`;
      case 'additive':
        return `得分 +${effect.value}`;
      case 'conditional':
        return `特定条件下激活效果`;
      case 'special':
        return `特殊效果`;
      default:
        return '';
    }
  }
}

// 小丑牌效果结果接口
interface JokerEffectResult {
  jokerId: string;
  jokerName: string;
  effectType: string;
  oldValue: number;
  newValue: number;
  description: string;
}
```

## 3. 状态管理实现

### 3.1 游戏状态 Store

```typescript
// stores/game-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameEngine } from '../game-engine/core/GameEngine';

interface GameStore {
  // 状态
  gameEngine: GameEngine;
  isLoading: boolean;
  error: string | null;
  
  // 动作
  initializeGame: () => void;
  selectCard: (cardId: string) => void;
  playHand: () => void;
  discardCards: (cardIds: string[]) => void;
  enterShop: () => void;
  buyItem: (itemId: string) => void;
  exitShop: () => void;
  saveGame: () => void;
  loadGame: (saveId: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(immer((set, get) => ({
  gameEngine: new GameEngine(),
  isLoading: false,
  error: null,

  initializeGame: () => {
    set(state => {
      state.gameEngine.initializeGame();
      state.error = null;
    });
  },

  selectCard: (cardId: string) => {
    set(state => {
      state.gameEngine.selectCard(cardId);
    });
  },

  playHand: () => {
    set(state => {
      const result = state.gameEngine.playHand();
      if (!result) {
        state.error = '无法出牌：没有选中的牌或回合数不足';
      }
    });
  },

  discardCards: (cardIds: string[]) => {
    set(state => {
      state.gameEngine.discardCards(cardIds);
    });
  },

  enterShop: () => {
    set(state => {
      state.gameEngine.enterShop();
    });
  },

  buyItem: (itemId: string) => {
    set(state => {
      const success = state.gameEngine.buyItem(itemId);
      if (!success) {
        state.error = '购买失败：金币不足或背包已满';
      }
    });
  },

  exitShop: () => {
    set(state => {
      state.gameEngine.exitShop();
    });
  },

  saveGame: () => {
    set(state => {
      state.isLoading = true;
    });
    
    // 异步保存游戏
    setTimeout(() => {
      const gameState = get().gameEngine.getState();
      localStorage.setItem('balatro_save', JSON.stringify(gameState));
      
      set(state => {
        state.isLoading = false;
      });
    }, 500);
  },

  loadGame: (saveId: string) => {
    set(state => {
      state.isLoading = true;
    });
    
    // 异步加载游戏
    setTimeout(() => {
      const savedData = localStorage.getItem('balatro_save');
      if (savedData) {
        const gameState = JSON.parse(savedData);
        get().gameEngine.loadState(gameState);
      }
      
      set(state => {
        state.isLoading = false;
      });
    }, 500);
  },

  resetGame: () => {
    set(state => {
      state.gameEngine = new GameEngine();
      state.error = null;
    });
  }
})));
```

## 4. 开发计划和里程碑

### 4.1 第一阶段：MVP 核心功能 (2-3周)

**Week 1: 基础架构**
- [ ] 项目初始化和环境配置
- [ ] 基础组件库搭建
- [ ] 游戏引擎核心架构
- [ ] 基础卡牌和牌型系统
- [ ] 简单的 UI 界面

**Week 2: 核心玩法**
- [ ] 完整的牌型识别系统
- [ ] 基础小丑牌效果（5-8种）
- [ ] 分数计算和显示
- [ ] 回合控制逻辑
- [ ] 基础动画效果

**Week 3: 完善和测试**
- [ ] 游戏状态持久化
- [ ] 错误处理和边界情况
- [ ] 基础音效集成
- [ ] 单元测试编写
- [ ] 性能优化

### 4.2 第二阶段：功能扩展 (3-4周)

**Week 4-5: 商店系统**
- [ ] 商店界面设计
- [ ] 小丑牌购买系统
- [ ] 道具和升级系统
- [ ] 经济平衡调整

**Week 6: 进阶功能**
- [ ] 更多小丑牌效果（20+种）
- [ ] 成就系统
- [ ] 统计数据追踪
- [ ] 设置和偏好管理

**Week 7: 优化和完善**
- [ ] 高级动画效果
- [ ] 音效和音乐完善
- [ ] 响应式设计优化
- [ ] 性能监控和优化

### 4.3 第三阶段：发布准备 (1-2周)

**Week 8: 发布准备**
- [ ] 全面测试和 Bug 修复
- [ ] 文档完善
- [ ] PWA 功能集成
- [ ] 部署和 CI/CD 配置
- [ ] 用户反馈收集机制

## 5. 关键技术实现细节

### 5.1 卡牌动画系统

```typescript
// components/game/Card.tsx
import { motion } from 'framer-motion';

interface CardProps {
  card: Card;
  isSelected: boolean;
  onSelect: (cardId: string) => void;
  position: { x: number; y: number };
}

export const Card: React.FC<CardProps> = ({ card, isSelected, onSelect, position }) => {
  return (
    <motion.div
      className={`card ${isSelected ? 'selected' : ''}`}
      initial={{ x: 0, y: 0, scale: 1 }}
      animate={{ 
        x: position.x, 
        y: position.y, 
        scale: isSelected ? 1.1 : 1,
        rotateY: isSelected ? 10 : 0
      }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={() => onSelect(card.id)}
    >
      <div className="card-front">
        <div className="card-rank">{card.rank}</div>
        <div className="card-suit">{card.suit}</div>
      </div>
    </motion.div>
  );
};
```

### 5.2 音效管理系统

```typescript
// utils/AudioManager.ts
import { Howl, Howler } from 'howler';

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;

  constructor() {
    this.loadSounds();
  }

  private loadSounds(): void {
    // 加载音效文件
    this.sounds.set('card_select', new Howl({
      src: ['/assets/sounds/sfx/card_select.mp3'],
      volume: this.sfxVolume
    }));

    this.sounds.set('card_play', new Howl({
      src: ['/assets/sounds/sfx/card_play.mp3'],
      volume: this.sfxVolume
    }));

    this.sounds.set('score_count', new Howl({
      src: ['/assets/sounds/sfx/score_count.mp3'],
      volume: this.sfxVolume
    }));

    this.sounds.set('background_music', new Howl({
      src: ['/assets/sounds/music/background.mp3'],
      volume: this.musicVolume,
      loop: true
    }));
  }

  playSound(soundName: string): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = volume;
    const music = this.sounds.get('background_music');
    if (music) {
      music.volume(volume);
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = volume;
    this.sounds.forEach((sound, name) => {
      if (name !== 'background_music') {
        sound.volume(volume);
      }
    });
  }

  playBackgroundMusic(): void {
    const music = this.sounds.get('background_music');
    if (music) {
      music.play();
    }
  }

  stopBackgroundMusic(): void {
    const music = this.sounds.get('background_music');
    if (music) {
      music.stop();
    }
  }
}

export const audioManager = new AudioManager();
```

### 5.3 性能监控

```typescript
// utils/PerformanceMonitor.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(label: string): void {
    performance.mark(`${label}-start`);
  }

  endTiming(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    const duration = measure.duration;
    
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    
    return duration;
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  logPerformanceReport(): void {
    console.group('Performance Report');
    this.metrics.forEach((times, label) => {
      const avg = this.getAverageTime(label);
      const max = Math.max(...times);
      const min = Math.min(...times);
      console.log(`${label}: avg=${avg.toFixed(2)}ms, max=${max.toFixed(2)}ms, min=${min.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

这个实施指南提供了详细的代码结构、核心模块实现、开发计划和关键技术细节，为开发团队提供了完整的技术路线图。