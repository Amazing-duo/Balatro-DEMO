以下是基于纯前端的 **Balatro 类游戏** 开发方案，从 MVP 到逐步还原 60% 内容的精确技术路线，结合效率与扩展性设计：

---

### **一、MVP 阶段（1-2周）**
**目标**：实现最简可玩核心循环（发牌、牌型得分、基础小丑牌效果）  
**技术栈**：  
- **框架**：React + TypeScript（强类型保障复杂游戏逻辑）  
- **样式**：Tailwind CSS（快速构建响应式 UI）  
- **状态管理**：Zustand（轻量级，适合游戏状态频繁更新）  
- **动画**：CSS Transitions + Framer Motion（简单卡牌动画）  

**核心模块**：  
1. **扑克牌型判断**  
   - 实现 `checkHandType(hand: Card[])` 函数，检测顺子、同花等组合，返回得分倍数  
   - 示例代码：  
     ```typescript
     const HAND_RANKS = {
       'high_card': 1,
       'pair': 2,
       'flush': 4,
       // ...其他牌型
     };
     ```  
2. **游戏基础状态**  
   - 使用 Zustand 管理：  
     ```typescript
     interface GameState {
       deck: Card[];
       hand: Card[];
       jokers: JokerEffect[];
       score: number;
     }
     ```  
3. **最小小丑牌系统**  
   - 预定义 3-5 种基础效果（如“对子得分×2”）通过 JSON 配置驱动：  
     ```json
     {
       "id": "double_pair",
       "name": "双倍对子",
       "effect": "pair_multiplier *= 2"
     }
     ```  

**部署**：Vercel 静态托管（免费 + 自动 CI/CD）  

---

### **二、进阶阶段（2-4周）**  
**目标**：还原 60% 核心玩法（完整牌型、小丑组合、局外成长）  
**新增技术**：  
- **数据持久化**：localStorage（存档/读档）  
- **复杂动画**：Canvas + PixiJS（渲染大量卡牌特效）  
- **音效**：Howler.js（背景音乐 + 交互反馈）  

**关键扩展**：  
1. **完整牌型系统**  
   - 支持 10+ 扑克牌型（如葫芦、同花顺）  
   - 动态计算连锁奖励（如连续同花额外加分）  
2. **小丑牌协同效果**  
   - 实现效果叠加（如“万能牌”+“翻倍同花”组合）  
   - 示例逻辑：  
     ```typescript
     applyJokerEffects(hand: Hand) {
       return this.jokers.reduce((score, joker) => 
         joker.onCalculateScore(score), baseScore);
     }
     ```  
3. **Roguelike 元素**  
   - 随机生成关卡难度（通过 `Math.seedrandom` 控制随机种子）  
   - 局外解锁系统（如胜利后解锁新小丑牌）  

**优化方向**：  
- **性能**：虚拟滚动优化手牌列表（React-Window）  
- **可维护性**：将游戏逻辑拆分为独立模块（`/core/game-engine`）  

---

### **三、避坑指南**  
1. **避免过度工程化**  
   - MVP 阶段禁用 Redux，直接用 Zustand 管理状态  
   - 初期用 SQLite 替代 IndexedDB（除非存档数据超 5MB）  
2. **版权规避**  
   - 替换扑克牌面美术（使用开源 CC0 素材）  
   - 调整术语（如“小丑牌”改为“技能卡”）  
3. **测试策略**  
   - 用 Jest 编写牌型判断单元测试  
   - 手动测试覆盖小丑牌组合边界条件  

---

### **四、分工建议（2人）*