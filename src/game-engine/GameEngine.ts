// 游戏引擎核心类

import { GameState, Card, Joker, ScoreResult, ShopItem, GamePhase } from '../types/game';
import { HandEvaluator } from './HandEvaluator';
import { ScoreCalculator } from './ScoreCalculator';
import { JokerManager } from './JokerManager';
import { createStandardDeck, shuffleDeck, dealCards } from '../utils/cardUtils';
import { INITIAL_HAND_SIZE, SHOP_SIZE, BASE_ANTE_SCORE, LEVEL_SCORE_INCREMENT, MAX_LEVELS } from '../types/constants';

/**
 * 游戏引擎事件类型
 */
export interface GameEngineEvents {
  onScoreCalculated: (result: ScoreResult) => void;
  onHandPlayed: (cards: Card[], score: ScoreResult) => void;
  onCardsDiscarded: (cards: Card[]) => void;
  onJokerTriggered: (joker: Joker, effect: any) => void;
  onRoundComplete: (targetReached: boolean) => void;
  onGameOver: (finalScore: number) => void;
  onShopEntered: () => void;
  onShopExited: () => void;
}

/**
 * 游戏引擎核心类
 */
export class GameEngine {
  private gameState: GameState;
  private eventHandlers: Partial<GameEngineEvents> = {};

  constructor(initialState: GameState) {
    this.gameState = { ...initialState };
  }

