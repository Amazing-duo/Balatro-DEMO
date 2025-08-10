// DeepSeek AI 服务模块

import { Card, Joker, HandTypeConfig } from '../types/game';
import { HandEvaluator } from '../game-engine/HandEvaluator';
import { ScoreCalculator } from '../game-engine/ScoreCalculator';

/**
 * AI建议响应接口
 */
export interface AIAdvice {
  recommendedCards: string[]; // 推荐出牌的卡牌ID
  reasoning: string; // 推荐理由
  expectedScore: number; // 预期得分
  handType: string; // 牌型
  confidence: number; // 置信度 (0-1)
}

/**
 * 游戏状态数据接口
 */
interface GameStateData {
  hand: Card[];
  jokers: Joker[];
  handTypeConfigs: Record<string, HandTypeConfig>;
  currentScore: number;
  targetScore: number;
  handsLeft: number;
  discardsLeft: number;
}

/**
 * DeepSeek API服务类
 */
export class DeepSeekService {
  private static readonly API_URL = 'https://api.deepseek.com/v1/chat/completions';
  private static readonly MODEL = 'deepseek-chat';
  
  /**
   * 获取AI出牌建议
   * @param gameState 当前游戏状态
   * @returns AI建议
   */
  static async getPlayAdvice(gameState: GameStateData): Promise<AIAdvice> {
    try {
      // 构建游戏状态描述
      const gameDescription = this.buildGameDescription(gameState);
      
      // 构建提示词
      const prompt = this.buildPrompt(gameDescription, gameState);
      
      // 调用DeepSeek API
      const response = await this.callDeepSeekAPI(prompt);
      
      // 解析AI响应
      const advice = this.parseAIResponse(response, gameState);
      
      return advice;
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      
      // 返回智能模拟建议
      return this.getSmartFallbackAdvice(gameState);
    }
  }
  
  /**
   * 构建游戏状态描述
   * @param gameState 游戏状态
   * @returns 游戏状态描述文本
   */
  private static buildGameDescription(gameState: GameStateData): string {
    const { hand, jokers, currentScore, targetScore, handsLeft, discardsLeft } = gameState;
    
    // 手牌描述
    const handDescription = hand.map(card => {
      const suitSymbol = this.getSuitSymbol(card.suit);
      const rankName = this.getRankName(card.rank);
      return `${rankName}${suitSymbol}`;
    }).join(', ');
    
    // 小丑牌描述
    const jokersDescription = jokers.length > 0 
      ? jokers.map(joker => `${joker.name}(${joker.description})`).join(', ')
      : '无';
    
    // 分析所有可能的出牌组合
    const possibleHands = this.analyzePossibleHands(hand, gameState.handTypeConfigs, jokers);
    
    return `
当前游戏状态：
- 手牌: ${handDescription}
- 小丑牌: ${jokersDescription}
- 当前分数: ${currentScore}
- 目标分数: ${targetScore}
- 剩余出牌次数: ${handsLeft}
- 剩余弃牌次数: ${discardsLeft}

可能的出牌组合分析：
${possibleHands}
    `.trim();
  }
  
  /**
   * 分析所有可能的出牌组合
   * @param hand 手牌
   * @param handTypeConfigs 牌型配置
   * @param jokers 小丑牌
   * @returns 分析结果
   */
  private static analyzePossibleHands(
    hand: Card[], 
    handTypeConfigs: Record<string, HandTypeConfig>,
    jokers: Joker[]
  ): string {
    const combinations: Array<{cards: Card[], score: number, handType: string}> = [];
    
    // 分析1-5张牌的所有组合
    for (let size = 1; size <= Math.min(5, hand.length); size++) {
      const combos = this.getCombinations(hand, size);
      
      for (const combo of combos) {
        try {
          const scoreResult = ScoreCalculator.calculateScore(combo, jokers, handTypeConfigs);
          combinations.push({
            cards: combo,
            score: scoreResult.finalScore,
            handType: scoreResult.handType
          });
        } catch (error) {
          // 忽略无效组合
        }
      }
    }
    
    // 按分数排序，取前5个
    combinations.sort((a, b) => b.score - a.score);
    const topCombinations = combinations.slice(0, 5);
    
    return topCombinations.map((combo, index) => {
      const cardsDesc = combo.cards.map(card => 
        `${this.getRankName(card.rank)}${this.getSuitSymbol(card.suit)}`
      ).join(', ');
      return `${index + 1}. ${combo.handType}: [${cardsDesc}] - ${combo.score}分`;
    }).join('\n');
  }
  
