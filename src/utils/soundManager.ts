import { Howl } from 'howler';
import { ModernSoundConfig, getAllModernSoundPresets, getModernSoundPreset } from './modernSoundEffects';

// 音效类型枚举
export enum SoundType {
  CARD_SELECT = 'CARD_SELECT',
  CARD_DESELECT = 'CARD_DESELECT',
  CARD_DESTROY = 'CARD_DESTROY',
  SCORE_COUNT = 'SCORE_COUNT',
  LEVEL_UP = 'LEVEL_UP',
  CARD_PLAY = 'CARD_PLAY',
  SHUFFLE = 'SHUFFLE',
  BUTTON_CLICK = 'BUTTON_CLICK'
}

class SoundManager {
  private sounds: Map<SoundType, Howl> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private currentPreset: string = 'elegant';
  private modernSoundConfigs: Map<string, ModernSoundConfig> = new Map();

  constructor() {
    this.initializeModernSoundConfigs();
    this.initializeSounds();
  }

  private initializeModernSoundConfigs() {
    const presets = getAllModernSoundPresets();
    presets.forEach(({ preset, config }) => {
      this.modernSoundConfigs.set(preset, config);
    });
  }

  private initializeSounds() {
    const preset = getModernSoundPreset(this.currentPreset);
    if (!preset) return;

    // 如果是自定义预设，使用特殊的音效创建方法
    if (this.currentPreset === 'custom') {
      this.createCustomCardSound(SoundType.CARD_SELECT);
      this.createCustomCardSound(SoundType.CARD_DESELECT);
      this.createCustomCardSound(SoundType.CARD_DESTROY);
    } else {
      // 初始化卡牌选择音效
      this.createModernCardSound(SoundType.CARD_SELECT, preset.cardSelect);
      
      // 初始化卡牌取消选择音效
      this.createModernCardSound(SoundType.CARD_DESELECT, preset.cardDeselect);
    }
    
    // 初始化其他音效（基于cardSelect配置）
    const baseConfig = preset.cardSelect;
    
    const scoreConfig = { ...baseConfig, frequency: baseConfig.frequency * 1.5, duration: 0.3 };
    this.createModernCardSound(SoundType.SCORE_COUNT, scoreConfig);
    
    const levelUpConfig = { ...baseConfig, frequency: baseConfig.frequency * 2, duration: 0.5, volume: baseConfig.volume * 1.2 };
    this.createModernCardSound(SoundType.LEVEL_UP, levelUpConfig);
    
    const cardPlayConfig = { ...baseConfig, frequency: baseConfig.frequency * 1.2, duration: 0.2 };
    this.createModernCardSound(SoundType.CARD_PLAY, cardPlayConfig);
    
    const shuffleConfig = { ...baseConfig, frequency: baseConfig.frequency * 0.5, duration: 0.4, volume: baseConfig.volume * 0.8 };
    this.createModernCardSound(SoundType.SHUFFLE, shuffleConfig);
    
    const buttonConfig = { ...baseConfig, frequency: baseConfig.frequency * 1.1, duration: 0.1 };
    this.createModernCardSound(SoundType.BUTTON_CLICK, buttonConfig);
  }

