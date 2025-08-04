// 小丑牌效果系统

import { Joker, JokerRarity, JokerEffect, GameState, Card } from '../types/game';

/**
 * 小丑牌模板定义
 */
export interface JokerTemplate {
  id: string;
  name: string;
  description: string;
  rarity: JokerRarity;
  baseCost: number;
  sellValueMultiplier: number;
  effectFactory: () => JokerEffect;
}

/**
 * 小丑牌管理器
 */
export class JokerManager {
  private static jokerTemplates: Map<string, JokerTemplate> = new Map();

  /**
   * 初始化小丑牌模板
   */
  static initialize() {
    this.registerDefaultJokers();
  }

  /**
   * 注册小丑牌模板
   */
  static registerJoker(template: JokerTemplate) {
    this.jokerTemplates.set(template.id, template);
  }

  /**
   * 创建小丑牌实例
   */
  static createJoker(templateId: string): Joker | null {
    const template = this.jokerTemplates.get(templateId);
    if (!template) {
      console.warn(`Joker template not found: ${templateId}`);
      return null;
    }

    return {
      id: `${templateId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      rarity: template.rarity,
      cost: template.baseCost,
      effect: template.effectFactory(),
      sellValue: Math.floor(template.baseCost * template.sellValueMultiplier)
    };
  }

  /**
   * 获取所有小丑牌模板
   */
  static getAllTemplates(): JokerTemplate[] {
    return Array.from(this.jokerTemplates.values());
  }

  /**
   * 根据稀有度获取小丑牌模板
   */
  static getTemplatesByRarity(rarity: JokerRarity): JokerTemplate[] {
    return this.getAllTemplates().filter(template => template.rarity === rarity);
  }

  /**
   * 随机获取小丑牌模板
   */
  static getRandomTemplate(rarityWeights?: Record<JokerRarity, number>): JokerTemplate | null {
    const templates = this.getAllTemplates();
    if (templates.length === 0) return null;

    if (!rarityWeights) {
      // 默认权重
      rarityWeights = {
        [JokerRarity.COMMON]: 50,
        [JokerRarity.UNCOMMON]: 30,
        [JokerRarity.RARE]: 15,
        [JokerRarity.LEGENDARY]: 5
      };
    }

    // 根据稀有度权重选择
    const weightedTemplates: JokerTemplate[] = [];
    
    for (const template of templates) {
      const weight = rarityWeights[template.rarity] || 1;
      for (let i = 0; i < weight; i++) {
        weightedTemplates.push(template);
      }
    }

    const randomIndex = Math.floor(Math.random() * weightedTemplates.length);
    return weightedTemplates[randomIndex];
  }

  /**
   * 注册默认小丑牌
   */
  private static registerDefaultJokers() {
    // 普通稀有度小丑牌
    this.registerJoker({
      id: 'joker_basic_mult',
      name: '基础倍数',
      description: '+4 倍数',
      rarity: JokerRarity.COMMON,
      baseCost: 2,
      sellValueMultiplier: 0.5,
      effectFactory: () => ({
        type: 'multiplier',
        trigger: 'onScore',
        value: 4,
        apply: (score: number) => score
      })
    });

    this.registerJoker({
      id: 'joker_basic_chips',
      name: '基础筹码',
      description: '+30 筹码',
      rarity: JokerRarity.COMMON,
      baseCost: 2,
      sellValueMultiplier: 0.5,
      effectFactory: () => ({
        type: 'additive',
        trigger: 'onScore',
        value: 30,
        apply: (score: number) => score
      })
    });

    this.registerJoker({
      id: 'joker_hearts_lover',
      name: '红桃爱好者',
      description: '每张红桃牌 +3 倍数',
      rarity: JokerRarity.COMMON,
      baseCost: 3,
      sellValueMultiplier: 0.5,
      effectFactory: () => ({
        type: 'conditional',
        trigger: 'onScore',
        value: 3,
        condition: (gameState: GameState) => {
          return gameState.selectedCards.some(card => card.suit === 'hearts');
        },
        apply: (score: number, gameState: GameState) => {
          const heartCards = gameState.selectedCards.filter(card => card.suit === 'hearts');
          return score + (heartCards.length * 3);
        }
      })
    });

    // 不常见稀有度小丑牌
    this.registerJoker({
      id: 'joker_pair_expert',
      name: '对子专家',
      description: '对子或更好的牌型 +50 筹码',
      rarity: JokerRarity.UNCOMMON,
      baseCost: 5,
      sellValueMultiplier: 0.6,
      effectFactory: () => ({
        type: 'conditional',
        trigger: 'onScore',
        value: 50,
        condition: (gameState: GameState) => {
          // 这里需要检查当前牌型是否为对子或更好
          return gameState.selectedCards.length >= 2;
        },
        apply: (score: number) => score + 50
      })
    });

    this.registerJoker({
      id: 'joker_face_card_bonus',
      name: '人头牌奖励',
      description: '每张人头牌 +2 倍数',
      rarity: JokerRarity.UNCOMMON,
      baseCost: 4,
      sellValueMultiplier: 0.6,
      effectFactory: () => ({
        type: 'conditional',
        trigger: 'onScore',
        value: 2,
        condition: (gameState: GameState) => {
          return gameState.selectedCards.some(card => card.rank >= 11);
        },
        apply: (score: number, gameState: GameState) => {
          const faceCards = gameState.selectedCards.filter(card => card.rank >= 11);
          return score + (faceCards.length * 2);
        }
      })
    });

    // 稀有小丑牌
    this.registerJoker({
      id: 'joker_lucky_seven',
      name: '幸运七',
      description: '每张7 +77 筹码',
      rarity: JokerRarity.RARE,
      baseCost: 8,
      sellValueMultiplier: 0.7,
      effectFactory: () => ({
        type: 'conditional',
        trigger: 'onScore',
        value: 77,
        condition: (gameState: GameState) => {
          return gameState.selectedCards.some(card => card.rank === 7);
        },
        apply: (score: number, gameState: GameState) => {
          const sevenCards = gameState.selectedCards.filter(card => card.rank === 7);
          return score + (sevenCards.length * 77);
        }
      })
    });

    this.registerJoker({
      id: 'joker_flush_master',
      name: '同花大师',
      description: '同花牌型 x3 倍数',
      rarity: JokerRarity.RARE,
      baseCost: 10,
      sellValueMultiplier: 0.7,
      effectFactory: () => ({
        type: 'conditional',
        trigger: 'onScore',
        value: 3,
        condition: (gameState: GameState) => {
          // 检查是否为同花
          if (gameState.selectedCards.length < 5) return false;
          const firstSuit = gameState.selectedCards[0].suit;
          return gameState.selectedCards.every(card => card.suit === firstSuit);
        },
        apply: (score: number) => score * 3
      })
    });

    // 传说稀有度小丑牌
    this.registerJoker({
      id: 'joker_golden_ticket',
      name: '黄金门票',
      description: '每轮 +1$ 并且 +10 倍数',
      rarity: JokerRarity.LEGENDARY,
      baseCost: 20,
      sellValueMultiplier: 0.8,
      effectFactory: () => ({
        type: 'special',
        trigger: 'passive',
        value: 10,
        apply: (score: number, gameState: GameState) => {
          // 特殊效果：每轮增加金钱和倍数
          return score + 10;
        }
      })
    });

    this.registerJoker({
      id: 'joker_chaos_multiplier',
      name: '混沌倍数器',
      description: '随机 x2 到 x10 倍数',
      rarity: JokerRarity.LEGENDARY,
      baseCost: 25,
      sellValueMultiplier: 0.8,
      effectFactory: () => ({
        type: 'special',
        trigger: 'onScore',
        value: 0, // 动态计算
        apply: (score: number) => {
          const randomMultiplier = Math.floor(Math.random() * 9) + 2; // 2-10
          return score * randomMultiplier;
        }
      })
    });
  }

  /**
   * 生成商店小丑牌
   */
  static generateShopJokers(count: number = 2): Joker[] {
    const jokers: Joker[] = [];
    
    for (let i = 0; i < count; i++) {
      const template = this.getRandomTemplate();
      if (template) {
        const joker = this.createJoker(template.id);
        if (joker) {
          jokers.push(joker);
        }
      }
    }
    
    return jokers;
  }

  /**
   * 计算小丑牌价值
   */
  static calculateJokerValue(joker: Joker): number {
    let baseValue = joker.cost;
    
    // 根据稀有度调整价值
    switch (joker.rarity) {
      case JokerRarity.COMMON:
        baseValue *= 1;
        break;
      case JokerRarity.UNCOMMON:
        baseValue *= 1.5;
        break;
      case JokerRarity.RARE:
        baseValue *= 2;
        break;
      case JokerRarity.LEGENDARY:
        baseValue *= 3;
        break;
    }
    
    return Math.floor(baseValue);
  }

  /**
   * 检查小丑牌是否可以触发
   */
  static canTriggerJoker(joker: Joker, gameState: GameState, trigger: string): boolean {
    if (joker.effect.trigger !== trigger) {
      return false;
    }
    
    if (joker.effect.condition) {
      return joker.effect.condition(gameState);
    }
    
    return true;
  }

  /**
   * 获取小丑牌效果描述
   */
  static getJokerEffectDescription(joker: Joker): string {
    let description = joker.description;
    
    // 根据效果类型添加详细说明
    switch (joker.effect.type) {
      case 'additive':
        description += ` (增加 ${joker.effect.value} 筹码)`;
        break;
      case 'multiplier':
        description += ` (增加 ${joker.effect.value} 倍数)`;
        break;
      case 'conditional':
        description += ' (条件触发)';
        break;
      case 'special':
        description += ' (特殊效果)';
        break;
    }
    
    return description;
  }
}

// 初始化小丑牌系统
JokerManager.initialize();