  /**
   * 获取组合
   * @param arr 数组
   * @param size 组合大小
   * @returns 组合数组
   */
  private static getCombinations<T>(arr: T[], size: number): T[][] {
    if (size === 1) return arr.map(item => [item]);
    if (size > arr.length) return [];
    
    const result: T[][] = [];
    
    for (let i = 0; i <= arr.length - size; i++) {
      const head = arr[i];
      const tailCombos = this.getCombinations(arr.slice(i + 1), size - 1);
      
      for (const tailCombo of tailCombos) {
        result.push([head, ...tailCombo]);
      }
    }
    
    return result;
  }
  
  /**
   * 构建AI提示词
   * @param gameDescription 游戏状态描述
   * @param gameState 游戏状态
   * @returns 提示词
   */
  private static buildPrompt(gameDescription: string, gameState: GameStateData): string {
    return `
你是一个专业的Balatro扑克游戏AI助手。请根据以下游戏状态，为玩家推荐最佳的出牌策略。

${gameDescription}

请分析当前局面并提供建议：
1. 推荐出哪些牌（用卡牌ID或描述）
2. 详细说明推荐理由
3. 预期能获得多少分数
4. 这个组合的牌型是什么
5. 对这个建议的置信度（0-100%）

考虑因素：
- 当前分数与目标分数的差距
- 剩余出牌次数
- 小丑牌的效果加成
- 风险与收益的平衡

请用JSON格式回复，格式如下：
{
  "recommendedCards": ["推荐的卡牌描述"],
  "reasoning": "推荐理由",
  "expectedScore": 预期分数,
  "handType": "牌型名称",
  "confidence": 置信度(0-1)
}
    `.trim();
  }
  
  /**
   * 调用DeepSeek API
   * @param prompt 提示词
   * @returns API响应
   */
  private static async callDeepSeekAPI(prompt: string): Promise<string> {
    // DeepSeek API密钥
    const apiKey = 'sk-2940e49eb8f446ab82861c5faf7b6693';
    
    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }
    
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
  
  /**
   * 解析AI响应
   * @param response AI响应文本
   * @param gameState 游戏状态
   * @returns 解析后的建议
   */
  private static parseAIResponse(response: string, gameState: GameStateData): AIAdvice {
    try {
      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // 将卡牌描述转换为卡牌ID
        const recommendedCardIds = this.matchCardsToIds(parsed.recommendedCards, gameState.hand);
        
        return {
          recommendedCards: recommendedCardIds,
          reasoning: parsed.reasoning || '无具体理由',
          expectedScore: parsed.expectedScore || 0,
          handType: parsed.handType || '未知',
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
        };
      }
    } catch (error) {
      console.error('解析AI响应失败:', error);
    }
    
