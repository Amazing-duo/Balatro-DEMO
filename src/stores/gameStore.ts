// 游戏状态管理 - Zustand Store

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState, GamePhase, Card, Joker, ShopItem, HandType } from '../types/game';
import { 
  INITIAL_MONEY, 
  INITIAL_HANDS, 
  INITIAL_DISCARDS, 
  INITIAL_MAX_JOKERS,
  INITIAL_HAND_SIZE,
  BASE_ANTE_SCORE,
  ANTE_SCORE_MULTIPLIER,
  INITIAL_HAND_TYPE_CONFIGS,
  SHOP_SIZE,
  INITIAL_SHOP_REFRESH_COST
} from '../types/constants';
import { createStandardDeck, shuffleDeck, dealCards, sortCardsByRank } from '../utils/cardUtils';
import { ScoreCalculator } from '../game-engine/ScoreCalculator';
import { soundManager, SoundType } from '../utils/soundManager';

// 游戏状态接口
interface GameStore extends GameState {
  // 游戏控制方法
  initializeGame: () => void;
  startNewGame: () => void;
  nextRound: () => void;
  
  // 卡牌操作方法
  selectCard: (cardId: string) => void;
  deselectCard: (cardId: string) => void;
  clearSelection: () => void;
  playSelectedCards: () => void;
  discardSelectedCards: () => void;
  
  // 小丑牌操作方法
  addJoker: (joker: Joker) => boolean;
  removeJoker: (jokerId: string) => void;
  sellJoker: (jokerId: string) => void;
  
  // 商店操作方法
  enterShop: () => void;
  exitShop: () => void;
  buyShopItem: (itemId: string) => boolean;
  refreshShop: () => void;
  
