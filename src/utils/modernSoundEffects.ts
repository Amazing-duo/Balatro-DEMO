// 现代化音效配置
// 基于现代UI设计和小丑牌游戏风格的音效参数

export interface ModernSoundConfig {
  name: string;
  displayName: string;
  description: string;
  cardSelect: {
    frequency: number;
    duration: number;
    volume: number;
    envelope: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    };
    filter?: {
      type: BiquadFilterType;
      frequency: number;
      Q: number;
    };
    modulation?: {
      frequency: number;
      depth: number;
    };
  };
  cardDeselect: {
    frequency: number;
    duration: number;
    volume: number;
    envelope: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    };
    filter?: {
      type: BiquadFilterType;
      frequency: number;
      Q: number;
    };
    modulation?: {
      frequency: number;
      depth: number;
    };
  };
}

// 现代化音效预设 - 灵感来自小丑牌和现代UI设计
export const modernSoundPresets: ModernSoundConfig[] = [
  {
    name: 'elegant',
    displayName: '优雅',
    description: '优雅清脆的音效，适合高端卡牌游戏',
    cardSelect: {
      frequency: 880,
      duration: 0.15,
      volume: 0.3,
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.09 },
      filter: { type: 'lowpass', frequency: 2000, Q: 1.5 },
      modulation: { frequency: 5, depth: 0.1 }
    },
    cardDeselect: {
      frequency: 660,
      duration: 0.12,
      volume: 0.25,
      envelope: { attack: 0.005, decay: 0.04, sustain: 0.6, release: 0.075 },
      filter: { type: 'lowpass', frequency: 1500, Q: 1.2 }
    }
  },
  {
    name: 'crisp',
    displayName: '清脆',
    description: '清脆明亮的音效，反应迅速',
    cardSelect: {
      frequency: 1320,
      duration: 0.08,
      volume: 0.35,
      envelope: { attack: 0.002, decay: 0.02, sustain: 0.8, release: 0.058 },
      filter: { type: 'highpass', frequency: 400, Q: 0.8 },
      modulation: { frequency: 12, depth: 0.05 }
    },
    cardDeselect: {
      frequency: 990,
      duration: 0.06,
      volume: 0.3,
      envelope: { attack: 0.001, decay: 0.015, sustain: 0.7, release: 0.044 },
      filter: { type: 'highpass', frequency: 300, Q: 0.6 }
    }
  },
  {
    name: 'warm',
    displayName: '温暖',
    description: '温暖柔和的音效，营造舒适氛围',
    cardSelect: {
      frequency: 440,
      duration: 0.2,
      volume: 0.4,
      envelope: { attack: 0.02, decay: 0.08, sustain: 0.6, release: 0.1 },
      filter: { type: 'lowpass', frequency: 1200, Q: 2.0 },
      modulation: { frequency: 3, depth: 0.15 }
    },
    cardDeselect: {
      frequency: 330,
      duration: 0.18,
      volume: 0.35,
      envelope: { attack: 0.015, decay: 0.06, sustain: 0.5, release: 0.105 },
      filter: { type: 'lowpass', frequency: 1000, Q: 1.8 }
    }
  },
  {
    name: 'digital',
    displayName: '数字',
    description: '现代数字化音效，科技感十足',
    cardSelect: {
      frequency: 1760,
      duration: 0.05,
      volume: 0.3,
      envelope: { attack: 0.001, decay: 0.01, sustain: 0.9, release: 0.039 },
      filter: { type: 'bandpass', frequency: 1500, Q: 3.0 },
      modulation: { frequency: 20, depth: 0.08 }
    },
    cardDeselect: {
      frequency: 1320,
      duration: 0.04,
      volume: 0.25,
      envelope: { attack: 0.0005, decay: 0.008, sustain: 0.8, release: 0.0315 },
      filter: { type: 'bandpass', frequency: 1200, Q: 2.5 }
    }
  },
  {
    name: 'organic',
    displayName: '自然',
    description: '自然有机的音效，贴近真实',
    cardSelect: {
      frequency: 523,
      duration: 0.25,
      volume: 0.35,
      envelope: { attack: 0.03, decay: 0.1, sustain: 0.5, release: 0.12 },
      filter: { type: 'lowpass', frequency: 800, Q: 1.0 },
      modulation: { frequency: 2, depth: 0.2 }
    },
    cardDeselect: {
      frequency: 392,
      duration: 0.22,
      volume: 0.3,
      envelope: { attack: 0.025, decay: 0.08, sustain: 0.4, release: 0.115 },
      filter: { type: 'lowpass', frequency: 600, Q: 0.8 }
    }
  },
  {
    name: 'metallic',
    displayName: '金属',
    description: '金属质感音效，锐利而精确',
    cardSelect: {
      frequency: 2640,
      duration: 0.1,
      volume: 0.25,
      envelope: { attack: 0.001, decay: 0.03, sustain: 0.7, release: 0.069 },
      filter: { type: 'highpass', frequency: 800, Q: 2.5 },
      modulation: { frequency: 15, depth: 0.12 }
    },
    cardDeselect: {
      frequency: 1980,
      duration: 0.08,
      volume: 0.2,
      envelope: { attack: 0.0005, decay: 0.025, sustain: 0.6, release: 0.0545 },
      filter: { type: 'highpass', frequency: 600, Q: 2.0 }
    }
  },
  {
    name: 'ethereal',
    displayName: '空灵',
    description: '空灵飘逸的音效，如梦如幻',
    cardSelect: {
      frequency: 1108,
      duration: 0.3,
      volume: 0.2,
      envelope: { attack: 0.05, decay: 0.15, sustain: 0.3, release: 0.1 },
      filter: { type: 'lowpass', frequency: 3000, Q: 0.5 },
      modulation: { frequency: 1.5, depth: 0.25 }
    },
    cardDeselect: {
      frequency: 831,
      duration: 0.25,
      volume: 0.15,
      envelope: { attack: 0.04, decay: 0.12, sustain: 0.2, release: 0.09 },
      filter: { type: 'lowpass', frequency: 2500, Q: 0.4 }
    }
  },
  {
    name: 'punchy',
    displayName: '有力',
    description: '有力冲击的音效，强调动作感',
    cardSelect: {
      frequency: 220,
      duration: 0.12,
      volume: 0.45,
      envelope: { attack: 0.005, decay: 0.04, sustain: 0.8, release: 0.075 },
      filter: { type: 'lowpass', frequency: 500, Q: 3.0 },
      modulation: { frequency: 8, depth: 0.1 }
    },
    cardDeselect: {
      frequency: 165,
      duration: 0.1,
      volume: 0.4,
      envelope: { attack: 0.003, decay: 0.03, sustain: 0.7, release: 0.067 },
      filter: { type: 'lowpass', frequency: 400, Q: 2.5 }
    }
  },
  {
    name: 'glassy',
    displayName: '玻璃',
    description: '玻璃质感音效，清透明亮',
    cardSelect: {
      frequency: 3520,
      duration: 0.06,
      volume: 0.2,
      envelope: { attack: 0.001, decay: 0.015, sustain: 0.9, release: 0.044 },
      filter: { type: 'highpass', frequency: 1500, Q: 4.0 },
      modulation: { frequency: 25, depth: 0.06 }
    },
    cardDeselect: {
      frequency: 2640,
      duration: 0.05,
      volume: 0.15,
      envelope: { attack: 0.0005, decay: 0.012, sustain: 0.8, release: 0.0375 },
      filter: { type: 'highpass', frequency: 1200, Q: 3.5 }
    }
  },
  {
    name: 'vintage',
    displayName: '复古',
    description: '复古怀旧音效，经典韵味',
    cardSelect: {
      frequency: 698,
      duration: 0.18,
      volume: 0.38,
      envelope: { attack: 0.015, decay: 0.06, sustain: 0.6, release: 0.105 },
      filter: { type: 'lowpass', frequency: 1500, Q: 1.2 },
      modulation: { frequency: 4, depth: 0.18 }
    },
    cardDeselect: {
      frequency: 523,
      duration: 0.15,
      volume: 0.33,
      envelope: { attack: 0.012, decay: 0.05, sustain: 0.5, release: 0.088 },
      filter: { type: 'lowpass', frequency: 1200, Q: 1.0 }
    }
  },
  {
    name: 'futuristic',
    displayName: '未来',
    description: '未来科幻音效，前卫时尚',
    cardSelect: {
      frequency: 1480,
      duration: 0.08,
      volume: 0.3,
      envelope: { attack: 0.002, decay: 0.02, sustain: 0.85, release: 0.058 },
      filter: { type: 'bandpass', frequency: 2000, Q: 5.0 },
      modulation: { frequency: 30, depth: 0.1 }
    },
    cardDeselect: {
      frequency: 1110,
      duration: 0.06,
      volume: 0.25,
      envelope: { attack: 0.001, decay: 0.015, sustain: 0.75, release: 0.044 },
      filter: { type: 'bandpass', frequency: 1500, Q: 4.0 }
    }
  },
  {
    name: 'smooth',
    displayName: '顺滑',
    description: '顺滑流畅的音效，操作丝般顺滑',
    cardSelect: {
      frequency: 784,
      duration: 0.22,
      volume: 0.32,
      envelope: { attack: 0.025, decay: 0.08, sustain: 0.55, release: 0.115 },
      filter: { type: 'lowpass', frequency: 1800, Q: 0.8 },
      modulation: { frequency: 2.5, depth: 0.12 }
    },
    cardDeselect: {
      frequency: 588,
      duration: 0.18,
      volume: 0.28,
      envelope: { attack: 0.02, decay: 0.06, sustain: 0.45, release: 0.1 },
      filter: { type: 'lowpass', frequency: 1400, Q: 0.6 }
    }
  },
  // 新增20种音效预设 - 纸张摩擦和各种材质感
  {
    name: 'paper_rustle',
    displayName: '纸张摩擦',
    description: '真实的纸张摩擦声，模拟卡牌滑动',
    cardSelect: {
      frequency: 3200,
      duration: 0.14,
      volume: 0.32,
      envelope: { attack: 0.003, decay: 0.04, sustain: 0.6, release: 0.093 },
      filter: { type: 'bandpass', frequency: 1800, Q: 3.2 },
      modulation: { frequency: 45, depth: 0.35 }
    },
    cardDeselect: {
      frequency: 2400,
      duration: 0.11,
      volume: 0.28,
      envelope: { attack: 0.002, decay: 0.03, sustain: 0.5, release: 0.075 },
      filter: { type: 'bandpass', frequency: 1400, Q: 2.8 },
      modulation: { frequency: 38, depth: 0.3 }
    }
  },
  {
    name: 'card_slide',
    displayName: '卡牌滑动',
    description: '卡牌在桌面滑动的声音',
    cardSelect: {
      frequency: 2800,
      duration: 0.16,
      volume: 0.35,
      envelope: { attack: 0.005, decay: 0.05, sustain: 0.45, release: 0.1 },
      filter: { type: 'highpass', frequency: 1500, Q: 2.8 },
      modulation: { frequency: 28, depth: 0.4 }
    },
    cardDeselect: {
      frequency: 2100,
      duration: 0.13,
      volume: 0.31,
      envelope: { attack: 0.004, decay: 0.04, sustain: 0.35, release: 0.086 },
      filter: { type: 'highpass', frequency: 1200, Q: 2.4 },
      modulation: { frequency: 22, depth: 0.35 }
    }
  },
  {
    name: 'page_flip',
    displayName: '翻页',
    description: '书页翻动的轻柔声音',
    cardSelect: {
      frequency: 1800,
      duration: 0.2,
      volume: 0.3,
      envelope: { attack: 0.008, decay: 0.06, sustain: 0.4, release: 0.126 },
      filter: { type: 'lowpass', frequency: 3200, Q: 1.5 },
      modulation: { frequency: 12, depth: 0.25 }
    },
    cardDeselect: {
      frequency: 1350,
      duration: 0.16,
      volume: 0.26,
      envelope: { attack: 0.006, decay: 0.05, sustain: 0.3, release: 0.104 },
      filter: { type: 'lowpass', frequency: 2800, Q: 1.2 },
      modulation: { frequency: 10, depth: 0.2 }
    }
  },
  {
    name: 'velvet',
    displayName: '天鹅绒',
    description: '柔软天鹅绒质感，奢华感受',
    cardSelect: {
      frequency: 440,
      duration: 0.3,
      volume: 0.35,
      envelope: { attack: 0.04, decay: 0.12, sustain: 0.4, release: 0.14 },
      filter: { type: 'lowpass', frequency: 800, Q: 2.5 },
      modulation: { frequency: 1.8, depth: 0.3 }
    },
    cardDeselect: {
      frequency: 330,
      duration: 0.25,
      volume: 0.3,
      envelope: { attack: 0.03, decay: 0.1, sustain: 0.3, release: 0.12 },
      filter: { type: 'lowpass', frequency: 600, Q: 2.0 }
    }
  },
  {
    name: 'crystal',
    displayName: '水晶',
    description: '水晶般清澈透明的音效',
    cardSelect: {
      frequency: 4400,
      duration: 0.12,
      volume: 0.22,
      envelope: { attack: 0.002, decay: 0.03, sustain: 0.8, release: 0.085 },
      filter: { type: 'highpass', frequency: 2000, Q: 5.0 },
      modulation: { frequency: 40, depth: 0.08 }
    },
    cardDeselect: {
      frequency: 3300,
      duration: 0.1,
      volume: 0.18,
      envelope: { attack: 0.001, decay: 0.025, sustain: 0.7, release: 0.074 },
      filter: { type: 'highpass', frequency: 1500, Q: 4.0 }
    }
  },
  {
    name: 'bamboo',
    displayName: '竹子',
    description: '竹制品的自然音效，清脆有韵',
    cardSelect: {
      frequency: 880,
      duration: 0.16,
      volume: 0.33,
      envelope: { attack: 0.008, decay: 0.05, sustain: 0.6, release: 0.097 },
      filter: { type: 'bandpass', frequency: 1000, Q: 3.5 },
      modulation: { frequency: 12, depth: 0.15 }
    },
    cardDeselect: {
      frequency: 660,
      duration: 0.13,
      volume: 0.28,
      envelope: { attack: 0.006, decay: 0.04, sustain: 0.5, release: 0.08 },
      filter: { type: 'bandpass', frequency: 750, Q: 3.0 }
    }
  },
  {
    name: 'marble',
    displayName: '大理石',
    description: '大理石质感，坚实而优雅',
    cardSelect: {
      frequency: 1760,
      duration: 0.14,
      volume: 0.3,
      envelope: { attack: 0.003, decay: 0.04, sustain: 0.7, release: 0.103 },
      filter: { type: 'highpass', frequency: 500, Q: 2.8 },
      modulation: { frequency: 22, depth: 0.1 }
    },
    cardDeselect: {
      frequency: 1320,
      duration: 0.11,
      volume: 0.25,
      envelope: { attack: 0.002, decay: 0.03, sustain: 0.6, release: 0.085 },
      filter: { type: 'highpass', frequency: 400, Q: 2.3 }
    }
  },
  {
    name: 'silk',
    displayName: '丝绸',
    description: '丝绸般顺滑柔软的触感',
    cardSelect: {
      frequency: 1108,
      duration: 0.28,
      volume: 0.25,
      envelope: { attack: 0.03, decay: 0.1, sustain: 0.35, release: 0.14 },
      filter: { type: 'lowpass', frequency: 1500, Q: 1.5 },
      modulation: { frequency: 3.5, depth: 0.22 }
    },
    cardDeselect: {
      frequency: 831,
      duration: 0.23,
      volume: 0.2,
      envelope: { attack: 0.025, decay: 0.08, sustain: 0.25, release: 0.125 },
      filter: { type: 'lowpass', frequency: 1200, Q: 1.2 }
    }
  },
  {
    name: 'ceramic',
    displayName: '陶瓷',
    description: '陶瓷质感，温润而坚实',
    cardSelect: {
      frequency: 1320,
      duration: 0.13,
      volume: 0.32,
      envelope: { attack: 0.005, decay: 0.04, sustain: 0.65, release: 0.08 },
      filter: { type: 'bandpass', frequency: 1100, Q: 2.5 },
      modulation: { frequency: 16, depth: 0.12 }
    },
    cardDeselect: {
      frequency: 990,
      duration: 0.1,
      volume: 0.27,
      envelope: { attack: 0.003, decay: 0.03, sustain: 0.55, release: 0.067 },
      filter: { type: 'bandpass', frequency: 850, Q: 2.0 }
    }
  },
  {
    name: 'leather',
    displayName: '皮革',
    description: '皮革质感，厚重而有质感',
    cardSelect: {
      frequency: 330,
      duration: 0.2,
      volume: 0.4,
      envelope: { attack: 0.02, decay: 0.08, sustain: 0.5, release: 0.1 },
      filter: { type: 'lowpass', frequency: 600, Q: 2.0 },
      modulation: { frequency: 6, depth: 0.18 }
    },
    cardDeselect: {
      frequency: 247,
      duration: 0.16,
      volume: 0.35,
      envelope: { attack: 0.015, decay: 0.06, sustain: 0.4, release: 0.085 },
      filter: { type: 'lowpass', frequency: 450, Q: 1.5 }
    }
  },
  {
    name: 'neon',
    displayName: '霓虹',
    description: '霓虹灯般的电子音效，炫彩夺目',
    cardSelect: {
      frequency: 2640,
      duration: 0.08,
      volume: 0.28,
      envelope: { attack: 0.001, decay: 0.02, sustain: 0.85, release: 0.059 },
      filter: { type: 'bandpass', frequency: 2200, Q: 6.0 },
      modulation: { frequency: 50, depth: 0.15 }
    },
    cardDeselect: {
      frequency: 1980,
      duration: 0.06,
      volume: 0.23,
      envelope: { attack: 0.0005, decay: 0.015, sustain: 0.75, release: 0.0445 },
      filter: { type: 'bandpass', frequency: 1650, Q: 5.0 }
    }
  },
  {
    name: 'wood',
    displayName: '木质',
    description: '木质材料的温暖音效',
    cardSelect: {
      frequency: 523,
      duration: 0.18,
      volume: 0.36,
      envelope: { attack: 0.012, decay: 0.06, sustain: 0.55, release: 0.102 },
      filter: { type: 'lowpass', frequency: 1000, Q: 1.8 },
      modulation: { frequency: 7, depth: 0.14 }
    },
    cardDeselect: {
      frequency: 392,
      duration: 0.15,
      volume: 0.31,
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.45, release: 0.085 },
      filter: { type: 'lowpass', frequency: 800, Q: 1.5 }
    }
  },
  {
    name: 'plasma',
    displayName: '等离子',
    description: '等离子体般的能量音效',
    cardSelect: {
      frequency: 3520,
      duration: 0.06,
      volume: 0.25,
      envelope: { attack: 0.001, decay: 0.015, sustain: 0.9, release: 0.044 },
      filter: { type: 'highpass', frequency: 1800, Q: 4.5 },
      modulation: { frequency: 60, depth: 0.2 }
    },
    cardDeselect: {
      frequency: 2640,
      duration: 0.04,
      volume: 0.2,
      envelope: { attack: 0.0005, decay: 0.01, sustain: 0.8, release: 0.0295 },
      filter: { type: 'highpass', frequency: 1350, Q: 4.0 }
    }
  },
  {
    name: 'ocean',
    displayName: '海洋',
    description: '海洋般深邃的音效',
    cardSelect: {
      frequency: 220,
      duration: 0.35,
      volume: 0.3,
      envelope: { attack: 0.05, decay: 0.15, sustain: 0.3, release: 0.15 },
      filter: { type: 'lowpass', frequency: 400, Q: 1.0 },
      modulation: { frequency: 1.2, depth: 0.4 }
    },
    cardDeselect: {
      frequency: 165,
      duration: 0.28,
      volume: 0.25,
      envelope: { attack: 0.04, decay: 0.12, sustain: 0.2, release: 0.12 },
      filter: { type: 'lowpass', frequency: 300, Q: 0.8 }
    }
  },
  {
    name: 'frost',
    displayName: '霜冻',
    description: '冰霜般清冷的音效',
    cardSelect: {
      frequency: 1760,
      duration: 0.15,
      volume: 0.24,
      envelope: { attack: 0.005, decay: 0.05, sustain: 0.6, release: 0.095 },
      filter: { type: 'highpass', frequency: 1000, Q: 3.0 },
      modulation: { frequency: 28, depth: 0.12 }
    },
    cardDeselect: {
      frequency: 1320,
      duration: 0.12,
      volume: 0.19,
      envelope: { attack: 0.003, decay: 0.04, sustain: 0.5, release: 0.077 },
      filter: { type: 'highpass', frequency: 750, Q: 2.5 }
    }
  },
  {
    name: 'thunder',
    displayName: '雷鸣',
    description: '雷鸣般震撼的音效',
    cardSelect: {
      frequency: 110,
      duration: 0.25,
      volume: 0.45,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.14 },
      filter: { type: 'lowpass', frequency: 300, Q: 2.5 },
      modulation: { frequency: 4, depth: 0.25 }
    },
    cardDeselect: {
      frequency: 82.5,
      duration: 0.2,
      volume: 0.4,
      envelope: { attack: 0.008, decay: 0.08, sustain: 0.3, release: 0.112 },
      filter: { type: 'lowpass', frequency: 250, Q: 2.0 }
    }
  },
  {
    name: 'wind',
    displayName: '微风',
    description: '微风般轻柔的音效',
    cardSelect: {
      frequency: 1480,
      duration: 0.3,
      volume: 0.2,
      envelope: { attack: 0.04, decay: 0.12, sustain: 0.25, release: 0.14 },
      filter: { type: 'lowpass', frequency: 2000, Q: 0.6 },
      modulation: { frequency: 2.5, depth: 0.35 }
    },
    cardDeselect: {
      frequency: 1110,
      duration: 0.25,
      volume: 0.15,
      envelope: { attack: 0.03, decay: 0.1, sustain: 0.15, release: 0.12 },
      filter: { type: 'lowpass', frequency: 1500, Q: 0.5 }
    }
  },
  {
    name: 'electric',
    displayName: '电流',
    description: '电流般刺激的音效',
    cardSelect: {
      frequency: 2200,
      duration: 0.05,
      volume: 0.3,
      envelope: { attack: 0.001, decay: 0.01, sustain: 0.9, release: 0.039 },
      filter: { type: 'bandpass', frequency: 1800, Q: 8.0 },
      modulation: { frequency: 80, depth: 0.3 }
    },
    cardDeselect: {
      frequency: 1650,
      duration: 0.03,
      volume: 0.25,
      envelope: { attack: 0.0005, decay: 0.008, sustain: 0.8, release: 0.0215 },
      filter: { type: 'bandpass', frequency: 1350, Q: 7.0 }
    }
  },
  {
    name: 'cosmic',
    displayName: '宇宙',
    description: '宇宙般神秘的音效',
    cardSelect: {
      frequency: 1108,
      duration: 0.4,
      volume: 0.18,
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.2, release: 0.12 },
      filter: { type: 'lowpass', frequency: 3500, Q: 0.3 },
      modulation: { frequency: 0.8, depth: 0.5 }
    },
    cardDeselect: {
      frequency: 831,
      duration: 0.32,
      volume: 0.13,
      envelope: { attack: 0.06, decay: 0.16, sustain: 0.1, release: 0.1 },
      filter: { type: 'lowpass', frequency: 2800, Q: 0.25 }
    }
  },
  {
    name: 'quantum',
    displayName: '量子',
    description: '量子般微妙的音效',
    cardSelect: {
      frequency: 1760,
      duration: 0.1,
      volume: 0.22,
      envelope: { attack: 0.002, decay: 0.025, sustain: 0.8, release: 0.073 },
      filter: { type: 'bandpass', frequency: 1400, Q: 10.0 },
      modulation: { frequency: 100, depth: 0.1 }
    },
    cardDeselect: {
      frequency: 1320,
      duration: 0.08,
      volume: 0.17,
      envelope: { attack: 0.001, decay: 0.02, sustain: 0.7, release: 0.059 },
      filter: { type: 'bandpass', frequency: 1050, Q: 8.0 }
    }
  },
  {
    name: 'custom',
    displayName: '自定义',
    description: '用户自制的高质量音效，包含清脆咔哒声和柔和嗖声',
    cardSelect: {
      frequency: 1650,
      duration: 0.03,
      volume: 0.4,
      envelope: { attack: 0.0005, decay: 0.008, sustain: 0.8, release: 0.015 },
      filter: { type: 'bandpass', frequency: 2000, Q: 8.0 }
    },
    cardDeselect: {
      frequency: 800,
      duration: 0.15,
      volume: 0.35,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0.6, release: 0.099 },
      filter: { type: 'bandpass', frequency: 1500, Q: 5.0 }
    }
  }
];

// 获取预设配置
export function getModernSoundPreset(name: string): ModernSoundConfig | undefined {
  return modernSoundPresets.find(preset => preset.name === name);
}

// 获取所有预设名称和配置
export function getAllModernSoundPresets(): { preset: string; config: ModernSoundConfig }[] {
  return modernSoundPresets.map(config => ({
    preset: config.name,
    config
  }));
}