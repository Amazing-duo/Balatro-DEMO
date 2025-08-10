import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import AnimationTestPage from './pages/AnimationTestPage';
import './App.css';

type AppState = 'home' | 'game' | 'animation-test';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('home');

  const handleStartGame = () => {
    setCurrentPage('game');
  };

  const handleBackToMenu = () => {
    setCurrentPage('home');
  };

  const handleTestAnimation = () => {
    setCurrentPage('animation-test');
  };

  const handleBackFromAnimation = () => {
    setCurrentPage('home');
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
    <div className="App h-screen w-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <motion.div
            key="home"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="absolute inset-0 h-full w-full"
          >
            <Home onStartGame={handleStartGame} onTestAnimation={handleTestAnimation} />
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
            className="absolute inset-0 h-full w-full"
          >
            <GamePage onBackToMenu={handleBackToMenu} />
          </motion.div>
        )}
        
        {currentPage === 'animation-test' && (
          <motion.div
            key="animation-test"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="absolute inset-0 h-full w-full"
          >
            <AnimationTestPage onBack={handleBackFromAnimation} />
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