  // 分数和金钱操作
  addScore: (points: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  
  // 牌型升级
  upgradeHandType: (handType: HandType) => boolean;
  
  // 游戏结束检查
  checkGameOver: () => boolean;
  
  // 重置游戏
  resetGame: () => void;
}

// 初始游戏状态
const getInitialGameState = (): GameState => {
  const deck = shuffleDeck(createStandardDeck());
  const { dealtCards: hand, remainingDeck } = dealCards(deck, INITIAL_HAND_SIZE);
  
  // 手牌默认按点数排序（从大到小）
  const sortedHand = sortCardsByRank(hand, true).reverse();
  
  return {
    gamePhase: GamePhase.MENU,
    currentRound: 1,
    targetScore: BASE_ANTE_SCORE,
    currentScore: 0,
    money: INITIAL_MONEY,
    
    deck: remainingDeck,
    hand: sortedHand,
    selectedCards: [],
    discardPile: [],
    
    jokers: [],
    maxJokers: INITIAL_MAX_JOKERS,
    
    handsLeft: INITIAL_HANDS,
    discardsLeft: INITIAL_DISCARDS,
    
    shopItems: [],
    shopRefreshCost: INITIAL_SHOP_REFRESH_COST,
    
    handTypeConfigs: { ...INITIAL_HAND_TYPE_CONFIGS },
    
    settings: {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      animationSpeed: 'normal',
      autoSave: true,
      showTutorial: true,
      language: 'zh-CN'
    }
  };
};

// 创建游戏状态store
export const useGameStore = create<GameStore>()(immer((set, get) => ({
  ...getInitialGameState(),
  
  // 初始化游戏
  initializeGame: () => {
    set((state) => {
      Object.assign(state, getInitialGameState());
    });
  },
  
  // 开始新游戏
  startNewGame: () => {
    set((state) => {
      Object.assign(state, getInitialGameState());
      state.gamePhase = GamePhase.PLAYING;
    });
  },
  
  // 下一轮
  nextRound: () => {
    set((state) => {
      state.currentRound += 1;
      state.targetScore = Math.floor(BASE_ANTE_SCORE * Math.pow(ANTE_SCORE_MULTIPLIER, state.currentRound - 1));
      state.currentScore = 0;
      state.handsLeft = INITIAL_HANDS;
      state.discardsLeft = INITIAL_DISCARDS;
      
      // 重新洗牌并发牌
      const allCards = [...state.deck, ...state.hand, ...state.discardPile];
      const shuffledDeck = shuffleDeck(allCards.map(card => ({ ...card, isSelected: false })));
      const { dealtCards: newHand, remainingDeck } = dealCards(shuffledDeck, INITIAL_HAND_SIZE);
      
      // 手牌按点数排序（从大到小）
      const sortedNewHand = sortCardsByRank(newHand, true).reverse();
      
      state.deck = remainingDeck;
      state.hand = sortedNewHand;
      state.selectedCards = [];
      state.discardPile = [];
    });
  },
  
  // 选择卡牌
  selectCard: (cardId: string) => {
    set((state) => {
      const card = state.hand.find(c => c.id === cardId);
      if (card && !card.isSelected && state.selectedCards.length < 5) {
        card.isSelected = true;
        state.selectedCards.push(card);
        soundManager.play(SoundType.CARD_SELECT);
      }
    });
  },
  
  // 取消选择卡牌
  deselectCard: (cardId: string) => {
    set((state) => {
      const card = state.hand.find(c => c.id === cardId);
      if (card && card.isSelected) {
        card.isSelected = false;
        state.selectedCards = state.selectedCards.filter(c => c.id !== cardId);
        soundManager.play(SoundType.CARD_DESELECT);
      }
    });
  },
  
  // 清空选择
  clearSelection: () => {
    set((state) => {
      state.hand.forEach(card => {
        card.isSelected = false;
      });
      state.selectedCards = [];
    });
  },
  
  // 出牌
  playSelectedCards: () => {
    set((state) => {
      if (state.selectedCards.length === 0 || state.handsLeft <= 0) return;
      
      // 计算分数
      const scoreResult = ScoreCalculator.calculateScore(state.selectedCards, state.jokers, state.handTypeConfigs);
      const totalScore = scoreResult.finalScore;
      
      // 添加分数到当前分数
      state.currentScore += totalScore;
      
      // 移除选中的卡牌到弃牌堆
      state.selectedCards.forEach(selectedCard => {
        const index = state.hand.findIndex(card => card.id === selectedCard.id);
        if (index !== -1) {
          state.discardPile.push(state.hand.splice(index, 1)[0]);
        }
      });
      
      state.selectedCards = [];
      state.handsLeft -= 1;
      
      // 补充手牌
      const cardsNeeded = INITIAL_HAND_SIZE - state.hand.length;
      if (cardsNeeded > 0 && state.deck.length > 0) {
        const { dealtCards, remainingDeck } = dealCards(state.deck, Math.min(cardsNeeded, state.deck.length));
        state.hand.push(...dealtCards);
        // 重新按点数排序（从大到小）
        state.hand = sortCardsByRank(state.hand, true).reverse();
        state.deck = remainingDeck;
      }
    });
  },
  
  // 弃牌
  discardSelectedCards: () => {
    set((state) => {
      if (state.selectedCards.length === 0 || state.discardsLeft <= 0) return;
      
      // 移除选中的卡牌到弃牌堆
      state.selectedCards.forEach(selectedCard => {
        const index = state.hand.findIndex(card => card.id === selectedCard.id);
        if (index !== -1) {
          state.discardPile.push(state.hand.splice(index, 1)[0]);
        }
      });
      
      state.selectedCards = [];
      state.discardsLeft -= 1;
      
      // 补充手牌
      const cardsNeeded = INITIAL_HAND_SIZE - state.hand.length;
      if (cardsNeeded > 0 && state.deck.length > 0) {
        const { dealtCards, remainingDeck } = dealCards(state.deck, Math.min(cardsNeeded, state.deck.length));
        state.hand.push(...dealtCards);
        // 重新按点数排序（从大到小）
        state.hand = sortCardsByRank(state.hand, true).reverse();
        state.deck = remainingDeck;
      }
    });
  },
  
  // 添加小丑牌
  addJoker: (joker: Joker) => {
    const state = get();
    if (state.jokers.length >= state.maxJokers) {
      return false;
    }
    
    set((state) => {
      state.jokers.push(joker);
    });
    return true;
  },
  
  // 移除小丑牌
  removeJoker: (jokerId: string) => {
    set((state) => {
      state.jokers = state.jokers.filter(joker => joker.id !== jokerId);
    });
  },
  
  // 出售小丑牌
  sellJoker: (jokerId: string) => {
    set((state) => {
      const jokerIndex = state.jokers.findIndex(joker => joker.id === jokerId);
      if (jokerIndex !== -1) {
        const joker = state.jokers[jokerIndex];
        state.money += joker.sellValue;
        state.jokers.splice(jokerIndex, 1);
      }
    });
  },
  
  // 进入商店
  enterShop: () => {
    set((state) => {
      state.gamePhase = GamePhase.SHOP;
      // TODO: 生成商店物品
      state.shopItems = [];
    });
  },
  
  // 退出商店
  exitShop: () => {
    set((state) => {
      state.gamePhase = GamePhase.PLAYING;
    });
  },
  
  // 购买商店物品
  buyShopItem: (itemId: string) => {
    const state = get();
    const item = state.shopItems.find(item => item.id === itemId);
    
    if (!item || state.money < item.cost) {
      return false;
    }
    
    set((state) => {
      state.money -= item.cost;
      state.shopItems = state.shopItems.filter(shopItem => shopItem.id !== itemId);
      
      // 根据物品类型处理
      if (item.type === 'joker') {
        const joker = item.item as Joker;
        if (state.jokers.length < state.maxJokers) {
          state.jokers.push(joker);
        }
      }
      // TODO: 处理其他类型的物品
    });
    
    return true;
  },
  
  // 刷新商店
  refreshShop: () => {
    const state = get();
    if (state.money < state.shopRefreshCost) {
      return;
    }
    
    set((state) => {
      state.money -= state.shopRefreshCost;
      // TODO: 重新生成商店物品
      state.shopItems = [];
    });
  },
  
  // 增加分数
  addScore: (points: number) => {
    set((state) => {
      state.currentScore += points;
    });
  },
  
  // 增加金钱
  addMoney: (amount: number) => {
    set((state) => {
      state.money += amount;
    });
  },
  
  // 花费金钱
  spendMoney: (amount: number) => {
    const state = get();
    if (state.money < amount) {
      return false;
    }
    
    set((state) => {
      state.money -= amount;
    });
    return true;
  },
  
  // 升级牌型
  upgradeHandType: (handType: HandType) => {
    const state = get();
    const config = state.handTypeConfigs[handType];
    
    if (state.money < config.upgradeCost) {
      return false;
    }
    
    set((state) => {
      state.money -= config.upgradeCost;
      const handConfig = state.handTypeConfigs[handType];
      handConfig.level += 1;
      handConfig.baseChips += Math.floor(handConfig.baseChips * 0.3);
      handConfig.baseMultiplier += 1;
      handConfig.upgradeCost += 1;
    });
    
    return true;
  },
  
  // 检查游戏结束
  checkGameOver: () => {
    const state = get();
    
    // 如果达到目标分数，进入下一轮
    if (state.currentScore >= state.targetScore) {
      return false;
    }
    
    // 如果没有剩余手数，游戏结束
    if (state.handsLeft <= 0) {
      set((state) => {
        state.gamePhase = GamePhase.GAME_OVER;
      });
      return true;
    }
    
    return false;
  },
  
  // 重置游戏
  resetGame: () => {
    set((state) => {
      Object.assign(state, getInitialGameState());
    });
  }
})));