  private createModernCardSound(type: SoundType, soundConfig: any) {
     // 使用现代化的Web Audio API生成高质量音效
     const playSound = () => {
       if (this.isMuted) return;
       
       try {
         const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
         
         // 创建主振荡器
         const oscillator = audioContext.createOscillator();
         const gainNode = audioContext.createGain();
         const filterNode = audioContext.createBiquadFilter();
         
         // 设置振荡器类型和频率
         oscillator.type = 'sine';
         oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);
         
         // 设置滤波器
         if (soundConfig.filter) {
           filterNode.type = soundConfig.filter.type;
           filterNode.frequency.setValueAtTime(soundConfig.filter.frequency, audioContext.currentTime);
           filterNode.Q.setValueAtTime(soundConfig.filter.Q, audioContext.currentTime);
         }
         
         // 连接音频节点
         oscillator.connect(filterNode);
         filterNode.connect(gainNode);
         gainNode.connect(audioContext.destination);
         
         // 设置音量包络 (ADSR)
         const envelope = soundConfig.envelope;
         const volume = soundConfig.volume * this.volume;
         const currentTime = audioContext.currentTime;
         
         gainNode.gain.setValueAtTime(0, currentTime);
         gainNode.gain.linearRampToValueAtTime(volume, currentTime + envelope.attack);
         gainNode.gain.linearRampToValueAtTime(volume * envelope.sustain, currentTime + envelope.attack + envelope.decay);
         gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + soundConfig.duration);
         
         // 添加频率调制（如果配置了）
         if (soundConfig.modulation) {
           const lfo = audioContext.createOscillator();
           const lfoGain = audioContext.createGain();
           
           lfo.type = 'sine';
           lfo.frequency.setValueAtTime(soundConfig.modulation.frequency, currentTime);
           lfoGain.gain.setValueAtTime(soundConfig.frequency * soundConfig.modulation.depth, currentTime);
           
           lfo.connect(lfoGain);
           lfoGain.connect(oscillator.frequency);
           
           lfo.start(currentTime);
           lfo.stop(currentTime + soundConfig.duration);
         }
         
         // 启动和停止振荡器
         oscillator.start(currentTime);
         oscillator.stop(currentTime + soundConfig.duration);
         
       } catch (error) {
         console.warn('Modern audio playback failed:', error);
       }
     };

     // 创建一个模拟的Howl对象
     const mockHowl = {
       play: playSound,
       volume: (vol?: number) => {
         if (vol !== undefined) {
           // 音量设置逻辑已在playSound中处理
         }
         return this.volume;
       }
     } as Howl;

     this.sounds.set(type, mockHowl);
   }

  private createCustomCardSound(type: SoundType) {
    // 用户自定义的高质量音效实现
    const playSound = () => {
      if (this.isMuted) return;
      
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (type === SoundType.CARD_SELECT) {
          // 点击卡牌：清脆"咔哒"声
          const params = {
            frequency: 1650,
            duration: 0.03,
            volume: 0.4,
            envelope: { attack: 0.0005, decay: 0.008, sustain: 0.8, release: 0.015 },
            filter: { type: 'bandpass' as BiquadFilterType, frequency: 2000, Q: 8.0 }
          };
          
          const oscillator = audioContext.createOscillator();
          const gainNode1 = audioContext.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(params.frequency, audioContext.currentTime);
          
          // 创建噪声
          const noise = audioContext.createBufferSource();
          const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.015, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          noise.buffer = buffer;
          
          const gainNode2 = audioContext.createGain();
          gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.015);
          
          const filter = audioContext.createBiquadFilter();
          filter.type = params.filter.type;
          filter.frequency.setValueAtTime(params.filter.frequency, audioContext.currentTime);
          filter.Q.setValueAtTime(params.filter.Q, audioContext.currentTime);
          
          const now = audioContext.currentTime;
          const volume = params.volume * this.volume;
          gainNode1.gain.setValueAtTime(0, now);
          gainNode1.gain.linearRampToValueAtTime(volume, now + params.envelope.attack);
          gainNode1.gain.linearRampToValueAtTime(volume * params.envelope.sustain, now + params.envelope.attack + params.envelope.decay);
          gainNode1.gain.setValueAtTime(volume * params.envelope.sustain, now + params.envelope.attack + params.envelope.decay);
          gainNode1.gain.linearRampToValueAtTime(0, now + params.duration);
          
          oscillator.connect(gainNode1);
          noise.connect(gainNode2);
          gainNode1.connect(filter);
          gainNode2.connect(filter);
          filter.connect(audioContext.destination);
          
          oscillator.start();
          noise.start();
          oscillator.stop(now + params.duration);
          noise.stop(now + 0.015);
          
        } else if (type === SoundType.CARD_DESELECT) {
          // 取消卡牌：柔和"嗖"声
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();
          
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
          
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1500, audioContext.currentTime);
          filter.Q.setValueAtTime(5.0, audioContext.currentTime);
          
          const volume = 0.35 * this.volume;
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
          
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.15);
          
        } else if (type === SoundType.CARD_DESTROY) {
          // 撕毁卡牌：粗糙"撕拉"声
          const noise = audioContext.createBufferSource();
          const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          noise.buffer = buffer;
          
          const filter = audioContext.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1800, audioContext.currentTime);
          filter.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.3);
          filter.Q.setValueAtTime(6.0, audioContext.currentTime);
          
          const gainNode = audioContext.createGain();
          const volume = 0.3 * this.volume;
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
          
          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          noise.start();
          noise.stop(audioContext.currentTime + 0.3);
        }
        
      } catch (error) {
        console.warn('Custom audio playback failed:', error);
      }
    };

    // 创建一个模拟的Howl对象
    const mockHowl = {
      play: playSound,
      volume: (vol?: number) => {
        if (vol !== undefined) {
          // 音量设置逻辑已在playSound中处理
        }
        return this.volume;
      }
    } as Howl;

    this.sounds.set(type, mockHowl);
  }

  public play(type: SoundType) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(type);
    if (sound) {
      sound.play();
    }
  }

  // 获取所有可用的声音预设
  public getAvailablePresets(): { preset: string; config: ModernSoundConfig }[] {
    return Array.from(this.modernSoundConfigs.entries()).map(([preset, config]) => ({
      preset,
      config
    }));
  }

  // 设置当前声音预设
  public setPreset(preset: string) {
    if (this.modernSoundConfigs.has(preset)) {
      this.currentPreset = preset;
      this.initializeSounds();
    }
  }

  // 获取当前预设
  public getCurrentPreset(): string {
    return this.currentPreset;
  }

  public setCurrentPreset(presetName: string) {
    this.currentPreset = presetName;
    this.initializeSounds();
  }

  // 预览指定预设的声音
  public previewPreset(preset: string, soundType: SoundType) {
    const config = this.modernSoundConfigs.get(preset);
    if (!config) return;

    const soundConfig = soundType === SoundType.CARD_SELECT ? config.cardSelect : config.cardDeselect;
    this.createModernCardSound(soundType, soundConfig);
    this.play(soundType);
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    // 更新所有现有音效的音量
    this.sounds.forEach(sound => {
      sound.volume(this.volume);
    });
  }

  public mute() {
    this.isMuted = true;
  }

  public unmute() {
    this.isMuted = false;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }
}

// 导出单例实例
export const soundManager = new SoundManager();
export default soundManager;