    // 如果解析失败，返回备用建议
    return this.getFallbackAdvice(gameState);
  }
  
  /**
   * 将卡牌描述匹配到卡牌ID
   * @param cardDescriptions 卡牌描述数组
   * @param hand 手牌
   * @returns 卡牌ID数组
   */
  private static matchCardsToIds(cardDescriptions: string[], hand: Card[]): string[] {
    const cardIds: string[] = [];
    
    for (const desc of cardDescriptions) {
      const matchedCard = hand.find(card => {
        const cardDesc = `${this.getRankName(card.rank)}${this.getSuitSymbol(card.suit)}`;
        return desc.includes(cardDesc) || cardDesc.includes(desc);
      });
      
      if (matchedCard) {
        cardIds.push(matchedCard.id);
      }
    }
    
    return cardIds;
  }
  
  /**
   * 获取智能模拟建议（当AI调用失败时）
   * @param gameState 游戏状态
   * @returns 智能模拟建议
   */
  private static getSmartFallbackAdvice(gameState: GameStateData): AIAdvice {
    const { hand, jokers, handTypeConfigs, currentScore, targetScore, handsLeft } = gameState;
    
    // 分析所有可能的组合
    const allCombinations = this.analyzeAllCombinations(hand, jokers, handTypeConfigs);
    
    // 根据游戏状态选择策略
    const strategy = this.determineStrategy(gameState);
    
    // 根据策略选择最佳组合
    const bestCombo = this.selectBestCombo(allCombinations, strategy, gameState);
    
    if (bestCombo) {
      const reasoning = this.generateReasoning(bestCombo, strategy, gameState, jokers);
      
      return {
        recommendedCards: bestCombo.cards.map(card => card.id),
        reasoning: `[模拟AI建议] ${reasoning}`,
        expectedScore: bestCombo.score,
        handType: bestCombo.handType,
        confidence: bestCombo.confidence
      };
    }
    
    // 如果没有找到有效组合，推荐第一张牌
    return {
      recommendedCards: hand.length > 0 ? [hand[0].id] : [],
      reasoning: '[模拟AI建议] 当前手牌无法形成有效组合，建议出单张牌',
      expectedScore: 0,
      handType: '高牌',
      confidence: 0.3
    };
  }
  
  /**
   * 分析所有可能的组合
   * @param hand 手牌
   * @param jokers 小丑牌
   * @param handTypeConfigs 牌型配置
   * @returns 所有组合的分析结果
   */
  private static analyzeAllCombinations(
    hand: Card[], 
    jokers: Joker[], 
    handTypeConfigs: Record<string, HandTypeConfig>
  ): Array<{cards: Card[], score: number, handType: string, efficiency: number}> {
    const combinations: Array<{cards: Card[], score: number, handType: string, efficiency: number}> = [];
    
    for (let size = 1; size <= Math.min(5, hand.length); size++) {
      const combos = this.getCombinations(hand, size);
      
      for (const combo of combos) {
        try {
          const scoreResult = ScoreCalculator.calculateScore(combo, jokers, handTypeConfigs);
          const efficiency = scoreResult.finalScore / combo.length; // 每张牌的平均得分
          
          combinations.push({
            cards: combo,
            score: scoreResult.finalScore,
            handType: scoreResult.handType,
            efficiency
          });
        } catch (error) {
          // 忽略无效组合
        }
      }
    }
    
    return combinations;
  }
  
  /**
   * 确定游戏策略
   * @param gameState 游戏状态
   * @returns 策略类型
   */
  private static determineStrategy(gameState: GameStateData): 'aggressive' | 'conservative' | 'balanced' {
    const { currentScore, targetScore, handsLeft } = gameState;
    const scoreGap = targetScore - currentScore;
    const averageNeeded = scoreGap / handsLeft;
    
    if (handsLeft <= 2 && scoreGap > 0) {
      return 'aggressive'; // 剩余次数少，需要激进策略
    } else if (averageNeeded <= 50) {
      return 'conservative'; // 目标容易达到，保守策略
    } else {
      return 'balanced'; // 平衡策略
    }
  }
  
  /**
   * 根据策略选择最佳组合
   * @param combinations 所有组合
   * @param strategy 策略
   * @param gameState 游戏状态
   * @returns 最佳组合
   */
  private static selectBestCombo(
    combinations: Array<{cards: Card[], score: number, handType: string, efficiency: number}>,
    strategy: string,
    gameState: GameStateData
  ): {cards: Card[], score: number, handType: string, confidence: number} | null {
    if (combinations.length === 0) return null;
    
    let selectedCombo;
    let confidence = 0.7;
    
    switch (strategy) {
      case 'aggressive':
        // 选择得分最高的组合
        selectedCombo = combinations.reduce((best, current) => 
          current.score > best.score ? current : best
        );
        confidence = 0.8;
        break;
        
      case 'conservative':
        // 选择效率最高的组合（每张牌平均得分最高）
        selectedCombo = combinations.reduce((best, current) => 
          current.efficiency > best.efficiency ? current : best
        );
        confidence = 0.9;
        break;
        
      case 'balanced':
      default:
        // 平衡考虑得分和效率
        selectedCombo = combinations.reduce((best, current) => {
          const currentValue = current.score * 0.7 + current.efficiency * 0.3;
          const bestValue = best.score * 0.7 + best.efficiency * 0.3;
          return currentValue > bestValue ? current : best;
        });
        confidence = 0.75;
        break;
    }
    
    return {
      cards: selectedCombo.cards,
      score: selectedCombo.score,
      handType: selectedCombo.handType,
      confidence
    };
  }
  
  /**
   * 生成推荐理由
   * @param combo 选中的组合
   * @param strategy 策略
   * @param gameState 游戏状态
   * @param jokers 小丑牌
   * @returns 推荐理由
   */
  private static generateReasoning(
    combo: {cards: Card[], score: number, handType: string},
    strategy: string,
    gameState: GameStateData,
    jokers: Joker[]
  ): string {
    const { currentScore, targetScore, handsLeft } = gameState;
    const scoreGap = targetScore - currentScore;
    
    let reasoning = `推荐出${combo.handType}（${combo.score}分）。`;
    
    // 添加策略说明
    switch (strategy) {
      case 'aggressive':
        reasoning += ` 当前距离目标还差${scoreGap}分，剩余${handsLeft}次出牌，需要采用激进策略争取高分。`;
        break;
      case 'conservative':
        reasoning += ` 当前分数接近目标，采用保守策略确保稳定得分。`;
        break;
      case 'balanced':
        reasoning += ` 采用平衡策略，兼顾得分和手牌效率。`;
        break;
    }
    
    // 添加小丑牌效果说明
    if (jokers.length > 0) {
      const relevantJokers = this.findRelevantJokers(combo.cards, jokers);
      if (relevantJokers.length > 0) {
        reasoning += ` 小丑牌"${relevantJokers[0].name}"将提供额外加成。`;
      }
    }
    
    return reasoning;
  }
  
  /**
   * 查找相关的小丑牌
   * @param cards 选中的卡牌
   * @param jokers 所有小丑牌
   * @returns 相关的小丑牌
   */
  private static findRelevantJokers(cards: Card[], jokers: Joker[]): Joker[] {
    return jokers.filter(joker => {
      // 简单检查：如果小丑牌描述中包含花色或牌型关键词
      const description = joker.description.toLowerCase();
      
      // 检查花色相关
      const hasHearts = cards.some(card => card.suit === 'hearts') && description.includes('红桃');
      const hasSpades = cards.some(card => card.suit === 'spades') && description.includes('黑桃');
      const hasClubs = cards.some(card => card.suit === 'clubs') && description.includes('梅花');
      const hasDiamonds = cards.some(card => card.suit === 'diamonds') && description.includes('方块');
      
      // 检查牌型相关
      const hasPair = description.includes('对子');
      const hasFlush = description.includes('同花');
      
      return hasHearts || hasSpades || hasClubs || hasDiamonds || hasPair || hasFlush;
    });
  }
  
  /**
   * 获取备用建议（保留原方法作为最后的备选）
   * @param gameState 游戏状态
   * @returns 备用建议
   */
  private static getFallbackAdvice(gameState: GameStateData): AIAdvice {
    const { hand } = gameState;
    
    // 如果没有找到有效组合，推荐第一张牌
    return {
      recommendedCards: hand.length > 0 ? [hand[0].id] : [],
      reasoning: '[模拟AI建议] 无法分析当前局面，建议出第一张牌',
      expectedScore: 0,
      handType: '高牌',
      confidence: 0.3
    };
  }
  
  /**
   * 获取花色符号
   * @param suit 花色
   * @returns 花色符号
   */
  private static getSuitSymbol(suit: string): string {
    const symbols: Record<string, string> = {
      'spades': '♠',
      'hearts': '♥',
      'clubs': '♣',
      'diamonds': '♦'
    };
    return symbols[suit] || suit;
  }
  
  /**
   * 获取牌面名称
   * @param rank 牌面值
   * @returns 牌面名称
   */
  private static getRankName(rank: number): string {
    if (rank === 1) return 'A';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    return rank.toString();
  }
}