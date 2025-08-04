// 分数计算引擎

import { Card, Joker, GameState, ScoreResult, JokerEffectResult, HandTypeConfig } from '../types/game';
import { HandEvaluator, HandEvaluationResult } from './HandEvaluator';
import { calculateHandBaseScore } from '../utils/cardUtils';

/**
 * 分数计算器
 */
export class ScoreCalculator {
  /**
   * 计算手牌得分
   */
  static calculateScore(
    cards: Card[],
    jokers: Joker[],
    handTypeConfigs: Record<string, HandTypeConfig>
  ): ScoreResult {
    if (cards.length === 0) {
      throw new Error('Cannot calculate score for empty hand');
    }

    // 1. 识别牌型
    const handEvaluation = HandEvaluator.evaluateHand(cards);
    const handTypeConfig = handTypeConfigs[handEvaluation.handType];

    // 2. 计算基础分数
    const baseChips = calculateHandBaseScore(cards);
    const handTypeChips = handTypeConfig.baseChips;
    const handTypeMultiplier = handTypeConfig.baseMultiplier;

    // 3. 初始分数计算
    let totalChips = baseChips + handTypeChips;
    let totalMultiplier = handTypeMultiplier;

    // 4. 应用小丑牌效果
    const jokerEffects: JokerEffectResult[] = [];
    
    for (const joker of jokers) {
      const effect = this.applyJokerEffect(joker, cards, handEvaluation, totalChips, totalMultiplier);
      if (effect) {
        jokerEffects.push(effect);
        
        // 根据效果类型更新分数
        switch (joker.effect.type) {
          case 'additive':
            totalChips += effect.value;
            break;
          case 'multiplier':
            totalMultiplier += effect.value;
            break;
          case 'conditional':
          case 'special':
            // 这些效果在 applyJokerEffect 中已经处理
            break;
        }
      }
    }

    // 5. 计算最终分数
    const finalScore = totalChips * totalMultiplier;

    return {
      handType: handEvaluation.handType,
      baseScore: baseChips,
      chips: totalChips,
      multiplier: totalMultiplier,
      finalScore,
      jokerEffects
    };
  }

  /**
   * 应用小丑牌效果
   */
  private static applyJokerEffect(
    joker: Joker,
    cards: Card[],
    handEvaluation: HandEvaluationResult,
    currentChips: number,
    currentMultiplier: number
  ): JokerEffectResult | null {
    const effect = joker.effect;

    // 检查触发条件
    if (effect.trigger !== 'onScore' && effect.trigger !== 'passive') {
      return null;
    }

    // 检查条件函数（如果有）
    if (effect.condition) {
      // 创建临时游戏状态用于条件检查
      const tempGameState: Partial<GameState> = {
        hand: cards,
        selectedCards: cards,
        jokers: [joker]
      };
      
      if (!effect.condition(tempGameState as GameState)) {
        return null;
      }
    }

    // 应用效果
    let effectValue = 0;
    let description = joker.description;

    switch (effect.type) {
      case 'additive':
        effectValue = effect.value;
        description = `+${effectValue} 筹码`;
        break;
        
      case 'multiplier':
        effectValue = effect.value;
        description = `+${effectValue} 倍数`;
        break;
        
      case 'conditional':
        effectValue = this.calculateConditionalEffect(joker, cards, handEvaluation);
        if (effectValue > 0) {
          description = `条件触发: +${effectValue}`;
        }
        break;
        
      case 'special':
        effectValue = this.calculateSpecialEffect(joker, cards, handEvaluation, currentChips, currentMultiplier);
        break;
    }

    if (effectValue === 0) {
      return null;
    }

    return {
      jokerId: joker.id,
      jokerName: joker.name,
      effectType: effect.type,
      value: effectValue,
      description
    };
  }

  /**
   * 计算条件效果
   */
  private static calculateConditionalEffect(
    joker: Joker,
    cards: Card[],
    handEvaluation: HandEvaluationResult
  ): number {
    // 这里可以根据具体的小丑牌实现不同的条件逻辑
    // 例如：特定花色、特定牌型、特定数量等
    
    // 示例：如果是红桃，给予额外分数
    if (joker.name === '红桃爱好者') {
      const heartCards = cards.filter(card => card.suit === 'hearts');
      return heartCards.length * joker.effect.value;
    }
    
    // 示例：如果是对子或更好的牌型
    if (joker.name === '对子专家') {
      const handTypeRank = this.getHandTypeRank(handEvaluation.handType);
      if (handTypeRank >= 2) { // 对子及以上
        return joker.effect.value;
      }
    }
    
    return 0;
  }

