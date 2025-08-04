import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewPage from './pages/PreviewPage';
import GamePage from './pages/GamePage';
import './App.css';

type AppState = 'preview' | 'game';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('preview');

  const handleStartGame = () => {
    setCurrentPage('game');
  };

  const handleBackToMenu = () => {
    setCurrentPage('preview');
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.9,
      rotateY: -90
    },
    in: {
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    out: {
      opacity: 0,
      scale: 1.1,
      rotateY: 90
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.8
  };

  return (
    <div className="App min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentPage === 'preview' && (
          <motion.div
            key="preview"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="absolute inset-0"
          >
            <PreviewPage onStartGame={handleStartGame} />
          </motion.div>
        )}
        
        {currentPage === 'game' && (
          <motion.div
            key="game"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="absolute inset-0"
          >
            <div className="relative h-full">
              {/* 返回按钮 */}
              <motion.button
                className="absolute top-4 left-4 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-4 py-2 rounded-lg font-bold transition-all backdrop-blur-sm"
                onClick={handleBackToMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                ← 返回主菜单
              </motion.button>
              
              <GamePage />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 全局加载指示器（如果需要） */}
      <AnimatePresence>
        {/* 可以在这里添加全局加载状态 */}
      </AnimatePresence>
    </div>
  );
}

export default App;