  /**
   * 注册事件处理器
   */
  on<K extends keyof GameEngineEvents>(event: K, handler: GameEngineEvents[K]) {
    this.eventHandlers[event] = handler;
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof GameEngineEvents>(event: K, ...args: Parameters<GameEngineEvents[K]>) {
    const handler = this.eventHandlers[event];
    if (handler) {
      (handler as any)(...args);
    }
  }

  /**
   * 获取当前游戏状态
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * 更新游戏状态
   */
  updateGameState(updates: Partial<GameState>) {
    this.gameState = { ...this.gameState, ...updates };
  }

  /**
   * 初始化新游戏
   */
  initializeGame(): void {
    const deck = shuffleDeck(createStandardDeck());
    const { dealtCards: hand, remainingDeck } = dealCards(deck, INITIAL_HAND_SIZE);

    this.gameState = {
      ...this.gameState,
      gamePhase: GamePhase.PLAYING,
      deck: remainingDeck,
      hand,
      selectedCards: [],
      discardPile: []
    };
  }

  /**
   * 选择卡牌
   */
  selectCard(cardId: string): boolean {
    const card = this.gameState.hand.find(c => c.id === cardId);
    if (!card || card.isSelected || this.gameState.selectedCards.length >= 5) {
      return false;
    }

    card.isSelected = true;
    this.gameState.selectedCards.push(card);
    return true;
  }

  /**
   * 取消选择卡牌
   */
  deselectCard(cardId: string): boolean {
    const card = this.gameState.hand.find(c => c.id === cardId);
    if (!card || !card.isSelected) {
      return false;
    }

    card.isSelected = false;
    this.gameState.selectedCards = this.gameState.selectedCards.filter(c => c.id !== cardId);
    return true;
  }

  /**
   * 清空选择
   */
  clearSelection(): void {
    this.gameState.hand.forEach(card => {
      card.isSelected = false;
    });
    this.gameState.selectedCards = [];
  }

  /**
   * 出牌
   */
  playHand(): ScoreResult | null {
    if (this.gameState.selectedCards.length === 0 || this.gameState.handsLeft <= 0) {
      return null;
    }

    // 计算分数
    const scoreResult = ScoreCalculator.calculateScore(
      this.gameState.selectedCards,
      this.gameState.jokers,
      this.gameState.handTypeConfigs
    );

    // 触发小丑牌效果
    this.triggerJokerEffects('onScore', scoreResult);

    // 更新游戏状态
    this.gameState.currentScore += scoreResult.finalScore;
    this.gameState.handsLeft -= 1;

    // 移动卡牌到弃牌堆
    this.moveSelectedCardsToDiscard();

    // 补充手牌
    this.refillHand();

    // 触发事件
    this.emit('onScoreCalculated', scoreResult);
    this.emit('onHandPlayed', this.gameState.selectedCards, scoreResult);

    // 检查回合结束
    this.checkRoundEnd();

    return scoreResult;
  }

  /**
   * 弃牌
   */
  discardCards(): boolean {
    if (this.gameState.selectedCards.length === 0 || this.gameState.discardsLeft <= 0) {
      return false;
    }

    // 触发小丑牌效果
    this.triggerJokerEffects('onDiscard');

    // 移动卡牌到弃牌堆
    const discardedCards = [...this.gameState.selectedCards];
    this.moveSelectedCardsToDiscard();

    // 更新状态
    this.gameState.discardsLeft -= 1;

    // 补充手牌
    this.refillHand();

    // 触发事件
    this.emit('onCardsDiscarded', discardedCards);

    return true;
  }

  /**
   * 移动选中卡牌到弃牌堆
   */
  private moveSelectedCardsToDiscard(): void {
    this.gameState.selectedCards.forEach(selectedCard => {
      const index = this.gameState.hand.findIndex(card => card.id === selectedCard.id);
      if (index !== -1) {
        const card = this.gameState.hand.splice(index, 1)[0];
        card.isSelected = false;
        this.gameState.discardPile.push(card);
      }
    });
    this.gameState.selectedCards = [];
  }

  /**
   * 补充手牌
   */
  private refillHand(): void {
    const cardsNeeded = INITIAL_HAND_SIZE - this.gameState.hand.length;
    if (cardsNeeded > 0 && this.gameState.deck.length > 0) {
      const { dealtCards, remainingDeck } = dealCards(
        this.gameState.deck,
        Math.min(cardsNeeded, this.gameState.deck.length)
      );
      this.gameState.hand.push(...dealtCards);
      this.gameState.deck = remainingDeck;
    }
  }

  /**
   * 触发小丑牌效果
   */
  private triggerJokerEffects(trigger: string, scoreResult?: ScoreResult): void {
    for (const joker of this.gameState.jokers) {
      if (JokerManager.canTriggerJoker(joker, this.gameState, trigger)) {
        // 应用小丑牌效果
        if (scoreResult && joker.effect.apply) {
          const newScore = joker.effect.apply(scoreResult.finalScore, this.gameState);
          scoreResult.finalScore = newScore;
        }
        
        this.emit('onJokerTriggered', joker, { trigger, scoreResult });
      }
    }
  }

  /**
   * 检查回合结束
   */
  private checkRoundEnd(): void {
    const targetReached = this.gameState.currentScore >= this.gameState.targetScore;
    const handsExhausted = this.gameState.handsLeft <= 0;

    if (targetReached) {
      // 达到目标分数，进入商店阶段
      this.enterShop();
      this.emit('onRoundComplete', true);
    } else if (handsExhausted) {
      // 手数用完，游戏结束
      this.gameState.gamePhase = GamePhase.GAME_OVER;
      this.emit('onGameOver', this.gameState.currentScore);
    }
  }

  /**
   * 进入商店
   */
  enterShop(): void {
    this.gameState.gamePhase = GamePhase.SHOP;
    this.generateShopItems();
    this.emit('onShopEntered');
  }

  /**
   * 退出商店
   */
  exitShop(): void {
    this.gameState.gamePhase = GamePhase.PLAYING;
    this.startNextRound();
    this.emit('onShopExited');
  }

  /**
   * 生成商店物品
   */
  private generateShopItems(): void {
    const jokers = JokerManager.generateShopJokers(SHOP_SIZE);
    
    this.gameState.shopItems = jokers.map(joker => ({
      id: `shop-${joker.id}`,
      type: 'joker' as const,
      item: joker,
      cost: joker.cost
    }));
  }

  /**
   * 购买商店物品
   */
  buyShopItem(itemId: string): boolean {
    const item = this.gameState.shopItems.find(item => item.id === itemId);
    if (!item || this.gameState.money < item.cost) {
      return false;
    }

    // 扣除金钱
    this.gameState.money -= item.cost;

    // 处理不同类型的物品
    if (item.type === 'joker') {
      const joker = item.item as Joker;
      if (this.gameState.jokers.length < this.gameState.maxJokers) {
        this.gameState.jokers.push(joker);
      } else {
        // 小丑牌位置已满，返回金钱
        this.gameState.money += item.cost;
        return false;
      }
    }

    // 从商店移除物品
    this.gameState.shopItems = this.gameState.shopItems.filter(shopItem => shopItem.id !== itemId);

    return true;
  }

  /**
   * 刷新商店
   */
  refreshShop(): boolean {
    if (this.gameState.money < this.gameState.shopRefreshCost) {
      return false;
    }

    this.gameState.money -= this.gameState.shopRefreshCost;
    this.generateShopItems();
    
    return true;
  }

  /**
   * 出售小丑牌
   */
  sellJoker(jokerId: string): boolean {
    const jokerIndex = this.gameState.jokers.findIndex(joker => joker.id === jokerId);
    if (jokerIndex === -1) {
      return false;
    }

    const joker = this.gameState.jokers[jokerIndex];
    this.gameState.money += joker.sellValue;
    this.gameState.jokers.splice(jokerIndex, 1);

    return true;
  }

  /**
   * 开始下一轮
   */
  private startNextRound(): void {
    // 检查是否已经完成最大关卡数
    if (this.gameState.currentRound >= MAX_LEVELS) {
      this.gameState.isGameCompleted = true;
      this.gameState.gamePhase = GamePhase.GAME_COMPLETED;
      return;
    }
    
    this.gameState.currentRound += 1;
    this.gameState.targetScore = BASE_ANTE_SCORE + (this.gameState.currentRound - 1) * LEVEL_SCORE_INCREMENT;
    this.gameState.currentScore = 0;
    this.gameState.handsLeft = 4; // 重置手数
    this.gameState.discardsLeft = 3; // 重置弃牌次数

    // 重新洗牌并发牌
    const allCards = [...this.gameState.deck, ...this.gameState.hand, ...this.gameState.discardPile];
    const shuffledDeck = shuffleDeck(allCards.map(card => ({ ...card, isSelected: false })));
    const { dealtCards: newHand, remainingDeck } = dealCards(shuffledDeck, INITIAL_HAND_SIZE);

    this.gameState.deck = remainingDeck;
    this.gameState.hand = newHand;
    this.gameState.selectedCards = [];
    this.gameState.discardPile = [];
  }

  /**
   * 预览分数
   */
  previewScore(): ScoreResult | null {
    if (this.gameState.selectedCards.length === 0) {
      return null;
    }

    return ScoreCalculator.previewScore(
      this.gameState.selectedCards,
      this.gameState.jokers,
      this.gameState.handTypeConfigs
    );
  }

  /**
   * 获取最佳手牌建议
   */
  getBestHandSuggestion(): Card[] {
    return ScoreCalculator.findBestHand(this.gameState.hand, 5);
  }

  /**
   * 检查游戏是否结束
   */
  isGameOver(): boolean {
    return this.gameState.gamePhase === GamePhase.GAME_OVER;
  }

  /**
   * 重置游戏
   */
  resetGame(): void {
    this.initializeGame();
    this.gameState.currentRound = 1;
    this.gameState.currentScore = 0;
    this.gameState.money = 4;
    this.gameState.jokers = [];
  }

  /**
   * 保存游戏状态
   */
  saveGame(): string {
    return JSON.stringify(this.gameState);
  }

  /**
   * 加载游戏状态
   */
  loadGame(saveData: string): boolean {
    try {
      const loadedState = JSON.parse(saveData) as GameState;
      this.gameState = loadedState;
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }
}