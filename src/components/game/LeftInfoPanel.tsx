import React from 'react';
import { motion } from 'framer-motion';
import { ScoreResult } from '../../types/game';

interface LeftInfoPanelProps {
  currentScore: number;
  targetScore: number;
  money: number;
  handsLeft: number;
  discardsLeft: number;
  currentRound: number;
  scorePreview: ScoreResult | null;
  handTypeDisplay: string | null;
  onBackToMenu: () => void;
}

const LeftInfoPanel: React.FC<LeftInfoPanelProps> = ({
  currentScore,
  targetScore,
  money,
  handsLeft,
  discardsLeft,
  currentRound,
  scorePreview,
  handTypeDisplay,
  onBackToMenu
}) => {
  return (
    <div className="w-1/4 min-w-[300px] max-w-[350px] bg-black bg-opacity-40 p-4 flex flex-col space-y-4 flex-shrink-0">
      {/* 分数信息 */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3 text-blue-400">回合分数</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">当前分数:</span>
            <span className="text-yellow-400 font-bold">
              {currentScore.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">目标分数:</span>
            <span className="text-blue-400 font-bold">
              {targetScore.toLocaleString()}
            </span>
          </div>
          <div className="bg-gray-700 rounded-full h-3 overflow-hidden mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (currentScore / targetScore) * 100)}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center text-sm text-gray-400">
            {Math.round((currentScore / targetScore) * 100)}% 完成
          </div>
        </div>
      </div>

      {/* 当前牌型 */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3 text-purple-400">当前牌型</h3>
        <div className="text-center">
          {handTypeDisplay ? (
            <div className="text-xl font-bold text-yellow-300 mb-3">
              {handTypeDisplay}
            </div>
          ) : (
            <div className="text-gray-400 mb-3">请选择卡牌</div>
          )}
          
          {/* 基础分和倍数显示 */}
          <div className="flex gap-2 mt-3">
            {/* 基础分 - 蓝色 */}
            <div className="flex-1 bg-blue-600 bg-opacity-80 rounded-lg p-3 text-center">
              <div className="text-white text-lg font-bold">
                {scorePreview ? scorePreview.baseScore : 0}
              </div>
              <div className="text-blue-200 text-xs">基础分</div>
            </div>
            
            {/* 倍数 - 红色 */}
            <div className="flex-1 bg-red-600 bg-opacity-80 rounded-lg p-3 text-center">
              <div className="text-white text-lg font-bold">
                {scorePreview ? scorePreview.multiplier : 0}
              </div>
              <div className="text-red-200 text-xs">倍数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部信息区域 - flex左右布局 */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4">
        <div className="flex gap-4">
          {/* 左侧：比赛信息和选项 - flex列布局 */}
          <div className="flex-1 space-y-2">
            {/* 比赛信息 */}
            <div className="bg-red-600 bg-opacity-90 rounded-lg p-4 h-16 flex items-center justify-center">
              <h3 className="text-lg font-bold text-white text-center">比赛<br/>信息</h3>
            </div>
            
            {/* 选项 */}
            <div className="bg-orange-500 bg-opacity-90 rounded-lg p-4 h-16 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-white text-center mb-1">选项</h3>
              <button
                className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold transition-colors text-white"
                onClick={onBackToMenu}
              >返回主菜单</button>
            </div>
          </div>

          {/* 右侧：五个展示框 - 表格布局 */}
          <div className="flex-1 grid grid-rows-3 gap-2 max-w-xs">
            {/* 第一行：出牌和弃牌 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-700 bg-opacity-90 rounded-lg p-3 flex flex-col items-center justify-center h-12">
                <div className="text-xl font-bold text-white">{handsLeft}</div>
                <div className="text-xs text-white mt-1">出牌</div>
              </div>
              <div className="bg-red-700 bg-opacity-90 rounded-lg p-3 flex flex-col items-center justify-center h-12">
                <div className="text-xl font-bold text-white">{discardsLeft}</div>
                <div className="text-xs text-white mt-1">弃牌</div>
              </div>
            </div>
            
            {/* 第二行：金币数（独占一行） */}
            <div className="bg-yellow-600 bg-opacity-90 rounded-lg p-3 flex flex-col items-center justify-center h-16">
              <div className="text-2xl font-bold text-white">${money}</div>
            </div>
            
            {/* 第三行：底注和回合 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-orange-600 bg-opacity-90 rounded-lg p-3 flex flex-col items-center justify-center h-12">
                <div className="text-lg font-bold text-white">8</div>
                <div className="text-xs text-white mt-1">底注</div>
              </div>
              <div className="bg-blue-700 bg-opacity-90 rounded-lg p-3 flex flex-col items-center justify-center h-12">
                <div className="text-lg font-bold text-white">{currentRound}</div>
                <div className="text-xs text-white mt-1">回合</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftInfoPanel;