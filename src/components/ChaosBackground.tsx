import React from 'react';
import { motion } from 'framer-motion';

const ChaosBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 基础渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-900 to-black" />
      
      {/* 动态混沌层 */}
      <div className="absolute inset-0">
        {/* 第一层：大型混沌泡泡 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`chaos-1-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-green-600/20 to-emerald-800/30 blur-xl"
            style={{
              width: `${120 + i * 40}px`,
              height: `${120 + i * 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 120, 0],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.6, 0.2, 0.3],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
        
        {/* 第二层：中型混沌粒子 */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`chaos-2-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-teal-500/15 to-green-700/25 blur-lg"
            style={{
              width: `${60 + i * 15}px`,
              height: `${60 + i * 15}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, -120, 80, 0],
              y: [0, 150, -100, 0],
              scale: [0.8, 1.3, 0.6, 0.8],
              opacity: [0.2, 0.5, 0.1, 0.2],
            }}
            transition={{
              duration: 12 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
        
        {/* 第三层：小型混沌点 */}
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={`chaos-3-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-emerald-400/10 to-green-600/20 blur-md"
            style={{
              width: `${20 + i * 8}px`,
              height: `${20 + i * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 60, -40, 0],
              y: [0, -60, 80, 0],
              scale: [0.5, 1.5, 0.3, 0.5],
              opacity: [0.1, 0.4, 0.05, 0.1],
            }}
            transition={{
              duration: 8 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
        
        {/* 第四层：流动波纹 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute w-full h-32 bg-gradient-to-r from-transparent via-green-500/5 to-transparent blur-sm"
            style={{
              top: `${i * 20}%`,
              transform: 'skewY(-2deg)',
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}
        
        {/* 第五层：混沌漩涡 */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-transparent via-green-700/5 to-transparent"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      
      {/* 顶层噪点效果 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px, 30px 30px',
        }}
      />
    </div>
  );
};

export default ChaosBackground;