  /**
   * 计算特殊效果
   */
  private static calculateSpecialEffect(
    joker: Joker,
    cards: Card[],
    handEvaluation: HandEvaluationResult,
    currentChips: number,
    currentMultiplier: number
  ): number {
    // 特殊效果可能会修改计算方式
    // 例如：基于当前分数的百分比加成、复杂的组合效果等
    
    switch (joker.name) {
      case '百分比加成':
        return Math.floor(currentChips * (joker.effect.value / 100));
        
      case '倍数翻倍':
        return currentMultiplier; // 将当前倍数作为额外倍数
        
      case '幸运七':
        // 如果手牌中有7，给予特殊加成
        const sevenCount = cards.filter(card => card.rank === 7).length;
        return sevenCount * joker.effect.value * 7;
        
      default:
        return joker.effect.value;
    }
  }

  /**
   * 获取牌型等级
   */
  private static getHandTypeRank(handType: string): number {
    const ranks: Record<string, number> = {
      'high_card': 1,
      'pair': 2,
      'two_pair': 3,
      'three_of_a_kind': 4,
      'straight': 5,
      'flush': 6,
      'full_house': 7,
      'four_of_a_kind': 8,
      'straight_flush': 9,
      'royal_flush': 10
    };
    
    return ranks[handType] || 0;
  }

  /**
   * 计算升级后的牌型配置
   */
  static calculateUpgradedHandType(config: HandTypeConfig, levels: number = 1): HandTypeConfig {
    const upgradedConfig = { ...config };
    
    for (let i = 0; i < levels; i++) {
      upgradedConfig.level += 1;
      upgradedConfig.baseChips += Math.floor(upgradedConfig.baseChips * 0.3);
      upgradedConfig.baseMultiplier += 1;
      upgradedConfig.upgradeCost += 1;
    }
    
    return upgradedConfig;
  }

  /**
   * 预览分数计算（不应用实际效果）
   */
  static previewScore(
    cards: Card[],
    jokers: Joker[],
    handTypeConfigs: Record<string, HandTypeConfig>
  ): ScoreResult {
    // 与 calculateScore 相同，但不会触发任何副作用
    return this.calculateScore(cards, jokers, handTypeConfigs);
  }

  /**
   * 计算潜在最佳手牌
   */
  static findBestHand(availableCards: Card[], handSize: number = 5): Card[] {
    if (availableCards.length < handSize) {
      return availableCards;
    }

    let bestHand: Card[] = [];
    let bestScore = -1;

    // 生成所有可能的组合
    const combinations = this.generateCombinations(availableCards, handSize);
    
    for (const combination of combinations) {
      const evaluation = HandEvaluator.evaluateHand(combination);
      if (evaluation.rank > bestScore) {
        bestScore = evaluation.rank;
        bestHand = combination;
      }
    }

    return bestHand;
  }

  /**
   * 生成卡牌组合
   */
  private static generateCombinations(cards: Card[], size: number): Card[][] {
    if (size === 0) return [[]];
    if (cards.length === 0) return [];
    
    const [first, ...rest] = cards;
    const withFirst = this.generateCombinations(rest, size - 1).map(combo => [first, ...combo]);
    const withoutFirst = this.generateCombinations(rest, size);
    
    return [...withFirst, ...withoutFirst];
  }

  /**
   * 获取分数显示信息
   */
  static getScoreDisplayInfo(scoreResult: ScoreResult): {
    chipText: string;
    multiplierText: string;
    totalText: string;
    breakdown: string[];
  } {
    const breakdown: string[] = [];
    
    breakdown.push(`基础筹码: ${scoreResult.baseScore}`);
    breakdown.push(`牌型加成: +${scoreResult.chips - scoreResult.baseScore}`);
    breakdown.push(`基础倍数: ${scoreResult.multiplier}`);
    
    if (scoreResult.jokerEffects.length > 0) {
      breakdown.push('小丑牌效果:');
      scoreResult.jokerEffects.forEach(effect => {
        breakdown.push(`  ${effect.jokerName}: ${effect.description}`);
      });
    }
    
    return {
      chipText: `${scoreResult.chips} 筹码`,
      multiplierText: `${scoreResult.multiplier}x 倍数`,
      totalText: `${scoreResult.finalScore} 分`,
      breakdown
    };
  }
}