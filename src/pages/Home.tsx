import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, TestTube } from 'lucide-react';
import { soundManager, SoundType } from '../utils/soundManager';
import { getAllModernSoundPresets, ModernSoundConfig } from '../utils/modernSoundEffects';
import { useGameStore } from '../stores/gameStore';

interface HomeProps {
  onStartGame?: () => void;
  onTestAnimation?: () => void;
}

export default function Home({ onStartGame, onTestAnimation }: HomeProps = {}) {
  const { initializeGame } = useGameStore();
  const [currentPreset, setCurrentPreset] = useState<string>('elegant');
  const [isMuted, setIsMuted] = useState(soundManager.isSoundMuted());
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [modernPresets, setModernPresets] = useState<{ preset: string; config: ModernSoundConfig }[]>([]);
  const [previewingSound, setPreviewingSound] = useState<string | null>(null);
  


  useEffect(() => {
    // 初始化现代化音效预设
    const presets = getAllModernSoundPresets();
    setModernPresets(presets);
    
    // 设置默认预设
    if (presets.length > 0) {
      soundManager.setCurrentPreset(presets[0].preset);
    }
  }, []);

  const handlePresetChange = (presetName: string) => {
    setCurrentPreset(presetName);
    soundManager.setCurrentPreset(presetName);
    soundManager.play(SoundType.CARD_SELECT);
  };

  const playPreviewSound = (type: SoundType, presetName?: string) => {
    if (presetName) {
      setPreviewingSound(presetName);
      const originalPreset = soundManager.getCurrentPreset();
      soundManager.setCurrentPreset(presetName);
      soundManager.play(type);
      
      setTimeout(() => {
        soundManager.setCurrentPreset(originalPreset);
        setPreviewingSound(null);
      }, 500);
    } else {
      soundManager.play(type);
    }
  };

  const toggleMute = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.isSoundMuted());
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const handleStartGame = () => {
    initializeGame();
    if (onStartGame) {
      onStartGame();
    } else {
      console.log('开始游戏');
    }
  };



  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    }
  };



  const titleVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="h-screen w-screen relative text-white overflow-hidden flex flex-col">
      {/* Balatro风格的流体背景 */}
      <div className="absolute inset-0">
        {/* 主背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-blue-600" />
        
        {/* 流体效果层 */}
        <motion.div
          className="absolute inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.8) 0%, transparent 50%),
              radial-gradient(ellipse 600px 800px at 80% 60%, rgba(239, 68, 68, 0.8) 0%, transparent 50%),
              radial-gradient(ellipse 400px 400px at 40% 80%, rgba(147, 51, 234, 0.6) 0%, transparent 50%)
            `
          }}
          animate={{
            background: [
              `radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.8) 0%, transparent 50%),
               radial-gradient(ellipse 600px 800px at 80% 60%, rgba(239, 68, 68, 0.8) 0%, transparent 50%),
               radial-gradient(ellipse 400px 400px at 40% 80%, rgba(147, 51, 234, 0.6) 0%, transparent 50%)`,
              `radial-gradient(ellipse 700px 700px at 30% 50%, rgba(59, 130, 246, 0.9) 0%, transparent 50%),
               radial-gradient(ellipse 500px 900px at 70% 50%, rgba(239, 68, 68, 0.7) 0%, transparent 50%),
               radial-gradient(ellipse 500px 300px at 50% 70%, rgba(147, 51, 234, 0.8) 0%, transparent 50%)`,
              `radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.8) 0%, transparent 50%),
               radial-gradient(ellipse 600px 800px at 80% 60%, rgba(239, 68, 68, 0.8) 0%, transparent 50%),
               radial-gradient(ellipse 400px 400px at 40% 80%, rgba(147, 51, 234, 0.6) 0%, transparent 50%)`
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 纹理覆盖层 */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 30px 30px'
        }} />
      </div>
      
      {/* 右上角测试动画按钮 */}
      <motion.div
        className="absolute top-4 right-4 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={onTestAnimation}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold shadow-lg transition-all duration-300 text-sm flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TestTube className="w-4 h-4" />
          <span className="hidden sm:inline">测试动画</span>
          <span className="sm:hidden">动画</span>
        </motion.button>
      </motion.div>

      <motion.div
        className="relative z-10 flex flex-col h-full w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 中央标题区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.div
            className="text-center mb-8"
            variants={titleVariants}
          >
            {/* BALATRO标题 - 简化设计提高可读性 */}
            <motion.div className="relative mb-8">
              {/* 简化的背景光效 */}
              <motion.div
                className="absolute inset-0 blur-2xl opacity-30"
                animate={{
                  background: [
                    'radial-gradient(ellipse 300px 150px at center, rgba(255, 255, 255, 0.3), transparent)',
                    'radial-gradient(ellipse 350px 200px at center, rgba(139, 92, 246, 0.2), transparent)',
                    'radial-gradient(ellipse 300px 150px at center, rgba(255, 255, 255, 0.3), transparent)'
                  ]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.h1 
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold relative z-10"
                style={{
                  color: '#ffffff',
                  textShadow: '0 0 20px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6), 0 0 40px rgba(139, 92, 246, 0.4)',
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))',
                  letterSpacing: '0.05em'
                }}
                animate={{
                  y: [-2, 2, -2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                BALATRO
              </motion.h1>
            </motion.div>
          </motion.div>
        </div>

        {/* 底部按钮区域 */}
        <motion.div
          className="pb-8 px-4"
          variants={itemVariants}
        >
          {/* 左上角配置按钮 */}
          <motion.div
            className="absolute top-4 left-4 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              className="px-3 py-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg font-bold shadow-lg transition-all duration-300 text-sm backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              配置
              <br />
              <span className="text-xs opacity-70">P1</span>
            </motion.button>
          </motion.div>
          
          {/* 主要按钮组 */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto justify-center items-center">
            {/* 开始游戏按钮 */}
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-xl font-bold shadow-xl transition-all duration-300 min-w-[160px]"
              onClick={handleStartGame}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 16px 32px rgba(59, 130, 246, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              开始游戏
            </motion.button>
            
            {/* 选项按钮 */}
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg text-xl font-bold shadow-xl transition-all duration-300 min-w-[160px]"
              onClick={() => setShowSoundSettings(!showSoundSettings)}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 16px 32px rgba(249, 115, 22, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              选项
            </motion.button>
            
            {/* 收藏按钮 */}
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-xl font-bold shadow-xl transition-all duration-300 min-w-[160px]"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 16px 32px rgba(34, 197, 94, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              收藏
            </motion.button>
          </div>
          
          {/* 右下角语言按钮 */}
          <motion.div
            className="absolute bottom-4 right-4 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="px-3 py-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg font-bold shadow-lg transition-all duration-300 text-sm backdrop-blur-sm flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xs">🌐</span>
              简体中文
            </motion.button>
          </motion.div>
        </motion.div>

        {/* 声音设置面板 */}
        <AnimatePresence>
          {showSoundSettings && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 h-screen w-screen"
              onClick={() => setShowSoundSettings(false)}
            >
              <motion.div
                className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 w-full max-w-sm sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">声音设置</h2>
                  <button
                    onClick={() => setShowSoundSettings(false)}
                    className="text-white/70 hover:text-white transition-colors text-xl sm:text-2xl p-1 rounded-lg hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>

                {/* 音量控制 */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">音量控制</h3>
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <button
                      onClick={toggleMute}
                      className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 flex-shrink-0"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                        disabled={isMuted}
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                        }}
                      />
                    </div>
                    <span className="text-white/70 text-xs sm:text-sm w-8 sm:w-12 text-right flex-shrink-0">{Math.round(volume * 100)}%</span>
                  </div>
                </div>

                {/* 声音预设选择 */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">音效预设 ({modernPresets.length}种)</h3>
                  
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 max-h-48 sm:max-h-60 overflow-hidden pr-1">
                    {modernPresets.slice(0, 12).map(({ preset, config }) => (
                      <motion.div
                        key={preset}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                          currentPreset === preset
                            ? 'bg-blue-500/20 border-blue-400 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                        onClick={() => handlePresetChange(preset)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white font-medium text-sm sm:text-base truncate">{config.displayName}</h5>
                            <p className="text-gray-400 text-xs sm:text-sm truncate mt-1">{config.description}</p>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              playPreviewSound(SoundType.CARD_SELECT, preset);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-green-500/20 text-green-400 p-2 sm:p-2.5 rounded-lg hover:bg-green-500/30 transition-colors flex-shrink-0"
                            disabled={isMuted}
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* 移动端友好的关闭按钮 */}
                  <div className="sm:hidden pt-4 border-t border-white/10">
                    <motion.button
                      onClick={() => setShowSoundSettings(false)}
                      className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold text-white transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      完成设置
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}